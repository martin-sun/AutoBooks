-- Create functions for banking accounts management
-- Created: 2025-05-13

-- Function to get all bank accounts for a workspace with their balances
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
      AND a.is_payment = TRUE
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
    AND a.is_payment = TRUE
    AND a.is_deleted = FALSE
  ORDER BY 
    a.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get a single bank account with its details
CREATE OR REPLACE FUNCTION get_bank_account(account_id_param UUID)
RETURNS TABLE (
  id UUID,
  workspace_id UUID,
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
  WITH account_balance AS (
    SELECT 
      COALESCE(SUM(tl.amount), 0) AS balance
    FROM 
      transaction_lines tl
    JOIN 
      transactions t ON tl.transaction_id = t.id
    WHERE 
      tl.account_id = account_id_param
      AND (t.is_deleted IS NULL OR t.is_deleted = FALSE)
  )
  SELECT 
    a.id,
    a.workspace_id,
    a.name,
    a.description,
    coa.type AS account_type,
    a.opening_balance,
    (a.opening_balance + (SELECT balance FROM account_balance)) AS current_balance,
    a.currency,
    NOT a.is_deleted AS is_active,
    NULL::TIMESTAMPTZ AS last_reconciled_date, -- To be implemented in reconciliation feature
    a.created_at,
    a.updated_at
  FROM 
    accounts a
  JOIN 
    chart_of_accounts coa ON a.chart_id = coa.id
  WHERE 
    a.id = account_id_param
    AND a.is_payment = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recent transactions for a bank account
CREATE OR REPLACE FUNCTION get_bank_account_transactions(
  account_id_param UUID,
  limit_param INTEGER DEFAULT 20,
  offset_param INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  transaction_id UUID,
  txn_date DATE,
  description TEXT,
  amount NUMERIC(18,2),
  reference TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tl.id,
    t.id AS transaction_id,
    t.txn_date,
    COALESCE(tl.description, t.memo) AS description,
    tl.amount,
    t.reference,
    t.created_at
  FROM 
    transaction_lines tl
  JOIN 
    transactions t ON tl.transaction_id = t.id
  WHERE 
    tl.account_id = account_id_param
    AND t.is_deleted = FALSE
  ORDER BY 
    t.txn_date DESC, t.created_at DESC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a new bank account
CREATE OR REPLACE FUNCTION create_bank_account(
  workspace_id_param UUID,
  name_param TEXT,
  description_param TEXT,
  chart_id_param UUID,
  opening_balance_param NUMERIC(18,2) DEFAULT 0,
  currency_param CHAR(3) DEFAULT 'CAD'
)
RETURNS UUID AS $$
DECLARE
  new_account_id UUID;
BEGIN
  -- Insert the new account
  INSERT INTO accounts (
    workspace_id,
    chart_id,
    name,
    description,
    opening_balance,
    currency,
    is_payment
  )
  VALUES (
    workspace_id_param,
    chart_id_param,
    name_param,
    description_param,
    opening_balance_param,
    currency_param,
    TRUE
  )
  RETURNING id INTO new_account_id;
  
  -- If there's an opening balance, create an initial transaction
  IF opening_balance_param <> 0 THEN
    DECLARE
      new_transaction_id UUID;
      equity_account_id UUID;
    BEGIN
      -- Find the equity account (Opening Balance Equity)
      SELECT id INTO equity_account_id
      FROM accounts
      WHERE workspace_id = workspace_id_param
        AND name = 'Opening Balance Equity'
        AND is_deleted = FALSE
      LIMIT 1;
      
      -- If no equity account exists, create one
      IF equity_account_id IS NULL THEN
        -- Find equity chart of account
        DECLARE
          equity_chart_id UUID;
        BEGIN
          SELECT id INTO equity_chart_id
          FROM chart_of_accounts
          WHERE workspace_id = workspace_id_param
            AND type = 'equity'
            AND is_deleted = FALSE
          LIMIT 1;
          
          -- Create Opening Balance Equity account
          INSERT INTO accounts (
            workspace_id,
            chart_id,
            name,
            description,
            opening_balance,
            currency,
            is_payment
          )
          VALUES (
            workspace_id_param,
            equity_chart_id,
            'Opening Balance Equity',
            'Account used for opening balances',
            0,
            currency_param,
            FALSE
          )
          RETURNING id INTO equity_account_id;
        END;
      END IF;
      
      -- Create the opening balance transaction
      INSERT INTO transactions (
        workspace_id,
        txn_date,
        reference,
        memo
      )
      VALUES (
        workspace_id_param,
        CURRENT_DATE,
        'Opening Balance',
        'Initial balance for ' || name_param
      )
      RETURNING id INTO new_transaction_id;
      
      -- Create transaction lines (double-entry)
      INSERT INTO transaction_lines (
        transaction_id,
        account_id,
        amount,
        description
      )
      VALUES
      (
        new_transaction_id,
        new_account_id,
        opening_balance_param,
        'Opening Balance'
      ),
      (
        new_transaction_id,
        equity_account_id,
        -opening_balance_param,
        'Opening Balance for ' || name_param
      );
    END;
  END IF;
  
  RETURN new_account_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update a bank account
CREATE OR REPLACE FUNCTION update_bank_account(
  account_id_param UUID,
  name_param TEXT,
  description_param TEXT,
  is_active_param BOOLEAN
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE accounts
  SET 
    name = name_param,
    description = description_param,
    is_deleted = NOT is_active_param,
    updated_at = NOW()
  WHERE 
    id = account_id_param
    AND is_payment = TRUE;
    
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete a bank account (soft delete)
CREATE OR REPLACE FUNCTION delete_bank_account(account_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if there are transactions for this account
  IF EXISTS (
    SELECT 1 FROM transaction_lines WHERE account_id = account_id_param
  ) THEN
    -- If transactions exist, just mark as deleted (soft delete)
    UPDATE accounts
    SET 
      is_deleted = TRUE,
      updated_at = NOW()
    WHERE 
      id = account_id_param
      AND is_payment = TRUE;
  ELSE
    -- If no transactions, we can hard delete
    DELETE FROM accounts
    WHERE 
      id = account_id_param
      AND is_payment = TRUE;
  END IF;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
