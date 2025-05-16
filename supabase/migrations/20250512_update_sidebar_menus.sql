-- First, clear the existing menu items for both templates
DELETE FROM public.sidebar_menu_items 
WHERE template_id IN (
  'a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', -- Personal template
  'b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e'  -- Business template
);

-- BUSINESS WORKSPACE SIDEBAR MENU

-- 一级菜单项
INSERT INTO public.sidebar_menu_items (template_id, parent_id, name, icon, route, position, is_active)
VALUES
  ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', NULL, 'Dashboard', 'LayoutDashboard', '/dashboard', 1, TRUE),
  ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', NULL, 'Transactions', 'Receipt', '/dashboard/transactions', 2, TRUE),
  ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', NULL, 'Banking', 'Wallet', '/dashboard/banking', 3, TRUE),
  ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', NULL, 'Sales', 'TrendingUp', '/dashboard/sales', 4, TRUE),
  ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', NULL, 'Purchases', 'TrendingDown', '/dashboard/purchases', 5, TRUE),
  ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', NULL, 'Assets', 'Package', '/dashboard/assets', 6, TRUE),
  ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', NULL, 'Accounting', 'FileSpreadsheet', '/dashboard/accounting', 7, TRUE),
  ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', NULL, 'Taxes', 'DollarSign', '/dashboard/taxes', 8, TRUE),
  ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', NULL, 'Reports', 'BarChart', '/dashboard/reports', 9, TRUE),
  ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', NULL, 'Settings', 'Settings', '/dashboard/settings', 10, TRUE),
  ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', NULL, 'AI Assistant', 'Bot', '/dashboard/ai-assistant', 11, TRUE);

-- Get the IDs of the top-level menu items for Business workspace
DO $$
DECLARE
  transactions_id UUID;
  banking_id UUID;
  sales_id UUID;
  purchases_id UUID;
  assets_id UUID;
  accounting_id UUID;
  taxes_id UUID;
  reports_id UUID;
  settings_id UUID;
BEGIN
  -- Get the IDs
  SELECT id INTO transactions_id FROM public.sidebar_menu_items 
  WHERE template_id = 'b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e' AND name = 'Transactions';
  
  SELECT id INTO banking_id FROM public.sidebar_menu_items 
  WHERE template_id = 'b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e' AND name = 'Banking';
  
  SELECT id INTO sales_id FROM public.sidebar_menu_items 
  WHERE template_id = 'b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e' AND name = 'Sales';
  
  SELECT id INTO purchases_id FROM public.sidebar_menu_items 
  WHERE template_id = 'b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e' AND name = 'Purchases';
  
  SELECT id INTO assets_id FROM public.sidebar_menu_items 
  WHERE template_id = 'b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e' AND name = 'Assets';
  
  SELECT id INTO accounting_id FROM public.sidebar_menu_items 
  WHERE template_id = 'b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e' AND name = 'Accounting';
  
  SELECT id INTO taxes_id FROM public.sidebar_menu_items 
  WHERE template_id = 'b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e' AND name = 'Taxes';
  
  SELECT id INTO reports_id FROM public.sidebar_menu_items 
  WHERE template_id = 'b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e' AND name = 'Reports';
  
  SELECT id INTO settings_id FROM public.sidebar_menu_items 
  WHERE template_id = 'b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e' AND name = 'Settings';

  -- Transactions submenu
  INSERT INTO public.sidebar_menu_items (template_id, parent_id, name, icon, route, position, is_active)
  VALUES
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', transactions_id, 'All Transactions', 'List', '/dashboard/transactions/all', 1, TRUE),
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', transactions_id, 'Income', 'ArrowUpCircle', '/dashboard/transactions/income', 2, TRUE),
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', transactions_id, 'Expenses', 'ArrowDownCircle', '/dashboard/transactions/expenses', 3, TRUE),
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', transactions_id, 'Transfers', 'ArrowLeftRight', '/dashboard/transactions/transfers', 4, TRUE);

  -- Banking submenu
  INSERT INTO public.sidebar_menu_items (template_id, parent_id, name, icon, route, position, is_active)
  VALUES
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', banking_id, 'Accounts Overview', 'CreditCard', '/dashboard/banking/accounts', 1, TRUE),
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', banking_id, 'Reconciliation', 'CheckSquare', '/dashboard/banking/reconciliation', 2, TRUE),
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', banking_id, 'Import Transactions', 'Upload', '/dashboard/banking/import', 3, TRUE);

  -- Sales submenu
  INSERT INTO public.sidebar_menu_items (template_id, parent_id, name, icon, route, position, is_active)
  VALUES
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', sales_id, 'Invoices', 'FileText', '/dashboard/sales/invoices', 1, TRUE),
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', sales_id, 'Customers', 'Users', '/dashboard/sales/customers', 2, TRUE),
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', sales_id, 'Products & Services', 'Package', '/dashboard/sales/products', 3, TRUE),
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', sales_id, 'Payments Received', 'DollarSign', '/dashboard/sales/payments', 4, TRUE);

  -- Purchases submenu
  INSERT INTO public.sidebar_menu_items (template_id, parent_id, name, icon, route, position, is_active)
  VALUES
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', purchases_id, 'Bills', 'FileText', '/dashboard/purchases/bills', 1, TRUE),
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', purchases_id, 'Vendors', 'Truck', '/dashboard/purchases/vendors', 2, TRUE),
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', purchases_id, 'Payments Made', 'CreditCard', '/dashboard/purchases/payments', 3, TRUE);

  -- Assets submenu
  INSERT INTO public.sidebar_menu_items (template_id, parent_id, name, icon, route, position, is_active)
  VALUES
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', assets_id, 'Asset List', 'List', '/dashboard/assets/list', 1, TRUE),
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', assets_id, 'Asset Categories', 'FolderTree', '/dashboard/assets/categories', 2, TRUE),
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', assets_id, 'Depreciation', 'TrendingDown', '/dashboard/assets/depreciation', 3, TRUE);

  -- Accounting submenu
  INSERT INTO public.sidebar_menu_items (template_id, parent_id, name, icon, route, position, is_active)
  VALUES
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', accounting_id, 'Chart of Accounts', 'FileSpreadsheet', '/dashboard/accounting/chart-of-accounts', 1, TRUE),
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', accounting_id, 'Journal Entries', 'BookOpen', '/dashboard/accounting/journal', 2, TRUE),
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', accounting_id, 'Accounting Periods', 'Calendar', '/dashboard/accounting/periods', 3, TRUE);

  -- Taxes submenu
  INSERT INTO public.sidebar_menu_items (template_id, parent_id, name, icon, route, position, is_active)
  VALUES
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', taxes_id, 'GST/HST Reports', 'FileText', '/dashboard/taxes/gst-hst', 1, TRUE),
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', taxes_id, 'Tax Settings', 'Settings', '/dashboard/taxes/settings', 2, TRUE),
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', taxes_id, 'Tax Calendar', 'Calendar', '/dashboard/taxes/calendar', 3, TRUE);

  -- Reports submenu
  INSERT INTO public.sidebar_menu_items (template_id, parent_id, name, icon, route, position, is_active)
  VALUES
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', reports_id, 'Balance Sheet', 'FileText', '/dashboard/reports/balance-sheet', 1, TRUE),
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', reports_id, 'Profit & Loss', 'TrendingUp', '/dashboard/reports/profit-loss', 2, TRUE),
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', reports_id, 'Cash Flow', 'DollarSign', '/dashboard/reports/cash-flow', 3, TRUE),
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', reports_id, 'Sales Reports', 'ShoppingCart', '/dashboard/reports/sales', 4, TRUE),
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', reports_id, 'Tax Reports', 'FileText', '/dashboard/reports/tax', 5, TRUE),
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', reports_id, 'Custom Reports', 'Edit', '/dashboard/reports/custom', 6, TRUE);

  -- Settings submenu
  INSERT INTO public.sidebar_menu_items (template_id, parent_id, name, icon, route, position, is_active)
  VALUES
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', settings_id, 'Company Information', 'Building', '/dashboard/settings/company', 1, TRUE),
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', settings_id, 'User Management', 'Users', '/dashboard/settings/users', 2, TRUE),
    ('b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e', settings_id, 'Preferences', 'Settings', '/dashboard/settings/preferences', 3, TRUE);
END;
$$;

-- PERSONAL WORKSPACE SIDEBAR MENU

-- 一级菜单项
INSERT INTO public.sidebar_menu_items (template_id, parent_id, name, icon, route, position, is_active)
VALUES
  ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', NULL, 'Dashboard', 'LayoutDashboard', '/dashboard', 1, TRUE),
  ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', NULL, 'Transactions', 'Receipt', '/dashboard/transactions', 2, TRUE),
  ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', NULL, 'Banking', 'Wallet', '/dashboard/banking', 3, TRUE),
  ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', NULL, 'Budgets', 'PieChart', '/dashboard/budgets', 4, TRUE),
  ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', NULL, 'Goals', 'Target', '/dashboard/goals', 5, TRUE),
  ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', NULL, 'Taxes', 'DollarSign', '/dashboard/taxes', 6, TRUE),
  ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', NULL, 'Business Expenses', 'Briefcase', '/dashboard/business-expenses', 7, TRUE),
  ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', NULL, 'Reports', 'BarChart', '/dashboard/reports', 8, TRUE),
  ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', NULL, 'Settings', 'Settings', '/dashboard/settings', 9, TRUE),
  ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', NULL, 'AI Assistant', 'Bot', '/dashboard/ai-assistant', 10, TRUE);

-- Get the IDs of the top-level menu items for Personal workspace
DO $$
DECLARE
  transactions_id UUID;
  banking_id UUID;
  budgets_id UUID;
  goals_id UUID;
  taxes_id UUID;
  business_expenses_id UUID;
  reports_id UUID;
  settings_id UUID;
BEGIN
  -- Get the IDs
  SELECT id INTO transactions_id FROM public.sidebar_menu_items 
  WHERE template_id = 'a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d' AND name = 'Transactions';
  
  SELECT id INTO banking_id FROM public.sidebar_menu_items 
  WHERE template_id = 'a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d' AND name = 'Banking';
  
  SELECT id INTO budgets_id FROM public.sidebar_menu_items 
  WHERE template_id = 'a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d' AND name = 'Budgets';
  
  SELECT id INTO goals_id FROM public.sidebar_menu_items 
  WHERE template_id = 'a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d' AND name = 'Goals';
  
  SELECT id INTO taxes_id FROM public.sidebar_menu_items 
  WHERE template_id = 'a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d' AND name = 'Taxes';
  
  SELECT id INTO business_expenses_id FROM public.sidebar_menu_items 
  WHERE template_id = 'a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d' AND name = 'Business Expenses';
  
  SELECT id INTO reports_id FROM public.sidebar_menu_items 
  WHERE template_id = 'a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d' AND name = 'Reports';
  
  SELECT id INTO settings_id FROM public.sidebar_menu_items 
  WHERE template_id = 'a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d' AND name = 'Settings';

  -- Transactions submenu
  INSERT INTO public.sidebar_menu_items (template_id, parent_id, name, icon, route, position, is_active)
  VALUES
    ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', transactions_id, 'All Transactions', 'List', '/dashboard/transactions/all', 1, TRUE),
    ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', transactions_id, 'Income', 'ArrowUpCircle', '/dashboard/transactions/income', 2, TRUE),
    ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', transactions_id, 'Expenses', 'ArrowDownCircle', '/dashboard/transactions/expenses', 3, TRUE),
    ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', transactions_id, 'Transfers', 'ArrowLeftRight', '/dashboard/transactions/transfers', 4, TRUE);

  -- Banking submenu
  INSERT INTO public.sidebar_menu_items (template_id, parent_id, name, icon, route, position, is_active)
  VALUES
    ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', banking_id, 'Accounts Overview', 'CreditCard', '/dashboard/banking/accounts', 1, TRUE),
    ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', banking_id, 'Reconciliation', 'CheckSquare', '/dashboard/banking/reconciliation', 2, TRUE),
    ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', banking_id, 'Import Transactions', 'Upload', '/dashboard/banking/import', 3, TRUE);

  -- Budgets submenu
  INSERT INTO public.sidebar_menu_items (template_id, parent_id, name, icon, route, position, is_active)
  VALUES
    ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', budgets_id, 'Budget Overview', 'PieChart', '/dashboard/budgets/overview', 1, TRUE),
    ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', budgets_id, 'Create Budget', 'Plus', '/dashboard/budgets/create', 2, TRUE),
    ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', budgets_id, 'Budget Analysis', 'BarChart', '/dashboard/budgets/analysis', 3, TRUE);

  -- Goals submenu
  INSERT INTO public.sidebar_menu_items (template_id, parent_id, name, icon, route, position, is_active)
  VALUES
    ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', goals_id, 'Savings Goals', 'PiggyBank', '/dashboard/goals/savings', 1, TRUE),
    ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', goals_id, 'Debt Payoff', 'CreditCard', '/dashboard/goals/debt', 2, TRUE);

  -- Taxes submenu
  INSERT INTO public.sidebar_menu_items (template_id, parent_id, name, icon, route, position, is_active)
  VALUES
    ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', taxes_id, 'Deductible Expenses', 'FileText', '/dashboard/taxes/deductible', 1, TRUE),
    ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', taxes_id, 'Medical Expenses', 'Heart', '/dashboard/taxes/medical', 2, TRUE),
    ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', taxes_id, 'Charitable Donations', 'Gift', '/dashboard/taxes/donations', 3, TRUE),
    ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', taxes_id, 'RRSP Contributions', 'Landmark', '/dashboard/taxes/rrsp', 4, TRUE);

  -- Business Expenses submenu
  INSERT INTO public.sidebar_menu_items (template_id, parent_id, name, icon, route, position, is_active)
  VALUES
    ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', business_expenses_id, 'Pending Reimbursements', 'Clock', '/dashboard/business-expenses/pending', 1, TRUE),
    ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', business_expenses_id, 'Reimbursement History', 'History', '/dashboard/business-expenses/history', 2, TRUE),
    ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', business_expenses_id, 'Mark as Business Expense', 'Tag', '/dashboard/business-expenses/mark', 3, TRUE);

  -- Reports submenu
  INSERT INTO public.sidebar_menu_items (template_id, parent_id, name, icon, route, position, is_active)
  VALUES
    ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', reports_id, 'Income vs Expenses', 'BarChart', '/dashboard/reports/income-vs-expenses', 1, TRUE),
    ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', reports_id, 'Expense Categories', 'PieChart', '/dashboard/reports/expense-categories', 2, TRUE),
    ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', reports_id, 'Net Worth', 'TrendingUp', '/dashboard/reports/net-worth', 3, TRUE),
    ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', reports_id, 'Tax Summary', 'FileText', '/dashboard/reports/tax-summary', 4, TRUE),
    ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', reports_id, 'Custom Reports', 'Edit', '/dashboard/reports/custom', 5, TRUE);

  -- Settings submenu
  INSERT INTO public.sidebar_menu_items (template_id, parent_id, name, icon, route, position, is_active)
  VALUES
    ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', settings_id, 'Personal Information', 'User', '/dashboard/settings/personal', 1, TRUE),
    ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', settings_id, 'Category Rules', 'List', '/dashboard/settings/categories', 2, TRUE),
    ('a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d', settings_id, 'Preferences', 'Settings', '/dashboard/settings/preferences', 3, TRUE);
END;
$$;
