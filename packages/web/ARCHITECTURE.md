# Architecture — Mini Campaign Manager - Web Frontend

## Overview

The frontend (`packages/web`) follows a predictable UI architecture built around:

- React Router pages as entry points
- Reusable domain components for screen sections
- Redux Toolkit + RTK Query for auth state and API communication
- Zod schemas for client-side form validation

High-level request flow:

```text
User interaction
  -> Page component
  -> Domain/UI component
  -> RTK Query hook (query/mutation)
  -> Base API with Bearer token
  -> Backend API
  -> Typed response mapped back to UI state
```

---

## Frontend Layer Rules

### Pages (`src/pages/`)

- Compose screens from domain components and hooks.
- Keep page responsibilities to routing concerns and top-level view state (dialog open/close, tab mode).
- Do not define inline Zod schemas or API-specific transformation helpers in page files.
- Import reusable logic from `src/validations/`, `src/helpers/`, `src/store/`, and `src/models/`.

### Domain Components (`src/components/<domain>/`)

- Implement screen sections for a domain (campaign header, stats, recipients table, edit section).
- Accept typed props from `src/models/` and keep behavior focused on presentation and user actions.
- May use RTK Query mutation hooks for local actions, but must not perform raw `fetch` calls.
- Must not import from `src/pages/`.

### Shared UI Components (`src/components/ui/`)

- Generated via shadcn CLI and treated as design system primitives.
- Do not place business logic inside these components.
- Prefer composition in domain components/pages instead of modifying generated primitives.

### Store and Data Access (`src/store/`)

- `authSlice` is the source of truth for auth token and user.
- `api.ts` is the only API layer; all network calls go through RTK Query endpoints.
- `prepareHeaders` injects `Authorization: Bearer <token>` when token exists.
- Cache invalidation and refetch behavior must be configured in RTK Query endpoints, not in component-side ad-hoc logic.

### Models (`src/models/`)

- Keep type definitions for API payloads, auth entities, and campaign entities.
- No runtime logic, React imports, or side effects.

### Helpers (`src/helpers/`)

- Pure utility functions only (date formatting, API error mapping).
- No React hooks, no global state mutation, no network calls.

### Validations (`src/validations/`)

- Zod schemas are the canonical source for form constraints in the frontend.
- Export both schema and inferred TypeScript form value type from each file.
- Keep validation rules synchronized with backend contract constraints.

---

## Validation Rules (Frontend)

- `auth` forms validate email format and required password fields before submit.
- `campaign` create/edit forms validate required fields (`name`, `subject`, `body`) and recipient email format.
- Schedule actions must reject invalid datetimes before sending requests.
- Validation errors are shown inline and prevent mutation calls until valid.
- Server-side validation remains authoritative; client validation is for UX and early feedback.

---

## Routing and Auth Flow

- Public routes: login/register pages.
- Protected routes: campaign pages under authenticated layout/guard.
- Successful login stores token/user and redirects to campaign list.
- Logout clears auth state and local storage, then redirects to login.
- Unauthorized API responses should lead to meaningful user feedback and auth recovery flow.

---

## File and Naming Conventions

- Page files: `<Feature>Page.tsx` in `src/pages/`.
- Domain components: `src/components/<domain>/<Component>.tsx`.
- Validation files: `<domain>.ts` in `src/validations/`.
- Model files: `<domain>.type.ts` in `src/models/`.
- Helper files: focused by concern (`date.ts`, `api-error.ts`) in `src/helpers/`.
