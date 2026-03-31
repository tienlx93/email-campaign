# Design Spec — Admin Portal Redesign
Date: 2026-03-30

## Overview

Redesign the Mini Campaign Manager frontend from a top-navbar single-page app into a full admin portal with a persistent collapsible left sidebar, new Dashboard page, User Settings screen, and a redesigned campaign table with search and filter. New backend endpoints support the dashboard analytics and user profile management.

---

## 1. Layout Shell

### Structure

A two-column layout replacing the existing top-navbar shell:

- Left: persistent sidebar (220px expanded, 56px icon-only collapsed)
- Right: flex column containing the top bar (48px fixed) and scrollable page content area

The sidebar and top bar are always visible on all authenticated pages.

### Sidebar

- Dark background (slate-900 / #0f172a)
- Top section: logo icon (blue rounded square, "M") + "MarTech / Campaign Mgr" label — hidden in collapsed state
- Nav groups:
  - "MAIN MENU": Dashboard (BsGrid icon), Email Campaigns (BsEnvelope icon)
  - "ACCOUNT": User Settings (BsPerson icon)
- Active nav item: left border accent in blue, slightly lighter background, white text
- Collapsed state: icons only, group labels hidden, 56px wide
- No bottom user card — user identity lives only in the top bar
- Icons from react-icons/bs (Bootstrap Icons) throughout

### Top Bar

- White background, bottom border
- Left: hamburger toggle (BsList icon) — toggles sidebar between 220px expanded and 56px collapsed; state stored in Redux (persisted to localStorage, survives page navigation)
- Center-left: site name "MarTech Campaign Manager" (bold)
- Right zone (left to right): theme toggle icon (BsMoon / BsSun), user avatar + name dropdown button
- User avatar: 28px circle, 2-letter initials derived from user name, background color deterministically chosen from 6 palette colors by hashing the name
- Dropdown menu (on avatar click): "User Settings" link to /settings, divider, "Logout" action
- Logout dispatches clearCredentials and navigates to /login (same as current behavior)

### Light / Dark Mode

- Toggle stored in Redux themeSlice + localStorage key
- Applies class "dark" to the html element
- Tailwind CSS dark mode via existing CSS variable system in index.css
- Default: light mode

### Routing

- Route "/" redirects to "/dashboard" (replaces current redirect to "/campaigns")
- New routes: /dashboard (DashboardPage), /settings (UserSettingsPage)
- All authenticated routes remain under AuthenticatedLayout
- Layout file renamed/replaced: two-column shell instead of top-navbar column

---

## 2. Email Campaigns — Table Redesign

### Layout Change

Replace the existing card grid with a full-width data table. The "New Campaign" button remains in the page header (top right).

### Search and Filter Bar

Positioned above the table, in a single row:

- Search input (flex-1): searches campaign name and subject, debounced 300ms, sends "search" query param
- Status filter dropdown: "All statuses" (default), Draft, Scheduled, Sent — sends "status" query param
- Both controls reset pagination to page 1 when changed

### Table Columns

Campaign Name (bold) · Subject (truncated, text-ellipsis) · Status badge · Recipients (count) · Scheduled At (shown as formatted date or "—") · Created At (short date)

- Status badges: Draft = grey, Scheduled = blue, Sent = green (same color map as current StatusBadge component)
- Default sort: created_at DESC
- Row click navigates to /campaigns/:id

### Empty / No-Results States

- Zero campaigns total: existing empty state (mail icon, "No campaigns yet", New Campaign button)
- Search or filter returns zero: "No campaigns match your search" with a clear-filters button

### Backend Change — Extend GET /campaigns

Add two optional query parameters to the existing endpoint:

- search: string, optional — filters campaigns where name ILIKE '%search%' OR subject ILIKE '%search%'
- status: string, optional, one of draft|scheduled|sent — filters by exact status match

Both params compose with existing page and limit params. Backend tests written before implementation (TDD).

---

## 3. Dashboard Page

### Route

/dashboard — default landing page after login

### Date Filter Bar

Positioned at the top of the page content area, above KPI cards. Contains:

- Preset pills: "Last 30 days" (default active), "Last 7 days", "Last 3 months", "This year" (Jan 1 of current year → today)
- Custom date range: two date inputs (from, to) — selecting custom dates deactivates preset pills
- Auto groupBy indicator (read-only label): range 1–30 days → "Day", 31–90 days → "Week", over 90 days → "Month"
- The groupBy value is computed in the frontend and passed as a query param to the backend

### KPI Cards (7, always visible)

Displayed in a single row of 7 equal-width cards, all filtered by the selected date range:

| Card | Value | Subtext |
|---|---|---|
| Total | count of all campaigns | "campaigns" |
| Draft | count of draft campaigns | "campaigns" |
| Scheduled | count of scheduled campaigns | "campaigns" |
| Emails Sent | sum of recipient_count for sent campaigns | "recipients" |
| Success Rate | FE-computed: sent_recipients / total_recipients | "sent / total" |
| Open Rate | FE-computed: opened / sent_recipients | "opened / sent" |
| Failed Rate | FE-computed: failed / total_recipients | "failed / total" |

Percentages are computed in the frontend. Backend returns raw integer counts only.

### Performance Overview Section

Section title: "Performance Overview" with subtitle "fromDate – toDate · grouped by day|week|month"

### Chart 1 — Campaign Volume Trend

Full-width stacked BarChart (MUI x-charts BarChart).

- Series: Scheduled (amber), Sent (green) — Draft excluded (no sent_at, cannot be placed on time axis)
- X axis: time periods (dates or week/month labels)
- Each bar group shows total count label above it
- Tooltip: series name + count + percentage of total for that period

### Chart 2 — Email Delivery Performance

Full-width stacked BarChart below Chart 1.

- Only periods with at least one sent campaign are shown
- Series: Sent (blue), Opened (green), Failed (red)
- X axis: time periods
- Each bar group shows total recipient count label above it
- Tooltip: series name + count + percentage of total recipients for that period

### Backend Endpoint — GET /dashboard

Single endpoint replacing two separate calls. Query params: from (ISO date), to (ISO date), groupBy (day|week|month). Auth required.

Response shape:

- kpi object: totalCampaigns, draftCampaigns, scheduledCampaigns, sentCampaigns, totalRecipients, sentRecipients, openedRecipients, failedRecipients (all integers)
- volumeSeries array: one entry per period with period label, scheduledCount, sentCount
- deliverySeries array: one entry per period with sent campaigns, with period label, sentRecipients, openedRecipients, failedRecipients

Backend tests written before implementation (TDD). Percentages not returned — computed in frontend.

---

## 4. User Settings Page

### Route

/settings — protected, under AuthenticatedLayout

### Layout

Constrained-width content (max 640px), two stacked cards:

### Card 1 — Profile Information

- Header row: user avatar (44px circle, initials + color), display name, email (read-only)
- Form: Display Name input (editable), Email input (read-only, visually muted, not-allowed cursor)
- "Save Name" submit button
- On success: dispatches updated user object to authSlice so top bar avatar and name update immediately; success toast
- Zod validation: name required, 1–100 characters

### Card 2 — Change Password

- Three fields: Current Password, New Password (min 8 chars), Confirm New Password
- Client-side validation: new and confirm must match before submit
- "Update Password" submit button
- On success: success toast; on wrong current password: inline error
- Zod validation: all fields required, newPassword min 8 chars, confirmPassword must equal newPassword

### Backend Endpoints

PATCH /auth/profile — auth required. Accepts name (string, required). Returns updated user object (id, email, name). Updates users table. TDD.

PATCH /auth/password — auth required. Accepts currentPassword (string) and newPassword (string, min 8). Verifies currentPassword against stored bcrypt hash, returns 401 with error message if wrong. Hashes and saves newPassword. Returns 200 with empty body on success. TDD.

---

## 5. Technical Constraints and Conventions

- Icons: react-icons/bs (Bootstrap Icons) — install package if not present
- Charts: @mui/x-charts BarChart — install package
- Sidebar collapse state: new uiSlice in Redux (sidebarOpen boolean, theme string) persisted to localStorage
- shadcn/ui components added via CLI for any new primitives needed (Select for status filter, etc.)
- All new backend endpoints follow the existing four-layer pattern: Route → Validator → Controller → Service
- All new backend endpoints have unit tests written before implementation (TDD using superpowers:tdd skill)
- Screen specs for new/updated pages saved to .context/spec/screens/ before implementation
- constitutions.md updated to reflect new design rules (sidebar-based layout, uiSlice, MUI charts)
- agent-browser used to verify the running UI after each major implementation step
