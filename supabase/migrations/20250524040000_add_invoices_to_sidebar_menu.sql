-- Add invoices to sidebar menu
DO $$
DECLARE
  personal_template_id UUID;
  business_template_id UUID;
  personal_sales_id UUID;
  business_sales_id UUID;
BEGIN
  -- Get template IDs
  SELECT id INTO personal_template_id FROM sidebar_templates WHERE name = 'Personal';
  SELECT id INTO business_template_id FROM sidebar_templates WHERE name = 'Business';
  
  -- Get sales menu IDs
  SELECT id INTO personal_sales_id FROM sidebar_menu_items 
  WHERE template_id = personal_template_id AND name = 'Sales' AND parent_id IS NULL;
  
  SELECT id INTO business_sales_id FROM sidebar_menu_items 
  WHERE template_id = business_template_id AND name = 'Sales' AND parent_id IS NULL;
  
  -- Add Invoices to Personal workspace
  INSERT INTO sidebar_menu_items (
    template_id,
    parent_id,
    name,
    icon,
    route,
    position,
    is_active
  ) VALUES (
    personal_template_id,
    personal_sales_id,
    'Invoices',
    'file-text',
    '/dashboard/{workspace_id}/invoices',
    10,
    TRUE
  );
  
  -- Add Invoices to Business workspace
  INSERT INTO sidebar_menu_items (
    template_id,
    parent_id,
    name,
    icon,
    route,
    position,
    is_active
  ) VALUES (
    business_template_id,
    business_sales_id,
    'Invoices',
    'file-text',
    '/dashboard/{workspace_id}/invoices',
    10,
    TRUE
  );
END $$;
