/**
 * Typed analytics helpers built on top of PostHog.
 *
 * Usage:
 *   import { capture, pageView } from "@/lib/analytics";
 *
 *   capture("user_signed_up", { plan: "pro" });
 *   pageView();
 *
 * All helpers are safe to call server-side (they no-op if posthog isn't
 * available) and safe in development (no errors when PostHog is unconfigured).
 */

import posthog from "posthog-js";

// ---------------------------------------------------------------------------
// Page Views
// ---------------------------------------------------------------------------

/**
 * Manually capture a $pageview event.
 *
 * Call this from a route-level useEffect or from a <PageViewTracker>
 * component that listens to Next.js router events.
 *
 * When `capture_pageview: false` is set in init, PostHog does NOT
 * auto-capture page views — you must call this yourself.
 */
export function pageView(): void {
  try {
    posthog.capture("$pageview");
  } catch {
    // PostHog not initialized — silently ignore
  }
}

// ---------------------------------------------------------------------------
// Custom Events
// ---------------------------------------------------------------------------

/**
 * Capture a custom event with optional properties.
 *
 * @param event  Event name (e.g. "therapy_session_started").
 * @param properties  Arbitrary properties to attach to the event.
 */
export function capture(event: string, properties?: Record<string, unknown>): void {
  try {
    posthog.capture(event, properties);
  } catch {
    // PostHog not initialized — silently ignore
  }
}

// ---------------------------------------------------------------------------
// Identity
// ---------------------------------------------------------------------------

/**
 * Identify a user (and optionally set their properties).
 *
 * Call this after login / sign-up.
 */
export function identify(
  userId: string,
  traits?: Record<string, unknown>,
): void {
  try {
    posthog.identify(userId, traits);
  } catch {
    // PostHog not initialized — silently ignore
  }
}

/**
 * Reset the user identity (call on logout).
 */
export function reset(): void {
  try {
    posthog.reset();
  } catch {
    // PostHog not initialized — silently ignore
  }
}

// ---------------------------------------------------------------------------
// Feature Flags
// ---------------------------------------------------------------------------

/**
 * Check if a feature flag is enabled for the current user.
 */
export function isFeatureEnabled(key: string): boolean {
  try {
    return posthog.isFeatureEnabled(key) ?? false;
  } catch {
    return false;
  }
}

/**
 * Get the variant payload for an experiment / feature flag.
 */
export function getFeatureVariant(key: string): string | boolean | undefined {
  try {
    return posthog.getFeatureFlag(key);
  } catch {
    return undefined;
  }
}
