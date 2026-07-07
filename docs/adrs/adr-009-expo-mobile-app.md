# ADR-009: Expo for Patient Mobile App

**Status:** Accepted  
**Date:** 2025-01-01  

## Context

Patients need a mobile app to view exercises (with video), log HEP compliance, message their clinician, view appointments, and track progress. Must work on both iOS and Android, with offline support for exercise viewing in low-connectivity environments.

## Decision

Use **Expo** (React Native) with **Expo Router** for navigation.

- Single codebase targeting iOS + Android
- Expo Router for file-based routing (similar to Next.js)
- Expo SQLite for local data persistence
- Legend State for reactive state management with persistence
- Expo Push Notifications for message alerts
- Over-the-air updates via Expo Updates (no App Store review for minor changes)

## Consequences

**Positive:**
- ~90% code sharing between iOS and Android
- File-based routing (developer familiarity with Next.js pattern)
- Over-the-air updates bypass app store review for bug fixes
- SQLite for offline exercise viewing and compliance logging
- Expo's managed workflow handles most native configuration
- Strong TypeScript support

**Negative:**
- Larger bundle size than native Swift/Kotlin apps
- Cannot use all native iOS/Android APIs (but can eject to bare workflow)
- Offline sync complexity (conflict resolution, merge strategies)
- React Native performance limitations for complex animations
- Expo Router is newer — potential instability

**Risk Mitigation:**
- Keep heavy computation on server; mobile is a thin client
- Use offline-first pattern: local SQLite as primary store, sync to server
- Design for offline degradation (cache exercise videos, queue messages)
- PWA companion for web-based access without app install

## Alternatives Considered

1. **React Native CLI** — More native control but higher setup cost. Expo is sufficient.
2. **Flutter** — Excellent performance but different language (Dart), team prefers TypeScript.
3. **PWA only** — Limited native features (push, camera, background sync not fully reliable on iOS).
4. **Swift + Kotlin (native)** — 2x development cost, no code sharing.
5. **Capacitor (Ionic)** — WebView-based, worse performance for exercise videos.
