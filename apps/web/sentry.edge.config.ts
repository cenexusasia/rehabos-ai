// This file configures the initialization of Sentry on the edge runtime.
// The DSN is loaded from the NEXT_PUBLIC_SENTRY_DSN environment variable.

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance monitoring — capture all edge transactions
  tracesSampleRate: 1.0,

  // Set to `true` to see Sentry logs during development
  debug: false,
});
