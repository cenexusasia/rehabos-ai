# ADR-007: Cal.diy for Scheduling

**Status:** Accepted  
**Date:** 2025-01-01  

## Context

Scheduling is one of the most complex features to build from scratch: availability management, timezone handling, recurring rules, booking pages, calendar sync (Google, Outlook), reminders, waitlists, and conflict resolution.

## Decision

Use **Cal.diy** (MIT-licensed community edition of Cal.com) as the scheduling engine.

- Self-hosted Cal.diy instance
- Embed booking pages in our clinician and patient apps
- Use Cal.diy API for availability management and appointment creation
- Cal.diy provides: availability schedules, booking pages, calendar sync, email reminders, cancellation management

## Consequences

**Positive:**
- Mature scheduling infrastructure — years of development
- Calendar sync (Google, Outlook, Apple) built-in
- Timezone handling done right
- Embeddable booking pages via iframe or API
- MIT license — no proprietary restrictions

**Negative:**
- Additional service to self-host (requires database + Redis)
- Cal.diy has fewer features than Cal.com (no routing forms, no workflows)
- Must maintain fork or keep up with upstream
- Integration requires mapping Cal.diy event types to our appointment types
- UI customization limited if using embedded booking pages

**Risk Mitigation:**
- Use Cal.diy for the scheduling engine but build custom UI for our app
- Store appointments in our database first, sync to Cal.diy
- Build a thin abstraction layer so we can swap scheduling providers
- Consider using Cal.com API directly if Cal.diy becomes too restrictive

## Alternatives Considered

1. **Build from scratch** — 2-3 months of development for features Cal.diy already has
2. **Cal.com API (SaaS)** — Proprietary core, expensive at scale
3. **Schedule-X + Supabase** — Calendar UI only, no scheduling engine. Still need availability, booking, reminders.
4. **Amie / Fantastical API** — Consumer-focused, not enterprise scheduling
