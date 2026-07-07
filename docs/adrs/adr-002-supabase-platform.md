# ADR-002: Supabase for Database + Auth + Storage

**Status:** Accepted  
**Date:** 2025-01-01  

## Context

We need PostgreSQL for relational data, authentication with MFA, file storage for exercise videos/images/documents, and real-time capabilities. Managing these as separate services adds operational overhead.

## Decision

Use **Supabase** as the integrated backend platform.

- Supabase PostgreSQL (managed, with pgvector extension)
- Supabase Auth (JWT-based, MFA, OAuth, Row-Level Security integration)
- Supabase Storage (S3-compatible, bucket-level policies, image optimization)
- Supabase Realtime (WebSocket subscriptions via PostgreSQL replication)

## Consequences

**Positive:**
- Single provider reduces infrastructure complexity
- RLS is built into the database layer — auth and authz are inseparable
- Realtime subscriptions without additional infrastructure (no Pusher/Firebase)
- BAA available for HIPAA compliance
- Standard PostgreSQL underneath — no lock-in if we need to migrate

**Negative:**
- Supabase Pro ($25/mo) is required for BAA/SOC2
- Rate limiting on auth endpoints
- Supabase Edge Functions are not as mature as alternatives

**Risk Mitigation:**
- Use standard PostgreSQL features — migration path to RDS/Aurora if needed
- Prisma ORM abstracts database access — switch with schema change
- Rate limiting mitigated by Upstash Redis in front of auth

## Alternatives Considered

1. **Supabase** — Chosen for integration and BAA availability
2. **Firebase** — Not HIPAA-compliant without BAA for specific features
3. **AWS Amplify + RDS** — Much higher operational overhead
4. **Self-hosted PostgreSQL + Auth0 + S3** — Highest operational cost
