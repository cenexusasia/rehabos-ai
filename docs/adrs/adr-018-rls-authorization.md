# ADR-018: Supabase RLS as Primary Authorization

**Status:** Accepted  
**Date:** 2025-01-01  

## Context

Authorization must be enforced at every layer: database, API, and UI. If authorization is only in the application layer, a direct database connection bypasses it. Supabase provides Row-Level Security (RLS) at the PostgreSQL level.

## Decision

Use **Supabase RLS** as the primary authorization mechanism, with application-level checks as a secondary layer.

- RLS policies defined per table, per operation (SELECT, INSERT, UPDATE, DELETE)
- JWT claims (user.role, user.org_id) drive RLS policies
- Application uses anon key (client-side) or service_role key (server-side)
- Application-level checks for complex authorization logic
- UI components use permission hooks for conditional rendering

## Consequences

**Positive:**
- Authorization enforced at the database level — no bypass possible
- RLS applies to all access methods (API, admin, direct queries)
- JWT integration is seamless with Supabase Auth
- Policies are declarative and auditable
- Service role can bypass RLS for admin operations

**Negative:**
- RLS policies can become complex and hard to debug
- Policy performance impact on queries (multiple policy checks)
- Not all authorization logic can be expressed in RLS (complex business rules)
- RLS policies in SQL files are separate from TypeScript code

**Risk Mitigation:**
- Test RLS policies with automated tests
- Use EXPLAIN ANALYZE to check policy performance
- Keep policies simple; move complex logic to application layer
- Document each policy with its rationale
- CI pipeline validates RLS policies against test scenarios

## Key Policy Patterns

```sql
-- Organization isolation (applies to most tables)
CREATE POLICY org_isolation ON patients
  USING (organization_id = auth.jwt() ->> 'org_id');

-- Clinician sees own patients
CREATE POLICY clinician_own_patients ON patients
  FOR SELECT
  USING (
    clinician_id = auth.uid()
    AND organization_id = auth.jwt() ->> 'org_id'
  );

-- Admin sees all in org
CREATE POLICY admin_all_patients ON patients
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM clinician_roles cr
      JOIN roles r ON cr.role_id = r.id
      WHERE cr.clinician_id = auth.uid()
      AND r.name = 'admin'
      AND r.organization_id = auth.jwt() ->> 'org_id'
    )
  );

-- Patient sees own data
CREATE POLICY patient_self ON patients
  FOR SELECT
  USING (id = auth.uid());
```
