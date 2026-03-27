---
screen: Campaign Detail
route: /campaigns/:id
auth: required (redirect to /login if no valid token)
---

# Campaign Detail Screen Spec

## Purpose

Shows the full details of a single campaign: metadata, email body (with a preview/edit toggle for drafts), stats with progress bars, recipient list with per-recipient status, and context-sensitive action buttons. All mutating actions (schedule, send, delete, edit) are performed from this screen.

---

## Layout

Single-column layout with a back navigation link at the top, followed by four sections stacked vertically:

1. Header section — campaign metadata and action buttons
2. Stats section — send and open rate visualisation
3. Body section — edit/preview toggle (draft only) or read-only preview (scheduled/sent)
4. Recipients section — table of linked recipients

---

## Top Navigation

A back link reading "← Back to campaigns" that navigates to /campaigns.

---

## Components

### CampaignDetailPage (page component)

- Calls the RTK Query `getCampaign` hook on mount using the :id route param
- Shows skeleton loaders while loading
- Shows error state if the query fails or returns 404
- Renders all four sections once data is available

---

## Section 1 — Header

Displays:

- Campaign name as a large heading
- Subject as secondary text below the name
- StatusBadge (same component as on the list screen)
- Dates row: "Created" date and "Last updated" date, formatted in a human-readable short form
- Scheduled at: shown only when status is scheduled — "Scheduled for [date and time]"
- Action buttons row (see Action Buttons below)

### Action Buttons

The set of buttons shown depends on campaign status. Buttons are right-aligned on the header row.

**Status: draft**

- Edit / Preview toggle button (outline variant) — toggles the body section between edit mode and preview mode (see Section 3 below); label reads "Edit" when currently in preview mode, "Preview" when currently in edit mode
- Schedule button (secondary variant) — opens the ScheduleDialog
- Send button (destructive variant) — opens the SendConfirmDialog
- Delete button (ghost/outline variant) — opens the DeleteConfirmDialog

**Status: scheduled**

- Send button (destructive variant) — opens the SendConfirmDialog
- Cancel Schedule button (outline variant) — calls the schedule mutation with scheduled_at set to null; no confirmation dialog needed; shows inline loading state on the button while in-flight
- Delete button (ghost/outline variant) — opens the DeleteConfirmDialog

**Status: sent**

- No action buttons are shown
- A read-only badge or note reading "This campaign has been sent" is displayed in the action area

---

## ScheduleDialog

A modal dialog opened by the Schedule button.

- Title: "Schedule Campaign"
- Description: "Choose a future date and time to automatically send this campaign."
- A date-time picker input — the value must be at least 1 minute in the future
- Confirm button: "Schedule" (primary variant)
- Cancel button: "Cancel" (outline variant) — closes the dialog without submitting
- On confirm: calls the RTK Query `scheduleCampaign` mutation with the selected datetime as an ISO string
- On HTTP 200: closes the dialog; the campaign detail refetches automatically via cache invalidation
- On HTTP 400 or 409: shows the error message inside the dialog below the input, dialog stays open
- While the mutation is in-flight: confirm button shows spinner and is disabled

Client-side validation: the selected datetime must be a valid date at least 1 minute after the current time. Error message: "Please select a future date and time."

---

## SendConfirmDialog

An AlertDialog (destructive) asking the user to confirm the send action.

- Title: "Send Campaign"
- Description: "This will immediately send the campaign to all X recipients. This action cannot be undone."
- Confirm button: "Send Now" (destructive variant)
- Cancel button: "Cancel" (outline variant)
- On confirm: calls the RTK Query `sendCampaign` mutation
- On HTTP 200: closes the dialog; campaign detail refetches via cache invalidation; shows a success toast "Campaign sent successfully"
- On HTTP 409 (already sent): closes the dialog; shows an error toast "Campaign was already sent"
- While in-flight: confirm button shows spinner and is disabled

---

## DeleteConfirmDialog

An AlertDialog (destructive) asking the user to confirm deletion.

- Title: "Delete Campaign"
- Description: "Are you sure you want to delete this campaign? This action cannot be undone."
- Confirm button: "Delete" (destructive variant)
- Cancel button: "Cancel" (outline variant)
- On confirm: calls the RTK Query `deleteCampaign` mutation
- On HTTP 204: navigate to /campaigns; show a success toast "Campaign deleted"
- On HTTP 409 (not draft): show an error toast "Only draft campaigns can be deleted"; close dialog
- While in-flight: confirm button shows spinner and is disabled

---

## Section 2 — Stats

Shown for all campaigns. When status is draft and stats.total is zero, show a muted placeholder: "No recipients added yet."

Displays four stat items, each with a label, numeric value, and (for rates) a progress bar:

- Total recipients — numeric value only (stats.total)
- Sent — numeric value (stats.sent) with a progress bar showing stats.send_rate as a percentage (green color)
- Opened — numeric value (stats.opened) with a progress bar showing stats.open_rate as a percentage (blue color)
- Failed — numeric value (stats.failed), no progress bar

The send rate and open rate progress bars display the percentage rounded to one decimal place as a label to the right of the bar (e.g. "72.3%").

---

## Section 3 — Body (Edit / Preview Toggle)

This section behaves differently depending on campaign status and the active toggle mode.

### For scheduled and sent campaigns (always read-only)

- Label: "Email Body"
- The raw HTML from the campaign body field is rendered inside a sandboxed container (dangerouslySetInnerHTML is acceptable here since the content is authored by the authenticated user)
- A light border and slight background tint distinguish the preview area from the surrounding page
- No editing controls are shown

### For draft campaigns — Preview mode (default)

- Label: "Email Body" with a "Preview" mode indicator
- Same read-only HTML render as above
- The Edit/Preview toggle button in the header (labeled "Edit") switches to edit mode

### For draft campaigns — Edit mode

- Label: "Email Body" with an "Editing" mode indicator
- A React Hook Form instance is activated, pre-populated with the current campaign's name, subject, body, and recipients
- The body field is rendered as a React Quill editor pre-filled with the existing HTML body
- The name and subject fields are rendered as text inputs above the Quill editor (the recipients field is not editable from this inline form — recipients are managed separately)
- A "Save changes" button (primary variant) appears below the editor
- A "Discard" button (ghost variant) appears next to Save, which reverts the form to the last saved values and switches back to preview mode without an API call
- Clicking the Edit/Preview toggle button in the header (now labeled "Preview") also discards unsaved changes and switches back to preview mode

**Save behavior:**

- On click of "Save changes": calls the RTK Query `updateCampaign` mutation (PATCH /campaigns/:id) with only the changed fields (name, subject, body)
- While in-flight: the Save button shows a spinner and is disabled; the editor and inputs are read-only
- On HTTP 200: switches back to preview mode; the updated campaign data is reflected immediately via RTK Query cache update; shows a success toast "Changes saved"
- On HTTP 409 (no longer draft): shows an error toast "Campaign can no longer be edited"; switches back to preview mode
- On HTTP 400: shows the API error message inside the edit section below the editor; stays in edit mode

**Initial state:** the page always opens in preview mode, regardless of status.

---

## Section 4 — Recipients

- Label: "Recipients" with the total count in parentheses
- Rendered as a table with columns: Name, Email, Status, Sent At, Opened At

### Table Columns

| Column    | Value source                      | Notes                                          |
|-----------|-----------------------------------|------------------------------------------------|
| Name      | recipients[].name                 | Plain text                                     |
| Email     | recipients[].email                | Plain text                                     |
| Status    | recipients[].status               | Rendered as a small badge: pending=grey, sent=green, failed=red |
| Sent At   | recipients[].sent_at              | Formatted datetime or "—" if null             |
| Opened At | recipients[].opened_at            | Formatted datetime or "—" if null             |

When the recipients array is empty, a full-width muted row reads "No recipients linked to this campaign."

The table does not paginate client-side; all recipients from the API response are shown. If the list is very long (more than 50 rows), the table container scrolls independently with a fixed max height.

---

## Loading State

While isLoading is true, replace each of the four sections with skeleton shapes:

- Header skeleton: one wide skeleton line for the name, one narrower for the subject, a small pill for the badge, two short lines for dates, and two skeleton buttons
- Stats skeleton: four rectangular skeleton blocks side by side
- Body preview skeleton: three skeleton lines of varying widths
- Recipients skeleton: a skeleton table with 3 rows of 5 cells each

---

## Error State

If the query returns a 404 error (campaign not found or not owned by the user):

- Show a centered error message: "Campaign not found"
- Sub-text: "This campaign does not exist or you do not have permission to view it."
- A button "Back to campaigns" that navigates to /campaigns

For any other error (network failure, 500):

- Show a full-width error alert with a Retry button that calls refetch

---

## Toast Notifications

The screen uses Sonner toasts for transient feedback on mutations:

- Send success: "Campaign sent successfully" (default/success)
- Delete success: "Campaign deleted" (default/success)
- Any mutation 409 error: the error message from the API response (destructive)
- Any mutation network error: "Something went wrong. Please try again." (destructive)
