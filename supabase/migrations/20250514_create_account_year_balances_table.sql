-- 创建account_year_balances表，用于存储每个账户在每个会计年度的期初余额
CREATE TABLE IF NOT EXISTS account_year_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  account_id UUID NOT NULL REFERENCES accounts(id),
  fiscal_year_id UUID NOT NULL REFERENCES fiscal_years(id),
  opening_balance NUMERIC(18,2) NOT NULL DEFAULT 0,
  closing_balance NUMERIC(18,2),
  last_reconciled_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE,
  UNIQUE(account_id, fiscal_year_id)
);

-- 添加RLS策略
ALTER TABLE account_year_balances ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略 - 使用workspace_id进行隔离
CREATE POLICY account_year_balances_workspace_isolation ON account_year_balances
  USING (workspace_id IN (
    SELECT id FROM workspaces WHERE user_id = auth.uid() AND is_deleted IS NOT TRUE
  ));

-- 创建索引以提高查询性能
CREATE INDEX idx_account_year_balances_account ON account_year_balances(account_id);
CREATE INDEX idx_account_year_balances_fiscal_year ON account_year_balances(fiscal_year_id);
CREATE INDEX idx_account_year_balances_workspace ON account_year_balances(workspace_id);

-- 添加触发器以自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_account_year_balances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_account_year_balances_updated_at
BEFORE UPDATE ON account_year_balances
FOR EACH ROW
EXECUTE FUNCTION update_account_year_balances_updated_at();

-- 添加审计日志触发器
CREATE OR REPLACE FUNCTION audit_account_year_balances_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (
      workspace_id,
      table_name,
      record_id,
      action,
      old_data,
      new_data,
      changed_by
    ) VALUES (
      NEW.workspace_id,
      'account_year_balances',
      NEW.id,
      'INSERT',
      NULL,
      row_to_json(NEW),
      auth.uid()
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (
      workspace_id,
      table_name,
      record_id,
      action,
      old_data,
      new_data,
      changed_by
    ) VALUES (
      NEW.workspace_id,
      'account_year_balances',
      NEW.id,
      'UPDATE',
      row_to_json(OLD),
      row_to_json(NEW),
      auth.uid()
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (
      workspace_id,
      table_name,
      record_id,
      action,
      old_data,
      new_data,
      changed_by
    ) VALUES (
      OLD.workspace_id,
      'account_year_balances',
      OLD.id,
      'DELETE',
      row_to_json(OLD),
      NULL,
      auth.uid()
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_account_year_balances_changes
AFTER INSERT OR UPDATE OR DELETE ON account_year_balances
FOR EACH ROW
EXECUTE FUNCTION audit_account_year_balances_changes();
