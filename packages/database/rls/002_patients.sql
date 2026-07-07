-- ============================================
-- RLS Policy: Patients
-- ============================================
-- - Clinician can see own patients (patients where clinician_id = their id)
-- - Admin can see all patients in the org
-- - All access is scoped to the user's organization via auth.org_id()
-- ============================================

-- Get the current user's clinician_id from the JWT (set at login)
CREATE OR REPLACE FUNCTION auth.clinician_id()
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claim.clinician_id', TRUE),
    (auth.jwt() ->> 'clinician_id')
  );
$$;

-- PATIENTS POLICIES

-- SELECT:
--   - Admin sees all patients in the org
--   - Clinician sees patients where they are the primary clinician
--   - Everyone else sees nothing
CREATE POLICY "Users can view patients in their org"
  ON patients
  FOR SELECT
  USING (
    organization_id::text = auth.org_id()
    AND (
      auth.is_admin()
      OR clinician_id::text = auth.clinician_id()
    )
  );

-- INSERT:
--   - Admin and clinicians can create patients in their org
CREATE POLICY "Clinicians and admins can create patients"
  ON patients
  FOR INSERT
  WITH CHECK (
    organization_id::text = auth.org_id()
    AND (
      auth.is_admin()
      OR clinician_id::text = auth.clinician_id()
    )
  );

-- UPDATE:
--   - Admin can update any patient in the org
--   - Clinician can update their own patients
CREATE POLICY "Clinicians can update own patients, admins can update all"
  ON patients
  FOR UPDATE
  USING (
    organization_id::text = auth.org_id()
    AND (
      auth.is_admin()
      OR clinician_id::text = auth.clinician_id()
    )
  )
  WITH CHECK (
    organization_id::text = auth.org_id()
    AND (
      auth.is_admin()
      OR clinician_id::text = auth.clinician_id()
    )
  );

-- DELETE:
--   - Only admin can delete patients (soft delete via deletedAt in app)
CREATE POLICY "Only admins can delete patients"
  ON patients
  FOR DELETE
  USING (
    organization_id::text = auth.org_id()
    AND auth.is_admin()
  );
