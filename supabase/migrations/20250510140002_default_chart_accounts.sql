-- Function to create default chart of accounts entries
CREATE OR REPLACE FUNCTION create_default_chart_accounts()
RETURNS VOID AS $$
DECLARE
  -- Variables to store account group IDs
  group_id UUID;
  account_id UUID;
  
  -- Cursor to iterate through all account groups
  groups_cursor CURSOR FOR 
    SELECT id, account_type, name, workspace_type
    FROM account_groups
    WHERE is_system = TRUE
    ORDER BY account_type, display_order;
    
  -- Record variable to store cursor data
  group_rec RECORD;
BEGIN
  -- Iterate through all system-defined account groups
  OPEN groups_cursor;
  LOOP
    FETCH groups_cursor INTO group_rec;
    EXIT WHEN NOT FOUND;
    
    -- Create default accounts based on the group
    CASE 
      -- BUSINESS WORKSPACE DEFAULT ACCOUNTS
      
      -- Asset accounts
      WHEN group_rec.name = 'Cash and Bank' AND group_rec.workspace_type = 'business' THEN
        -- Create Cash on Hand account
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Cash on Hand', 'asset', '1001', 
          'Physical cash available for business use',
          1, TRUE, 'business'
        );
        
      WHEN group_rec.name = 'Expected Payments from Customers' AND group_rec.workspace_type = 'business' THEN
        -- Create Accounts Receivable account
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Accounts Receivable', 'asset', '1200', 
          'Money owed to your business by customers',
          1, TRUE, 'business'
        );
      
      -- Liability accounts
      WHEN group_rec.name = 'Expected Payments to Vendors' AND group_rec.workspace_type = 'business' THEN
        -- Create Accounts Payable account
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Accounts Payable', 'liability', '2100', 
          'Money your business owes to vendors',
          1, TRUE, 'business'
        );
      
      -- Income accounts
      WHEN group_rec.name = 'Income' AND group_rec.workspace_type = 'business' THEN
        -- Create Sales account
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Sales', 'income', '4000', 
          'Revenue from product sales',
          1, TRUE, 'business'
        );
        
        -- Create Consulting Income account
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Consulting Income', 'income', '4100', 
          'Revenue from consulting services',
          2, TRUE, 'business'
        );
      
      WHEN group_rec.name = 'Uncategorized Income' AND group_rec.workspace_type = 'business' THEN
        -- Create Uncategorized Income account
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Uncategorized Income', 'income', '4900', 
          'Temporary category for unclassified income',
          1, TRUE, 'business'
        );
      
      WHEN group_rec.name = 'Gain on Foreign Exchange' AND group_rec.workspace_type = 'business' THEN
        -- Create Gain on Foreign Exchange account
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Gain on Foreign Exchange', 'income', '4950', 
          'Gains from currency exchange rate fluctuations',
          1, TRUE, 'business'
        );
      
      -- Expense accounts
      WHEN group_rec.name = 'Operating Expense' AND group_rec.workspace_type = 'business' THEN
        -- Create common operating expense accounts
        
        -- Accounting Fees
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Accounting Fees', 'expense', '5010', 
          'Fees paid for accounting services',
          1, TRUE, 'business'
        );
        
        -- Advertising & Promotion
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Advertising & Promotion', 'expense', '5020', 
          'Costs for advertising and marketing',
          2, TRUE, 'business'
        );
        
        -- Bank Service Charges
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Bank Service Charges', 'expense', '5030', 
          'Fees charged by financial institutions',
          3, TRUE, 'business'
        );
        
        -- Office Supplies
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Office Supplies', 'expense', '5040', 
          'Stationery, paper, ink, and other office supplies',
          4, TRUE, 'business'
        );
        
        -- Rent Expense
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Rent Expense', 'expense', '5050', 
          'Payment for rented facilities',
          5, TRUE, 'business'
        );
      
      WHEN group_rec.name = 'Uncategorized Expense' AND group_rec.workspace_type = 'business' THEN
        -- Create Uncategorized Expense account
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Uncategorized Expense', 'expense', '5900', 
          'Temporary category for unclassified expenses',
          1, TRUE, 'business'
        );
      
      WHEN group_rec.name = 'Loss on Foreign Exchange' AND group_rec.workspace_type = 'business' THEN
        -- Create Loss on Foreign Exchange account
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Loss on Foreign Exchange', 'expense', '5950', 
          'Losses from currency exchange rate fluctuations',
          1, TRUE, 'business'
        );
      
      -- Equity accounts
      WHEN group_rec.name = 'Business Owner Contribution & Drawing' AND group_rec.workspace_type = 'business' THEN
        -- Owner Investment
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Owner Investment', 'equity', '3010', 
          'Money invested in the business by the owner',
          1, TRUE, 'business'
        );
        
        -- Owner Drawings
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Owner Drawings', 'equity', '3020', 
          'Money withdrawn from the business by the owner',
          2, TRUE, 'business'
        );
      
      WHEN group_rec.name = 'Retained Earnings: Profit' AND group_rec.workspace_type = 'business' THEN
        -- Owner's Equity
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Owner''s Equity', 'equity', '3100', 
          'Accumulated profits retained in the business',
          1, TRUE, 'business'
        );
      
      -- PERSONAL WORKSPACE DEFAULT ACCOUNTS
      
      -- Asset accounts
      WHEN group_rec.name = 'Cash & Bank' AND group_rec.workspace_type = 'personal' THEN
        -- Cash on Hand
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Cash on Hand', 'asset', '1001', 
          'Physical cash you keep at home',
          1, TRUE, 'personal'
        );
        
        -- Chequing Account
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Chequing Account', 'asset', '1010', 
          'Primary bank account for day-to-day transactions',
          2, TRUE, 'personal'
        );
        
        -- Savings Account
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Savings Account', 'asset', '1020', 
          'Bank account for setting aside money',
          3, TRUE, 'personal'
        );
      
      WHEN group_rec.name = 'Investments' AND group_rec.workspace_type = 'personal' THEN
        -- TFSA Account
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'TFSA', 'asset', '1100', 
          'Tax-Free Savings Account',
          1, TRUE, 'personal'
        );
        
        -- RRSP Account
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'RRSP', 'asset', '1110', 
          'Registered Retirement Savings Plan',
          2, TRUE, 'personal'
        );
      
      WHEN group_rec.name = 'Property & Vehicles' AND group_rec.workspace_type = 'personal' THEN
        -- Primary Residence
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Primary Residence', 'asset', '1200', 
          'Your primary home',
          1, TRUE, 'personal'
        );
        
        -- Vehicle
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Vehicle', 'asset', '1210', 
          'Car or other vehicle',
          2, TRUE, 'personal'
        );
      
      WHEN group_rec.name = 'Receivables' AND group_rec.workspace_type = 'personal' THEN
        -- Money Owed to Me
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Money Owed to Me', 'asset', '1300', 
          'Money others have borrowed from you',
          1, TRUE, 'personal'
        );
      
      -- Liability accounts
      WHEN group_rec.name = 'Credit & Loans' AND group_rec.workspace_type = 'personal' THEN
        -- Credit Card
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Credit Card', 'liability', '2000', 
          'Credit card balances',
          1, TRUE, 'personal'
        );
        
        -- Mortgage
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Mortgage', 'liability', '2010', 
          'Home loan balance',
          2, TRUE, 'personal'
        );
        
        -- Student Loan
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Student Loan', 'liability', '2020', 
          'Education loan balance',
          3, TRUE, 'personal'
        );
      
      WHEN group_rec.name = 'Taxes Payable' AND group_rec.workspace_type = 'personal' THEN
        -- Income Tax Owing
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Income Tax Owing', 'liability', '2100', 
          'Taxes owed to tax authorities',
          1, TRUE, 'personal'
        );
      
      -- Income accounts
      WHEN group_rec.name = 'Regular Income' AND group_rec.workspace_type = 'personal' THEN
        -- Salary
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Salary', 'income', '4000', 
          'Regular employment income',
          1, TRUE, 'personal'
        );
        
        -- Bonus
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Bonus', 'income', '4010', 
          'Additional employment compensation',
          2, TRUE, 'personal'
        );
      
      WHEN group_rec.name = 'Passive Income' AND group_rec.workspace_type = 'personal' THEN
        -- Interest & Dividends
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Interest & Dividends', 'income', '4100', 
          'Income from investments',
          1, TRUE, 'personal'
        );
        
        -- Rental Income
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Rental Income', 'income', '4110', 
          'Income from renting property',
          2, TRUE, 'personal'
        );
      
      WHEN group_rec.name = 'Other Income' AND group_rec.workspace_type = 'personal' THEN
        -- Gift
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Gift', 'income', '4200', 
          'Money received as a gift',
          1, TRUE, 'personal'
        );
        
        -- One-off Income
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'One-off Income', 'income', '4210', 
          'Non-recurring income',
          2, TRUE, 'personal'
        );
      
      -- Expense accounts
      WHEN group_rec.name = 'Living' AND group_rec.workspace_type = 'personal' THEN
        -- Groceries
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Groceries', 'expense', '5000', 
          'Food and household supplies',
          1, TRUE, 'personal'
        );
        
        -- Utilities
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Utilities', 'expense', '5010', 
          'Electricity, water, gas, internet',
          2, TRUE, 'personal'
        );
        
        -- Rent
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Rent', 'expense', '5020', 
          'Housing rental payment',
          3, TRUE, 'personal'
        );
      
      WHEN group_rec.name = 'Transport' AND group_rec.workspace_type = 'personal' THEN
        -- Fuel
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Fuel', 'expense', '5100', 
          'Gasoline or electric charging for vehicles',
          1, TRUE, 'personal'
        );
        
        -- Public Transit
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Public Transit', 'expense', '5110', 
          'Bus, train, subway fares',
          2, TRUE, 'personal'
        );
        
        -- Car Maintenance
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Car Maintenance', 'expense', '5120', 
          'Vehicle repairs and servicing',
          3, TRUE, 'personal'
        );
      
      WHEN group_rec.name = 'Lifestyle' AND group_rec.workspace_type = 'personal' THEN
        -- Dining Out
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Dining Out', 'expense', '5300', 
          'Restaurant meals',
          1, TRUE, 'personal'
        );
        
        -- Entertainment
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Entertainment', 'expense', '5310', 
          'Movies, concerts, events',
          2, TRUE, 'personal'
        );
        
        -- Travel
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Travel', 'expense', '5320', 
          'Vacation and trip expenses',
          3, TRUE, 'personal'
        );
      
      WHEN group_rec.name = 'Miscellaneous' AND group_rec.workspace_type = 'personal' THEN
        -- Uncategorized
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Uncategorized', 'expense', '5900', 
          'Expenses that don''t fit elsewhere',
          1, TRUE, 'personal'
        );
      
      -- Equity accounts
      WHEN group_rec.name = 'Opening Balances' AND group_rec.workspace_type = 'personal' THEN
        -- Opening Balance Equity
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Opening Balance Equity', 'equity', '3000', 
          'Initial net worth adjustments',
          1, TRUE, 'personal'
        );
      
      WHEN group_rec.name = 'Retained Surplus' AND group_rec.workspace_type = 'personal' THEN
        -- Retained Earnings
        INSERT INTO chart_of_accounts (
          group_id, name, type, code, description, 
          display_order, is_system, workspace_type
        )
        VALUES (
          group_rec.id, 'Retained Earnings', 'equity', '3100', 
          'Accumulated savings',
          1, TRUE, 'personal'
        );
      
      ELSE
        -- No default accounts for this group
        NULL;
    END CASE;
  END LOOP;
  CLOSE groups_cursor;
  
  -- Mark accounts as payment accounts (is_payment = TRUE)
  -- For business workspace
  UPDATE accounts a
  SET is_payment = TRUE
  FROM chart_of_accounts c, account_groups g
  WHERE a.chart_id = c.id
    AND c.group_id = g.id
    AND g.workspace_type = 'business'
    AND (
      g.name = 'Cash and Bank' OR
      g.name = 'Money in Transit' OR
      g.name = 'Credit Card'
    );
  
  -- For personal workspace
  UPDATE accounts a
  SET is_payment = TRUE
  FROM chart_of_accounts c, account_groups g
  WHERE a.chart_id = c.id
    AND c.group_id = g.id
    AND g.workspace_type = 'personal'
    AND (
      g.name = 'Cash & Bank'
    );
  
END;
$$ LANGUAGE plpgsql;

-- Create a function to automatically add default groups and accounts to new workspaces
CREATE OR REPLACE FUNCTION initialize_workspace_chart_of_accounts()
RETURNS TRIGGER AS $$
DECLARE
  -- Variables
  workspace_type_val TEXT;
  group_rec RECORD;
  new_group_id UUID;
  account_rec RECORD;
  new_chart_id UUID;
BEGIN
  -- Get the workspace type
  SELECT type INTO workspace_type_val
  FROM workspaces
  WHERE id = NEW.id;

  -- Loop through default account groups for this workspace type
  FOR group_rec IN (
    SELECT id, account_type, name, description, display_order
    FROM account_groups
    WHERE (workspace_type = workspace_type_val OR workspace_type IS NULL)
      AND is_system = TRUE
  ) LOOP
    -- Create a copy of this group for the new workspace
    INSERT INTO account_groups (
      workspace_id, account_type, name, description, 
      display_order, workspace_type, is_system
    )
    VALUES (
      NEW.id, group_rec.account_type, group_rec.name, group_rec.description,
      group_rec.display_order, workspace_type_val, FALSE
    )
    RETURNING id INTO new_group_id;
    
    -- Loop through default accounts for this group
    FOR account_rec IN (
      SELECT name, type, code, description, display_order
      FROM chart_of_accounts
      WHERE group_id = group_rec.id
        AND (workspace_type = workspace_type_val OR workspace_type IS NULL)
        AND is_system = TRUE
    ) LOOP
      -- Create a copy of this account for the new workspace
      INSERT INTO chart_of_accounts (
        workspace_id, group_id, name, type, code,
        description, display_order, is_system, workspace_type
      )
      VALUES (
        NEW.id, new_group_id, account_rec.name, account_rec.type, account_rec.code,
        account_rec.description, account_rec.display_order, FALSE, workspace_type_val
      )
      RETURNING id INTO new_chart_id;
      
      -- Create an account record in accounts table
      INSERT INTO accounts (
        workspace_id, chart_id, name, description,
        is_payment, opening_balance, currency
      )
      VALUES (
        NEW.id, new_chart_id, account_rec.name, account_rec.description,
        FALSE, 0, NEW.currency
      );
    END LOOP;
  END LOOP;
  
  -- Mark accounts as payment accounts (is_payment = TRUE)
  IF workspace_type_val = 'business' THEN
    UPDATE accounts a
    SET is_payment = TRUE
    FROM chart_of_accounts c, account_groups g
    WHERE a.chart_id = c.id
      AND c.group_id = g.id
      AND a.workspace_id = NEW.id
      AND (
        g.name = 'Cash and Bank' OR
        g.name = 'Money in Transit' OR
        g.name = 'Credit Card'
      );
  ELSIF workspace_type_val = 'personal' THEN
    UPDATE accounts a
    SET is_payment = TRUE
    FROM chart_of_accounts c, account_groups g
    WHERE a.chart_id = c.id
      AND c.group_id = g.id
      AND a.workspace_id = NEW.id
      AND (
        g.name = 'Cash & Bank'
      );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to create default chart of accounts
SELECT create_default_chart_accounts();

-- Create a trigger to initialize chart of accounts for new workspaces
CREATE TRIGGER initialize_workspace_coa_trigger
AFTER INSERT ON workspaces
FOR EACH ROW EXECUTE PROCEDURE initialize_workspace_chart_of_accounts();

-- Drop the function after execution
DROP FUNCTION create_default_chart_accounts();
