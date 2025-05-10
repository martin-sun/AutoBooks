-- FlowLedger: 多租户 Bookkeeping 系统 (Wave-like)
-- 初始数据库模式 v0.9
-- 创建时间: 2025-05-09

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- 用于模糊搜索

-- 1. 用户表
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email           TEXT UNIQUE NOT NULL,
  password_hash   TEXT, -- 由 Supabase Auth 管理，此处仅为参考
  full_name       TEXT,
  locale          TEXT DEFAULT 'en-CA',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- 2. 工作空间表
CREATE TABLE workspaces (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('personal','business')),
  currency        CHAR(3) DEFAULT 'CAD',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  is_deleted      BOOLEAN DEFAULT FALSE -- 软删除标记
);

CREATE INDEX idx_workspaces_user ON workspaces(user_id);

-- 3. 科目表
CREATE TABLE chart_of_accounts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  code            TEXT,                    -- 可选科目编码 1000, 2000...
  name            TEXT NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('asset','liability','equity','income','expense')),
  description     TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  is_deleted      BOOLEAN DEFAULT FALSE -- 软删除标记
);

CREATE INDEX idx_coa_workspace ON chart_of_accounts(workspace_id);

-- 4. 账户表
CREATE TABLE accounts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  chart_id        UUID NOT NULL REFERENCES chart_of_accounts(id),
  name            TEXT NOT NULL,
  description     TEXT,
  opening_balance NUMERIC(18,2) DEFAULT 0,
  currency        CHAR(3) DEFAULT 'CAD',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  is_deleted      BOOLEAN DEFAULT FALSE -- 软删除标记
);

CREATE INDEX idx_accounts_workspace ON accounts(workspace_id);

-- 5. 交易表
CREATE TABLE transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  txn_date        DATE NOT NULL,
  reference       TEXT,                 -- 发票号/收据号
  memo            TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  is_deleted      BOOLEAN DEFAULT FALSE -- 软删除标记
);

CREATE INDEX idx_txn_workspace_date ON transactions(workspace_id, txn_date);

-- 6. 交易行表 (双分录)
CREATE TABLE transaction_lines (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id  UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  account_id      UUID NOT NULL REFERENCES accounts(id),
  amount          NUMERIC(18,2) NOT NULL,   -- 正数为+，负数为-
  description     TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_txl_txnid ON transaction_lines(transaction_id);

-- 7. 工作空间间余额表 (个人垫付业务)
CREATE TABLE inter_workspace_balances (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_workspace_id   UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  to_workspace_id     UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  balance             NUMERIC(18,2) DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_inter_workspace_from ON inter_workspace_balances(from_workspace_id);
CREATE INDEX idx_inter_workspace_to ON inter_workspace_balances(to_workspace_id);

-- 8. 标签表
CREATE TABLE tags (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id      UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  is_tax_deductible BOOLEAN DEFAULT FALSE,
  system_defined    BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  is_deleted        BOOLEAN DEFAULT FALSE, -- 软删除标记
  UNIQUE(workspace_id, name)
);

CREATE INDEX idx_tags_workspace ON tags(workspace_id);

-- 9. 交易标签关联表
CREATE TABLE transaction_tags (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id  UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  tag_id          UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tag_txn ON transaction_tags(transaction_id);
CREATE INDEX idx_tag_tag ON transaction_tags(tag_id);

-- 10. 税种表
CREATE TABLE taxes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,           -- GST, PST, HST...
  rate            NUMERIC(6,4) NOT NULL,   -- 0.0500 表示 5%
  is_stackable    BOOLEAN DEFAULT FALSE,
  is_recoverable  BOOLEAN DEFAULT FALSE,   -- GST 可抵扣
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  is_deleted      BOOLEAN DEFAULT FALSE, -- 软删除标记
  UNIQUE(workspace_id, name)
);

CREATE INDEX idx_taxes_workspace ON taxes(workspace_id);

-- 11. 交易税种关联表
CREATE TABLE transaction_taxes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id  UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  tax_id          UUID NOT NULL REFERENCES taxes(id),
  tax_amount      NUMERIC(18,2) NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_txn_tax_txnid ON transaction_taxes(transaction_id);
CREATE INDEX idx_txn_tax_taxid ON transaction_taxes(tax_id);

-- 12. 审计日志表
CREATE TABLE audit_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  table_name      TEXT NOT NULL,
  record_id       UUID NOT NULL,
  action          TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data        JSONB,
  new_data        JSONB,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_workspace ON audit_logs(workspace_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);

-- 13. 预算表
CREATE TABLE budgets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  is_deleted      BOOLEAN DEFAULT FALSE -- 软删除标记
);

CREATE INDEX idx_budgets_workspace ON budgets(workspace_id);

-- 14. 预算项目表
CREATE TABLE budget_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  budget_id       UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  account_id      UUID NOT NULL REFERENCES accounts(id),
  amount          NUMERIC(18,2) NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_budget_items_budget ON budget_items(budget_id);

-- 添加行级安全策略 (RLS) 以实现多租户隔离
-- 启用 RLS
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE inter_workspace_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE taxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_taxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;

-- 创建一个用于获取当前用户ID的函数
CREATE OR REPLACE FUNCTION auth.get_current_user_id()
RETURNS UUID
LANGUAGE sql STABLE
AS $$
  SELECT auth.uid();
$$;

-- 为每个表创建策略
-- Workspaces 策略
CREATE POLICY workspace_user_policy ON workspaces
  FOR ALL
  USING (user_id = auth.get_current_user_id());

-- 其他表的策略 (基于workspace_id)
CREATE POLICY chart_of_accounts_policy ON chart_of_accounts
  FOR ALL
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id()));

CREATE POLICY accounts_policy ON accounts
  FOR ALL
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id()));

CREATE POLICY transactions_policy ON transactions
  FOR ALL
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id()));

CREATE POLICY transaction_lines_policy ON transaction_lines
  FOR ALL
  USING (transaction_id IN (SELECT id FROM transactions WHERE workspace_id IN 
         (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id())));

CREATE POLICY inter_workspace_balances_policy ON inter_workspace_balances
  FOR ALL
  USING (from_workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id()) OR
         to_workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id()));

CREATE POLICY tags_policy ON tags
  FOR ALL
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id()));

CREATE POLICY transaction_tags_policy ON transaction_tags
  FOR ALL
  USING (transaction_id IN (SELECT id FROM transactions WHERE workspace_id IN 
         (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id())));

CREATE POLICY taxes_policy ON taxes
  FOR ALL
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id()));

CREATE POLICY transaction_taxes_policy ON transaction_taxes
  FOR ALL
  USING (transaction_id IN (SELECT id FROM transactions WHERE workspace_id IN 
         (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id())));

CREATE POLICY audit_logs_policy ON audit_logs
  FOR ALL
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id()));

CREATE POLICY budgets_policy ON budgets
  FOR ALL
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id()));

CREATE POLICY budget_items_policy ON budget_items
  FOR ALL
  USING (budget_id IN (SELECT id FROM budgets WHERE workspace_id IN 
         (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id())));

-- 创建触发器函数来自动更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为每个表添加更新触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_chart_of_accounts_updated_at BEFORE UPDATE ON chart_of_accounts
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_transaction_lines_updated_at BEFORE UPDATE ON transaction_lines
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_inter_workspace_balances_updated_at BEFORE UPDATE ON inter_workspace_balances
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON tags
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_taxes_updated_at BEFORE UPDATE ON taxes
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_transaction_taxes_updated_at BEFORE UPDATE ON transaction_taxes
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_budget_items_updated_at BEFORE UPDATE ON budget_items
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 创建触发器函数来验证交易平衡 (SUM(amount) = 0)
CREATE OR REPLACE FUNCTION check_transaction_balance()
RETURNS TRIGGER AS $$
DECLARE
  total NUMERIC(18,2);
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO total
  FROM transaction_lines
  WHERE transaction_id = NEW.transaction_id;
  
  IF ABS(total) > 0.01 THEN
    RAISE EXCEPTION 'Transaction must be balanced: sum of amounts must be zero, got %', total;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 添加交易平衡检查触发器
CREATE TRIGGER check_transaction_balance_trigger
AFTER INSERT OR UPDATE ON transaction_lines
FOR EACH ROW EXECUTE PROCEDURE check_transaction_balance();

-- 创建审计日志触发器函数
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  workspace_id_val UUID;
BEGIN
  -- 尝试获取 workspace_id
  IF TG_TABLE_NAME = 'workspaces' THEN
    workspace_id_val := NEW.id;
  ELSIF TG_TABLE_NAME IN ('chart_of_accounts', 'accounts', 'transactions', 'tags', 'taxes', 'budgets') THEN
    workspace_id_val := NEW.workspace_id;
  ELSIF TG_TABLE_NAME = 'transaction_lines' THEN
    SELECT workspace_id INTO workspace_id_val FROM transactions WHERE id = NEW.transaction_id;
  ELSIF TG_TABLE_NAME = 'transaction_tags' THEN
    SELECT workspace_id INTO workspace_id_val FROM transactions WHERE id = NEW.transaction_id;
  ELSIF TG_TABLE_NAME = 'transaction_taxes' THEN
    SELECT workspace_id INTO workspace_id_val FROM transactions WHERE id = NEW.transaction_id;
  ELSIF TG_TABLE_NAME = 'budget_items' THEN
    SELECT workspace_id INTO workspace_id_val FROM budgets WHERE id = NEW.budget_id;
  ELSIF TG_TABLE_NAME = 'inter_workspace_balances' THEN
    workspace_id_val := NEW.from_workspace_id; -- 使用 from_workspace_id 作为审计记录的 workspace
  END IF;

  -- 插入审计日志
  INSERT INTO audit_logs (
    workspace_id,
    user_id,
    table_name,
    record_id,
    action,
    old_data,
    new_data
  ) VALUES (
    workspace_id_val,
    auth.get_current_user_id(),
    TG_TABLE_NAME,
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.id
      ELSE NEW.id
    END,
    TG_OP,
    CASE 
      WHEN TG_OP = 'UPDATE' OR TG_OP = 'DELETE' 
      THEN to_jsonb(OLD) 
      ELSE NULL 
    END,
    CASE 
      WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' 
      THEN to_jsonb(NEW) 
      ELSE NULL 
    END
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 为主要表添加审计日志触发器
CREATE TRIGGER audit_workspaces
AFTER INSERT OR UPDATE OR DELETE ON workspaces
FOR EACH ROW EXECUTE PROCEDURE create_audit_log();

CREATE TRIGGER audit_chart_of_accounts
AFTER INSERT OR UPDATE OR DELETE ON chart_of_accounts
FOR EACH ROW EXECUTE PROCEDURE create_audit_log();

CREATE TRIGGER audit_accounts
AFTER INSERT OR UPDATE OR DELETE ON accounts
FOR EACH ROW EXECUTE PROCEDURE create_audit_log();

CREATE TRIGGER audit_transactions
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW EXECUTE PROCEDURE create_audit_log();

CREATE TRIGGER audit_transaction_lines
AFTER INSERT OR UPDATE OR DELETE ON transaction_lines
FOR EACH ROW EXECUTE PROCEDURE create_audit_log();

-- 创建视图: 账户余额
CREATE OR REPLACE VIEW account_balances AS
SELECT 
  a.id AS account_id,
  a.workspace_id,
  a.name AS account_name,
  a.opening_balance,
  COALESCE(SUM(tl.amount), 0) AS transaction_total,
  a.opening_balance + COALESCE(SUM(tl.amount), 0) AS current_balance
FROM 
  accounts a
LEFT JOIN 
  transaction_lines tl ON a.id = tl.account_id
LEFT JOIN
  transactions t ON tl.transaction_id = t.id AND t.is_deleted = FALSE
WHERE
  a.is_deleted = FALSE
GROUP BY 
  a.id, a.workspace_id, a.name, a.opening_balance;

-- 创建视图: 可抵税支出汇总
CREATE OR REPLACE VIEW tax_deductible_expenses AS
SELECT 
  w.id AS workspace_id,
  w.name AS workspace_name,
  t.id AS tag_id,
  t.name AS tag_name,
  EXTRACT(YEAR FROM txn.txn_date) AS tax_year,
  SUM(CASE WHEN tl.amount < 0 THEN ABS(tl.amount) ELSE 0 END) AS deductible_amount
FROM 
  workspaces w
JOIN 
  transactions txn ON w.id = txn.workspace_id AND txn.is_deleted = FALSE
JOIN 
  transaction_tags tt ON txn.id = tt.transaction_id
JOIN 
  tags t ON tt.tag_id = t.id AND t.is_tax_deductible = TRUE AND t.is_deleted = FALSE
JOIN 
  transaction_lines tl ON txn.id = tl.transaction_id
JOIN
  accounts a ON tl.account_id = a.id AND a.is_deleted = FALSE
JOIN
  chart_of_accounts coa ON a.chart_id = coa.id AND coa.type = 'expense' AND coa.is_deleted = FALSE
GROUP BY 
  w.id, w.name, t.id, t.name, tax_year;

-- 创建视图: GST/HST 净应付汇总 (ITC 报告)
CREATE OR REPLACE VIEW tax_itc_summary AS
WITH collected_taxes AS (
  SELECT 
    w.id AS workspace_id,
    w.name AS workspace_name,
    tx.id AS tax_id,
    tx.name AS tax_name,
    EXTRACT(YEAR FROM txn.txn_date) AS tax_year,
    EXTRACT(QUARTER FROM txn.txn_date) AS tax_quarter,
    SUM(tt.tax_amount) AS collected_amount
  FROM 
    workspaces w
  JOIN 
    transactions txn ON w.id = txn.workspace_id AND txn.is_deleted = FALSE
  JOIN 
    transaction_taxes tt ON txn.id = tt.transaction_id
  JOIN 
    taxes tx ON tt.tax_id = tx.id AND tx.is_deleted = FALSE
  JOIN 
    transaction_lines tl ON txn.id = tl.transaction_id
  JOIN
    accounts a ON tl.account_id = a.id AND a.is_deleted = FALSE
  JOIN
    chart_of_accounts coa ON a.chart_id = coa.id AND coa.type = 'income' AND coa.is_deleted = FALSE
  WHERE
    tl.amount > 0  -- 收入为正
  GROUP BY 
    w.id, w.name, tx.id, tx.name, tax_year, tax_quarter
),
paid_taxes AS (
  SELECT 
    w.id AS workspace_id,
    w.name AS workspace_name,
    tx.id AS tax_id,
    tx.name AS tax_name,
    EXTRACT(YEAR FROM txn.txn_date) AS tax_year,
    EXTRACT(QUARTER FROM txn.txn_date) AS tax_quarter,
    SUM(tt.tax_amount) AS paid_amount
  FROM 
    workspaces w
  JOIN 
    transactions txn ON w.id = txn.workspace_id AND txn.is_deleted = FALSE
  JOIN 
    transaction_taxes tt ON txn.id = tt.transaction_id
  JOIN 
    taxes tx ON tt.tax_id = tx.id AND tx.is_recoverable = TRUE AND tx.is_deleted = FALSE
  JOIN 
    transaction_lines tl ON txn.id = tl.transaction_id
  JOIN
    accounts a ON tl.account_id = a.id AND a.is_deleted = FALSE
  JOIN
    chart_of_accounts coa ON a.chart_id = coa.id AND coa.type = 'expense' AND coa.is_deleted = FALSE
  WHERE
    tl.amount < 0  -- 支出为负
  GROUP BY 
    w.id, w.name, tx.id, tx.name, tax_year, tax_quarter
)
SELECT 
  COALESCE(c.workspace_id, p.workspace_id) AS workspace_id,
  COALESCE(c.workspace_name, p.workspace_name) AS workspace_name,
  COALESCE(c.tax_id, p.tax_id) AS tax_id,
  COALESCE(c.tax_name, p.tax_name) AS tax_name,
  COALESCE(c.tax_year, p.tax_year) AS tax_year,
  COALESCE(c.tax_quarter, p.tax_quarter) AS tax_quarter,
  COALESCE(c.collected_amount, 0) AS collected_amount,
  COALESCE(p.paid_amount, 0) AS itc_amount,
  COALESCE(c.collected_amount, 0) - COALESCE(p.paid_amount, 0) AS net_payable
FROM 
  collected_taxes c
FULL OUTER JOIN 
  paid_taxes p ON c.workspace_id = p.workspace_id AND c.tax_id = p.tax_id 
                  AND c.tax_year = p.tax_year AND c.tax_quarter = p.tax_quarter;

-- 创建默认科目表和税种的函数
CREATE OR REPLACE FUNCTION initialize_workspace_defaults(workspace_id UUID)
RETURNS VOID AS $$
DECLARE
  asset_id UUID;
  liability_id UUID;
  equity_id UUID;
  income_id UUID;
  expense_id UUID;
  cash_account_id UUID;
  accounts_receivable_id UUID;
  accounts_payable_id UUID;
BEGIN
  -- 创建默认科目类型
  INSERT INTO chart_of_accounts (workspace_id, code, name, type, description)
  VALUES 
    (workspace_id, '1000', 'Assets', 'asset', 'Things you own') RETURNING id INTO asset_id;
    
  INSERT INTO chart_of_accounts (workspace_id, code, name, type, description)
  VALUES 
    (workspace_id, '2000', 'Liabilities', 'liability', 'Things you owe') RETURNING id INTO liability_id;
    
  INSERT INTO chart_of_accounts (workspace_id, code, name, type, description)
  VALUES 
    (workspace_id, '3000', 'Equity', 'equity', 'Net worth') RETURNING id INTO equity_id;
    
  INSERT INTO chart_of_accounts (workspace_id, code, name, type, description)
  VALUES 
    (workspace_id, '4000', 'Income', 'income', 'Money coming in') RETURNING id INTO income_id;
    
  INSERT INTO chart_of_accounts (workspace_id, code, name, type, description)
  VALUES 
    (workspace_id, '5000', 'Expenses', 'expense', 'Money going out') RETURNING id INTO expense_id;

  -- 创建一些基本账户
  INSERT INTO accounts (workspace_id, chart_id, name, description)
  VALUES 
    (workspace_id, asset_id, 'Cash', 'Physical cash on hand') RETURNING id INTO cash_account_id;
    
  INSERT INTO accounts (workspace_id, chart_id, name, description)
  VALUES 
    (workspace_id, asset_id, 'Accounts Receivable', 'Money owed to you') RETURNING id INTO accounts_receivable_id;
    
  INSERT INTO accounts (workspace_id, chart_id, name, description)
  VALUES 
    (workspace_id, liability_id, 'Accounts Payable', 'Money you owe') RETURNING id INTO accounts_payable_id;
    
  INSERT INTO accounts (workspace_id, chart_id, name, description)
  VALUES 
    (workspace_id, income_id, 'Sales Revenue', 'Income from sales');
    
  INSERT INTO accounts (workspace_id, chart_id, name, description)
  VALUES 
    (workspace_id, expense_id, 'Office Supplies', 'Office supplies and stationery');
    
  INSERT INTO accounts (workspace_id, chart_id, name, description)
  VALUES 
    (workspace_id, expense_id, 'Rent', 'Office or workspace rent');

  -- 创建加拿大常用税种
  INSERT INTO taxes (workspace_id, name, rate, is_stackable, is_recoverable)
  VALUES 
    (workspace_id, 'GST', 0.05, TRUE, TRUE),
    (workspace_id, 'HST', 0.13, FALSE, TRUE),
    (workspace_id, 'PST (BC)', 0.07, TRUE, FALSE),
    (workspace_id, 'PST (SK)', 0.06, TRUE, FALSE),
    (workspace_id, 'PST (MB)', 0.07, TRUE, FALSE),
    (workspace_id, 'QST', 0.09975, TRUE, TRUE);

  -- 创建一些常用标签
  INSERT INTO tags (workspace_id, name, is_tax_deductible, system_defined)
  VALUES 
    (workspace_id, 'Business Expense', TRUE, TRUE),
    (workspace_id, 'Personal', FALSE, TRUE),
    (workspace_id, 'Medical', TRUE, TRUE),
    (workspace_id, 'Donation', TRUE, TRUE),
    (workspace_id, 'Education', TRUE, TRUE);
END;
$$ LANGUAGE plpgsql;

-- 创建触发器，在创建新工作空间时自动初始化默认值
CREATE OR REPLACE FUNCTION auto_initialize_workspace()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM initialize_workspace_defaults(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER initialize_new_workspace
AFTER INSERT ON workspaces
FOR EACH ROW EXECUTE PROCEDURE auto_initialize_workspace();
