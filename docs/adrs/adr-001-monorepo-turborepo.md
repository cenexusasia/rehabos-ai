# ADR-001: Monorepo with Turborepo

**Status:** Accepted  
**Date:** 2025-01-01  
**Deciders:** CTO / Principal Architect  

---

## Context

RehabOS AI has multiple applications (web clinician app, patient mobile app, admin dashboard) and shared packages (AI engine, database, shared UI, exercise library). Managing these in separate repositories would create:

- Dependency version drift between packages
- Duplicated CI/CD configuration
- Difficulty making cross-cutting changes
- Cognitive overhead of context switching between repos

## Decision

Use a **Turborepo** monorepo managed by **pnpm workspaces**.

- Root `package.json` with `pnpm-workspace.yaml` defining packages
- `turbo.json` for build caching, task orchestration, and dependency ordering
- Shared TypeScript configs (`packages/config/typescript/`)
- Shared ESLint config
- Single `pnpm-lock.yaml` for consistent dependency resolution

## Consequences

**Positive:**
- Build caching speeds up CI (Turborepo caches task outputs)
- Single dependency tree eliminates version drift
- Cross-cutting changes (e.g., adding a field to Patient model) update everywhere atomically
- Shared tooling configs reduce duplication
- `pnpm` workspace protocol (`"@rehabos/database": "workspace:*"`) locks internal versions

**Negative:**
- Initial setup complexity (pnpm install at root, workspace configuration)
- All packages must use compatible TypeScript and React versions
- CI must handle larger context (but caching mitigates)
- Requires discipline to maintain package boundaries

**Risk Mitigation:**
- Use `strict` package dependency graph in `turbo.json`
- Package-level `tsconfig.json` extends root configs
- CI runs only affected tasks via `turbo run --filter=[changed packages]`

## Alternatives Considered

1. **Nx** — More powerful but heavier. Turborepo is simpler and sufficient for our needs.
2. **npm workspaces only** — No build caching, no task orchestration.
3. **Multi-repo** — Rejected due to version drift and cross-cutting change complexity.
4. **Bazel** — Too heavy for a startup. Enterprise scale when we have 100+ engineers.
