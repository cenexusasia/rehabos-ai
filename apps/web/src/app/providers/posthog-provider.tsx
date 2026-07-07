"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

/**
 * PostHog analytics provider.
 * Must be rendered inside a <Suspense> boundary or client component tree
 * so that usePostHog() / useFeatureFlagVariantKey() hooks work in page components.
 *
 * Configuration is read from environment variables:
 *   NEXT_PUBLIC_POSTHOG_KEY  — the project API key
 *   NEXT_PUBLIC_POSTHOG_HOST — self-hosted or https://us.i.posthog.com
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

    if (!key) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[PostHog] NEXT_PUBLIC_POSTHOG_KEY is not set — analytics disabled",
        );
      }
      return;
    }

    posthog.init(key, {
      api_host: host,
      person_profiles: "identified_only",
      capture_pageview: false, // We'll capture manually for route-aware page views
      loaded: (ph) => {
        if (process.env.NODE_ENV === "development") {
          ph.debug();
        }
      },
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
