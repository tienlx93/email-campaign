---
screen: Campaigns List
route: /campaigns
auth: required (redirect to /login if no valid token)
---

# Campaigns List Screen Spec

## Purpose

Shows the authenticated user's campaigns in a full-width data table with search and filter controls. Entry point for navigating to a specific campaign or creating a new one.

---

## Layout

Full-width page under AdminLayout. Content area scrollable below the fixed top bar.

### Page Header

- Page title: "Email Campaigns" (bold, prominent)
- Right: "New Campaign" button (primary variant) → navigates to /campaigns/new

---

## Search and Filter Bar

Positioned above the data table in a single horizontal row.

**Search Input**

- Flex-grow to fill available space
- Placeholder: "Search campaigns..."
- Searches campaign name and subject using case-insensitive substring match (ILIKE on backend)
- Debounced 300ms: query param "search" is only sent to backend after user stops typing
- Resets pagination to page 1 when search term changes
- Input can be cleared to show all campaigns

**Status Filter Dropdown**

- Label: "Status" (optional)
- Default: "All statuses"
- Options: All statuses, Draft, Scheduled, Sent
- Sends "status" query param on selection (value: draft|scheduled|sent, or empty/omitted for all)
- Resets pagination to page 1 when status filter changes
- Dropdown uses a select component (shadcn/ui Select or similar)

Both controls are independent and compose with each other.

---

## Data Table

Full-width table replacing the old card grid layout.

### Columns (left to right)

1. **Campaign Name** (bold text) — the campaign's name, acts as primary content
2. **Subject** (normal text, truncated) — email subject line, max 2–3 lines, text-ellipsis overflow
3. **Status** (badge) — StatusBadge component (see below)
4. **Recipients** (count) — number of recipients (e.g. "150" or "0")
5. **Scheduled At** (date or "—") — formatted date only (e.g. "Mar 28, 2026" or "—" if not scheduled)
6. **Created At** (short date) — when the campaign was created (e.g. "Mar 27")

### Row Behavior

- Entire row is clickable
- Clicking a row navigates to /campaigns/:id
- Cursor changes to pointer on hover
- Subtle hover effect (background color shift or highlight)

### Status Badge Styling

| Status    | Color       | Label       |
|-----------|-------------|-------------|
| draft     | Grey        | Draft       |
| scheduled | Blue        | Scheduled   |
| sent      | Green       | Sent        |

### Default Sorting

- Sorted by created_at DESC (newest first)
- Sort indicator visible in table header

### Pagination

Shown below the table only when pagination.total > pagination.limit.

- Previous and Next buttons
- Current page indicator: "Page X of Y"
- Previous disabled on page 1; Next disabled on last page
- Clicking Previous or Next updates the page query param and re-fetches data

---

## Empty States

### No Campaigns Total

Shown when the query succeeds but campaigns array is empty and no search/filter is active.

- Centered vertically in the content area
- Icon: mail icon
- Heading: "No campaigns yet"
- Subtext: "Create your first campaign to get started."
- Button: "New Campaign" (primary variant) → navigates to /campaigns/new

### Search or Filter Returns Zero Results

Shown when search or filter params are active but no campaigns match.

- Centered vertically in the content area
- Heading: "No campaigns match your search"
- Subtext: (optional) "Try adjusting your search terms or filters."
- Button: "Clear filters" — resets search and status filter to defaults, returns to page 1

---

## Data Loading and Error States

### Loading State (initial)

While isLoading is true on first fetch, render 4–6 skeleton table rows in place of real data. Each skeleton row has skeleton shapes for: name, subject, status badge, recipients, scheduled at, created at.

### Loading State (subsequent)

During pagination or filter/search changes, show a subtle loading indicator (e.g. reduced opacity on existing rows or a loading spinner in the table) while isFetching is true. Do not hide existing data.

### Error State

If the query returns an error:

- Show a full-width error alert inside the content area
- Heading: "Failed to load campaigns"
- Message: error detail from API response if available, otherwise "Something went wrong. Please try again."
- Retry button: calls the refetch function from RTK Query hook

---

## Data Shape (from RTK Query)

The hook receives the full response from GET /campaigns (with optional search and status params):

- campaigns — array of campaign summary objects: id, name, subject, status, scheduled_at, created_at, recipient_count
- pagination — object with page, limit, total

---

## RTK Query Hook

- Hook name: useListCampaignsQuery
- Arguments: object with page (integer, default 1), limit (integer, default 20), search (string, optional), status (string, optional, one of draft|scheduled|sent)
- When page, search, or status params change, RTK Query automatically re-fetches
- Cache is invalidated (tag: "Campaign") after a successful create, update, delete, schedule, or send mutation
- Debouncing: search changes are debounced 300ms before triggering a query update

---

## Backend Query Parameters

GET /campaigns endpoint accepts optional query params:

- search (string, optional) — filters campaigns where name ILIKE '%search%' OR subject ILIKE '%search%' (case-insensitive substring match)
- status (string, optional, one of draft|scheduled|sent) — filters by exact status match
- page (integer, default 1) — pagination
- limit (integer, default 20) — pagination

All params compose with each other. Filters are AND-ed together.

---

## Notes

- The layout replaces the old card-grid component with a table-based UI
- Search is debounced to reduce backend calls
- All filters reset pagination to page 1 to avoid orphaned "empty" pages
- The existing "New Campaign" button in the header provides the primary action for creating campaigns
- Row click is the primary navigation pattern (no separate view button needed)
