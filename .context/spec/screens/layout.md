---
screen: Admin Portal Layout
route: all routes under / (except /login and /register)
auth: required — RequireAuth wrapper redirects to /login if no valid token
---

# Admin Portal Layout Spec

## Purpose

Provides a persistent two-column admin shell for all authenticated pages. The left sidebar houses navigation, and the top bar contains the app branding and user controls. All authenticated pages are rendered inside this layout.

---

## Structure

The layout is a full-viewport flex row:

- Left: persistent collapsible sidebar (220px expanded, 56px icon-only collapsed)
- Right: flex column containing the fixed top bar (48px) and scrollable content area

The sidebar and top bar are always visible on all authenticated pages.

---

## Left Sidebar

### Styling

- Background color: dark slate (Tailwind slate-900 / #0f172a)
- Width: 220px when expanded, 56px when collapsed
- Smooth transition on width change

### Content Zones

**Logo Zone (top)**

- Logo icon: blue rounded square background with white "M" letter
- Logo label: "MarTech / Campaign Mgr" text displayed to the right of the icon
- Label is hidden when sidebar is collapsed
- The entire logo zone is non-interactive (no link/button)

**Navigation Groups**

Two navigation groups, each with a group label and menu items. Group labels are hidden when the sidebar is collapsed.

**Group: MAIN MENU**

- Dashboard (BsGrid icon from react-icons/bs)
- Email Campaigns (BsEnvelope icon from react-icons/bs)

**Group: ACCOUNT**

- User Settings (BsPerson icon from react-icons/bs)

### Navigation Item Styling

Each navigation item displays:

- Icon (left side)
- Label text (to the right of icon, hidden when collapsed)
- Active state: left border accent (blue), slightly lighter background, white text

When collapsed, only icons are shown; labels are hidden.

### Collapsed State

When sidebar is collapsed to 56px:

- All group labels are hidden
- All item labels are hidden
- Only icons are visible
- Width transition smooth (200–300ms)

---

## Top Bar

### Styling

- Background color: white
- Height: 48px fixed
- Bottom border: subtle grey shadow or 1px border
- Layout: flex row, space-between distribution

### Left Zone (hamburger + site name)

- Hamburger icon button (BsList from react-icons/bs): toggles sidebar between 220px expanded and 56px collapsed
- Icon button has a hover state (subtle background)
- Site name: "MarTech Campaign Manager" (bold weight) displayed to the right of hamburger
- Site name uses a consistent font size (e.g. base or lg)

### Center Zone

Empty; reserved for future use.

### Right Zone (theme + avatar + dropdown)

Displayed left to right:

**1. Theme Toggle Button**

- Icon button (BsMoon in light mode, BsSun in dark mode from react-icons/bs)
- Toggles between light and dark themes
- Hover state applied
- No text label

**2. User Avatar + Dropdown**

- Avatar circle (28px diameter)
- 2-letter initials derived from the user's display name (e.g. "John Doe" → "JD")
- Background color: deterministically hashed from the user's name, selected from 6 palette colors (stays consistent for the same user across sessions)
- Avatar click opens a dropdown menu (see Dropdown Menu below)
- Initials: white text, centered, bold

**3. Dropdown Menu**

Appears below the avatar when clicked. Contains:

- "User Settings" link (navigates to /settings, closes menu)
- Divider (horizontal line)
- "Logout" action (dispatches clearCredentials to auth slice, navigates to /login, closes menu)

---

## No Bottom User Card

The sidebar does NOT contain a user info card at the bottom. User identity is displayed only in the top bar (avatar + dropdown).

---

## Redux State (uiSlice)

New Redux slice manages UI state:

- sidebarOpen (boolean) — tracks expanded/collapsed state, default true
- theme (string) — 'light' or 'dark', default 'light'

Both values are persisted to localStorage under the key `ui_state` as a JSON object. They survive page navigation and session restarts.

### Actions

- toggleSidebar() — inverts sidebarOpen
- toggleTheme() — switches between 'light' and 'dark'

Both actions trigger localStorage update via a middleware or effect.

---

## Light / Dark Mode

- Theme toggle icon in top bar dispatches toggleTheme action
- On toggle, theme value updated in Redux and localStorage
- main.tsx on app startup: reads ui_state from localStorage, applies `dark` class to `<html>` element if theme is 'dark'
- Tailwind CSS dark: mode via class strategy (dark class on html element)
- CSS variables in index.css support both light and dark color schemes
- Default theme: light mode

---

## Routing

- Route "/" redirects to "/dashboard" (replaces old redirect to "/campaigns")
- New routes: /dashboard (DashboardPage), /settings (UserSettingsPage)
- All authenticated routes remain under AdminLayout (the new two-column shell)
- Public routes /login and /register are siblings of AdminLayout, not children

---

## Data Dependencies

The layout reads from Redux:

- auth.user (id, name, email) — for avatar initials and dropdown
- ui.sidebarOpen — for sidebar width state
- ui.theme — for dark mode class application (read at startup; onChange updates html element)

---

## Avatar Color Hashing

The avatar background color is deterministically chosen from a 6-color palette by hashing the user's name. The hash function ensures:

- Same user name always produces the same color
- Colors are evenly distributed across the palette
- Implementation: see src/helpers/avatar.ts

---

## Notes

- The layout does not fetch data; all user info is already in Redux after login
- Sidebar collapse state and theme preference survive navigation and page reload
- All navigation icons use react-icons/bs (Bootstrap Icons) for consistency
