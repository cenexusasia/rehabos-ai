# ADR-006: Meilisearch for Full-Text Search

**Status:** Accepted  
**Date:** 2025-01-01  

## Context

Clinicians need instant search across patients, exercises, assessments, protocols, and notes. Search must be fast, typo-tolerant, and support faceted filtering (by category, body region, equipment, etc.).

## Decision

Use **Meilisearch** as the primary search engine.

- Self-hosted via Docker (or Meilisearch Cloud)
- Instant search-as-you-type (<50ms response)
- Built-in typo tolerance (configurable)
- Faceted search with filters
- Sorting by relevance, date, name
- Simple REST API with SDKs for TypeScript

## Consequences

**Positive:**
- Near-instant search results
- Typo tolerance without complex configuration
- Lightweight (~256MB RAM) — cheap to self-host
- REST API is simple and well-documented
- Can index multiple resource types (patients, exercises, assessments)
- Supabase → Meilisearch sync via webhook or cron

**Negative:**
- Additional service to maintain
- Data synchronization delay (eventual consistency)
- ~256MB RAM requirement for self-hosting
- Full-text search on PostgreSQL could handle basic needs

**Risk Mitigation:**
- Start with PostgreSQL full-text search (tsvector) — it's already there
- Add Meilisearch when search volume requires it
- Meilisearch is a cache/index layer; PostgreSQL is always the source of truth

## Alternatives Considered

1. **PostgreSQL tsvector** — Good enough for MVP (thousands of records). Use as fallback.
2. **Typesense** — Comparable to Meilisearch. Slightly faster raw performance but smaller ecosystem.
3. **Algolia** — Best-in-class but expensive for self-hosted or high-volume. SaaS cost adds up.
4. **ElasticSearch** — Too heavy for our needs. Designed for log analytics, not instant search.
