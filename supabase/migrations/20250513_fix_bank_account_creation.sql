-- Fix bank account creation to support both asset and liability types
-- Created: 2025-05-13

-- Update the function to create a bank account
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
    currency
  )
  VALUES (
    workspace_id_param,
    chart_id_param,
    name_param,
    description_param,
    opening_balance_param,
    currency_param
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
        AND is_deleted = FALSE;
      
      -- If equity account doesn't exist, create it
      IF equity_account_id IS NULL THEN
        -- First find the equity chart of account
        DECLARE
          equity_chart_id UUID;
        BEGIN
          SELECT id INTO equity_chart_id
          FROM chart_of_accounts
          WHERE workspace_id = workspace_id_param
            AND type = 'equity'
            AND name = 'Equity'
            AND is_deleted = FALSE;
          
          -- If equity chart doesn't exist, create it
          IF equity_chart_id IS NULL THEN
            INSERT INTO chart_of_accounts (
              workspace_id,
              name,
              type,
              description
            )
            VALUES (
              workspace_id_param,
              'Equity',
              'equity',
              'Equity accounts'
            )
            RETURNING id INTO equity_chart_id;
          END IF;
          
          -- Create the Opening Balance Equity account
          INSERT INTO accounts (
            workspace_id,
            chart_id,
            name,
            description
          )
          VALUES (
            workspace_id_param,
            equity_chart_id,
            'Opening Balance Equity',
            'Used for opening balances of accounts'
          )
          RETURNING id INTO equity_account_id;
        END;
      END IF;
      
      -- Create the opening balance transaction
      INSERT INTO transactions (
        workspace_id,
        txn_date,
        memo,
        reference
      )
      VALUES (
        workspace_id_param,
        CURRENT_DATE,
        'Opening balance for ' || name_param,
        'OPENING-BALANCE'
      )
      RETURNING id INTO new_transaction_id;
      
      -- Create the transaction lines
      -- For asset accounts: debit the asset account, credit equity
      -- For liability accounts: credit the liability account, debit equity
      DECLARE
        account_type TEXT;
      BEGIN
        SELECT coa.type INTO account_type
        FROM chart_of_accounts coa
        WHERE coa.id = chart_id_param;
        
        IF account_type = 'asset' THEN
          -- Debit the asset account (positive amount)
          INSERT INTO transaction_lines (
            transaction_id,
            account_id,
            amount,
            description
          )
          VALUES (
            new_transaction_id,
            new_account_id,
            opening_balance_param,
            'Opening balance'
          );
          
          -- Credit equity (negative amount)
          INSERT INTO transaction_lines (
            transaction_id,
            account_id,
            amount,
            description
          )
          VALUES (
            new_transaction_id,
            equity_account_id,
            -opening_balance_param,
            'Opening balance for ' || name_param
          );
        ELSIF account_type = 'liability' THEN
          -- Credit the liability account (negative amount)
          INSERT INTO transaction_lines (
            transaction_id,
            account_id,
            amount,
            description
          )
          VALUES (
            new_transaction_id,
            new_account_id,
            -opening_balance_param,
            'Opening balance'
          );
          
          -- Debit equity (positive amount)
          INSERT INTO transaction_lines (
            transaction_id,
            account_id,
            amount,
            description
          )
          VALUES (
            new_transaction_id,
            equity_account_id,
            opening_balance_param,
            'Opening balance for ' || name_param
          );
        END IF;
      END;
    END;
  END IF;
  
  RETURN new_account_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
