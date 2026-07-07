-- ============================================
-- RLS Policy: Roles
-- ============================================
-- - Admin can manage roles (CRUD)
-- - Other roles can only read roles
-- - All access scoped to the user's organization
-- ============================================

-- ROLES POLICIES

-- SELECT: Everyone in the org can see roles
CREATE POLICY "Users can view roles in their org"
  ON roles
  FOR SELECT
  USING (
    organization_id::text = auth.org_id()
  );

-- INSERT: Only admin can create new roles
CREATE POLICY "Only admins can create roles"
  ON roles
  FOR INSERT
  WITH CHECK (
    organization_id::text = auth.org_id()
    AND auth.is_admin()
  );

-- UPDATE: Only admin can update roles
CREATE POLICY "Only admins can update roles"
  ON roles
  FOR UPDATE
  USING (
    organization_id::text = auth.org_id()
    AND auth.is_admin()
  )
  WITH CHECK (
    organization_id::text = auth.org_id()
    AND auth.is_admin()
  );

-- DELETE: Only admin can delete roles (system roles protected at app level)
CREATE POLICY "Only admins can delete roles"
  ON roles
  FOR DELETE
  USING (
    organization_id::text = auth.org_id()
    AND auth.is_admin()
  );
