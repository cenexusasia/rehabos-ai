# ADR-013: Server Components + Server Actions Pattern

**Status:** Accepted  
**Date:** 2025-01-01  

## Context

Next.js App Router offers two data-fetching patterns: React Server Components (RSC) for reads and Server Actions for mutations. We need a consistent pattern that maximizes performance while maintaining developer clarity.

## Decision

Use **React Server Components for data fetching** and **Server Actions for mutations**, with the following rules:

- **Data reads:** Use RSC + Supabase server client. Fetch in page components, pass down to client components as props.
- **Data mutations:** Use Server Actions with Zod validation. Call from client components via `useActionState` or direct invocation.
- **Real-time data:** Use Supabase Realtime subscriptions in client wrappers.
- **No API routes for internal operations** — Server Actions replace them.
- **API routes only for:** External integrations, webhook handlers, public API.

## Consequences

**Positive:**
- Zero client-side JavaScript for data fetching
- Server Actions are type-safe (no manual API route typing)
- Automatic revalidation with `revalidatePath` / `revalidateTag`
- Progressive enhancement (forms work without JS)
- Reduced boilerplate vs. API routes + fetch

**Negative:**
- Server Actions run as POST requests (can't cache like GET)
- Error handling is less intuitive than try/catch in API routes
- Cannot call Server Actions from client-side code outside forms (use server/api route)
- Large payloads better suited for API routes
- Server Actions in app Router have some edge cases with loading states

**Risk Mitigation:**
- Use `useActionState` for pending states
- Use `revalidateTag` for granular cache invalidation
- API routes for file uploads and external requests
- Wrap Server Actions in typed helpers for consistent error handling

## Pattern Template

```typescript
// app/_actions/patients.ts
'use server';

import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const schema = z.object({
  firstName: z.string().min(1, 'First name required'),
  lastName: z.string().min(1, 'Last name required'),
});

export async function createPatient(formData: FormData) {
  const parsed = schema.parse(Object.fromEntries(formData));
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('patients')
    .insert({ ...parsed, organization_id: (await getOrgId()) })
    .select()
    .single();
  
  if (error) return { error: error.message };
  revalidatePath('/patients');
  return { data };
}
```
