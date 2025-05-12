-- 将会计科目表管理添加到侧边栏菜单
-- Created: 2025-05-12

DO $$
DECLARE
  personal_accounts_id UUID;
  business_accounts_id UUID;
BEGIN
  -- 获取个人账户模板的"账户"菜单项ID
  SELECT id INTO personal_accounts_id FROM sidebar_menu_items 
  WHERE template_id = (SELECT id FROM sidebar_menu_templates WHERE name = 'personal')
  AND name = '账户'
  AND parent_id IS NULL;
  
  -- 获取商业账户模板的"账户"菜单项ID
  SELECT id INTO business_accounts_id FROM sidebar_menu_items 
  WHERE template_id = (SELECT id FROM sidebar_menu_templates WHERE name = 'business')
  AND name = '账户'
  AND parent_id IS NULL;
  
  -- 为个人账户模板添加会计科目表菜单项
  INSERT INTO sidebar_menu_items (
    template_id,
    parent_id,
    name,
    icon,
    route,
    position,
    is_active
  ) VALUES (
    (SELECT id FROM sidebar_menu_templates WHERE name = 'personal'),
    personal_accounts_id,
    '会计科目表',
    'ChartBarSquareIcon',
    '/chart-of-accounts',
    4,
    true
  );
  
  -- 为商业账户模板添加会计科目表菜单项
  INSERT INTO sidebar_menu_items (
    template_id,
    parent_id,
    name,
    icon,
    route,
    position,
    is_active
  ) VALUES (
    (SELECT id FROM sidebar_menu_templates WHERE name = 'business'),
    business_accounts_id,
    '会计科目表',
    'ChartBarSquareIcon',
    '/chart-of-accounts',
    4,
    true
  );
  
END $$;
