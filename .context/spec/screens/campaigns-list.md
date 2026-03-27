---
screen: Campaigns List
route: /campaigns
auth: required (redirect to /login if no valid token)
---

# Campaigns List Screen Spec

## Purpose

Shows the authenticated user's campaigns in reverse-chronological order with status badges, recipient counts, and pagination. Entry point for navigating to a specific campaign or creating a new one.

---

## Layout

Full-width page with a top header bar and a scrollable content area below it.

### Header Bar

- Left: Application name / logo text "Campaign Manager"
- Right: "New Campaign" button (primary variant) → navigates to /campaigns/new
- Right (far right): User's name with a logout button or dropdown

### Content Area

- Page title: "Campaigns"
- Subtitle showing total count: "X campaigns" (from pagination.total)
- List of campaign cards (see CampaignCard below)
- Pagination controls at the bottom (see Pagination below)
- Empty state when no campaigns exist (see Empty State below)

---

## Components

### CampaignsListPage (page component)

- Calls the RTK Query `listCampaigns` hook on mount with the current page from URL search params (default page 1, limit 20)
- Shows skeleton loaders while loading
- Shows the error state if the query fails
- Renders the list of CampaignCard components when data is available

### CampaignCard

Each card represents one campaign and displays:

- Campaign name (bold, prominent)
- Subject (secondary text, truncated to one line with ellipsis)
- StatusBadge component (see below)
- Recipient count: "X recipients" (using campaigns[].recipient_count)
- Scheduled at: shown only when status is scheduled — formatted as a human-readable date and time (e.g. "Scheduled for Mar 28, 2026 at 3:00 PM")
- Created at: shown in muted text (e.g. "Created Mar 27, 2026")
- The entire card is clickable and navigates to /campaigns/:id

Cards are displayed in a vertical list. On wider screens (md breakpoint and above) cards may use a grid of two columns.

### StatusBadge

A small pill-shaped badge rendered inside CampaignCard and on the CampaignDetail screen.

| Status    | Variant / color       | Label       |
|-----------|-----------------------|-------------|
| draft     | secondary (grey)      | Draft       |
| scheduled | outline with blue text | Scheduled  |
| sent      | default (green)       | Sent        |

### SkeletonCard

Shown in place of each CampaignCard while the initial query is loading. Renders skeleton shapes matching the approximate layout of a real card (one wide line for name, one narrower line for subject, a small pill for the badge, and a short line for recipient count). Show 4 skeleton cards by default.

### Pagination

Shown below the card list only when pagination.total is greater than pagination.limit.

- Displays Previous and Next buttons
- Displays current page indicator: "Page X of Y"
- Previous is disabled on page 1; Next is disabled on the last page
- Clicking Previous or Next updates the page query param in the URL and re-fetches via RTK Query

### Empty State

Shown when the query succeeds but campaigns array is empty (pagination.total equals zero).

- Centered vertically in the content area
- Icon: a simple inbox or mail icon
- Heading: "No campaigns yet"
- Sub-text: "Create your first campaign to get started."
- Button: "New Campaign" (primary variant) → navigates to /campaigns/new

---

## Data Shape (from RTK Query)

The hook receives the full response from GET /campaigns:

- campaigns — array of campaign summary objects (id, name, subject, status, scheduled_at, created_at, recipient_count)
- pagination — object with page, limit, total

---

## RTK Query Hook

- Hook name: useListCampaignsQuery
- Arguments: object with page (integer, defaults to 1) and limit (integer, defaults to 20)
- The hook is called with the page derived from the URL search param "page"
- When the page param changes, RTK Query automatically re-fetches
- Cache is invalidated (tag: "Campaign") after a successful create, update, delete, schedule, or send mutation

---

## Loading State

While isLoading is true (first fetch only), render 4 SkeletonCard components in place of the real list. Do not show skeleton during subsequent page navigations; show a subtle loading indicator (e.g. reduced opacity on the existing cards) instead using isFetching.

---

## Error State

If the query returns an error, show a full-width error alert inside the content area:

- Heading: "Failed to load campaigns"
- Message: the error detail from the API response if available, otherwise "Something went wrong. Please try again."
- A Retry button that calls the refetch function from the RTK Query hook

---

## Logout

Clicking the logout button (in the header) dispatches `clearCredentials` to the auth slice (which removes the token and user from state and localStorage) and navigates to /login.
