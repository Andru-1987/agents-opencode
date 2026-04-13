---
name: vertical-slice-architecture
description: >
  Apply Vertical Slice Architecture (VSA) when designing or building any backend service,
  API, or application — regardless of programming language. Use this skill whenever the
  user asks to scaffold a new project, add a feature, design folder structure, or asks
  how to organize code in a backend service. Also trigger when the user mentions "clean
  architecture", "layered architecture", "project structure", "how to organize my backend",
  "new feature", or "new endpoint" — VSA is almost always the better default for speed
  and scalability without over-engineering. This skill is language-agnostic: it applies
  equally to Go, Python, Node.js, Java, C#, Rust, or any other language.
---

# Vertical Slice Architecture for Programming Agents

## Core Principle

Organize code by **feature (slice)**, not by technical layer.

Each feature owns everything it needs: its HTTP/RPC handler, business logic, data access,
and data models. Features are independent. Adding a feature means adding a folder.
Removing a feature means removing a folder. Nothing bleeds between slices unless explicitly
shared.

This is the opposite of layered architecture, which groups code by technical role
(all controllers together, all repositories together). Layered architectures force you
to touch 4 files in 4 folders to add one endpoint. VSA touches 1 folder.

---

## When to Use VSA vs Layered / Clean Architecture

| Situation | Use |
|---|---|
| New project, solo or small team | VSA |
| SaaS, APIs, CRUD-heavy services | VSA |
| Need to scale features fast | VSA |
| Complex domain with many business rules and invariants | Clean Architecture |
| Large team, shared domain kernel | Clean Architecture |
| Enterprise, regulated industry with strict separation mandates | Clean Architecture |

**Default to VSA.** Only deviate when domain complexity justifies the overhead.

---

## Canonical Structure

```
/cmd (or /app or /main — entry point)
  main.<ext>

/internal (or /src or /lib — private application code)
  /<feature-a>
    handler.<ext>       <- HTTP / gRPC / CLI entry point
    service.<ext>       <- Business logic
    repository.<ext>    <- Data access (DB, cache, external API)
    model.<ext>         <- Types, structs, interfaces for THIS feature

  /<feature-b>
    handler.<ext>
    service.<ext>
    repository.<ext>
    model.<ext>

  /shared (or /common)
    db.<ext>            <- DB connection factory
    middleware.<ext>    <- Auth, logging, error handling
    errors.<ext>        <- Shared error types (keep minimal)
```

**Rules:**
- A feature folder NEVER imports from another feature folder.
- `shared/` only contains infrastructure primitives and cross-cutting concerns.
- No `utils/` dumping ground. If something belongs to a feature, it lives there.

---

## Layer Responsibilities Within a Slice

### Handler
- Parses and validates input (request body, query params, path params).
- Calls the service.
- Writes the HTTP/gRPC response.
- Contains NO business logic.
- Contains NO direct DB calls.

### Service
- Implements business rules and validation that go beyond input shape.
- Orchestrates calls to the repository and/or external services.
- Returns domain objects or errors — never HTTP constructs.
- Can be omitted early on if there is zero business logic. Introduce it when logic appears.

### Repository
- Executes queries against the database (or cache, or external API).
- Maps raw DB rows to domain models.
- Returns domain objects or errors.
- Contains NO business logic.

### Model
- Data types used within this feature.
- Request/response DTOs.
- Domain entities.
- Keep them local to the feature unless explicitly shared.

---

## Decision Rules for the Agent

### Starting a new project

1. Create the entry point (`main.<ext>`) that wires dependencies.
2. Create `/shared/db.<ext>` for the DB connection.
3. Create the first feature slice under `/internal/<first-feature>/`.
4. Do NOT create a `/controllers`, `/services`, `/repositories` folder structure.

### Adding a new feature

1. Create `/internal/<new-feature>/` directory.
2. Scaffold `model`, `repository`, `service` (if needed), `handler` in that order.
3. Register the handler routes in `main.<ext>`.
4. Do NOT modify existing feature slices.

### Adding an endpoint to an existing feature

1. Add the route registration in the feature's `handler.<ext>`.
2. Add the service method if business logic is involved.
3. Add the repository method if a new query is needed.
4. Do NOT create new files unless the existing file becomes unmanageably large (>300 lines is a soft signal).

### When a feature file gets too large

Split by sub-concern, keeping them inside the same feature folder:
```
/orders
  handler_create.<ext>
  handler_query.<ext>
  service.<ext>
  repository_write.<ext>
  repository_read.<ext>
  model.<ext>
```

Do NOT split by moving parts to a shared layer.

### When two features need the same logic

Ask: is this infrastructure or business logic?

- **Infrastructure** (DB helpers, HTTP utilities, auth middleware): move to `/shared/`.
- **Business logic**: do NOT share. Duplicate it. Duplication between slices is intentional —
  it keeps them independent. Premature abstraction across slices is the main failure mode of VSA.

---

## Anti-Patterns to Avoid

- **Cross-slice imports**: `orders` importing from `invoices` is a red flag.
- **God `shared/` package**: if `shared/` grows business logic, it becomes a hidden layered architecture.
- **Premature interfaces**: don't define interfaces for the sake of it. Define them when you have multiple implementations or need to mock for tests.
- **Folder-per-layer at the root**: `/controllers`, `/services`, `/repositories` at the project root is layered architecture, not VSA.
- **Anemic models**: models that are just bags of fields with all logic in the service are acceptable, but don't mistake this pattern for good design when the domain warrants richer objects.

---

## Language-Specific Notes

### Go
- Feature folders map to packages: `package orders`.
- Use `net/http` (stdlib, Go 1.22+) for simple APIs. Add `chi` or `echo` only if middleware composition becomes complex.
- Inject `*sql.DB` (or a thin wrapper) directly into the repository. No ORM needed for most cases.

### Python
- Feature folders are modules with `__init__.py`.
- Use FastAPI routers per feature: `router = APIRouter(prefix="/orders")`.
- Use SQLAlchemy Core (not ORM) or raw `asyncpg` for performance-sensitive paths.

### Node.js / TypeScript
- Feature folders export an Express/Fastify router.
- Compose routers in `app.ts`.
- Use a thin query builder (Kysely, Knex) or raw pg/mysql2 instead of a full ORM.

### Java / Kotlin (Spring)
- Feature folders become packages. Each feature has its own `@RestController`, `@Service`, `@Repository`.
- Avoid the instinct to put all `@Repository` beans in a single `repository` package.

### C# (.NET)
- Features map to folders with their own Controller, Service, Repository classes.
- Register dependencies per feature in a `<Feature>Extensions.cs` static class called from `Program.cs`.

---

## Wiring (Dependency Injection)

VSA does not prescribe a DI framework. The pattern works with:

- **Manual wiring in main**: simplest, recommended for small-to-medium services.
- **DI container**: use when the number of dependencies becomes hard to manage manually.

Manual wiring example (language-agnostic pseudocode):

```
// main
db = connect(DATABASE_URL)

// wire orders slice
ordersRepo = orders.NewRepository(db)
ordersSvc  = orders.NewService(ordersRepo)
ordersHandler = orders.NewHandler(ordersSvc)
ordersHandler.Register(router)

// wire invoices slice
invoicesRepo = invoices.NewRepository(db)
invoicesSvc  = invoices.NewService(invoicesRepo)
invoicesHandler = invoices.NewHandler(invoicesSvc)
invoicesHandler.Register(router)

start(router, ":8080")
```

Each slice is wired independently. Adding a slice = adding 4 lines to main.

---

## Evolving to Microservices

VSA maps naturally to microservices. When a slice needs to be extracted:

1. Copy the feature folder to a new repository.
2. Replace the in-process DB call with an HTTP/gRPC client in the consuming slice.
3. The feature already has its own models, logic, and data access — no untangling required.

This is the key long-term advantage over layered architecture: **each slice is already a bounded context**.

---

## Checklist Before Generating Code

- [ ] Identified the feature name.
- [ ] Determined which layers are needed (handler always; service only if logic exists; repository if DB/external access is needed).
- [ ] Confirmed no cross-slice imports.
- [ ] Confirmed shared utilities go to `/shared/`, not a new feature folder.
- [ ] Entry point (`main`) wires the new slice manually unless a DI container is already in use.