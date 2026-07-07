# ADR-010: Zod for Validation Everywhere

**Status:** Accepted  
**Date:** 2025-01-01  

## Context

We need consistent validation across client (forms), server (API), and database boundaries. Having multiple validation sources leads to type drift and bugs.

## Decision

Use **Zod** as the single validation source of truth. TypeScript types are inferred from Zod schemas, never written separately.

- Form validation: React Hook Form + `@hookform/resolvers/zod`
- Server Actions: Zod `.parse()` on input
- API routes: Zod `.parse()` on request body
- Database: Zod schemas validate before Prisma insert
- Configuration: Zod validates environment variables

## Consequences

**Positive:**
- Single source of truth for types and validation
- Runtime validation + compile-time type safety
- Eliminates type drift between client and server
- React Hook Form integration is excellent
- Server Actions automatically validate input

**Negative:**
- Schema duplication when Prisma and Zod types diverge
- Large schemas can be verbose
- Performance overhead for large data sets (mitigated by lazy validation)

**Risk Mitigation:**
- Use `zod-prisma` or `zod-prisma-types` to generate Zod schemas from Prisma
- Use `.passthrough()` for DB-specific fields not in Zod
- Validate at boundaries only, not every DB operation
