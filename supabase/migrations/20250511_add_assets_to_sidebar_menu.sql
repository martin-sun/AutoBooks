-- Add Assets Management to Sidebar Menu
-- Created: 2025-05-11

-- First, get the template IDs for personal and business workspaces
DO $$
DECLARE
  personal_template_id UUID;
  business_template_id UUID;
  assets_menu_id UUID;
BEGIN
  -- Get template IDs
  SELECT id INTO personal_template_id FROM sidebar_templates WHERE workspace_type = 'personal' LIMIT 1;
  SELECT id INTO business_template_id FROM sidebar_templates WHERE workspace_type = 'business' LIMIT 1;
  
  -- Add Assets menu item to both personal and business templates
  -- Personal template
  INSERT INTO sidebar_menu_items (
    template_id,
    name,
    route,
    icon,
    parent_id,
    position,
    is_active
  ) VALUES (
    personal_template_id,
    'Assets',
    '/dashboard/:workspace_id/assets',
    'Landmark',
    NULL,
    50, -- Position after existing menu items
    TRUE
  ) RETURNING id INTO assets_menu_id;
  
  -- Business template
  INSERT INTO sidebar_menu_items (
    template_id,
    name,
    route,
    icon,
    parent_id,
    position,
    is_active
  ) VALUES (
    business_template_id,
    'Assets',
    '/dashboard/:workspace_id/assets',
    'Landmark',
    NULL,
    50, -- Position after existing menu items
    TRUE
  );
END $$;
