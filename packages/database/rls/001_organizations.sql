-- ============================================
-- RLS Policy: Organizations
-- ============================================
-- Users can only see their own organization's data
-- Relies on auth.jwt() containing an 'org_id' claim set at login
-- ============================================

-- Enable RLS on core tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinician_roles ENABLE ROW LEVEL SECURITY;

-- Helper: Extract org_id from the JWT
CREATE OR REPLACE FUNCTION auth.org_id()
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claim.org_id', TRUE),
    (auth.jwt() ->> 'org_id')
  );
$$;

-- Helper: Extract role from the JWT
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claim.role', TRUE),
    (auth.jwt() ->> 'role')
  );
$$;

-- Helper: Check if the current user is an admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT auth.user_role() = 'admin';
$$;

-- ============================================
-- ORGANIZATIONS POLICIES
-- ============================================

-- SELECT: Users can only see their own organization
CREATE POLICY "Users can view their own organization"
  ON organizations
  FOR SELECT
  USING (id::text = auth.org_id());

-- INSERT: Only authenticated users can create orgs (rate-limited at app level)
CREATE POLICY "Authenticated users can create organizations"
  ON organizations
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- UPDATE: Only admins of the org can update
CREATE POLICY "Admins can update their organization"
  ON organizations
  FOR UPDATE
  USING (id::text = auth.org_id() AND auth.is_admin())
  WITH CHECK (id::text = auth.org_id() AND auth.is_admin());

-- DELETE: Only admins of the org can delete
CREATE POLICY "Admins can delete their organization"
  ON organizations
  FOR DELETE
  USING (id::text = auth.org_id() AND auth.is_admin());
