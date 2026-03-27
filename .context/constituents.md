# Constituents — Framework & Architecture

## Project Structure

**Monorepo** managed by **npm workspaces**, with two packages:
- `packages/api` — Express.js backend
- `packages/web` — React frontend

```
email-campaign/
├── packages/
│   ├── api/          # Backend (Express + TypeScript)
│   └── web/          # Frontend (React + Vite + TypeScript)
├── docker-compose.yml
├── package.json      # Root workspace config
└── .context/         # Project documentation
```

---

## Runtime

- **Node.js**: LTS version (current: v24 LTS) for both FE and BE
- Use `.nvmrc` or `engines` field in `package.json` to pin version

---

## Backend (`packages/api`)

| Concern | Choice | Notes |
|---|---|---|
| Framework | **Express.js** | With TypeScript |
| Validation | **Zod** | Request body, params, query validation |
| DB Query / Migration | **Knex** | SQL query builder + migration runner |
| Auth | **JWT** (`jsonwebtoken`) | Middleware-based, Bearer token |
| Testing | **Vitest** | Unit + integration tests |
| API Docs | **Swagger UI** (`swagger-ui-express` + `swagger-jsdoc`) | Auto-generated from JSDoc comments |
| Scheduler | **node-schedule** | Cron-style job registration at startup; jobs re-read from DB |
| Migration runner | `npm run migrate` | Knex CLI via npm script |
| Seed runner | `npm run seed` | Knex seed files via npm script |

### Key conventions
- All routes validated with Zod schemas before hitting controllers
- JWT decoded in middleware and attached to `req.user`
- Knex migrations in `src/db/migrations/`, seeds in `src/db/seeds/`
- No heavy ORMs (no Prisma, no TypeORM)
- Four-layer architecture: Routes → Validators → Controllers → Services. See [ARCHITECTURE.md](../ARCHITECTURE.md) for the full rules.
- **Services** hold all business logic and DB access; throw `ServiceError` for expected failures.
- **Controllers** receive their service via constructor injection; never instantiate services themselves. Thin: extract params, call service, send response. No DB, no business rules, no try/catch.
- **Validators** are `BaseValidator<T>` subclasses; each domain has its own file with DTO type + Zod schema + class.
- **Routes** are the composition root: `new Controller(new Service())`. Wire validators and controller methods to Express routes. No logic.

### Class-based architecture (enforced)

**Validators** — each request shape is a `class extends BaseValidator<Dto>` in its own file:
- Each file exports a DTO type, the raw Zod schema constant, and the validator class
- `BaseValidator<T>` reads from `source` (`'body'` default, `'params'`, or `'query'`) and writes validated data to `req.body` (or `req.params` for param validators)
- File layout: `src/validators/<domain>.validator.ts` — one file per domain (e.g. `auth.validator.ts`, `campaign.validator.ts`)

**Controllers** — each resource is a `class` in `src/controllers/<domain>.controller.ts`:
- Methods are arrow-function properties wrapping `asyncHandler(...)` so `this` binding is safe when passed as middleware
- No business logic in route files — routes are thin wiring only

**Route files** (`src/routes/`) instantiate validators and controller once, then wire Express routes. No logic beyond `router.verb(path, ...validators, controller.method)`.

---

## Frontend (`packages/web`)

| Concern | Choice | Notes |
|---|---|---|
| Framework | **React 18+** | With TypeScript |
| Build tool | **Vite** | Fast HMR dev server |
| State management | **Redux Toolkit** | Global state: theme, auth status |
| Data fetching | **RTK Query** (Redux Toolkit Query) | API calls, caching |
| Auth persistence | **localStorage** | JWT token + user info stored locally |
| Component library | **shadcn/ui** | Radix UI primitives + Tailwind |
| CSS framework | **Tailwind CSS** | Utility-first, configured for shadcn/ui |
| Rich text editor | **React Quill** (`react-quill`) | Email body field |
| Routing | **React Router v6** | Client-side routing |

### Key conventions
- RTK Query base API configured with JWT Bearer header injected from Redux store
- shadcn/ui components installed individually via CLI (`npx shadcn@latest add <component>`); never edit generated files in `src/components/ui/`
- Tailwind CSS v4 — no `tailwind.config.ts`; CSS variables configured via `@theme inline` block in `index.css`
- Rich text editor uses `react-quill-new` (React 19-compatible fork); shared config in `src/lib/quill.ts`
- Proxy target for `/api` requests configured via `VITE_API_URL` env var (default `http://localhost:3000`)

### Frontend code structure — follow when editing
See [ARCHITECTURE.md](../ARCHITECTURE.md#frontend-layer-rules) for the full rules. Summary:

| Folder | Rule |
|---|---|
| `src/pages/` | Thin orchestrators only. No inline Zod schemas, no inline helpers, no business logic. |
| `src/components/<domain>/` | Domain components. Large sections (identified by comment headers) and sub-components live here. |
| `src/helpers/` | Pure functions — `date.ts` (formatting) and `api-error.ts` (RTK error extraction). No React. |
| `src/validations/` | One file per domain. Each exports a Zod schema constant + the inferred TypeScript form type. No React. |
| `src/models/` | Interface-only type definitions. `auth.type.ts` and `campaign.type.ts`. No functions, no Zod. |
| `src/store/` | RTK Query endpoints are the only place API calls are made. `api.ts` re-exports model types. |
| `src/components/ui/` | shadcn/ui — never edit directly. Re-add via CLI with `--overwrite` to update. |

---

## Infrastructure — Docker Compose (Development)

Services:
- **postgres** — PostgreSQL 16, port `5432`
- **api** — Express app, port `3000`, hot-reload via `ts-node-dev` or `tsx --watch`
- **web** — Vite dev server, port `5173`, with API proxy to `api:3000`

All services networked together; volumes for postgres data persistence and node_modules caching.

---

## Spec Writing Rules

These rules apply to all spec files written by agents (Steps 1, 7 and any derived specs):

1. **No code in spec files.** Specs must be written in plain English (prose, tables, bullet lists). No TypeScript, SQL DDL, JSON examples, or code blocks. Agents translate spec language into code — they do not copy-paste from specs.
2. **Precise, unambiguous language.** Use exact field names, types, constraints, and rule descriptions. Avoid vague terms like "appropriate" or "reasonable".
3. **Structured sections.** Use consistent headings so agents can navigate specs programmatically.

---

## Execution Rules

1. **Pause after each step.** After a step is committed, stop and wait for human review before proceeding to the next step. Do not auto-chain steps.
2. **One step at a time.** Never dispatch the next step until the human explicitly approves the current one.

---

## Context Documents

| File | Purpose |
|---|---|
| [constituents.md](.context/constituents.md) | Framework & architecture decisions (this file) |
| [spec.md](.context/spec.md) | Full functional requirements and API/DB specs |
| [tasks.md](.context/tasks.md) | Step-by-step implementation tasks with status |
| [spec/](./spec/) | Derived detailed specs (DB schema, API contracts, screen specs) — generated during tasks |