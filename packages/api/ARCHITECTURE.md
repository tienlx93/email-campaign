# Architecture — Mini Campaign Manager - API Backend

## Overview

The backend (`packages/api`) follows a strict four-layer architecture. Each layer has a single responsibility and depends only on the layer directly below it.

```
HTTP Request
     │
     ▼
┌─────────────┐
│   Routes    │  Wire validators + controller to Express router. No logic.
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Validators  │  Parse and validate req.body / req.params / req.query via Zod.
└──────┬──────┘  Attach validated data back to req. Return 400 on failure.
       │
       ▼
┌─────────────┐
│ Controllers │  Extract typed data from req. Call service. Send HTTP response.
└──────┬──────┘  No business logic. No DB access. No try/catch.
       │
       ▼
┌─────────────┐
│  Services   │  All business logic and DB access (via Knex).
└──────┬──────┘  Throw ServiceError for expected failures (4xx).
       │
       ▼
┌─────────────┐
│  Database   │  PostgreSQL accessed via Knex query builder.
└─────────────┘
```

---

## Packages

### `packages/api` — Express Backend

| Folder | Purpose |
|---|---|
| `src/routes/` | Thin Express router files. Instantiate validators and controller, wire routes. No logic. |
| `src/controllers/` | One class per resource. Methods are `asyncHandler`-wrapped arrow functions. Extract params from `req`, call service, send response. |
| `src/services/` | One class per domain (`AuthService`, `CampaignService`). All business logic and Knex queries live here. Throw `ServiceError` for expected failures. |
| `src/validators/` | `BaseValidator<T>` subclasses. One file per domain. Each file exports the DTO type, the raw Zod schema, and the validator class. |
| `src/errors/` | `ServiceError` — typed error carrying an HTTP status code. Caught by the global error handler. |
| `src/middleware/` | `authMiddleware` (JWT), `asyncHandler` (error forwarding). |
| `src/db/` | Knex instance, migrations (`migrations/`), seeds (`seeds/`). |
| `src/scheduler/` | `node-schedule` job registry. Initialized at startup by `initScheduler()`. |
| `src/services/campaign.utils.ts` | Pure functions (`isCampaignEditable`, `calculateStats`). No DB access. Tested directly by unit tests. |

---

## Layer Rules

### Routes (`src/routes/`)
- Instantiate the service, inject it into the controller constructor, then instantiate validators — all at module load.
- Wire Express routes as: `router.verb(path, ...validators, controller.method)`.
- **Routes are the only place where `new Service()` and `new Controller(service)` are called.**
- No logic, no imports from `db`, no imports from `campaign.utils`.

### Controllers (`src/controllers/`)
- Receive their service via constructor injection (`constructor(private service: XService) {}`). Never instantiate services themselves.
- Methods are arrow-function properties so `this` is safe when passed as middleware.
- Retrieve the campaign id with `parseInt(String(req.params.id), 10)`. The `CampaignIdParamValidator` is a guard that rejects non-integer/non-positive values with a 400 before the controller runs; the controller still retrieves the value via `parseInt` because `req.params` is typed as `Record<string, string>` and cannot carry a number directly.
- The `asyncHandler` wrapper forwards any thrown error to the global handler — **no try/catch in controllers**.
- **No DB access. No business rule checks. No imports from `db` or `services/campaign.utils`.**

### Services (`src/services/`)
- Contain all business rules, ownership checks, status guards, and Knex queries.
- Return plain data objects — no `Request`/`Response` types.
- Throw `ServiceError(statusCode, message)` for expected failures (not found, conflict, unauthorized).
- Let unexpected errors propagate as-is to the global handler (they become 500).
- Side-effects that must happen after a DB transaction (e.g. `cancelJob`) are called after `db.transaction()` resolves. This ordering is intentional: calling them before the commit would leave state inconsistent if the transaction rolls back.

### Validators (`src/validators/`)
- `BaseValidator<T>` reads from `source` (`'body'` default, `'params'`, `'query'`).
- Writes validated data to `req.body` for both `body` and `query` sources; to `req.params` for `params` source.
- Each domain file exports: DTO type, raw Zod schema constant (for unit tests), validator class.

---

## Error Flow

```
Service throws ServiceError(409, "Campaign can only be edited when status is draft")
  → asyncHandler catches and calls next(err)
    → global error handler in index.ts
      → err instanceof ServiceError → res.status(409).json({ error: "..." })

Service throws unexpected Error (e.g., DB connection failure)
  → asyncHandler catches and calls next(err)
    → global error handler
      → console.error + res.status(500).json({ error: "Internal server error" })
```

---

## File Naming Conventions

| Pattern | Example | Contents |
|---|---|---|
| `<domain>.validator.ts` | `campaign.validator.ts` | DTO types + Zod schemas + validator classes |
| `<domain>.service.ts` | `campaign.service.ts` | Service class with all business logic |
| `<domain>.controller.ts` | `campaign.controller.ts` | Thin controller class |
| `<domain>.utils.ts` | `campaign.utils.ts` | Pure utility functions (no DB, no side effects) |
| `<domain>.test.ts` | `campaign-guard.test.ts` | Vitest unit tests |
