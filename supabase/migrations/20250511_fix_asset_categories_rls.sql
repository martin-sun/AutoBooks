-- Fix recursive RLS policy for asset_categories
-- Created: 2025-05-11

-- Drop the existing policy that causes recursive issues
DROP POLICY IF EXISTS asset_categories_select_policy ON asset_categories;

-- Create a new, non-recursive policy for asset_categories
CREATE POLICY asset_categories_select_policy ON asset_categories
  FOR SELECT
  USING (
    system_defined OR 
    (parent_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM asset_categories ac 
      WHERE ac.id = asset_categories.parent_id AND ac.system_defined = TRUE
    ))
  );

-- Add a policy for insert/update/delete operations
CREATE POLICY asset_categories_modify_policy ON asset_categories
  FOR ALL
  USING (NOT system_defined);  -- Users can only modify non-system categories
