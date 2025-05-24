-- Fix infinite recursion in workspaces RLS policy
-- Migration: 20250524010000_fix_workspace_rls_recursion.sql

-- Drop the problematic policy
DROP POLICY IF EXISTS workspace_access_policy ON workspaces;

-- Create a simplified policy that avoids recursion
CREATE POLICY workspace_access_policy ON workspaces
  FOR ALL
  USING (
    -- Direct ownership checks that don't cause recursion
    user_id = auth.get_current_user_id() OR 
    owner_id = auth.get_current_user_id()
  );

-- Create a separate policy for workspace members that uses a security definer function
-- to avoid the recursion issue
CREATE OR REPLACE FUNCTION auth.check_workspace_membership(workspace_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- This is crucial to avoid the RLS recursion
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM workspace_members
    WHERE 
      workspace_id = workspace_id_param AND 
      user_id = auth.get_current_user_id() AND 
      is_active = TRUE
  );
END;
$$;

-- Add the membership check as a separate policy
CREATE POLICY workspace_member_access_policy ON workspaces
  FOR ALL
  USING (
    auth.check_workspace_membership(id)
  );

-- Update any other policies that might be causing recursion
-- For example, if workspace_members has a policy that references workspaces:
DROP POLICY IF EXISTS workspace_members_policy ON workspace_members;

CREATE POLICY workspace_members_policy ON workspace_members
  FOR ALL
  USING (
    -- Direct user check without referencing workspaces table
    user_id = auth.get_current_user_id() OR
    -- Check if user is the owner of the workspace
    workspace_id IN (
      SELECT id FROM workspaces 
      WHERE user_id = auth.get_current_user_id() OR owner_id = auth.get_current_user_id()
    )
  );
