# ADR-004: LangGraph + LlamaIndex for AI Pipeline

**Status:** Accepted  
**Date:** 2025-01-01  

## Context

We need multi-step AI workflows (SOAP generation, assessment interpretation, exercise recommendation, clinical decision support) with reliable retrieval, structured output, and state management. Each workflow has multiple steps that depend on each other.

## Decision

Use **LangGraph** for agent/orchestration layer and **LlamaIndex** for RAG pipeline.

- **LangGraph:** State machine pattern for multi-step AI agent workflows. Each step is a node; transitions are edges. Supports cycles, branching, and tool integration.
- **LlamaIndex:** Document indexing, chunking strategies, embedding, hybrid retrieval (vector + keyword), reranking. Optimized for RAG scenarios.

## Consequences

**Positive:**
- Clear separation of concerns: LangGraph handles workflow state, LlamaIndex handles retrieval
- LangGraph supports cycles (e.g., retry, feedback loops)
- LlamaIndex provides advanced chunking (semantic, recursive) and reranking
- Both have active communities and frequent updates
- TypeScript SDKs available for both

**Negative:**
- Two frameworks to learn and maintain
- Integration between them requires adapter code
- LangGraph's TypeScript API is evolving rapidly (breaking changes possible)
- LlamaIndex TypeScript is less mature than Python version

**Risk Mitigation:**
- Pin framework versions in package.json
- Abstract AI pipeline behind clean interfaces so we can swap components
- Use Python microservice for heavy AI workloads if TypeScript limits become blockers

## Alternatives Considered

1. **LangChain only** — LangChain agents are less structured than LangGraph for complex workflows
2. **LlamaIndex only** — Lacks the state machine pattern for multi-step agents
3. **Custom Python microservice** — Would lose tight integration with Next.js; added latency
4. **Vercel AI SDK** — Good for simple streaming, not for complex multi-step agents
5. **DSPy** — Too experimental for production
