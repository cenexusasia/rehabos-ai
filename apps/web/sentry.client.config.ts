// This file configures the initialization of Sentry on the client side.
// The DSN is loaded from the NEXT_PUBLIC_SENTRY_DSN environment variable.

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance monitoring sample rate — capture 20% of transactions
  tracesSampleRate: 0.2,

  // Replay sampling
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Set to `true` to see Sentry logs during development
  debug: false,
});
