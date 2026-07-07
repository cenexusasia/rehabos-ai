# ADR-003: Custom Internal Models over FHIR

**Status:** Accepted  
**Date:** 2025-01-01  

## Context

FHIR (Fast Healthcare Interoperability Resources) is the healthcare data standard. Using FHIR would provide interoperability, but adds abstraction overhead. Our assessment engine, knowledge graph, AI pipelines, and exercise library do not map cleanly to FHIR resources without excessive extension.

## Decision

Use **custom normalized database models** optimized for our AI workflows and clinical domain. Provide a **FHIR export adapter** for interoperability.

- Internal models are designed for performance and developer productivity
- FHIR mapping layer is built as an adapter for specific use cases (export, integration)
- Key entities (Patient, Observation, Condition) map to FHIR equivalents
- Exercise, Protocol, Assessment entities are purely custom

## Consequences

**Positive:**
- Faster development velocity — no FHIR learning curve
- Better AI pipeline performance — models designed for retrieval and generation
- Simpler queries — no FHIR resource resolution overhead
- Full control over schema evolution

**Negative:**
- Not FHIR-native — trade-off for interoperability
- Need to build FHIR export adapter when integration is needed
- May complicate integration with FHIR-native systems
- Must manually track FHIR mappings for key compliance use cases

**Risk Mitigation:**
- Store ICD-10, CPT, SNOMED codes as first-class fields
- FHIR adapter built as a separate package (not embedded)
- Use FHIR Patient structure as reference for our Patient model
- Plan FHIR integration for Phase 8 (not blocking MVP)

## Alternatives Considered

1. **Medplum (FHIR-native)** — Rejected due to operational complexity, resource overhead (1GB+ RAM), and poor fit for AI workflows. See architecture document for detailed rationale.
2. **Hybrid (core FHIR + custom extensions)** — Still carries FHIR query overhead. Best of neither world.
3. **Full custom** — Chosen approach.
