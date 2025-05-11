-- 插入Personal工作空间模板
INSERT INTO public.sidebar_templates (id, name, description, workspace_type)
VALUES 
  ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', 'Personal Workspace Template', 'Default sidebar template for personal workspaces', 'personal');

-- 插入Business工作空间模板
INSERT INTO public.sidebar_templates (id, name, description, workspace_type)
VALUES 
  ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', 'Business Workspace Template', 'Default sidebar template for business workspaces', 'business');

-- 插入Personal工作空间的菜单项
-- 一级菜单项
INSERT INTO public.sidebar_menu_items (template_id, parent_id, name, icon, route, position, is_active)
VALUES
  ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', NULL, 'Dashboard', 'dashboard', '/dashboard', 1, TRUE),
  ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', NULL, 'Transactions', 'receipt', '/dashboard/transactions', 2, TRUE),
  ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', NULL, 'Accounts', 'account_balance', '/dashboard/accounts', 3, TRUE),
  ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', NULL, 'Income', 'trending_up', '/dashboard/income', 4, TRUE),
  ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', NULL, 'Expense', 'trending_down', '/dashboard/expense', 5, TRUE),
  ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', NULL, 'Categories / Rules', 'rule', '/dashboard/categories', 6, TRUE),
  ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', NULL, 'Reports', 'bar_chart', '/dashboard/reports', 7, TRUE),
  ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', NULL, 'Settings', 'settings', '/dashboard/settings', 8, TRUE);

-- 获取Accounts菜单项的ID
DO $$
DECLARE
  accounts_id UUID;
  income_id UUID;
  expense_id UUID;
  categories_id UUID;
  reports_id UUID;
BEGIN
  SELECT id INTO accounts_id FROM public.sidebar_menu_items 
  WHERE template_id = 'a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d' AND name = 'Accounts';
  
  SELECT id INTO income_id FROM public.sidebar_menu_items 
  WHERE template_id = 'a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d' AND name = 'Income';
  
  SELECT id INTO expense_id FROM public.sidebar_menu_items 
  WHERE template_id = 'a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d' AND name = 'Expense';
  
  SELECT id INTO categories_id FROM public.sidebar_menu_items 
  WHERE template_id = 'a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d' AND name = 'Categories / Rules';
  
  SELECT id INTO reports_id FROM public.sidebar_menu_items 
  WHERE template_id = 'a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d' AND name = 'Reports';

  -- Accounts子菜单
  INSERT INTO public.sidebar_menu_items (template_id, parent_id, name, icon, route, position, is_active)
  VALUES
    ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', accounts_id, 'Assets', 'account_balance_wallet', '/dashboard/accounts/assets', 1, TRUE),
    ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', accounts_id, 'Liabilities', 'credit_card', '/dashboard/accounts/liabilities', 2, TRUE);

  -- 获取Assets和Liabilities的ID
  DECLARE
    assets_id UUID;
    liabilities_id UUID;
  BEGIN
    SELECT id INTO assets_id FROM public.sidebar_menu_items 
    WHERE template_id = 'a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d' AND name = 'Assets';
    
    SELECT id INTO liabilities_id FROM public.sidebar_menu_items 
    WHERE template_id = 'a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d' AND name = 'Liabilities';

    -- Assets子菜单
    INSERT INTO public.sidebar_menu_items (template_id, parent_id, name, icon, route, position, is_active)
    VALUES
      ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', assets_id, 'Add Asset', 'add', '/dashboard/accounts/assets/add', 1, TRUE),
      ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', assets_id, 'Asset List', 'list', '/dashboard/accounts/assets/list', 2, TRUE);

    -- Liabilities子菜单
    INSERT INTO public.sidebar_menu_items (template_id, parent_id, name, icon, route, position, is_active)
    VALUES
      ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', liabilities_id, 'Add Liability', 'add', '/dashboard/accounts/liabilities/add', 1, TRUE),
      ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', liabilities_id, 'Liability List', 'list', '/dashboard/accounts/liabilities/list', 2, TRUE);
  END;

  -- Income子菜单
  INSERT INTO public.sidebar_menu_items (template_id, parent_id, name, icon, route, position, is_active)
  VALUES
    ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', income_id, 'Add Income', 'add', '/dashboard/income/add', 1, TRUE),
    ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', income_id, 'Income List', 'list', '/dashboard/income/list', 2, TRUE);

  -- Expense子菜单
  INSERT INTO public.sidebar_menu_items (template_id, parent_id, name, icon, route, position, is_active)
  VALUES
    ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', expense_id, 'Add Expense', 'add', '/dashboard/expense/add', 1, TRUE),
    ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', expense_id, 'Expense List', 'list', '/dashboard/expense/list', 2, TRUE);

  -- Categories子菜单
  INSERT INTO public.sidebar_menu_items (template_id, parent_id, name, icon, route, position, is_active)
  VALUES
    ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', categories_id, 'Add Rule', 'add', '/dashboard/categories/add', 1, TRUE),
    ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', categories_id, 'Rule List', 'list', '/dashboard/categories/list', 2, TRUE);

  -- Reports子菜单
  INSERT INTO public.sidebar_menu_items (template_id, parent_id, name, icon, route, position, is_active)
  VALUES
    ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', reports_id, 'Net Worth', 'account_balance', '/dashboard/reports/net-worth', 1, TRUE),
    ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', reports_id, 'Spending Trends', 'trending_down', '/dashboard/reports/spending-trends', 2, TRUE),
    ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', reports_id, 'Income vs Expense', 'compare_arrows', '/dashboard/reports/income-vs-expense', 3, TRUE);
END;
$$;
