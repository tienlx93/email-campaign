---
screen: Authenticated Layout
route: all routes under / (except /login and /register)
auth: required — RequireAuth wrapper redirects to /login if no valid token
---

# Authenticated Layout Spec

## Purpose

Wraps every authenticated page with a consistent shell: a top navigation bar with the app name, a navigation link to the campaigns list, and a user info display showing the current user's name and email. All pages rendered inside this layout inherit the navigation and user context without re-implementing it.

---

## Structure

The layout is a full-viewport flex column:

- Top: the AppNavbar (fixed height, always visible)
- Bottom: a scrollable content area that fills the remaining height

The page component for each route (CampaignsListPage, NewCampaignPage, CampaignDetailPage) is rendered inside the content area.

---

## Components

### AuthenticatedLayout (layout component)

- Wraps content via a React Router `<Outlet />`
- Reads the current user from the Redux auth slice (`state.auth.user`)
- If `user` is null (token expired or missing), renders a `<Navigate to="/login" replace />` immediately — this is the RequireAuth guard

### AppNavbar

Rendered at the top of every authenticated page. Contains three zones: left, center (optional), and right.

**Left zone**

- Application logo or wordmark: clicking it navigates to /campaigns
- The text label is "Campaign Manager"

**Center zone**

- Navigation link: "Campaigns" — navigates to /campaigns
- The link uses NavLink (React Router) so it receives an "active" visual style (bold or underlined) when the current route starts with /campaigns

**Right zone**

- UserInfo component (see below)

---

### UserInfo

Displayed in the right zone of AppNavbar. Shows a static read-only display — no dropdown, no menu.

- Username label: the user's name from the auth slice (`user.name`), displayed in normal weight
- Email label: the user's email from the auth slice (`user.email`), displayed in muted smaller text below the name
- Logout button: a ghost-variant button labeled "Logout" rendered to the right of the user info text

The two labels are stacked vertically (name on top, email below) and right-aligned inside the right zone.

**Logout behavior:** clicking the Logout button dispatches `clearCredentials` to the auth slice (which removes token and user from state and clears localStorage) then navigates to /login using React Router navigate.

---

## Data Shape (from Redux auth slice)

The layout reads from `state.auth`:

- user.name — string — displayed as the username label
- user.email — string — displayed as the email label
- token — string or null — used by RequireAuth to decide whether to redirect

---

## Responsive Behavior

On narrow screens (below the sm breakpoint):

- The center navigation link "Campaigns" is hidden; the logo link on the left serves as the only navigation affordance
- The UserInfo component collapses to show only the Logout button (name and email labels are hidden)

---

## Router Setup

The authenticated layout is wired in the React Router tree as a parent route:

- The layout route has no path of its own; it wraps child routes
- Child routes: /campaigns (CampaignsListPage), /campaigns/new (NewCampaignPage), /campaigns/:id (CampaignDetailPage)
- Public routes /login and /register are siblings of the layout route, not children — they render without the AppNavbar

---

## Notes

- The layout does not fetch any data of its own; all user info is already in the Redux store after login/register
- There is no profile edit or settings page in scope; the UserInfo component is read-only labels only
