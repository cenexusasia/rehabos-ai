# ADR-005: Neo4j for Knowledge Graph

**Status:** Accepted  
**Date:** 2025-01-01  

## Context

Our clinical knowledge graph requires heavily relationship-rich queries:
- "What exercises are indicated for ACL reconstruction in Phase 2?"
- "What contraindications exist for this exercise given this patient's comorbidities?"
- "What assessments measure outcomes related to this diagnosis?"
- "What diagnoses differentiate from this presentation?"

These queries involve multi-hop graph traversals that are inefficient in relational databases.

## Decision

Use **Neo4j** (with Neo4j AuraDB managed hosting) as the knowledge graph database.

- Graph structure mirrors clinical relationship patterns naturally
- Cypher queries express multi-hop traversals concisely
- Neo4j AuraDB provides managed hosting (backup, scaling, security)
- Combined with pgvector embeddings for hybrid GraphRAG

## Consequences

**Positive:**
- Natural representation of clinical entities and relationships
- Sub-millisecond multi-hop traversals
- GraphRAG pattern (graph traversal + vector similarity) for rich AI context
- Cypher is expressive for complex clinical queries
- Neo4j's native vector search (GA in 5.x) for unified approach

**Negative:**
- Additional infrastructure to manage (even with AuraDB)
- Data synchronization between PostgreSQL and Neo4j needed
- Team must learn Cypher (different from SQL)
- Cost: AuraDB free tier limited; professional tier starts at $65/mo
- Dual-write pattern introduces eventual consistency concerns

**Risk Mitigation:**
- Use event-driven sync (Supabase Realtime → Neo4j sync worker)
- Build Cypher query templates in `packages/knowledge-graph/queries/`
- Sync is asynchronous — graph is an enhancement, not the system of record
- PostgreSQL remains source of truth for all transactional data

## Alternatives Considered

1. **PostgreSQL + recursive CTEs** — Works for small graphs, but performance degrades past 3-4 hops. No graph-native algorithms.
2. **pgvector only** — Embeddings can capture some relationships but not explicit graph structure.
3. **ArangoDB** — Multi-model (document + graph) but smaller ecosystem for healthcare.
4. **Amazon Neptune** — AWS lock-in, higher cost, less developer-friendly.
