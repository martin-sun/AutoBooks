-- Fix Assets Menu Item
-- Created: 2025-05-11

-- Add Assets as a submenu item under Accounts
DO $$
DECLARE
  personal_accounts_id UUID;
  business_accounts_id UUID;
BEGIN
  -- Get Accounts menu item IDs
  SELECT id INTO personal_accounts_id FROM sidebar_menu_items 
  WHERE name = 'Accounts' AND template_id = (
    SELECT id FROM sidebar_templates WHERE workspace_type = 'personal' LIMIT 1
  );
  
  SELECT id INTO business_accounts_id FROM sidebar_menu_items 
  WHERE name = 'Accounts' AND template_id = (
    SELECT id FROM sidebar_templates WHERE workspace_type = 'business' LIMIT 1
  );
  
  -- Add Assets as submenu under Accounts for personal workspace
  INSERT INTO sidebar_menu_items (
    template_id,
    name,
    route,
    icon,
    parent_id,
    position,
    is_active
  ) VALUES (
    (SELECT id FROM sidebar_templates WHERE workspace_type = 'personal' LIMIT 1),
    'Assets',
    '/dashboard/:workspace_id/assets',
    'Landmark',
    personal_accounts_id,
    3, -- Position within Accounts submenu
    TRUE
  );
  
  -- Add Assets as submenu under Accounts for business workspace
  INSERT INTO sidebar_menu_items (
    template_id,
    name,
    route,
    icon,
    parent_id,
    position,
    is_active
  ) VALUES (
    (SELECT id FROM sidebar_templates WHERE workspace_type = 'business' LIMIT 1),
    'Assets',
    '/dashboard/:workspace_id/assets',
    'Landmark',
    business_accounts_id,
    3, -- Position within Accounts submenu
    TRUE
  );
END $$;
