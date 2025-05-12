-- Asset Management Tables for AutoBooks
-- Created: 2025-05-11

-- 1. Asset Categories Table
CREATE TABLE asset_categories (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('personal', 'business', 'both')),
  parent_id       UUID REFERENCES asset_categories(id),
  system_defined  BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  is_deleted      BOOLEAN DEFAULT FALSE
);

-- 2. Assets Table
CREATE TABLE assets (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id        UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  category_id         UUID NOT NULL REFERENCES asset_categories(id),
  account_id          UUID NOT NULL REFERENCES accounts(id),
  name                TEXT NOT NULL,
  description         TEXT,
  purchase_date       DATE,
  purchase_value      NUMERIC(18,2),
  current_value       NUMERIC(18,2),
  depreciation_method TEXT CHECK (depreciation_method IN ('straight_line', 'reducing_balance', 'none', NULL)),
  depreciation_rate   NUMERIC(5,2),
  depreciation_period INTEGER, -- in months
  currency            CHAR(3) DEFAULT 'CAD',
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now(),
  is_deleted          BOOLEAN DEFAULT FALSE
);

-- 3. Asset Transactions Table (for tracking value changes, depreciation, etc.)
CREATE TABLE asset_transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id        UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  transaction_id  UUID REFERENCES transactions(id) ON DELETE SET NULL,
  type            TEXT NOT NULL CHECK (type IN ('purchase', 'sale', 'depreciation', 'revaluation')),
  amount          NUMERIC(18,2) NOT NULL,
  transaction_date DATE NOT NULL,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  is_deleted      BOOLEAN DEFAULT FALSE
);

-- Create indexes for better performance
CREATE INDEX idx_assets_workspace ON assets(workspace_id);
CREATE INDEX idx_assets_category ON assets(category_id);
CREATE INDEX idx_assets_account ON assets(account_id);
CREATE INDEX idx_asset_transactions_asset ON asset_transactions(asset_id);
CREATE INDEX idx_asset_categories_parent ON asset_categories(parent_id);

-- Add triggers for updated_at
CREATE TRIGGER update_asset_categories_updated_at BEFORE UPDATE ON asset_categories
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_asset_transactions_updated_at BEFORE UPDATE ON asset_transactions
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Add RLS policies
ALTER TABLE asset_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for asset_categories (all users can view system categories)
CREATE POLICY asset_categories_select_policy ON asset_categories
  FOR SELECT
  USING (system_defined OR parent_id IN (
    SELECT id FROM asset_categories WHERE system_defined
  ));

-- RLS policies for assets (users can only access their own workspace assets)
CREATE POLICY assets_policy ON assets
  FOR ALL
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid()));

-- RLS policies for asset_transactions
CREATE POLICY asset_transactions_policy ON asset_transactions
  FOR ALL
  USING (asset_id IN (
    SELECT id FROM assets WHERE workspace_id IN (
      SELECT id FROM workspaces WHERE user_id = auth.uid()
    )
  ));
