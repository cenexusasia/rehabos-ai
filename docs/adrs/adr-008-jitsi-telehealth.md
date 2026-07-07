# ADR-008: Jitsi for Telehealth

**Status:** Accepted  
**Date:** 2025-01-01  

## Context

We need HIPAA-compatible video consultations between clinicians and patients. Requirements: multi-party (future group therapy), screen sharing, recording, chat, waiting room, and the ability to self-host for data control.

## Decision

Use **Jitsi Meet** as the telehealth video platform.

- Self-hosted Jitsi Meet on Docker infrastructure
- Integration via Jitsi iframe API for custom UI overlay
- Room management: create unique room per appointment
- Authentication via JWT tokens (Jitsi supports URL-based auth)
- Recording to local storage or S3-compatible backend
- Optional: Jitsi as a Service (managed) for production

## Consequences

**Positive:**
- Full data control (self-hosted = HIPAA-compatible)
- Feature-rich: screen sharing, chat, recording, virtual backgrounds
- Stable and well-tested in healthcare contexts
- Iframe API allows custom UI around the video container
- Active open-source community

**Negative:**
- Requires server infrastructure (minimum 2GB RAM recommended)
- Jitsi Docker setup is complex (Prosody, Jicofo, Videobridge components)
- Video quality depends on connection (no adaptive streaming as good as proprietary)
- Iframe API limits UI customization within the video window
- No built-in EMR integration (we build that)

**Risk Mitigation:**
- Use Jitsi as a Service (managed) for production — HIPAA-compliant hosting available
- Wrap Jitsi in custom React component for consistent UI
- Store session quality metrics for troubleshooting
- Fallback to phone audio if video fails

## Alternatives Considered

1. **OpenVidu** — More customizable but heavier infrastructure. mediasoup-based.
2. **mediasoup** — Lower-level. More control but significantly more development work.
3. **Daily (SaaS)** — Excellent DX but expensive at scale, no self-hosting.
4. **Twilio Video** — Deprecated (Twilio exited video).
5. **Zoom API** — Proprietary, no self-hosting, expensive.
