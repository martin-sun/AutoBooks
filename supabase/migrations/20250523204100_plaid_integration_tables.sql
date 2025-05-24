-- Plaid 集成表结构
-- Created: 2025-05-23

-- 1. 银行连接表
CREATE TABLE bank_connections (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id      UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  plaid_item_id     TEXT NOT NULL,
  plaid_access_token TEXT NOT NULL,
  institution_id    TEXT NOT NULL,
  institution_name  TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'active',
  error             TEXT,
  last_synced_at    TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  is_deleted        BOOLEAN DEFAULT FALSE,
  UNIQUE(workspace_id, plaid_item_id)
);

-- 添加行级安全策略
ALTER TABLE bank_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY bank_connections_policy ON bank_connections
  FOR ALL
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));

-- 2. 银行账户链接表
CREATE TABLE bank_account_links (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id     UUID NOT NULL REFERENCES bank_connections(id) ON DELETE CASCADE,
  account_id        UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  plaid_account_id  TEXT NOT NULL,
  mask              TEXT,
  official_name     TEXT,
  type              TEXT NOT NULL,
  subtype           TEXT,
  sync_enabled      BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  is_deleted        BOOLEAN DEFAULT FALSE,
  UNIQUE(connection_id, plaid_account_id)
);

-- 添加行级安全策略
ALTER TABLE bank_account_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY bank_account_links_policy ON bank_account_links
  FOR ALL
  USING (connection_id IN (SELECT id FROM bank_connections WHERE workspace_id IN 
         (SELECT id FROM workspaces WHERE user_id = auth.uid())));

-- 3. 银行交易表
CREATE TABLE bank_transactions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_link_id     UUID NOT NULL REFERENCES bank_account_links(id) ON DELETE CASCADE,
  transaction_id      UUID REFERENCES transactions(id),
  plaid_transaction_id TEXT NOT NULL,
  amount              NUMERIC(18,2) NOT NULL,
  date                DATE NOT NULL,
  name                TEXT,
  merchant_name       TEXT,
  pending             BOOLEAN DEFAULT FALSE,
  category_id         TEXT,
  category            TEXT[],
  location            JSONB,
  payment_meta        JSONB,
  imported_at         TIMESTAMPTZ DEFAULT now(),
  matched_at          TIMESTAMPTZ,
  is_deleted          BOOLEAN DEFAULT FALSE,
  UNIQUE(account_link_id, plaid_transaction_id)
);

-- 添加行级安全策略
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY bank_transactions_policy ON bank_transactions
  FOR ALL
  USING (account_link_id IN (SELECT id FROM bank_account_links WHERE connection_id IN 
         (SELECT id FROM bank_connections WHERE workspace_id IN 
          (SELECT id FROM workspaces WHERE user_id = auth.uid()))));

-- 4. 交易匹配规则表
CREATE TABLE transaction_match_rules (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id      UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  match_pattern     JSONB NOT NULL, -- 匹配条件，如商户名、金额范围等
  target_account_id UUID NOT NULL REFERENCES accounts(id),
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  is_deleted        BOOLEAN DEFAULT FALSE
);

-- 添加行级安全策略
ALTER TABLE transaction_match_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY transaction_match_rules_policy ON transaction_match_rules
  FOR ALL
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));

-- 添加索引以提高查询性能
CREATE INDEX idx_bank_connections_workspace ON bank_connections(workspace_id);
CREATE INDEX idx_bank_account_links_connection ON bank_account_links(connection_id);
CREATE INDEX idx_bank_account_links_account ON bank_account_links(account_id);
CREATE INDEX idx_bank_transactions_account_link ON bank_transactions(account_link_id);
CREATE INDEX idx_bank_transactions_transaction ON bank_transactions(transaction_id);
CREATE INDEX idx_bank_transactions_date ON bank_transactions(date);
CREATE INDEX idx_transaction_match_rules_workspace ON transaction_match_rules(workspace_id);

-- 更新accounts表，确保有is_payment字段
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'accounts' AND column_name = 'is_payment'
  ) THEN
    ALTER TABLE accounts ADD COLUMN is_payment BOOLEAN DEFAULT FALSE;
  END IF;
END $$;
