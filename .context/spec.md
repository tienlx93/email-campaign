# Spec — Functional Requirements

> Source: [requirement.md](.context/requirement.md)
> Derived detailed specs: [.context/spec/](.context/spec/)

---

## Domain Overview

**Mini Campaign Manager** — a simplified MarTech tool for marketers to create, manage, and track email campaigns.

---

## Database Schema

### `users`
| Column | Type | Constraints |
|---|---|---|
| id | UUID / SERIAL | PK |
| email | VARCHAR(255) | NOT NULL, UNIQUE |
| name | VARCHAR(255) | NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

### `campaigns`
| Column | Type | Constraints |
|---|---|---|
| id | UUID / SERIAL | PK |
| name | VARCHAR(255) | NOT NULL |
| subject | VARCHAR(500) | NOT NULL |
| body | TEXT | NOT NULL |
| status | VARCHAR(20) | NOT NULL, CHECK IN ('draft','scheduled','sent'), DEFAULT 'draft' |
| scheduled_at | TIMESTAMPTZ | NULLABLE |
| created_by | FK → users.id | NOT NULL, ON DELETE RESTRICT |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

### `recipients`
| Column | Type | Constraints |
|---|---|---|
| id | UUID / SERIAL | PK |
| email | VARCHAR(255) | NOT NULL, UNIQUE |
| name | VARCHAR(255) | NOT NULL |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

### `campaign_recipients`
| Column | Type | Constraints |
|---|---|---|
| campaign_id | FK → campaigns.id | NOT NULL, ON DELETE CASCADE |
| recipient_id | FK → recipients.id | NOT NULL, ON DELETE RESTRICT |
| sent_at | TIMESTAMPTZ | NULLABLE |
| opened_at | TIMESTAMPTZ | NULLABLE |
| status | VARCHAR(20) | NOT NULL, CHECK IN ('pending','sent','failed'), DEFAULT 'pending' |

**Primary key:** (campaign_id, recipient_id)

### Indexes (required)
- `campaigns(created_by)` — filter by user
- `campaigns(status)` — filter by status
- `campaigns(scheduled_at)` — scheduler queries
- `campaign_recipients(campaign_id)` — join stats
- `campaign_recipients(status)` — count by status
- `recipients(email)` — upsert/lookup by email

---

## API Endpoints

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login, return JWT |

### Campaigns

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/campaigns` | Yes | List campaigns (paginated) |
| POST | `/campaigns` | Yes | Create campaign (status: draft) |
| GET | `/campaigns/:id` | Yes | Campaign details + recipient stats |
| PATCH | `/campaigns/:id` | Yes | Update campaign (**draft only**) |
| DELETE | `/campaigns/:id` | Yes | Delete campaign (**draft only**) |
| POST | `/campaigns/:id/schedule` | Yes | Set or cancel `scheduled_at` |
| POST | `/campaigns/:id/send` | Yes | Simulate send (marks all recipients sent) |
| GET | `/campaigns/:id/stats` | Yes | Return send/open rates |

---

## Business Rules

1. **Edit/Delete guard**: A campaign can only be edited (`PATCH`) or deleted (`DELETE`) when `status = 'draft'`.
2. **Schedule validation**: `scheduled_at` must be a **future** timestamp. Pass `null` to cancel scheduling.
3. **Send is terminal**: Sending transitions `status → 'sent'` and cannot be undone. All `campaign_recipients` records are marked `sent` and `sent_at` is recorded.
4. **Campaign ownership**: Users should only see/modify their own campaigns (filter by `created_by`).
5. **Recipient upsert**: When creating a campaign with recipient emails, upsert recipients by email.

---

## Stats Response Shape

```json
{
  "total": 0,
  "sent": 0,
  "failed": 0,
  "opened": 0,
  "open_rate": 0.0,
  "send_rate": 0.0
}
```

- `open_rate = opened / total` (0 if total = 0)
- `send_rate = sent / total` (0 if total = 0)

---

## Input Validation Rules

### `POST /auth/register`
- `email`: required, valid email format
- `name`: required, non-empty string, max 255 chars
- `password`: required, min 8 chars

### `POST /auth/login`
- `email`: required, valid email format
- `password`: required, non-empty

### `POST /campaigns`
- `name`: required, non-empty, max 255 chars
- `subject`: required, non-empty, max 500 chars
- `body`: required, non-empty string (HTML from rich text editor)
- `recipients`: optional array of `{ email, name }` — email must be valid format

### `PATCH /campaigns/:id`
- Same fields as POST, all optional (partial update)
- Campaign must be in `draft` status

### `POST /campaigns/:id/schedule`
- `scheduled_at`: required ISO datetime string, must be in the future — OR `null` to cancel

### `POST /campaigns/:id/send`
- No body required
- Campaign must not already be `sent`

### Path params
- `:id` — must be a valid integer (or UUID depending on chosen PK type)

---

## Frontend Pages

### `/login`
- Email + password form
- On success: store JWT in localStorage, redirect to `/campaigns`
- Show field-level validation errors
- Show API error (invalid credentials)

### `/campaigns`
- List all campaigns for the authenticated user
- Status badges: `draft` = grey, `scheduled` = blue, `sent` = green
- Pagination (page-based or infinite scroll)
- Link to campaign detail
- "New Campaign" button → `/campaigns/new`

### `/campaigns/new`
- Form: name, subject, body (QuillJS rich text editor), recipient emails (multi-input)
- Submit → POST `/campaigns`, redirect to campaign detail on success
- Client-side validation before submit

### `/campaigns/:id`
- Campaign details (name, subject, status, scheduled_at)
- Recipient list with per-recipient status
- Stats section: send rate + open rate (progress bars)
- Conditional action buttons:
  - `draft`: Schedule, Send, Delete
  - `scheduled`: Send, Cancel Schedule, Delete
  - `sent`: none (read-only)
- Loading skeletons while fetching
- Meaningful error messages for failed actions

---

## Non-Functional Requirements

- Swagger UI available at `/api-docs` in development
- Docker Compose `docker compose up` starts all services
- README includes local setup + seed data instructions + "How I Used Claude Code" section
- At least 3 meaningful tests (unit or integration)
- At least 1 integration test using Vitest + Testcontainers
