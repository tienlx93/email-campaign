---
screen: New Campaign
route: /campaigns/new
auth: required (redirect to /login if no valid token)
---

# New Campaign Screen Spec

## Purpose

Allows the authenticated user to create a new campaign in draft status. The form collects the campaign name, subject, HTML body (via rich text editor), and an optional list of recipients. On success, redirects to the new campaign's detail page.

---

## Layout

Single-column centered form, maximum width of 800px, with a back navigation link at the top and a submit button at the bottom.

### Top Navigation

- A back link reading "← Back to campaigns" that navigates to /campaigns without a confirmation dialog (form data is lost).

### Page Title

"New Campaign" — displayed as a heading above the form.

### Form

All fields are arranged vertically in a single column. Required fields are marked with an asterisk in their label.

---

## Components

### NewCampaignPage (page component)

- Owns form state via React Hook Form with a Zod resolver
- Calls the RTK Query `createCampaign` mutation on submit
- On success: navigates to /campaigns/:id using the campaign id from the response
- On error: displays the API error message above the submit button

### NameField

- Label: "Campaign Name *"
- Input type: text
- Placeholder: "e.g. Summer Promotion"
- Validation: required, non-empty, max 255 characters

### SubjectField

- Label: "Email Subject *"
- Input type: text
- Placeholder: "e.g. Don't miss our summer deals"
- Validation: required, non-empty, max 500 characters

### BodyField

- Label: "Email Body *"
- Component: React Quill rich text editor
- The editor outputs HTML as a string stored in form state
- Minimum visible height: 200px
- Toolbar: bold, italic, underline, ordered list, unordered list, link — standard Quill toolbar subset
- Validation: required; the raw HTML must contain at least one non-whitespace character after stripping tags (i.e. the editor must not be empty)

### RecipientsField

- Label: "Recipients (optional)"
- Description text below the label: "Enter recipient email addresses. Each recipient requires a name and email."
- Component: a dynamic list input allowing the user to add and remove recipient rows
- Each row contains two inputs side by side:
  - Name input — label "Name", placeholder "Alice", required per row
  - Email input — label "Email", placeholder "alice@example.com", required per row, must be valid email format
- An "Add recipient" button below the list appends a new empty row
- Each row has a remove icon button on the right that deletes that row
- The entire recipients field is optional — submitting with zero rows is valid
- Validation: if any row is present, both name and email are required and email must be a valid format

### SubmitButton

- Label: "Create Campaign"
- Shows a loading spinner and is disabled while the mutation is in-flight
- Re-enables once the mutation settles

---

## Validation Rules (client-side, before submit)

All validation runs via React Hook Form with a Zod resolver. Errors appear below the relevant field.

| Field               | Rule                                                     | Error message                                    |
|---------------------|----------------------------------------------------------|--------------------------------------------------|
| name                | Required; non-empty; max 255 characters                  | "Campaign name is required" / "Max 255 characters" |
| subject             | Required; non-empty; max 500 characters                  | "Subject is required" / "Max 500 characters"     |
| body                | Required; editor must not be empty (strip HTML tags)     | "Email body is required"                         |
| recipients[].name   | Required when the row exists; non-empty                  | "Recipient name is required"                     |
| recipients[].email  | Required when the row exists; must be valid email format | "Enter a valid email address"                    |

Validation fires on submit. Individual field errors clear as the field passes validation on blur or change.

---

## API Call

- Endpoint: POST /campaigns
- Request body: name (string), subject (string), body (string — raw HTML from Quill), recipients (array of objects with email and name, omitted entirely if empty)
- On HTTP 201: navigate to /campaigns/:id where :id is the id from the response body
- On HTTP 400: show the error message from the API response above the submit button (the API validation message is descriptive enough to show directly)
- On HTTP 401: redirect to /login
- On network error: show "Something went wrong. Please try again." above the submit button

---

## Loading State

While the mutation is in-flight, the submit button shows a spinner and is disabled. No other UI changes occur — the form fields remain editable (user cannot accidentally double-submit because the button is disabled).

---

## Error State

A destructive alert banner is shown directly above the submit button when the API returns an error. It disappears when the user modifies any field. It does not replace individual field validation errors.

---

## Success State

On HTTP 201, the page immediately navigates to /campaigns/:id. No success toast is needed on the new campaign page itself; the detail page will show the newly created campaign.
