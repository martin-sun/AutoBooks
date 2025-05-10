-- Add account groups table to support Wave-like UI for chart of accounts
CREATE TABLE account_groups (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id    UUID REFERENCES workspaces(id) ON DELETE CASCADE, -- Allow NULL for template groups
  account_type    TEXT NOT NULL CHECK (account_type IN ('asset','liability','equity','income','expense')),
  name            TEXT NOT NULL,
  description     TEXT,
  display_order   INTEGER DEFAULT 0, -- Controls the display order within the account type
  workspace_type  TEXT CHECK (workspace_type IN ('personal','business')), -- If null, applies to both types
  is_system       BOOLEAN DEFAULT FALSE, -- System-defined groups cannot be deleted
  is_template     BOOLEAN DEFAULT FALSE, -- Template groups are used to create workspace-specific groups
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  is_deleted      BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_account_groups_workspace ON account_groups(workspace_id);
CREATE INDEX idx_account_groups_type ON account_groups(account_type);

-- Add group_id to chart_of_accounts to link accounts to groups
ALTER TABLE chart_of_accounts 
ADD COLUMN group_id UUID REFERENCES account_groups(id);

-- Add is_payment flag to accounts table to distinguish payment accounts from categories
-- This was added in a previous migration, but included here for reference
-- ALTER TABLE accounts ADD COLUMN is_payment BOOLEAN DEFAULT FALSE;

-- Add additional fields to chart_of_accounts
ALTER TABLE chart_of_accounts 
ADD COLUMN display_order INTEGER DEFAULT 0,
ADD COLUMN is_system BOOLEAN DEFAULT FALSE, -- System accounts cannot be deleted
ADD COLUMN workspace_type TEXT CHECK (workspace_type IN ('personal','business')); -- If null, applies to both types

-- Add RLS policy for account_groups
CREATE POLICY account_groups_policy ON account_groups
  FOR ALL
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = public.get_current_user_id()));

-- Create trigger to update updated_at
CREATE TRIGGER update_account_groups_updated_at BEFORE UPDATE ON account_groups
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Create audit log triggers
CREATE TRIGGER audit_account_groups_trigger
AFTER INSERT OR UPDATE OR DELETE ON account_groups
FOR EACH ROW EXECUTE PROCEDURE create_audit_log();
