-- ============================================
-- RLS Policy: Clinicians
-- ============================================
-- - Clinicians can see other clinicians in the same org
-- - Admin can see and manage all clinicians in the org
-- - Users can only see their own org's clinicians
-- ============================================

-- CLINICIANS POLICIES

-- SELECT:
--   - Users in the org can view all clinicians in their org
--   - Admin has no additional visibility (org-scoping already covers it)
CREATE POLICY "Users can view clinicians in their org"
  ON clinicians
  FOR SELECT
  USING (
    organization_id::text = auth.org_id()
  );

-- INSERT:
--   - Only admin can create new clinicians in the org
CREATE POLICY "Only admins can create clinicians"
  ON clinicians
  FOR INSERT
  WITH CHECK (
    organization_id::text = auth.org_id()
    AND auth.is_admin()
  );

-- UPDATE:
--   - Admin can update any clinician in the org
--   - Clinicians can update their own profile (except role-sensitive fields)
CREATE POLICY "Admins can update any clinician, users can update own profile"
  ON clinicians
  FOR UPDATE
  USING (
    organization_id::text = auth.org_id()
    AND (
      auth.is_admin()
      OR id::text = auth.clinician_id()
    )
  )
  WITH CHECK (
    organization_id::text = auth.org_id()
    AND (
      auth.is_admin()
      OR id::text = auth.clinician_id()
    )
  );

-- DELETE:
--   - Only admin can delete clinicians (soft delete preferred in app)
CREATE POLICY "Only admins can delete clinicians"
  ON clinicians
  FOR DELETE
  USING (
    organization_id::text = auth.org_id()
    AND auth.is_admin()
  );

-- CLINICIAN_ROLES POLICIES

-- SELECT: Users in the org can view role assignments
CREATE POLICY "Users can view clinician roles in their org"
  ON clinician_roles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clinicians c
      WHERE c.id = clinician_id
        AND c.organization_id::text = auth.org_id()
    )
  );

-- INSERT/UPDATE/DELETE: Only admins can manage role assignments
CREATE POLICY "Only admins can manage clinician roles"
  ON clinician_roles
  FOR INSERT
  WITH CHECK (
    auth.is_admin()
    AND EXISTS (
      SELECT 1 FROM clinicians c
      WHERE c.id = clinician_id
        AND c.organization_id::text = auth.org_id()
    )
  );

CREATE POLICY "Only admins can update clinician roles"
  ON clinician_roles
  FOR UPDATE
  USING (
    auth.is_admin()
    AND EXISTS (
      SELECT 1 FROM clinicians c
      WHERE c.id = clinician_id
        AND c.organization_id::text = auth.org_id()
    )
  );

CREATE POLICY "Only admins can delete clinician roles"
  ON clinician_roles
  FOR DELETE
  USING (
    auth.is_admin()
    AND EXISTS (
      SELECT 1 FROM clinicians c
      WHERE c.id = clinician_id
        AND c.organization_id::text = auth.org_id()
    )
  );
