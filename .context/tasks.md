# Tasks — Implementation Plan

> Status legend: `[ ]` pending · `[-]` in progress · `[x]` done · `[!]` blocked
>
> **Skills key — local:** `shadcn` · `frontend-design` · `agent-browser` · `find-skills`
> **Skills key — superpowers:** `brainstorming` · `writing-plans` · `tdd` · `dispatching-parallel-agents` · `subagent-driven-development` · `systematic-debugging` · `verification-before-completion` · `simplify` · `requesting-code-review`

---

## Cross-Cutting Skills (every step)

| Skill | When to invoke |
|---|---|
| `superpowers:verification-before-completion` | Before marking any step `[x]` |
| `superpowers:systematic-debugging` | Any test failure, container error, or unexpected behavior |
| `simplify` | After completing any major implementation block |

---

## Step 1 — Detailed DB & API Specs `[x]`

**Skills:** `superpowers:brainstorming` (index strategy, API shape, pagination)

**Output location:** [.context/spec/](.context/spec/)

Create detailed spec documents in plain English before touching code. **No code in spec files** — prose, tables, and bullet lists only. Agents translate spec language into code.

**Pause after commit** — wait for human review before proceeding to Step 2.

**Sub-tasks:**
- [x] `spec/db-schema.md` — All 4 tables: exact column names, data types, nullability, default values, constraints (UNIQUE, CHECK, FK, CASCADE/RESTRICT), composite PKs, and all required indexes with a one-sentence rationale for each
- [x] `spec/api-contracts.md` — Every endpoint: method, path, auth required, request fields (name + type + required/optional), response fields (name + type), HTTP status codes used and the condition for each, error response format
- [x] `spec/validation-rules.md` — Per-field validation rules for every request body and path/query param: field name, type, required/optional, constraints (min/max length, format, range, business constraint), error message
- [x] `spec/business-rules.md` — Campaign status state machine (all valid transitions and conditions), ownership rule, edit/delete guard, schedule constraint, send terminal rule, recipient upsert rule, stats formula, scheduler startup and runtime behavior

**Links:** [constituents.md](.context/constituents.md) · [spec.md](.context/spec.md)

---

## Step 2 — Project Scaffolding `[x]`

**Skills:** `superpowers:dispatching-parallel-agents` (`packages/api` and `packages/web` are independent — run in parallel)

**Pause after commit** — wait for human review before proceeding to Step 3.

Set up the monorepo structure with working dev environment before writing any feature code.

**Sub-tasks:**
- [x] Initialize root `package.json` with `"workspaces": ["packages/*"]`
- [x] Add `.nvmrc` with current LTS Node version
- [x] Scaffold `packages/api/` — Express + TypeScript, tsconfig, Vitest config, Knex config, folder structure (`src/routes`, `src/controllers`, `src/db`, `src/middleware`, `src/validators`)
- [x] Scaffold `packages/web/` — Vite + React + TypeScript, Tailwind CSS, shadcn/ui init, Redux store stub, RTK Query base API stub, React Router setup
- [x] Write `docker-compose.yml` with services: `postgres`, `api` (hot-reload), `web` (Vite dev server with proxy to api)
- [x] Add `npm run dev` at root that starts all services (or delegate to docker compose)
- [x] Verify: `docker compose up` starts all three services without errors

**Links:** [constituents.md](.context/constituents.md)

---

## Step 3 — Unit Test Shells `[x]`

**Skills:** `superpowers:test-driven-development` (write test shells before implementation; tests drive Step 4)

**Pause after commit** — wait for human review before proceeding to Step 4.

Write failing unit tests for all critical business logic. No implementation yet — tests define the contracts.

**Sub-tasks:**
- [x] Test: campaign status transition guards — edit/delete rejected when status ≠ `draft`
- [x] Test: `scheduled_at` validation — rejected when not a future timestamp, accepted when in the future, `null` accepted to cancel
- [x] Test: stats calculation — `open_rate`, `send_rate` correct values; edge cases: `total=0`, all sent, none opened
- [x] Test: JWT helpers — token generation produces verifiable token; invalid/expired token throws
- [x] Test: Zod schemas — at least one valid and one invalid payload per schema (register, login, create campaign, schedule)
- [x] All tests should run with `vitest run` and fail (red) at this point — implementation comes in Step 4

**Links:** [spec/validation-rules.md](.context/spec/validation-rules.md) · [spec/business-rules.md](.context/spec/business-rules.md)

---

## Step 4 — Backend Implementation `[x]`

**Skills:** `superpowers:tdd` (make Step 3 tests pass) · `superpowers:dispatching-parallel-agents` (auth, campaign CRUD, stats routes independent) · `superpowers:requesting-code-review` (after all routes pass)

**Pause after commit** — wait for human review before proceeding to Step 5.

Implement all BE features to make Step 3 tests green. Swagger must be reviewable before this step is marked done.

**Sub-tasks:**
- [x] Knex migration: create all tables with constraints and indexes (from [spec/db-schema.md](.context/spec/db-schema.md))
- [x] Knex seed: at least 1 user, 3 campaigns (one per status), 5 recipients, with campaign_recipients
- [x] `npm run migrate` and `npm run seed` npm scripts in `packages/api`
- [x] Auth routes: `POST /auth/register`, `POST /auth/login` with Zod validation and JWT signing
- [x] JWT middleware: extract and verify Bearer token, attach `req.user`
- [x] Campaign CRUD routes: list, create, get, update, delete — all with auth middleware and Zod validation
- [x] Campaign action routes: `/schedule`, `/send`, `/stats`
- [x] Business rule enforcement: draft-only edit/delete, future `scheduled_at`, terminal send
- [x] Swagger setup: `swagger-jsdoc` + `swagger-ui-express` at `/api-docs`, document all endpoints
- [x] All Step 3 unit tests pass (green)
- [x] Verify: all endpoints work via Swagger UI or curl

**Links:** [spec/db-schema.md](.context/spec/db-schema.md) · [spec/api-contracts.md](.context/spec/api-contracts.md) · [spec/validation-rules.md](.context/spec/validation-rules.md) · [spec/business-rules.md](.context/spec/business-rules.md) · [tasks.md → Step 3](#step-3--unit-test-shells-)

---

## Step 5 — Scheduler `[x]`

**Skills:** `superpowers:tdd` (test job registration/cancellation before wiring) · `superpowers:systematic-debugging` (timing/race issues)

**Pause after commit** — wait for human review before proceeding to Step 6.

Implement background job that auto-sends scheduled campaigns at their `scheduled_at` time.

**Sub-tasks:**
- [x] Install `node-schedule` in `packages/api`
- [x] Create `src/scheduler/index.ts` — register all pending scheduled campaigns as jobs at app startup
- [x] On each job fire: query DB for campaign, verify status still `scheduled`, execute send logic (reuse send service from Step 4)
- [x] On campaign schedule/cancel (update to `scheduled_at`): cancel existing job if any, create new job if `scheduled_at` is set
- [x] Ensure jobs are cleaned up on process shutdown (graceful shutdown handler)
- [x] Verify: schedule a campaign 1–2 minutes in future, confirm it auto-sends

**Links:** [spec/business-rules.md](.context/spec/business-rules.md) · [tasks.md → Step 4](#step-4--backend-implementation-)

---

## Step 6 — Integration Test `[x]`

**Skills:** `superpowers:tdd` · `superpowers:systematic-debugging` (container startup issues)

**Pause after commit** — wait for human review before proceeding to Step 7.

One end-to-end integration test that spins up a real PostgreSQL database via Testcontainers. The integration tests should be splitted from Unit test, run on demand (default skipped by CI).

**Sub-tasks:**
- [x] Install `testcontainers`, `@testcontainers/postgresql`, `supertest`, `@types/supertest` in `packages/api`
- [x] Split `app.ts` (Express config) from `index.ts` (server listen) so supertest can import app without starting server
- [x] Write `src/__integration_tests__/setup/global.setup.ts` — starts `postgres:16-alpine` container, sets `DATABASE_URL`, runs migrations, tears down after suite
- [x] Write `src/__integration_tests__/campaign-flow.integration.test.ts` — full flow: register → login → create campaign with recipients → schedule → send → verify stats; also tests 409 double-send and edit/delete guards
- [x] Add `vitest.integration.config.ts` (separate from unit config) with `globalSetup` and `testTimeout: 120000`; unit `vitest.config.ts` excludes `__integration_tests__/`
- [x] Add `"types": ["vitest/globals"]` to `tsconfig.json` so IDE resolves `describe`/`it`/`expect` without installing Jest types
- [x] Add `test:integration` script to `packages/api/package.json` and root `package.json`; also add `migrate` and `migrate:rollback` to root workspace scripts
- [x] Verify: `npm test` runs 27 unit tests only; `npm run test:integration` runs 13 integration tests against real Postgres

**Links:** [tasks.md → Step 3](#step-3--unit-test-shells-) · [tasks.md → Step 4](#step-4--backend-implementation-)

---

## Step 7 — Frontend Screen Specs `[x]`

**Skills:** `superpowers:brainstorming` (component decomposition, state ownership, RTK Query cache invalidation)

**Output location:** [.context/spec/screens/](.context/spec/screens/)

**Pause after commit** — wait for human review before proceeding to Step 8.

Write UI specs before implementing the frontend. These guide Step 8. **No code in spec files** — plain English only.

**Sub-tasks:**
- [x] `spec/screens/login.md` — Components, validation messages, API call (`POST /auth/login`), redirect logic, error display
- [x] `spec/screens/campaigns-list.md` — Component tree, RTK Query hook, status badge color map, pagination, empty state, skeleton loader
- [x] `spec/screens/campaign-new.md` — Form fields (name, subject, QuillJS body, recipient multi-input), submit behavior, redirect, error handling
- [x] `spec/screens/campaign-detail.md` — Sections (header, stats, recipients table, actions), conditional buttons per status, progress bars, error/loading states
- [x] Each spec: component breakdown, props/data shape, validation rules, API endpoints called, success/error states

**Links:** [spec.md](.context/spec.md) · [spec/api-contracts.md](.context/spec/api-contracts.md) · [spec/screens/login.md](.context/spec/screens/login.md) · [spec/screens/register.md](.context/spec/screens/register.md) · [spec/screens/layout.md](.context/spec/screens/layout.md) · [spec/screens/campaigns-list.md](.context/spec/screens/campaigns-list.md) · [spec/screens/campaign-new.md](.context/spec/screens/campaign-new.md) · [spec/screens/campaign-detail.md](.context/spec/screens/campaign-detail.md)

---

## Step 8 — Frontend Implementation `[ ]`

**Skills:**
- `frontend-design` — UI design direction, campaign cards, stats display, overall aesthetic
- `shadcn` — install and compose shadcn/ui components; follow shadcn rules strictly
- `superpowers:dispatching-parallel-agents` — Redux/RTK Query setup vs page components are independent
- `agent-browser` — smoke-test the running UI (login flow, campaign CRUD, stats display)
- `superpowers:requesting-code-review` — final review before submission

Implement all FE features against the screen specs from Step 7.

**Sub-tasks:**
- [ ] Redux store: `authSlice` (token, user, isAuthenticated) persisted to localStorage; `themeSlice` (light/dark)
- [ ] RTK Query base API: base URL from env var, auto-inject Bearer token from store
- [ ] RTK Query endpoints: all campaign CRUD and action endpoints
- [ ] Auth: login page, protected route wrapper (`<RequireAuth>`), logout
- [ ] shadcn/ui components: `Button`, `Badge`, `Card`, `Input`, `Form`, `Skeleton`, `Progress`, `AlertDialog`, `Table`, `Separator`, `Sonner` (toast)
- [ ] `/campaigns` list page: campaign cards with status badges, pagination, loading skeletons, empty state
- [ ] `/campaigns/new` page: form with React Hook Form + Zod resolver, QuillJS rich text for body, multi-email input for recipients
- [ ] `/campaigns/:id` detail page: stats with progress bars, recipient list, conditional action buttons, confirmation dialogs for destructive actions
- [ ] Error handling: RTK Query error states shown via `sonner` toast or inline messages
- [ ] `agent-browser` smoke test: open app, login, create campaign, verify detail page renders

**Links:** [spec/screens/login.md](.context/spec/screens/login.md) · [spec/screens/campaigns-list.md](.context/spec/screens/campaigns-list.md) · [spec/screens/campaign-new.md](.context/spec/screens/campaign-new.md) · [spec/screens/campaign-detail.md](.context/spec/screens/campaign-detail.md) · [tasks.md → Step 7](#step-7--frontend-screen-specs-)

---

## Completion Checklist

- [ ] `docker compose up` starts everything cleanly
- [ ] `/api-docs` shows all endpoints in Swagger UI
- [ ] All Step 3 unit tests pass
- [ ] Integration test (Step 6) passes
- [ ] Seed data is loaded and browsable via the UI
- [ ] All 8 steps marked `[x]`
- [ ] README updated with setup instructions + "How I Used Claude Code" section
