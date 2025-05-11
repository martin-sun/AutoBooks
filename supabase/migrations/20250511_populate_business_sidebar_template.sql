-- 插入Business工作空间的菜单项
-- 一级菜单项
INSERT INTO public.sidebar_menu_items (template_id, parent_id, name, icon, route, position, is_active)
VALUES
  ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', NULL, 'Dashboard', 'dashboard', '/dashboard', 1, TRUE),
  ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', NULL, 'Transactions', 'receipt', '/dashboard/transactions', 2, TRUE),
  ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', NULL, 'Invoices', 'description', '/dashboard/invoices', 3, TRUE),
  ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', NULL, 'Bills', 'request_quote', '/dashboard/bills', 4, TRUE),
  ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', NULL, 'Products & Services', 'inventory', '/dashboard/products', 5, TRUE),
  ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', NULL, 'Accounts', 'account_balance', '/dashboard/accounts', 6, TRUE),
  ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', NULL, 'Revenue', 'trending_up', '/dashboard/revenue', 7, TRUE),
  ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', NULL, 'Expense', 'trending_down', '/dashboard/expense', 8, TRUE),
  ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', NULL, 'Reports', 'bar_chart', '/dashboard/reports', 9, TRUE),
  ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', NULL, 'Settings', 'settings', '/dashboard/settings', 10, TRUE);

-- 获取各个一级菜单项的ID
DO $$
DECLARE
  invoices_id UUID;
  bills_id UUID;
  products_id UUID;
  accounts_id UUID;
  revenue_id UUID;
  expense_id UUID;
  reports_id UUID;
BEGIN
  SELECT id INTO invoices_id FROM public.sidebar_menu_items 
  WHERE template_id = 'b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e' AND name = 'Invoices';
  
  SELECT id INTO bills_id FROM public.sidebar_menu_items 
  WHERE template_id = 'b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e' AND name = 'Bills';
  
  SELECT id INTO products_id FROM public.sidebar_menu_items 
  WHERE template_id = 'b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e' AND name = 'Products & Services';
  
  SELECT id INTO accounts_id FROM public.sidebar_menu_items 
  WHERE template_id = 'b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e' AND name = 'Accounts';
  
  SELECT id INTO revenue_id FROM public.sidebar_menu_items 
  WHERE template_id = 'b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e' AND name = 'Revenue';
  
  SELECT id INTO expense_id FROM public.sidebar_menu_items 
  WHERE template_id = 'b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e' AND name = 'Expense';
  
  SELECT id INTO reports_id FROM public.sidebar_menu_items 
  WHERE template_id = 'b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e' AND name = 'Reports';

  -- Invoices子菜单
  INSERT INTO public.sidebar_menu_items (template_id, parent_id, name, icon, route, position, is_active)
  VALUES
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', invoices_id, 'New Invoice', 'add', '/dashboard/invoices/new', 1, TRUE),
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', invoices_id, 'Invoice List', 'list', '/dashboard/invoices/list', 2, TRUE);

  -- Bills子菜单
  INSERT INTO public.sidebar_menu_items (template_id, parent_id, name, icon, route, position, is_active)
  VALUES
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', bills_id, 'New Bill', 'add', '/dashboard/bills/new', 1, TRUE),
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', bills_id, 'Bill List', 'list', '/dashboard/bills/list', 2, TRUE);

  -- Products & Services子菜单
  INSERT INTO public.sidebar_menu_items (template_id, parent_id, name, icon, route, position, is_active)
  VALUES
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', products_id, 'New Item', 'add', '/dashboard/products/new', 1, TRUE),
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', products_id, 'Item List', 'list', '/dashboard/products/list', 2, TRUE);

  -- Accounts子菜单
  INSERT INTO public.sidebar_menu_items (template_id, parent_id, name, icon, route, position, is_active)
  VALUES
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', accounts_id, 'Assets', 'account_balance_wallet', '/dashboard/accounts/assets', 1, TRUE),
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', accounts_id, 'Liabilities', 'credit_card', '/dashboard/accounts/liabilities', 2, TRUE),
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', accounts_id, 'Equity', 'pie_chart', '/dashboard/accounts/equity', 3, TRUE);

  -- 获取Assets和Liabilities的ID
  DECLARE
    assets_id UUID;
    liabilities_id UUID;
  BEGIN
    SELECT id INTO assets_id FROM public.sidebar_menu_items 
    WHERE template_id = 'b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e' AND name = 'Assets';
    
    SELECT id INTO liabilities_id FROM public.sidebar_menu_items 
    WHERE template_id = 'b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e' AND name = 'Liabilities';

    -- Assets子菜单
    INSERT INTO public.sidebar_menu_items (template_id, parent_id, name, icon, route, position, is_active)
    VALUES
      ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', assets_id, 'Add Asset', 'add', '/dashboard/accounts/assets/add', 1, TRUE),
      ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', assets_id, 'Asset List', 'list', '/dashboard/accounts/assets/list', 2, TRUE);

    -- Liabilities子菜单
    INSERT INTO public.sidebar_menu_items (template_id, parent_id, name, icon, route, position, is_active)
    VALUES
      ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', liabilities_id, 'Add Liability', 'add', '/dashboard/accounts/liabilities/add', 1, TRUE),
      ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', liabilities_id, 'Liability List', 'list', '/dashboard/accounts/liabilities/list', 2, TRUE);
  END;

  -- Revenue子菜单
  INSERT INTO public.sidebar_menu_items (template_id, parent_id, name, icon, route, position, is_active)
  VALUES
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', revenue_id, 'Add Revenue', 'add', '/dashboard/revenue/add', 1, TRUE),
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', revenue_id, 'Revenue List', 'list', '/dashboard/revenue/list', 2, TRUE);

  -- Expense子菜单
  INSERT INTO public.sidebar_menu_items (template_id, parent_id, name, icon, route, position, is_active)
  VALUES
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', expense_id, 'Add Expense', 'add', '/dashboard/expense/add', 1, TRUE),
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', expense_id, 'Expense List', 'list', '/dashboard/expense/list', 2, TRUE);

  -- Reports子菜单
  INSERT INTO public.sidebar_menu_items (template_id, parent_id, name, icon, route, position, is_active)
  VALUES
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', reports_id, 'Profit & Loss', 'assessment', '/dashboard/reports/profit-loss', 1, TRUE),
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', reports_id, 'Balance Sheet', 'account_balance', '/dashboard/reports/balance-sheet', 2, TRUE),
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', reports_id, 'Cash Flow', 'money', '/dashboard/reports/cash-flow', 3, TRUE);
END;
$$;
