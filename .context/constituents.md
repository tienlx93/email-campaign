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
- shadcn/ui components installed individually via CLI (`npx shadcn-ui add ...`)
- Tailwind config extended with shadcn/ui CSS variables

---

## Infrastructure — Docker Compose (Development)

Services:
- **postgres** — PostgreSQL 16, port `5432`
- **api** — Express app, port `3000`, hot-reload via `ts-node-dev` or `tsx --watch`
- **web** — Vite dev server, port `5173`, with API proxy to `api:3000`

All services networked together; volumes for postgres data persistence and node_modules caching.

---

## Context Documents

| File | Purpose |
|---|---|
| [constituents.md](.context/constituents.md) | Framework & architecture decisions (this file) |
| [spec.md](.context/spec.md) | Full functional requirements and API/DB specs |
| [tasks.md](.context/tasks.md) | Step-by-step implementation tasks with status |
| [spec/](./spec/) | Derived detailed specs (DB schema, API contracts, screen specs) — generated during tasks |