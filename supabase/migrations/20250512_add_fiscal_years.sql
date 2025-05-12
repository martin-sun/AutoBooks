-- Create fiscal years table
CREATE TABLE fiscal_years (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  name VARCHAR NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'active', -- active, closed, filed
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add fiscal year settings to workspaces
ALTER TABLE workspaces ADD COLUMN default_fiscal_year_end VARCHAR(5) DEFAULT '12-31';
ALTER TABLE workspaces ADD COLUMN fiscal_year_start_month INTEGER DEFAULT 1;

-- Create RLS policies for fiscal years
ALTER TABLE fiscal_years ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to manage fiscal years for workspaces they have access to
CREATE POLICY fiscal_years_workspace_access_policy ON fiscal_years
  FOR ALL 
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_users
      WHERE user_id = auth.uid()
    )
  );

-- Trigger to update timestamp
CREATE TRIGGER update_fiscal_years_updated_at
BEFORE UPDATE ON fiscal_years
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Function to ensure only one current fiscal year per workspace
CREATE OR REPLACE FUNCTION ensure_single_current_fiscal_year()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_current = TRUE THEN
    UPDATE fiscal_years
    SET is_current = FALSE
    WHERE workspace_id = NEW.workspace_id AND id != NEW.id AND is_current = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER fiscal_year_current_trigger
BEFORE INSERT OR UPDATE ON fiscal_years
FOR EACH ROW
EXECUTE FUNCTION ensure_single_current_fiscal_year();
