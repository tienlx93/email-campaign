# Tasks — Implementation Plan

> Status legend: `[ ]` pending · `[-]` in progress · `[x]` done · `[!]` blocked

---

## Step 1 — Detailed DB & API Specs `[ ]`

**Output location:** [.context/spec/](.context/spec/)

Create detailed machine-readable spec documents before touching code. These become the source of truth for Step 2+.

**Sub-tasks:**
- [ ] `spec/db-schema.md` — Full table definitions with column types, constraints, indexes, and rationale for each index
- [ ] `spec/api-contracts.md` — Every endpoint: method, path, request shape (with Zod schema examples), response shape, HTTP status codes, error codes
- [ ] `spec/validation-rules.md` — Per-field validation rules for all request bodies (min/max, format, required/optional, business constraints)
- [ ] `spec/business-rules.md` — State machine for campaign status transitions, ownership rules, scheduler behavior

**Links:** [constituents.md](.context/constituents.md) · [spec.md](.context/spec.md)

---

## Step 2 — Project Scaffolding `[ ]`

Set up the monorepo structure with working dev environment before writing any feature code.

**Sub-tasks:**
- [ ] Initialize root `package.json` with `"workspaces": ["packages/*"]`
- [ ] Add `.nvmrc` with current LTS Node version
- [ ] Scaffold `packages/api/` — Express + TypeScript, tsconfig, Vitest config, Knex config, folder structure (`src/routes`, `src/controllers`, `src/db`, `src/middleware`, `src/validators`)
- [ ] Scaffold `packages/web/` — Vite + React + TypeScript, Tailwind CSS, shadcn/ui init, Redux store stub, RTK Query base API stub, React Router setup
- [ ] Write `docker-compose.yml` with services: `postgres`, `api` (hot-reload), `web` (Vite dev server with proxy to api)
- [ ] Add `npm run dev` at root that starts all services (or delegate to docker compose)
- [ ] Verify: `docker compose up` starts all three services without errors

**Links:** [constituents.md](.context/constituents.md)

---

## Step 3 — Backend Implementation `[ ]`

Implement all BE features against the specs from Step 1. Swagger must be reviewable before this step is marked done.

**Sub-tasks:**
- [ ] Knex migration: create all tables with constraints and indexes (from [spec/db-schema.md](.context/spec/db-schema.md))
- [ ] Knex seed: at least 1 user, 3 campaigns (one per status), 5 recipients, with campaign_recipients
- [ ] `npm run migrate` and `npm run seed` npm scripts in `packages/api`
- [ ] Auth routes: `POST /auth/register`, `POST /auth/login` with Zod validation and JWT signing
- [ ] JWT middleware: extract and verify Bearer token, attach `req.user`
- [ ] Campaign CRUD routes: list, create, get, update, delete — all with auth middleware and Zod validation
- [ ] Campaign action routes: `/schedule`, `/send`, `/stats`
- [ ] Business rule enforcement: draft-only edit/delete, future `scheduled_at`, terminal send
- [ ] Swagger setup: `swagger-jsdoc` + `swagger-ui-express` at `/api-docs`, document all endpoints
- [ ] Verify: all endpoints work via Swagger UI or curl

**Links:** [spec/db-schema.md](.context/spec/db-schema.md) · [spec/api-contracts.md](.context/spec/api-contracts.md) · [spec/validation-rules.md](.context/spec/validation-rules.md) · [spec/business-rules.md](.context/spec/business-rules.md) · [tasks.md → Step 1](.context/tasks.md#step-1)

---

## Step 4 — Scheduler `[ ]`

Implement background job that auto-sends scheduled campaigns at their `scheduled_at` time.

**Sub-tasks:**
- [ ] Install `node-schedule` in `packages/api`
- [ ] Create `src/scheduler/index.ts` — register all pending scheduled campaigns as jobs at app startup
- [ ] On each job fire: query DB for campaign, verify status still `scheduled`, execute send logic (reuse send service from Step 3)
- [ ] On campaign schedule/cancel (PATCH to `scheduled_at`): cancel existing job if any, create new job if `scheduled_at` is set
- [ ] Ensure jobs are cleaned up on process shutdown (graceful shutdown handler)
- [ ] Verify: schedule a campaign 1–2 minutes in future, confirm it auto-sends

**Links:** [spec/business-rules.md](.context/spec/business-rules.md) · [tasks.md → Step 3](.context/tasks.md#step-3)

---

## Step 5 — Unit Tests `[ ]`

Cover critical business logic with focused, fast unit tests (no DB required).

**Sub-tasks:**
- [ ] Test: campaign status transition guards (cannot edit/delete non-draft)
- [ ] Test: `scheduled_at` must be in the future (validation function)
- [ ] Test: stats calculation (`open_rate`, `send_rate` with edge cases: total=0, all sent, none opened)
- [ ] Test: JWT token generation and verification helpers
- [ ] Test: Zod schema validation — at least one valid and one invalid case per schema
- [ ] Minimum 3 meaningful tests total; aim for 8–10 for good coverage of core logic

**Links:** [spec/business-rules.md](.context/spec/business-rules.md) · [spec/validation-rules.md](.context/spec/validation-rules.md)

---

## Step 6 — Integration Test `[ ]`

One end-to-end integration test that spins up a real PostgreSQL database via Testcontainers.

**Sub-tasks:**
- [ ] Install `testcontainers` and `@testcontainers/postgresql` in `packages/api`
- [ ] Write integration test file `src/__tests__/campaign-flow.integration.test.ts`
- [ ] Test flow: register user → login → create campaign → add recipients → schedule → send → verify stats
- [ ] Run migrations against test container before tests, clean up after
- [ ] Verify: test passes with `vitest run` (may take 30–60s for container startup)

**Links:** [tasks.md → Step 5](.context/tasks.md#step-5)

---

## Step 7 — Frontend Screen Specs `[ ]`

**Output location:** [.context/spec/screens/](.context/spec/screens/)

Write UI specs before implementing the frontend. These guide Step 8.

**Sub-tasks:**
- [ ] `spec/screens/login.md` — UI components (form fields, button), validation messages, API call (`POST /auth/login`), redirect logic, error display
- [ ] `spec/screens/campaigns-list.md` — Component tree, data source (RTK Query hook), status badge color map, pagination behavior, empty state, skeleton loader
- [ ] `spec/screens/campaign-new.md` — Form fields (name, subject, QuillJS body, recipient multi-input), submit behavior, redirect on success, error handling
- [ ] `spec/screens/campaign-detail.md` — Sections (header, stats, recipients table, actions), conditional action buttons per status, progress bars for rates, error/loading states
- [ ] Each spec should include: component breakdown, props/data shape, validation rules, API endpoints called, success/error states

**Links:** [spec.md](.context/spec.md) · [spec/api-contracts.md](.context/spec/api-contracts.md)

---

## Step 8 — Frontend Implementation `[ ]`

Implement all FE features against the screen specs from Step 7.

**Sub-tasks:**
- [ ] Redux store: `authSlice` (token, user, isAuthenticated) persisted to localStorage; `themeSlice` (light/dark)
- [ ] RTK Query base API: base URL from env var, auto-inject Bearer token from store
- [ ] RTK Query endpoints: all campaign CRUD and action endpoints
- [ ] Auth: login page, register page (optional), protected route wrapper, logout
- [ ] `shadcn/ui` components: install Button, Badge, Card, Input, Form, Skeleton, Progress, Dialog, Table
- [ ] `/campaigns` list page: campaign cards/table with status badges, pagination, loading skeletons
- [ ] `/campaigns/new` page: form with React Hook Form + Zod resolver, QuillJS rich text for body, multi-email input for recipients
- [ ] `/campaigns/:id` detail page: stats section with progress bars, recipient list, conditional action buttons (Schedule, Send, Delete), confirmation dialogs for destructive actions
- [ ] Error handling: RTK Query error states shown as toast or inline messages
- [ ] Responsive layout: works on desktop; mobile-friendly is a bonus

**Links:** [spec/screens/login.md](.context/spec/screens/login.md) · [spec/screens/campaigns-list.md](.context/spec/screens/campaigns-list.md) · [spec/screens/campaign-new.md](.context/spec/screens/campaign-new.md) · [spec/screens/campaign-detail.md](.context/spec/screens/campaign-detail.md) · [tasks.md → Step 7](.context/tasks.md#step-7)

---

## Completion Checklist

- [ ] `docker compose up` starts everything cleanly
- [ ] `/api-docs` shows all endpoints in Swagger UI
- [ ] Seed data is loaded and browsable via the UI
- [ ] All 8 steps marked `[x]`
- [ ] README updated with setup instructions + "How I Used Claude Code" section
