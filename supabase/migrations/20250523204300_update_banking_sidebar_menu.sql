-- 更新 Banking 侧边栏菜单，添加银行连接功能
-- Created: 2025-05-23

DO $$
DECLARE
  personal_template_id UUID;
  business_template_id UUID;
  personal_banking_id UUID;
  business_banking_id UUID;
BEGIN
  -- 获取个人工作空间模板 ID
  SELECT id INTO personal_template_id
  FROM sidebar_templates
  WHERE type = 'personal';
  
  -- 获取商业工作空间模板 ID
  SELECT id INTO business_template_id
  FROM sidebar_templates
  WHERE type = 'business';
  
  -- 获取个人工作空间 Banking 菜单 ID
  SELECT id INTO personal_banking_id
  FROM sidebar_menu_items
  WHERE template_id = personal_template_id
    AND name = 'Banking'
    AND parent_id IS NULL;
  
  -- 获取商业工作空间 Banking 菜单 ID
  SELECT id INTO business_banking_id
  FROM sidebar_menu_items
  WHERE template_id = business_template_id
    AND name = 'Banking'
    AND parent_id IS NULL;
  
  -- 更新个人工作空间 Banking 子菜单顺序
  UPDATE sidebar_menu_items
  SET sort_order = sort_order + 1
  WHERE template_id = personal_template_id
    AND parent_id = personal_banking_id
    AND sort_order >= 3;
  
  -- 更新商业工作空间 Banking 子菜单顺序
  UPDATE sidebar_menu_items
  SET sort_order = sort_order + 1
  WHERE template_id = business_template_id
    AND parent_id = business_banking_id
    AND sort_order >= 3;
  
  -- 添加个人工作空间 Banking 连接菜单项
  INSERT INTO sidebar_menu_items (
    template_id,
    parent_id,
    name,
    icon,
    path,
    sort_order,
    is_active
  )
  VALUES (
    personal_template_id,
    personal_banking_id,
    'Connect Bank',
    'Link',
    '/dashboard/banking/connect',
    3,
    TRUE
  );
  
  -- 添加商业工作空间 Banking 连接菜单项
  INSERT INTO sidebar_menu_items (
    template_id,
    parent_id,
    name,
    icon,
    path,
    sort_order,
    is_active
  )
  VALUES (
    business_template_id,
    business_banking_id,
    'Connect Bank',
    'Link',
    '/dashboard/banking/connect',
    3,
    TRUE
  );
END $$;
