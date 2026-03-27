# Business Rules Specification

This document describes all business logic that governs the Mini Campaign Manager beyond simple validation. No code appears here — these rules are expressed in plain prose and tables for agents to translate into implementation.

---

## Campaign Status State Machine

A campaign is always in exactly one of three statuses: draft, scheduled, or sent. The following table lists every valid transition, the action that triggers it, and the conditions that must be met.

| From Status | To Status | Triggering Action                                     | Conditions Required                                              |
|-------------|-----------|-------------------------------------------------------|------------------------------------------------------------------|
| (new)       | draft     | Campaign creation via POST /campaigns                 | Always; new campaigns always start as draft                      |
| draft       | scheduled | POST /campaigns/:id/schedule with a future datetime   | scheduled_at must be at least 1 minute in the future             |
| scheduled   | draft     | POST /campaigns/:id/schedule with null                | Campaign must not already be sent                                |
| draft       | sent      | POST /campaigns/:id/send or scheduler job fires       | Campaign must not already be sent                                |
| scheduled   | sent      | POST /campaigns/:id/send or scheduler job fires       | Campaign must not already be sent                                |
| sent        | (any)     | Not possible                                          | sent is a terminal status; no transitions out of sent are allowed |

---

## Business Rules

### Rule 1 — Edit and Delete Guard

PATCH and DELETE requests are only permitted when the campaign's current status is draft. If the campaign's status is scheduled or sent at the time the request is processed, the server must reject the request with HTTP 409 Conflict. The error message should clearly state that the campaign cannot be modified because it is not in draft status. This guard applies even if the requested change would result in no actual data modification.

### Rule 2 — Schedule Constraint

The scheduled_at value supplied to the schedule endpoint must represent a point in time at least 1 minute after the moment the server processes the request. The comparison is made against the server's current clock at request time, not at any other point. If the supplied datetime is in the past or within 1 minute of the current time, the request is rejected with HTTP 400.

If scheduled_at is null, the schedule is cancelled. When cancellation is requested on a campaign that is currently scheduled, the campaign's status returns to draft and its scheduled_at field is cleared. When cancellation is requested on a campaign that is already in draft status (i.e., no schedule was set), the request is treated as a no-op and succeeds without error.

If the campaign is already in sent status when the schedule endpoint is called — regardless of whether a datetime or null is supplied — the request is rejected with HTTP 409.

### Rule 3 — Terminal Send

When a campaign is sent, whether through the send endpoint or because a scheduled job fires, the following changes are applied atomically:

- Every campaign_recipient row linked to that campaign has its status set to sent and its sent_at set to the current time.
- The campaign row's status is set to sent.

This action cannot be undone. There is no way to revert a campaign from sent to any other status. Calling the send endpoint on a campaign that already has status sent returns HTTP 409.

The send action applies to all campaign_recipients that exist at the moment of sending. Recipients added after sending are not retroactively sent to; however, the spec does not support adding recipients after a campaign is sent.

### Rule 4 — Ownership and Privacy

Every database query that retrieves or modifies campaign data must filter by the authenticated user's id from the JWT. A campaign that exists in the database but belongs to a different user is treated as if it does not exist. The server returns HTTP 404 in this case, not HTTP 403. This prevents authenticated users from discovering whether a particular campaign id exists in the system at all.

This rule applies to all campaign endpoints: GET, PATCH, DELETE, schedule, send, and stats.

### Rule 5 — Recipient Upsert

When a campaign is created with a non-empty recipients array, each recipient is processed as follows:

First, look up the recipients table by email address. If no row exists for that email, insert a new recipient with the provided email and name. If a row already exists for that email, update the existing row's name to the provided value (the email serves as the stable identifier).

Second, create a row in campaign_recipients linking the campaign to the recipient. If a link between this campaign and this recipient already exists (which could happen in edge cases), the duplicate is ignored rather than treated as an error.

The upsert is processed for all recipients in the array before the response is returned. If any individual recipient entry fails validation (as described in the validation rules document), the entire campaign creation request is rejected before any database writes occur.

### Rule 6 — Stats Calculation

The stats endpoint and the stats object embedded in campaign detail responses compute the following values by querying the campaign_recipients rows for the given campaign:

- total: the count of all campaign_recipient rows for the campaign, regardless of status.
- sent: the count of rows where the status column equals sent.
- failed: the count of rows where the status column equals failed.
- opened: the count of rows where the opened_at column is not null.
- open_rate: opened divided by total. If total is zero, open_rate is zero. The result is rounded to 4 decimal places.
- send_rate: sent divided by total. If total is zero, send_rate is zero. The result is rounded to 4 decimal places.

These values are computed at query time and are not cached or stored separately in the database.

---

## Scheduler Behavior

The scheduler is a background process that runs within the same server process as the API. It is responsible for auto-sending campaigns when their scheduled_at time arrives.

### On Server Startup

When the server starts, it queries the database for all campaigns with status scheduled and a scheduled_at value in the future. For each such campaign, the scheduler registers a timed job to fire at that campaign's scheduled_at time. All registered jobs are tracked in memory using the campaign id as the key. This ensures that campaigns scheduled before a server restart are not forgotten.

### When a Campaign is Scheduled or Rescheduled

When the schedule endpoint is called with a valid future datetime, the scheduler first cancels and removes any existing job registered for that campaign id, then registers a new job for the new scheduled_at time. This handles the case where a campaign was already scheduled and is being moved to a different time.

### When a Campaign's Schedule is Cancelled

When the schedule endpoint is called with null, the scheduler cancels and removes any job currently registered for that campaign id. No new job is created.

### When a Scheduled Job Fires

When a registered job's timer expires, the scheduler does not immediately execute the send logic. Instead, it first queries the database to confirm that the campaign still has status scheduled. This guards against race conditions where the campaign was manually sent, deleted, or otherwise modified between the time the job was registered and the time it fired.

If the database confirms the campaign still has status scheduled, the scheduler executes the full send logic described in Rule 3 above.

If the campaign's status has changed since the job was registered — for example, because a user manually triggered the send endpoint in the meantime — the scheduler skips execution and removes the job from memory.

### On Server Shutdown

When the server process receives a shutdown signal, all registered scheduler jobs are cancelled before the process exits. This prevents jobs from firing against a database that the server is no longer connected to, and ensures a clean restart where the startup query (described above) will accurately reflect the true state of pending campaigns.
