# Database Schema Specification

This document describes all four database tables used by the Mini Campaign Manager API. Each section defines the columns for one table, followed by a list of indexes and the rationale for each.

---

## Table: users

Stores registered user accounts. Each user is the owner of any campaigns they create.

| Field Name    | Data Type                       | Nullable | Default          | Constraints                        |
|---------------|---------------------------------|----------|------------------|------------------------------------|
| id            | Auto-incrementing integer       | No       | Auto-assigned    | Primary key                        |
| email         | Variable text, max 255 chars    | No       | None             | Must be unique across all rows     |
| name          | Variable text, max 255 chars    | No       | None             | None                               |
| password_hash | Variable text, max 255 chars    | No       | None             | None                               |
| created_at    | Timezone-aware timestamp        | No       | Current time     | None                               |

### Indexes on users

No additional indexes are required beyond the primary key and the unique constraint on email. The unique constraint implicitly creates an index that also serves lookup-by-email during login.

---

## Table: campaigns

Stores email campaign records. Each campaign belongs to exactly one user.

| Field Name   | Data Type                       | Nullable | Default          | Constraints                                                                                       |
|--------------|---------------------------------|----------|------------------|---------------------------------------------------------------------------------------------------|
| id           | Auto-incrementing integer       | No       | Auto-assigned    | Primary key                                                                                       |
| name         | Variable text, max 255 chars    | No       | None             | None                                                                                              |
| subject      | Variable text, max 500 chars    | No       | None             | None                                                                                              |
| body         | Unlimited text                  | No       | None             | None                                                                                              |
| status       | Variable text, max 20 chars     | No       | draft            | Must be one of: draft, scheduled, sent                                                            |
| scheduled_at | Timezone-aware timestamp        | Yes      | None             | None                                                                                              |
| created_by   | Integer                         | No       | None             | Foreign key referencing users.id; deleting a user is blocked if they own any campaigns (RESTRICT) |
| created_at   | Timezone-aware timestamp        | No       | Current time     | None                                                                                              |
| updated_at   | Timezone-aware timestamp        | No       | Current time     | Must be updated to the current time on every row modification                                    |

### Indexes on campaigns

- Index on created_by — every campaign list query filters campaigns down to those owned by the authenticated user, making this index essential for performance.
- Index on status — the scheduler and list-filter queries both need to quickly locate campaigns matching a particular status value.
- Index on scheduled_at — the scheduler queries for campaigns whose scheduled_at has arrived or passed, requiring an efficient range scan on this column.

---

## Table: recipients

Stores individual email recipients. A recipient is identified uniquely by their email address and can be linked to multiple campaigns.

| Field Name | Data Type                    | Nullable | Default       | Constraints                    |
|------------|------------------------------|----------|---------------|--------------------------------|
| id         | Auto-incrementing integer    | No       | Auto-assigned | Primary key                    |
| email      | Variable text, max 255 chars | No       | None          | Must be unique across all rows |
| name       | Variable text, max 255 chars | No       | None          | None                           |
| created_at | Timezone-aware timestamp     | No       | Current time  | None                           |

### Indexes on recipients

- Index on email — campaign creation upserts recipients by email address, requiring fast lookup by this field to determine whether to insert or update an existing row.

---

## Note on updated_at

The application layer is responsible for explicitly setting the updated_at field to the current timestamp on every PATCH or update operation. This is not handled by a database trigger or any automatic database mechanism. Agents implementing the update logic must include this assignment explicitly in every update query.

---

## Table: campaign_recipients

Join table linking campaigns to recipients. Tracks the per-recipient delivery state for each campaign send.

| Field Name   | Data Type                    | Nullable | Default       | Constraints                                                                                                    |
|--------------|------------------------------|----------|---------------|----------------------------------------------------------------------------------------------------------------|
| campaign_id  | Integer                      | No       | None          | Foreign key referencing campaigns.id; deleting a campaign cascades to delete all its campaign_recipient rows   |
| recipient_id | Integer                      | No       | None          | Foreign key referencing recipients.id; deleting a recipient is blocked if they are linked to a campaign (RESTRICT) |
| sent_at      | Timezone-aware timestamp     | Yes      | None          | None                                                                                                           |
| opened_at    | Timezone-aware timestamp     | Yes      | None          | None                                                                                                           |
| status       | Variable text, max 20 chars  | No       | pending       | Must be one of: pending, sent, failed                                                                          |

The primary key for this table is the combination of campaign_id and recipient_id. No single-column primary key exists.

### Indexes on campaign_recipients

- Index on campaign_id — stats aggregation and recipient listing always filter or join on campaign_id, making this index critical for those queries.
- Index on status — counting recipients by delivery status for the stats endpoint requires filtering on this column efficiently across potentially large result sets.
