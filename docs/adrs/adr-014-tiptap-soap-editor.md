# ADR-014: TipTap for Rich Text SOAP Editor

**Status:** Accepted  
**Date:** 2025-01-01  

## Context

Clinicians need a rich text editor for SOAP notes that supports structured sections (S/O/A/P), formatting, images, tables, and templates. It must be extensible for custom clinical content types.

## Decision

Use **TipTap** (ProseMirror-based) as the rich text editor.

- Built on ProseMirror (battle-tested, extensible)
- Custom nodes for SOAP sections
- Schema validation for structured data
- Collaborative editing support (future)
- JSON output for database storage
- HTML output for PDF export

## Consequences

**Positive:**
- Highly extensible — custom SOAP section nodes
- Structured JSON output (not HTML) — easier to parse for AI
- Schema validation prevents malformed content
- Collaborative editing via Yjs (future capability)
- Active community and frequent releases
- TypeScript-native

**Negative:**
- Learning curve for custom node development
- Bundle size impact (~100KB gzipped)
- Schema definition requires care (migrations for existing content)
- Collaborative editing adds complexity

## Alternatives Considered

1. **Slate.js** — More flexible but less structured. Higher learning curve.
2. **Quill.js** — Simpler but not extensible enough for structured clinical content.
3. **ContentEditable div** — Too low-level, no schema enforcement.
4. **Lexical (Meta)** — Promising but younger ecosystem.
