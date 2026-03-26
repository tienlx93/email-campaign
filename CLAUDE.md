# CLAUDE.md — Mini Campaign Manager

## Project Context

Full-stack Mini Campaign Manager (MarTech tool). Monorepo with an Express.js backend and React frontend.

Read these files to understand the project before doing any work:

| File | What it contains |
|---|---|
| [.context/constituents.md](.context/constituents.md) | Framework choices, architecture, folder structure, Docker setup |
| [.context/spec.md](.context/spec.md) | Full functional requirements: DB schema, API endpoints, business rules, FE pages |
| [.context/tasks.md](.context/tasks.md) | Step-by-step implementation plan with status tracking |
| [.context/spec/](.context/spec/) | Derived detailed specs (generated during Step 1) — DB schema, API contracts, validation rules, screen specs |

---

## How to Navigate This Project

1. **Before starting any task**: read [tasks.md](.context/tasks.md) to find the current step and its linked spec files.
2. **Before implementing anything**: read the linked spec file(s) for that step — they are the source of truth.
3. **After completing a step**: update the corresponding checkboxes in [tasks.md](.context/tasks.md) to `[x]`.
4. **When generating spec output** (Steps 1, 7): save files to `.context/spec/` and link them back in [tasks.md](.context/tasks.md).

---

## Architecture Summary

- **Monorepo**: npm workspaces, packages at `packages/api` and `packages/web`
- **Backend**: Express.js + TypeScript, Zod validation, Knex (query builder + migrations), JWT auth, Vitest, Swagger UI, node-schedule
- **Frontend**: React 18 + Vite + TypeScript, Redux Toolkit + RTK Query, shadcn/ui, Tailwind CSS, React Quill
- **Infrastructure**: Docker Compose — services: `postgres`, `api`, `web`

Full details in [constituents.md](.context/constituents.md).

---

## Key Constraints

- No heavy ORMs (no Prisma, no TypeORM) — use Knex only
- shadcn/ui components must be installed via CLI (`npx shadcn-ui add <component>`)
- JWT stored in localStorage (not httpOnly cookie) — per spec
- Campaign edit/delete only allowed when `status = 'draft'` (enforced server-side)
- `scheduled_at` must always be a future timestamp
- Sending a campaign is terminal — status cannot go back from `sent`

Full business rules in [spec.md](.context/spec.md) and [.context/spec/business-rules.md](.context/spec/business-rules.md) (after Step 1).

---

## npm Scripts Convention

In `packages/api`:
- `npm run dev` — start API with hot reload
- `npm run migrate` — run Knex migrations
- `npm run seed` — run Knex seeds
- `npm run test` — run Vitest

In `packages/web`:
- `npm run dev` — start Vite dev server

At root:
- `docker compose up` — start all services (postgres + api + web)
