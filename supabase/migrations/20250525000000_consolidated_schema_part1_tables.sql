-- AutoBooks 综合数据库结构 - 第1部分：表结构
-- 生成日期: 2025-05-25
-- 此文件包含所有表的创建语句

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- 用于模糊搜索

-- 1. 用户表
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email           TEXT UNIQUE NOT NULL,
  password_hash   TEXT, -- 由 Supabase Auth 管理，此处仅为参考
  full_name       TEXT,
  locale          TEXT DEFAULT 'en-CA',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- 2. 工作空间表
CREATE TABLE IF NOT EXISTS workspaces (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name                  TEXT NOT NULL,
  type                  TEXT NOT NULL CHECK (type IN ('personal','business')),
  currency              CHAR(3) DEFAULT 'CAD',
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now(),
  is_deleted            BOOLEAN DEFAULT FALSE, -- 软删除标记
  default_fiscal_year_end VARCHAR(5) DEFAULT '12-31',
  fiscal_year_start_month INTEGER DEFAULT 1,
  owner_id              UUID REFERENCES users(id),
  created_by            UUID REFERENCES users(id)
);

CREATE INDEX idx_workspaces_user ON workspaces(user_id);

-- 3. 科目表
CREATE TABLE IF NOT EXISTS chart_of_accounts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  code            TEXT,                    -- 可选科目编码 1000, 2000...
  name            TEXT NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('asset','liability','equity','income','expense')),
  description     TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  is_deleted      BOOLEAN DEFAULT FALSE, -- 软删除标记
  is_payment      BOOLEAN DEFAULT FALSE  -- 标记是否适合作为银行账户
);

CREATE INDEX idx_coa_workspace ON chart_of_accounts(workspace_id);

-- 4. 账户表
CREATE TABLE IF NOT EXISTS accounts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  chart_id        UUID NOT NULL REFERENCES chart_of_accounts(id),
  name            TEXT NOT NULL,
  description     TEXT,
  currency        CHAR(3) DEFAULT 'CAD',
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  is_deleted      BOOLEAN DEFAULT FALSE, -- 软删除标记
  account_number  TEXT,                  -- 银行账号等
  institution     TEXT,                  -- 银行/金融机构名称
  notes           TEXT,
  last_reconciled_date DATE,
  opening_balance NUMERIC(15,2) DEFAULT 0,
  opening_balance_date DATE
);

CREATE INDEX idx_accounts_workspace ON accounts(workspace_id);

-- 5. 账户组表
CREATE TABLE IF NOT EXISTS account_groups (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  account_type    TEXT NOT NULL, -- 'asset', 'liability', 'equity', 'income', 'expense'
  name            TEXT NOT NULL,
  description     TEXT,
  display_order   INTEGER DEFAULT 0,
  workspace_type  TEXT, -- 'personal', 'business', NULL表示通用
  is_system       BOOLEAN DEFAULT FALSE,
  is_template     BOOLEAN DEFAULT FALSE,
  is_deleted      BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_account_groups_workspace ON account_groups(workspace_id);
CREATE INDEX idx_account_groups_type ON account_groups(account_type);

-- 6. 会计年度表
CREATE TABLE IF NOT EXISTS fiscal_years (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  is_closed       BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  created_by      UUID REFERENCES users(id),
  closed_by       UUID REFERENCES users(id),
  closed_at       TIMESTAMPTZ
);

CREATE INDEX idx_fiscal_years_workspace ON fiscal_years(workspace_id);
CREATE UNIQUE INDEX idx_fiscal_years_workspace_dates ON fiscal_years(workspace_id, start_date, end_date);

-- 7. 账户年度余额表
CREATE TABLE IF NOT EXISTS account_year_balances (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  account_id      UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  fiscal_year_id  UUID NOT NULL REFERENCES fiscal_years(id) ON DELETE CASCADE,
  opening_balance NUMERIC(15,2) DEFAULT 0,
  current_balance NUMERIC(15,2) DEFAULT 0,
  closing_balance NUMERIC(15,2) DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  is_closed       BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_account_year_balances_workspace ON account_year_balances(workspace_id);
CREATE INDEX idx_account_year_balances_account ON account_year_balances(account_id);
CREATE INDEX idx_account_year_balances_fiscal_year ON account_year_balances(fiscal_year_id);
CREATE UNIQUE INDEX account_year_balances_account_id_fiscal_year_id_key ON account_year_balances(account_id, fiscal_year_id);

-- 8. 交易表
CREATE TABLE IF NOT EXISTS transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  txn_date        DATE NOT NULL,
  description     TEXT NOT NULL,
  reference       TEXT,
  notes           TEXT,
  status          TEXT DEFAULT 'posted' CHECK (status IN ('draft','posted','reconciled','void')),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  created_by      UUID REFERENCES users(id),
  updated_by      UUID REFERENCES users(id),
  is_deleted      BOOLEAN DEFAULT FALSE,
  fiscal_year_id  UUID REFERENCES fiscal_years(id)
);

CREATE INDEX idx_txn_workspace ON transactions(workspace_id);
CREATE INDEX idx_txn_workspace_date ON transactions(workspace_id, txn_date);

-- 9. 交易明细表
CREATE TABLE IF NOT EXISTS transaction_lines (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id  UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  account_id      UUID NOT NULL REFERENCES accounts(id),
  description     TEXT,
  amount          NUMERIC(15,2) NOT NULL, -- 正数表示借方，负数表示贷方
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_txn_lines_transaction ON transaction_lines(transaction_id);
CREATE INDEX idx_txn_lines_account ON transaction_lines(account_id);

-- 10. 交易标签表
CREATE TABLE IF NOT EXISTS transaction_tags (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id  UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  tag_id          UUID NOT NULL REFERENCES tags(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_txn_tags_transaction ON transaction_tags(transaction_id);
CREATE INDEX idx_txn_tags_tag ON transaction_tags(tag_id);

-- 11. 标签表
CREATE TABLE IF NOT EXISTS tags (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  color           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tags_workspace ON tags(workspace_id);
CREATE UNIQUE INDEX idx_tags_workspace_name ON tags(workspace_id, name);

-- 12. 税务表
CREATE TABLE IF NOT EXISTS taxes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  rate            NUMERIC(5,2) NOT NULL, -- 百分比，如 5.00 表示 5%
  code            TEXT, -- 如 GST, HST, PST 等
  is_recoverable  BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_taxes_workspace ON taxes(workspace_id);

-- 13. 交易税务表
CREATE TABLE IF NOT EXISTS transaction_taxes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id  UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  tax_id          UUID NOT NULL REFERENCES taxes(id),
  amount          NUMERIC(15,2) NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_txn_taxes_transaction ON transaction_taxes(transaction_id);
CREATE INDEX idx_txn_taxes_tax ON transaction_taxes(tax_id);

-- 14. 审计日志表
CREATE TABLE IF NOT EXISTS audit_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  table_name      TEXT NOT NULL,
  record_id       UUID NOT NULL,
  action          TEXT NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
  old_data        JSONB,
  new_data        JSONB,
  changed_by      UUID,
  changed_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_logs_workspace ON audit_logs(workspace_id);
CREATE INDEX idx_audit_logs_record ON audit_logs(record_id);

-- 15. 资产类别表
CREATE TABLE IF NOT EXISTS asset_categories (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  description     TEXT,
  parent_id       UUID REFERENCES asset_categories(id),
  workspace_type  TEXT, -- 'personal', 'business', NULL表示通用
  system_defined  BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_asset_categories_parent ON asset_categories(parent_id);

-- 16. 资产表
CREATE TABLE IF NOT EXISTS assets (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id        UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  description         TEXT,
  category_id         UUID REFERENCES asset_categories(id),
  account_id          UUID REFERENCES accounts(id),
  purchase_date       DATE,
  purchase_price      NUMERIC(15,2),
  current_value       NUMERIC(15,2),
  depreciation_method TEXT CHECK (depreciation_method IN ('straight_line','declining_balance','none')),
  useful_life_years   INTEGER,
  salvage_value       NUMERIC(15,2),
  depreciation_rate   NUMERIC(5,2),
  last_valuation_date DATE,
  notes               TEXT,
  status              TEXT DEFAULT 'active' CHECK (status IN ('active','inactive','sold','disposed')),
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now(),
  created_by          UUID REFERENCES users(id),
  updated_by          UUID REFERENCES users(id)
);

CREATE INDEX idx_assets_workspace ON assets(workspace_id);
CREATE INDEX idx_assets_category ON assets(category_id);
CREATE INDEX idx_assets_account ON assets(account_id);

-- 17. 资产交易表
CREATE TABLE IF NOT EXISTS asset_transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id        UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  transaction_id  UUID REFERENCES transactions(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase','sale','depreciation','revaluation','disposal')),
  amount          NUMERIC(15,2) NOT NULL,
  transaction_date DATE NOT NULL,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_asset_transactions_asset ON asset_transactions(asset_id);
CREATE INDEX idx_asset_transactions_transaction ON asset_transactions(transaction_id);

-- 18. 预算表
CREATE TABLE IF NOT EXISTS budgets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  description     TEXT,
  status          TEXT DEFAULT 'active' CHECK (status IN ('active','inactive','archived')),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  created_by      UUID REFERENCES users(id)
);

CREATE INDEX idx_budgets_workspace ON budgets(workspace_id);

-- 19. 预算项目表
CREATE TABLE IF NOT EXISTS budget_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  budget_id       UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  account_id      UUID NOT NULL REFERENCES accounts(id),
  amount          NUMERIC(15,2) NOT NULL,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_budget_items_budget ON budget_items(budget_id);
CREATE INDEX idx_budget_items_account ON budget_items(account_id);

-- 20. 跨工作空间余额表
CREATE TABLE IF NOT EXISTS inter_workspace_balances (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  target_workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  source_transaction_id UUID REFERENCES transactions(id),
  target_transaction_id UUID REFERENCES transactions(id),
  amount              NUMERIC(15,2) NOT NULL,
  status              TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','completed')),
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now(),
  created_by          UUID REFERENCES users(id)
);

CREATE INDEX idx_inter_workspace_balances_source ON inter_workspace_balances(source_workspace_id);
CREATE INDEX idx_inter_workspace_balances_target ON inter_workspace_balances(target_workspace_id);

-- 21. 角色表
CREATE TABLE IF NOT EXISTS roles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  description     TEXT,
  is_system       BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- 22. 权限表
CREATE TABLE IF NOT EXISTS permissions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  description     TEXT,
  resource        TEXT NOT NULL,
  action          TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- 23. 角色权限表
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id         UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id   UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (role_id, permission_id)
);

-- 24. 工作空间成员表
CREATE TABLE IF NOT EXISTS workspace_members (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id         UUID REFERENCES roles(id),
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','active','inactive')),
  invited_by      UUID REFERENCES users(id),
  invited_at      TIMESTAMPTZ DEFAULT now(),
  accepted_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_workspace_members_workspace ON workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user ON workspace_members(user_id);
CREATE UNIQUE INDEX workspace_members_workspace_id_user_id_key ON workspace_members(workspace_id, user_id);

-- 25. 工作空间自定义权限表
CREATE TABLE IF NOT EXISTS workspace_custom_permissions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  member_id       UUID NOT NULL REFERENCES workspace_members(id) ON DELETE CASCADE,
  permission_id   UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  granted_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_workspace_custom_permissions_workspace ON workspace_custom_permissions(workspace_id);
CREATE INDEX idx_workspace_custom_permissions_member ON workspace_custom_permissions(member_id);

-- 26. 审批工作流表
CREATE TABLE IF NOT EXISTS approval_workflows (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  resource_type   TEXT NOT NULL, -- 'transaction', 'invoice', etc.
  condition_json  JSONB,
  approver_role_id UUID REFERENCES roles(id),
  approver_user_id UUID REFERENCES users(id),
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_approval_workflows_workspace ON approval_workflows(workspace_id);

-- 27. 审批表
CREATE TABLE IF NOT EXISTS approvals (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  workflow_id     UUID NOT NULL REFERENCES approval_workflows(id) ON DELETE CASCADE,
  resource_type   TEXT NOT NULL,
  resource_id     UUID NOT NULL,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  requested_by    UUID REFERENCES users(id),
  approved_by     UUID REFERENCES users(id),
  requested_at    TIMESTAMPTZ DEFAULT now(),
  approved_at     TIMESTAMPTZ,
  notes           TEXT
);

CREATE INDEX idx_approvals_workspace ON approvals(workspace_id);
CREATE INDEX idx_approvals_workflow ON approvals(workflow_id);
CREATE INDEX idx_approvals_resource ON approvals(resource_type, resource_id);

-- 28. 侧边栏模板表
CREATE TABLE IF NOT EXISTS sidebar_templates (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  description     TEXT,
  workspace_type  TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- 29. 侧边栏菜单项表
CREATE TABLE IF NOT EXISTS sidebar_menu_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id     UUID NOT NULL REFERENCES sidebar_templates(id) ON DELETE CASCADE,
  parent_id       UUID REFERENCES sidebar_menu_items(id),
  name            TEXT NOT NULL,
  icon            TEXT,
  route           TEXT,
  display_order   INTEGER DEFAULT 0,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sidebar_menu_items_template ON sidebar_menu_items(template_id);
CREATE INDEX idx_sidebar_menu_items_parent ON sidebar_menu_items(parent_id);

-- 30. 工作空间菜单配置表
CREATE TABLE IF NOT EXISTS workspace_menu_configs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  template_id     UUID NOT NULL REFERENCES sidebar_templates(id),
  custom_config   JSONB,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX workspace_menu_configs_workspace_id_idx ON workspace_menu_configs(workspace_id);
CREATE UNIQUE INDEX workspace_menu_configs_workspace_id_key ON workspace_menu_configs(workspace_id);

-- 31. 客户表
CREATE TABLE IF NOT EXISTS customers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  email           TEXT,
  phone           TEXT,
  address         TEXT,
  city            TEXT,
  province        TEXT,
  postal_code     TEXT,
  country         TEXT DEFAULT 'Canada',
  notes           TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  created_by      UUID REFERENCES users(id),
  updated_by      UUID REFERENCES users(id)
);

CREATE INDEX idx_customers_workspace ON customers(workspace_id);

-- 32. 产品和服务表
CREATE TABLE IF NOT EXISTS products_services (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  type            TEXT NOT NULL CHECK (type IN ('product','service')),
  price           NUMERIC(15,2) NOT NULL,
  cost            NUMERIC(15,2),
  tax_id          UUID REFERENCES taxes(id),
  income_account_id UUID REFERENCES accounts(id),
  expense_account_id UUID REFERENCES accounts(id),
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  created_by      UUID REFERENCES users(id),
  updated_by      UUID REFERENCES users(id)
);

CREATE INDEX idx_products_services_workspace ON products_services(workspace_id);

-- 33. 发票模板表
CREATE TABLE IF NOT EXISTS invoice_templates (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  content         TEXT,
  header          TEXT,
  footer          TEXT,
  style_json      JSONB,
  is_default      BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  created_by      UUID REFERENCES users(id),
  updated_by      UUID REFERENCES users(id)
);

CREATE INDEX idx_invoice_templates_workspace ON invoice_templates(workspace_id);

-- 34. 发票表
CREATE TABLE IF NOT EXISTS invoices (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  customer_id     UUID REFERENCES customers(id),
  invoice_number  TEXT NOT NULL,
  issue_date      DATE NOT NULL,
  due_date        DATE NOT NULL,
  status          TEXT DEFAULT 'draft' CHECK (status IN ('draft','sent','viewed','partial','paid','overdue','cancelled')),
  notes           TEXT,
  terms           TEXT,
  subtotal        NUMERIC(15,2) NOT NULL DEFAULT 0,
  tax_amount      NUMERIC(15,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_amount    NUMERIC(15,2) NOT NULL DEFAULT 0,
  paid_amount     NUMERIC(15,2) NOT NULL DEFAULT 0,
  template_id     UUID REFERENCES invoice_templates(id),
  sent_at         TIMESTAMPTZ,
  viewed_at       TIMESTAMPTZ,
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  created_by      UUID REFERENCES users(id),
  updated_by      UUID REFERENCES users(id)
);

CREATE INDEX idx_invoices_workspace ON invoices(workspace_id);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE UNIQUE INDEX idx_invoices_workspace_number ON invoices(workspace_id, invoice_number);

-- 35. 发票明细表
CREATE TABLE IF NOT EXISTS invoice_lines (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id      UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  product_id      UUID REFERENCES products_services(id),
  description     TEXT NOT NULL,
  quantity        NUMERIC(15,2) NOT NULL DEFAULT 1,
  unit_price      NUMERIC(15,2) NOT NULL,
  tax_id          UUID REFERENCES taxes(id),
  tax_amount      NUMERIC(15,2) DEFAULT 0,
  discount_amount NUMERIC(15,2) DEFAULT 0,
  line_total      NUMERIC(15,2) NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_invoice_lines_invoice ON invoice_lines(invoice_id);

-- 36. 发票支付表
CREATE TABLE IF NOT EXISTS invoice_payments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id      UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  transaction_id  UUID REFERENCES transactions(id),
  payment_date    DATE NOT NULL,
  amount          NUMERIC(15,2) NOT NULL,
  payment_method  TEXT NOT NULL,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  created_by      UUID REFERENCES users(id)
);

CREATE INDEX idx_invoice_payments_invoice ON invoice_payments(invoice_id);

-- 37. 发票活动表
CREATE TABLE IF NOT EXISTS invoice_activities (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id      UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  activity_type   TEXT NOT NULL,
  description     TEXT,
  performed_by    UUID REFERENCES users(id),
  performed_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_invoice_activities_invoice ON invoice_activities(invoice_id);

-- 38. 定期发票表
CREATE TABLE IF NOT EXISTS recurring_invoices (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  customer_id     UUID REFERENCES customers(id),
  template_id     UUID REFERENCES invoice_templates(id),
  frequency       TEXT NOT NULL CHECK (frequency IN ('weekly','monthly','quarterly','yearly')),
  start_date      DATE NOT NULL,
  end_date        DATE,
  next_issue_date DATE NOT NULL,
  auto_send       BOOLEAN DEFAULT FALSE,
  notes           TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  created_by      UUID REFERENCES users(id),
  updated_by      UUID REFERENCES users(id)
);

CREATE INDEX idx_recurring_invoices_workspace ON recurring_invoices(workspace_id);
CREATE INDEX idx_recurring_invoices_customer ON recurring_invoices(customer_id);

-- 39. 问题表
CREATE TABLE IF NOT EXISTS questions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES users(id),
  question        TEXT NOT NULL,
  answer          TEXT,
  context         JSONB,
  created_at      TIMESTAMPTZ DEFAULT now(),
  answered_at     TIMESTAMPTZ
);

CREATE INDEX idx_questions_workspace ON questions(workspace_id);
CREATE INDEX idx_questions_user ON questions(user_id);
