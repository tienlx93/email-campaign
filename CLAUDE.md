# CLAUDE.md — Mini Campaign Manager

## Project Context

Full-stack Mini Campaign Manager (MarTech tool). Monorepo with an Express.js backend and React frontend.

Read these files to understand the project before doing any work:

| File | What it contains |
|---|---|
| [.context/constitutions.md](.context/constitutions.md) | Framework choices, architecture, folder structure, Docker setup |
| [.context/spec.md](.context/spec.md) | Full functional requirements: DB schema, API endpoints, business rules, FE pages |
| [.context/tasks.md](.context/tasks.md) | Step-by-step implementation plan with status tracking |
| [.context/spec/](.context/spec/) | Derived detailed specs (generated during Step 1) — DB schema, API contracts, validation rules, screen specs |

---

## How to Navigate This Project

1. **Before starting any task**: read [tasks.md](.context/tasks.md) to find the current step and its linked spec files.
2. **Before implementing anything**: read the linked spec file(s) for that step — they are the source of truth.
3. **After completing a step**: commit, update the checkboxes in [tasks.md](.context/tasks.md) to `[x]`, then **stop and wait for human review** before starting the next step.
4. **When generating spec output** (Steps 1, 7): save files to `.context/spec/` and link them back in [tasks.md](.context/tasks.md).

## Spec Writing Rules

- **No code in spec files.** Write specs in plain English — prose, tables, and bullet lists only. No TypeScript, SQL, JSON, or code blocks. Agents translate spec language into code; they do not copy from specs.
- **Be precise.** Use exact field names, types, constraints, and rule wording. Avoid vague language.

---

## Architecture Summary

- **Monorepo**: npm workspaces, packages at `packages/api` and `packages/web`
- **Backend**: Express.js + TypeScript, Zod validation, Knex (query builder + migrations), JWT auth, Vitest, Swagger UI, node-schedule
- **Frontend**: React 18 + Vite + TypeScript, Redux Toolkit + RTK Query, shadcn/ui, Tailwind CSS, React Quill
- **Infrastructure**: Docker Compose — services: `postgres`, `api`, `web`

Full framework details in [constitutions.md](.context/constitutions.md).

**Before writing backend code, read [packages/api/ARCHITECTURE.md](packages/api/ARCHITECTURE.md).**
**Before writing frontend code, read [packages/web/ARCHITECTURE.md](packages/web/ARCHITECTURE.md).**
Each package architecture file is the source of truth for its layer rules, flow, and naming conventions.

---

## Architecture Decision Records

When you introduce or change an architectural pattern — not a feature, but a **how-we-build-things** decision — you must update the docs **in the same commit** as the code change.

### What counts as an architecture decision

Update the docs when you:

- Introduce a new layer, class pattern, or file convention (e.g. "all validators extend BaseValidator")
- Change how errors are handled across the codebase (e.g. ServiceError + global handler)
- Add or remove a cross-cutting convention (e.g. "query validators write to req.body")
- Change import rules between layers (e.g. "controllers must not import from db")
- Introduce a new shared base class, abstract type, or utility pattern used in more than one file

Do **not** update the docs for:

- Adding a new endpoint, route, or page (that's a feature, not an architectural decision)
- Renaming a variable or refactoring within a single file
- Fixing a bug without changing the pattern

### Where to write it

| Document | What to update |
|---|---|
| [packages/api/ARCHITECTURE.md](packages/api/ARCHITECTURE.md) | Backend layer diagram, per-layer rules, error flow, naming conventions |
| [packages/web/ARCHITECTURE.md](packages/web/ARCHITECTURE.md) | Frontend flow, layer responsibilities, validation and state-management conventions |
| [.context/constitutions.md](.context/constitutions.md) | "Key conventions" section — concise bullet pointing to ARCHITECTURE.md for detail |

### How to write it

- State the rule, not the history. Write "Controllers must not import from `db`" not "We decided to move DB access to services".
- One rule per bullet. Avoid compound sentences that hide two constraints.
- If the rule has a non-obvious reason, add a one-line rationale in parentheses.
- Keep each package `ARCHITECTURE.md` as the source of detail. `.context/constitutions.md` bullets are summaries with links.

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
