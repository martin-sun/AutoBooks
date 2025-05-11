-- Fix the audit_logs RLS policy to allow inserts from authenticated users
-- This is needed to support creating new workspaces, which generate audit logs

-- First, drop the existing policy
DROP POLICY IF EXISTS audit_logs_policy ON audit_logs;

-- Create a new policy that allows:
-- 1. SELECT/UPDATE/DELETE only for records where workspace_id is in the user's workspaces
-- 2. INSERT for any authenticated user (needed for new workspace creation)
CREATE POLICY audit_logs_select_policy ON audit_logs
  FOR SELECT
  USING (
    workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid())
    OR
    user_id = auth.uid()
  );

CREATE POLICY audit_logs_insert_policy ON audit_logs
  FOR INSERT
  WITH CHECK (true);  -- Allow any authenticated user to insert audit logs

-- Enable RLS on audit_logs table (in case it wasn't already enabled)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
