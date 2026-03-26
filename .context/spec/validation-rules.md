# Validation Rules Specification

This document defines the exact validation rules applied to every request input in the Mini Campaign Manager API. Rules are listed per endpoint. Validation is applied before any business logic runs. When validation fails, the server returns HTTP 400 with an error response that includes a details field listing all failing fields.

---

## POST /auth/register

| Field    | Source | Type   | Required | Rules                                                                 | Error Message                             |
|----------|--------|--------|----------|-----------------------------------------------------------------------|-------------------------------------------|
| email    | body   | string | Yes      | Must be a syntactically valid email address format; max 255 characters | "Valid email is required"                 |
| name     | body   | string | Yes      | Must be non-empty after trimming leading and trailing whitespace; max 255 characters | "Name is required"           |
| password | body   | string | Yes      | Minimum 8 characters; maximum 100 characters                          | "Password must be at least 8 characters"  |

---

## POST /auth/login

| Field    | Source | Type   | Required | Rules                                          | Error Message              |
|----------|--------|--------|----------|------------------------------------------------|----------------------------|
| email    | body   | string | Yes      | Must be a syntactically valid email address format | "Valid email is required" |
| password | body   | string | Yes      | Must be non-empty                              | "Password is required"     |

---

## GET /campaigns

| Field | Source | Type    | Required | Rules                                     | Error Message                        |
|-------|--------|---------|----------|-------------------------------------------|--------------------------------------|
| page  | query  | integer | No       | Must be a whole number; minimum value 1; defaults to 1 if omitted | "page must be a positive integer"    |
| limit | query  | integer | No       | Must be a whole number; minimum value 1; maximum value 100; defaults to 20 if omitted | "limit must be between 1 and 100"    |

---

## POST /campaigns

| Field              | Source | Type   | Required | Rules                                                                                                                             | Error Message                    |
|--------------------|--------|--------|----------|-----------------------------------------------------------------------------------------------------------------------------------|----------------------------------|
| name               | body   | string | Yes      | Must be non-empty after trimming; max 255 characters                                                                              | "Campaign name is required"      |
| subject            | body   | string | Yes      | Must be non-empty after trimming; max 500 characters                                                                              | "Subject is required"            |
| body               | body   | string | Yes      | Must be non-empty (HTML content is expected from the rich text editor)                                                            | "Email body is required"         |
| recipients         | body   | array  | No       | If provided: must be an array; maximum 1000 items; each item must satisfy the per-item rules below                                | "Invalid recipient at index N"   |
| recipients[].email | body   | string | Yes (per item) | Must be a syntactically valid email address format; max 255 characters                                                      | "Invalid recipient at index N"   |
| recipients[].name  | body   | string | Yes (per item) | Must be non-empty after trimming; max 255 characters                                                                        | "Invalid recipient at index N"   |

For the recipients array, the error message includes the zero-based index of the failing item so the caller can identify which entry is invalid.

---

## GET /campaigns/:id

| Field | Source | Type    | Required | Rules                                | Error Message          |
|-------|--------|---------|----------|--------------------------------------|------------------------|
| id    | path   | integer | Yes      | Must be a positive whole number (greater than zero) | "Invalid campaign id"  |

---

## PATCH /campaigns/:id

| Field              | Source | Type    | Required       | Rules                                                                                             | Error Message                             |
|--------------------|--------|---------|----------------|---------------------------------------------------------------------------------------------------|-------------------------------------------|
| id                 | path   | integer | Yes            | Must be a positive whole number                                                                   | "Invalid campaign id"                     |
| name               | body   | string  | No             | If provided: must be non-empty after trimming; max 255 characters                                 | "Campaign name cannot be empty"           |
| subject            | body   | string  | No             | If provided: must be non-empty after trimming; max 500 characters                                 | "Subject cannot be empty"                 |
| body               | body   | string  | No             | If provided: must be non-empty                                                                    | "Body cannot be empty"                    |
| recipients         | body   | array   | No             | If provided: must be an array; maximum 1000 items; each item must satisfy the per-item rules below | "Invalid recipient at index N"            |
| recipients[].email | body   | string  | Yes (per item) | Must be a syntactically valid email address format; max 255 characters                            | "Invalid recipient at index N"            |
| recipients[].name  | body   | string  | Yes (per item) | Must be non-empty after trimming; max 255 characters                                              | "Invalid recipient at index N"            |

In addition to the per-field rules above, at least one of name, subject, body, or recipients must be present in the request body. If none are provided, the server returns a 400 error with the message "At least one field must be provided".

---

## DELETE /campaigns/:id

| Field | Source | Type    | Required | Rules                           | Error Message         |
|-------|--------|---------|----------|---------------------------------|-----------------------|
| id    | path   | integer | Yes      | Must be a positive whole number | "Invalid campaign id" |

---

## POST /campaigns/:id/schedule

| Field        | Source | Type           | Required | Rules                                                                                                                                                                        | Error Message                                                              |
|--------------|--------|----------------|----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------|
| id           | path   | integer        | Yes      | Must be a positive whole number                                                                                                                                              | "Invalid campaign id"                                                      |
| scheduled_at | body   | string or null | Yes      | The field must be present. If the value is null, the schedule is cancelled. If the value is a string, it must be a valid ISO 8601 datetime string representing a point in time at least 1 minute after the moment the request is processed. | "scheduled_at must be a future date at least 1 minute from now, or null to cancel" |

---

## POST /campaigns/:id/send

| Field | Source | Type    | Required | Rules                           | Error Message         |
|-------|--------|---------|----------|---------------------------------|-----------------------|
| id    | path   | integer | Yes      | Must be a positive whole number | "Invalid campaign id" |

---

## GET /campaigns/:id/stats

| Field | Source | Type    | Required | Rules                           | Error Message         |
|-------|--------|---------|----------|---------------------------------|-----------------------|
| id    | path   | integer | Yes      | Must be a positive whole number | "Invalid campaign id" |

---

## Notes on Validation Behavior

- Trimming applies to string fields where stated: leading and trailing whitespace is removed before checking emptiness and length. The stored value should also be trimmed.
- Length constraints refer to the number of characters after trimming where trimming is specified, and before trimming otherwise.
- When multiple fields fail validation in a single request, all failures should be reported together in the details field of the error response rather than stopping at the first failure.
- Path parameter validation (for id fields) that fails should return 400, not 404, since the value is syntactically invalid before any database lookup is attempted.
