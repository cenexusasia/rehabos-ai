# ADR-019: Turborepo + GitHub Actions for CI/CD

**Status:** Accepted  
**Date:** 2025-01-01  

## Context

We need automated build, test, and deployment for a monorepo with multiple apps and packages. CI must be fast (caching), reliable, and provide preview deployments.

## Decision

Use **GitHub Actions** with **Turborepo task orchestration** and **Vercel** for deployment.

- **CI Pipeline:** GitHub Actions with Turborepo's `--filter` for affected tasks
- **Caching:** Turborepo remote caching (via Vercel Remote Cache)
- **Testing:** Vitest for unit, Playwright for E2E
- **Deployment:** Vercel for web, EAS Build for mobile (Phase 7)
- **Preview Deployments:** Vercel per PR

## Pipeline Stages

```
Commit → Install → Lint → Typecheck → Test → Build → Deploy
    ↑─────────── cache hit ───────────↑ (Turborepo)
```

- **Install:** pnpm install (cached via actions/cache)
- **Lint:** pnpm turbo lint
- **Typecheck:** pnpm turbo typecheck
- **Test:** pnpm turbo test (Vitest, with coverage)
- **Build:** pnpm turbo build (cached output)
- **E2E:** Playwright against preview deployment
- **Deploy:** Vercel (production for main, preview for PR)

## Consequences

**Positive:**
- Turborepo caching makes CI fast (only builds changed packages)
- Preview deployments for every PR
- Parallel test execution
- Consistent developer and CI experience (same commands)

**Negative:**
- GitHub Actions macOS runners are expensive (for mobile builds)
- Remote cache requires Vercel account
- Complex matrix configurations for cross-browser testing

## Alternatives Considered

1. **CircleCI** — Good but more expensive for same features.
2. **GitLab CI** — Not applicable (GitHub-hosted).
3. **Vercel-only** — Insufficient for running tests and linting.
