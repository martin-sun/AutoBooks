-- Fix the get_bank_accounts function by removing the is_payment condition
-- Created: 2025-05-13

-- Update the function to get all bank accounts for a workspace with their balances
CREATE OR REPLACE FUNCTION get_bank_accounts(workspace_id_param UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  account_type TEXT,
  opening_balance NUMERIC(18,2),
  current_balance NUMERIC(18,2),
  currency CHAR(3),
  is_active BOOLEAN,
  last_reconciled_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  WITH account_balances AS (
    SELECT 
      a.id,
      COALESCE(SUM(tl.amount), 0) AS balance
    FROM 
      accounts a
    LEFT JOIN 
      transaction_lines tl ON a.id = tl.account_id
    LEFT JOIN 
      transactions t ON tl.transaction_id = t.id
    WHERE 
      a.workspace_id = workspace_id_param
      AND a.is_deleted = FALSE
      AND (t.is_deleted IS NULL OR t.is_deleted = FALSE)
    GROUP BY 
      a.id
  )
  SELECT 
    a.id,
    a.name,
    a.description,
    coa.type AS account_type,
    a.opening_balance,
    (a.opening_balance + COALESCE(ab.balance, 0)) AS current_balance,
    a.currency,
    NOT a.is_deleted AS is_active,
    NULL::TIMESTAMPTZ AS last_reconciled_date, -- To be implemented in reconciliation feature
    a.created_at,
    a.updated_at
  FROM 
    accounts a
  JOIN 
    chart_of_accounts coa ON a.chart_id = coa.id
  LEFT JOIN 
    account_balances ab ON a.id = ab.id
  WHERE 
    a.workspace_id = workspace_id_param
    AND a.is_deleted = FALSE
  ORDER BY 
    a.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
