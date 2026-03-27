# API Contracts Specification

This document describes every endpoint exposed by the Mini Campaign Manager API. All endpoints are prefixed under the server base URL. Authenticated endpoints require a Bearer token passed in the Authorization header.

---

## Error Response Format

All error responses share a consistent shape regardless of status code:

- error — string — a human-readable message describing what went wrong
- details — optional — structured information about individual validation failures; present only when there are field-level errors to report

---

## POST /auth/register

Registers a new user account.

Auth required: No

### Request

| Field    | Source | Type   | Required | Constraints              |
|----------|--------|--------|----------|--------------------------|
| email    | body   | string | Yes      | Valid email format       |
| name     | body   | string | Yes      | Non-empty string         |
| password | body   | string | Yes      | Non-empty string         |

### Success Response

HTTP status: 201

| Field          | Type    | Description                                      |
|----------------|---------|--------------------------------------------------|
| token          | string  | A signed JWT the client must include in subsequent authenticated requests |
| user.id        | integer | The newly created user's identifier              |
| user.email     | string  | The user's email address                         |
| user.name      | string  | The user's display name                          |
| user.created_at | string (ISO 8601 datetime) | When the account was created   |

### Error Responses

| Status | Condition                                      |
|--------|------------------------------------------------|
| 400    | One or more request fields fail validation     |
| 409    | A user with the provided email already exists  |

---

## POST /auth/login

Authenticates an existing user and returns a JWT.

Auth required: No

### Request

| Field    | Source | Type   | Required | Constraints        |
|----------|--------|--------|----------|--------------------|
| email    | body   | string | Yes      | Valid email format |
| password | body   | string | Yes      | Non-empty string   |

### Success Response

HTTP status: 200

| Field        | Type    |
|--------------|---------|
| token        | string (JWT) |
| user.id      | integer |
| user.email   | string  |
| user.name    | string  |

### Error Responses

| Status | Condition                                   |
|--------|---------------------------------------------|
| 400    | One or more request fields fail validation  |
| 401    | Email not found or password does not match  |

---

## GET /campaigns

Lists all campaigns owned by the authenticated user, with pagination.

Auth required: Yes

### Request

| Field | Source | Type    | Required | Constraints             |
|-------|--------|---------|----------|-------------------------|
| page  | query  | integer | No       | Defaults to 1           |
| limit | query  | integer | No       | Defaults to 20, max 100 |

### Success Response

HTTP status: 200

| Field                        | Type    |
|------------------------------|---------|
| campaigns                    | array   |
| campaigns[].id               | integer |
| campaigns[].name             | string  |
| campaigns[].subject          | string  |
| campaigns[].status           | string  |
| campaigns[].scheduled_at     | string (ISO 8601 datetime) or null |
| campaigns[].created_at       | string (ISO 8601 datetime) |
| campaigns[].recipient_count  | integer |
| pagination.page              | integer |
| pagination.limit             | integer |
| pagination.total             | integer |

### Error Responses

| Status | Condition                            |
|--------|--------------------------------------|
| 401    | No valid Bearer token was provided   |

---

## POST /campaigns

Creates a new campaign in draft status. Optionally links an initial set of recipients.

Auth required: Yes

### Request

| Field              | Source | Type   | Required | Constraints                                  |
|--------------------|--------|--------|----------|----------------------------------------------|
| name               | body   | string | Yes      | Non-empty string                             |
| subject            | body   | string | Yes      | Non-empty string                             |
| body               | body   | string | Yes      | Non-empty HTML string from rich text editor  |
| recipients         | body   | array  | No       | Each item must have an email and a name      |
| recipients[].email | body   | string | Yes (per item) | Valid email format                   |
| recipients[].name  | body   | string | Yes (per item) | Non-empty string                     |

### Success Response

HTTP status: 201

Returns the full campaign object as described in GET /campaigns/:id.

### Error Responses

| Status | Condition                           |
|--------|-------------------------------------|
| 400    | One or more fields fail validation  |
| 401    | No valid Bearer token was provided  |

---

## GET /campaigns/:id

Returns full details for a single campaign including its recipients and stats.

Auth required: Yes

### Request

| Field | Source | Type    | Required | Constraints            |
|-------|--------|---------|----------|------------------------|
| id    | path   | integer | Yes      | Positive whole number  |

### Success Response

HTTP status: 200

| Field                             | Type    |
|-----------------------------------|---------|
| id                                | integer |
| name                              | string  |
| subject                           | string  |
| body                              | string  |
| status                            | string  |
| scheduled_at                      | string (ISO 8601 datetime) or null |
| created_by                        | integer |
| created_at                        | string (ISO 8601 datetime) |
| updated_at                        | string (ISO 8601 datetime) |
| recipients                        | array   |
| recipients[].id                   | integer |
| recipients[].email                | string  |
| recipients[].name                 | string  |
| recipients[].status               | string  |
| recipients[].sent_at              | string (ISO 8601 datetime) or null |
| recipients[].opened_at            | string (ISO 8601 datetime) or null |
| stats.total                       | integer |
| stats.sent                        | integer |
| stats.failed                      | integer |
| stats.opened                      | integer |
| stats.open_rate                   | decimal |
| stats.send_rate                   | decimal |

### Error Responses

| Status | Condition                                                                 |
|--------|---------------------------------------------------------------------------|
| 401    | No valid Bearer token was provided                                        |
| 404    | Campaign does not exist or belongs to a different authenticated user       |

---

## PATCH /campaigns/:id

Partially updates a campaign. Only campaigns in draft status may be modified.

Auth required: Yes

### Request

| Field              | Source | Type    | Required       | Constraints                                                              |
|--------------------|--------|---------|----------------|--------------------------------------------------------------------------|
| id                 | path   | integer | Yes            | Positive whole number                                                    |
| name               | body   | string  | No             | Non-empty string if provided, max 255 characters                         |
| subject            | body   | string  | No             | Non-empty string if provided, max 500 characters                         |
| body               | body   | string  | No             | Non-empty string if provided                                             |
| recipients         | body   | array   | No             | If provided: replaces the full recipient list; each item has email and name |
| recipients[].email | body   | string  | Yes (per item) | Valid email format                                                       |
| recipients[].name  | body   | string  | Yes (per item) | Non-empty string, max 255 characters                                     |

At least one of name, subject, body, or recipients must be present in the request body.

### Success Response

HTTP status: 200

Returns the full updated campaign object (same shape as GET /campaigns/:id).

### Error Responses

| Status | Condition                                                           |
|--------|---------------------------------------------------------------------|
| 400    | No fields provided, or a provided field fails validation            |
| 401    | No valid Bearer token was provided                                  |
| 404    | Campaign does not exist or belongs to a different authenticated user |
| 409    | Campaign status is not draft                                        |

---

## DELETE /campaigns/:id

Permanently deletes a campaign. Only campaigns in draft status may be deleted.

Auth required: Yes

### Request

| Field | Source | Type    | Required | Constraints           |
|-------|--------|---------|----------|-----------------------|
| id    | path   | integer | Yes      | Positive whole number |

### Success Response

HTTP status: 204 — no response body is returned.

### Error Responses

| Status | Condition                                                           |
|--------|---------------------------------------------------------------------|
| 401    | No valid Bearer token was provided                                  |
| 404    | Campaign does not exist or belongs to a different authenticated user |
| 409    | Campaign status is not draft                                        |

---

## POST /campaigns/:id/schedule

Sets or cancels the scheduled send time for a campaign. Passing null for scheduled_at cancels an existing schedule.

Auth required: Yes

### Request

| Field        | Source | Type           | Required | Constraints                                                 |
|--------------|--------|----------------|----------|-------------------------------------------------------------|
| id           | path   | integer        | Yes      | Positive whole number                                       |
| scheduled_at | body   | string or null | Yes      | If a string: valid ISO 8601 datetime at least 1 minute in the future. If null: cancels the schedule. |

### Success Response

HTTP status: 200

Returns the full updated campaign object (same shape as GET /campaigns/:id).

### Error Responses

| Status | Condition                                                           |
|--------|---------------------------------------------------------------------|
| 400    | scheduled_at is a string but is not a valid or sufficiently future datetime |
| 401    | No valid Bearer token was provided                                  |
| 404    | Campaign does not exist or belongs to a different authenticated user |
| 409    | Campaign has already been sent                                      |

---

## POST /campaigns/:id/send

Immediately sends the campaign to all linked recipients.

Auth required: Yes

### Request

| Field | Source | Type    | Required | Constraints           |
|-------|--------|---------|----------|-----------------------|
| id    | path   | integer | Yes      | Positive whole number |

No request body.

### Success Response

HTTP status: 200

Returns the full updated campaign object including the updated stats (same shape as GET /campaigns/:id).

### Error Responses

| Status | Condition                                                           |
|--------|---------------------------------------------------------------------|
| 401    | No valid Bearer token was provided                                  |
| 404    | Campaign does not exist or belongs to a different authenticated user |
| 409    | Campaign has already been sent                                      |

---

## GET /campaigns/:id/stats

Returns send and open statistics for a single campaign.

Auth required: Yes

### Request

| Field | Source | Type    | Required | Constraints           |
|-------|--------|---------|----------|-----------------------|
| id    | path   | integer | Yes      | Positive whole number |

No request body.

### Success Response

HTTP status: 200

| Field     | Type    | Description                                                           |
|-----------|---------|-----------------------------------------------------------------------|
| total     | integer | Total number of recipients linked to this campaign                    |
| sent      | integer | Number of recipients whose status is sent                             |
| failed    | integer | Number of recipients whose status is failed                           |
| opened    | integer | Number of recipients whose opened_at is not null                      |
| open_rate | decimal | opened divided by total; zero when total is zero; 4 decimal places    |
| send_rate | decimal | sent divided by total; zero when total is zero; 4 decimal places      |

### Error Responses

| Status | Condition                                                           |
|--------|---------------------------------------------------------------------|
| 401    | No valid Bearer token was provided                                  |
| 404    | Campaign does not exist or belongs to a different authenticated user |
