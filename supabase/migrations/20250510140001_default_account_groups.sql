-- Function to create default account groups and chart of accounts
CREATE OR REPLACE FUNCTION create_default_account_groups()
RETURNS VOID AS $$
DECLARE
  -- Business workspace system account group IDs
  b_cash_and_bank_id UUID;
  b_money_in_transit_id UUID;
  b_expected_payments_from_customers_id UUID;
  b_inventory_id UUID;
  b_property_plant_equipment_id UUID;
  b_depreciation_and_amortization_id UUID;
  b_vendor_prepayments_id UUID;
  b_other_short_term_asset_id UUID;
  b_other_long_term_asset_id UUID;
  
  b_credit_card_id UUID;
  b_loan_and_line_of_credit_id UUID;
  b_expected_payments_to_vendors_id UUID;
  b_sales_taxes_id UUID;
  b_due_for_payroll_id UUID;
  b_due_to_owners_id UUID;
  b_customer_prepayments_id UUID;
  b_other_short_term_liability_id UUID;
  b_other_long_term_liability_id UUID;
  
  b_income_id UUID;
  b_discount_id UUID;
  b_other_income_id UUID;
  b_uncategorized_income_id UUID;
  b_gain_on_forex_id UUID;
  
  b_operating_expense_id UUID;
  b_cogs_id UUID;
  b_payment_processing_fee_id UUID;
  b_payroll_expense_id UUID;
  b_uncategorized_expense_id UUID;
  b_loss_on_forex_id UUID;
  
  b_owner_contributions_id UUID;
  b_retained_earnings_id UUID;
  
  -- Personal workspace system account group IDs
  p_cash_and_bank_id UUID;
  p_investments_id UUID;
  p_property_vehicles_id UUID;
  p_receivables_id UUID;
  
  p_credit_and_loans_id UUID;
  p_taxes_payable_id UUID;
  
  p_regular_income_id UUID;
  p_passive_income_id UUID;
  p_other_income_id UUID;
  
  p_living_expense_id UUID;
  p_transport_expense_id UUID;
  p_personal_family_expense_id UUID;
  p_lifestyle_expense_id UUID;
  p_savings_investments_expense_id UUID;
  p_miscellaneous_expense_id UUID;
  
  p_opening_balances_id UUID;
  p_retained_surplus_id UUID;

BEGIN
  ---------------------------
  -- BUSINESS ACCOUNT GROUPS
  ---------------------------

  -- Business Asset Groups
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system, is_template)
  VALUES ('asset', 'Cash and Bank', 'Cash, checking and savings accounts', 1, 'business', TRUE, TRUE)
  RETURNING id INTO b_cash_and_bank_id;
  
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system)
  VALUES ('asset', 'Money in Transit', 'Money received but not yet deposited', 2, 'business', TRUE, TRUE)
  RETURNING id INTO b_money_in_transit_id;
  
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system)
  VALUES ('asset', 'Expected Payments from Customers', 'Money owed to your business', 3, 'business', TRUE, TRUE)
  RETURNING id INTO b_expected_payments_from_customers_id;
  
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system)
  VALUES ('asset', 'Inventory', 'Goods purchased for resale', 4, 'business', TRUE, TRUE)
  RETURNING id INTO b_inventory_id;
  
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system)
  VALUES ('asset', 'Property, Plant, Equipment', 'Long-term tangible assets', 5, 'business', TRUE, TRUE)
  RETURNING id INTO b_property_plant_equipment_id;
  
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system)
  VALUES ('asset', 'Depreciation and Amortization', 'Accumulated depreciation of assets', 6, 'business', TRUE, TRUE)
  RETURNING id INTO b_depreciation_and_amortization_id;
  
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system)
  VALUES ('asset', 'Vendor Prepayments and Credits', 'Payments made to vendors in advance', 7, 'business', TRUE, TRUE)
  RETURNING id INTO b_vendor_prepayments_id;
  
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system)
  VALUES ('asset', 'Other Short-Term Asset', 'Assets expected to be converted to cash within one year', 8, 'business', TRUE, TRUE)
  RETURNING id INTO b_other_short_term_asset_id;
  
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system)
  VALUES ('asset', 'Other Long-Term Asset', 'Assets not expected to be converted to cash within one year', 9, 'business', TRUE, TRUE)
  RETURNING id INTO b_other_long_term_asset_id;
  
  -- Business Liability Groups
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system, is_template)
  VALUES ('liability', 'Credit Card', 'Credit card accounts', 1, 'business', TRUE, TRUE)
  RETURNING id INTO b_credit_card_id;
  
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system)
  VALUES ('liability', 'Loan and Line of Credit', 'Business loans and lines of credit', 2, 'business', TRUE, TRUE)
  RETURNING id INTO b_loan_and_line_of_credit_id;
  
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system)
  VALUES ('liability', 'Expected Payments to Vendors', 'Money owed to vendors', 3, 'business', TRUE, TRUE)
  RETURNING id INTO b_expected_payments_to_vendors_id;
  
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system)
  VALUES ('liability', 'Sales Taxes', 'Collected sales taxes owed to tax authorities', 4, 'business', TRUE, TRUE)
  RETURNING id INTO b_sales_taxes_id;
  
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system)
  VALUES ('liability', 'Due for Payroll', 'Payroll liabilities', 5, 'business', TRUE, TRUE)
  RETURNING id INTO b_due_for_payroll_id;
  
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system)
  VALUES ('liability', 'Due to You & Other Owners', 'Money owed to business owners', 6, 'business', TRUE, TRUE)
  RETURNING id INTO b_due_to_owners_id;
  
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system)
  VALUES ('liability', 'Customer Prepayments & Credits', 'Payments received in advance for goods or services', 7, 'business', TRUE, TRUE)
  RETURNING id INTO b_customer_prepayments_id;
  
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system)
  VALUES ('liability', 'Other Short-Term Liability', 'Liabilities due within one year', 8, 'business', TRUE, TRUE)
  RETURNING id INTO b_other_short_term_liability_id;
  
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system)
  VALUES ('liability', 'Other Long-Term Liability', 'Liabilities due beyond one year', 9, 'business', TRUE, TRUE)
  RETURNING id INTO b_other_long_term_liability_id;
  
  -- Business Income Groups
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system, is_template)
  VALUES ('income', 'Income', 'Revenue from sales and services', 1, 'business', TRUE, TRUE)
  RETURNING id INTO b_income_id;
  
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system)
  VALUES ('income', 'Discount', 'Customer discounts', 2, 'business', TRUE, TRUE)
  RETURNING id INTO b_discount_id;
  
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system)
  VALUES ('income', 'Other Income', 'Income from secondary sources', 3, 'business', TRUE, TRUE)
  RETURNING id INTO b_other_income_id;
  
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system)
  VALUES ('income', 'Uncategorized Income', 'Temporary category for unclassified income', 4, 'business', TRUE, TRUE)
  RETURNING id INTO b_uncategorized_income_id;
  
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system)
  VALUES ('income', 'Gain on Foreign Exchange', 'Gains from currency exchange rate fluctuations', 5, 'business', TRUE, TRUE)
  RETURNING id INTO b_gain_on_forex_id;
  
  -- Business Expense Groups
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system, is_template)
  VALUES ('expense', 'Operating Expense', 'Day-to-day business expenses', 1, 'business', TRUE, TRUE)
  RETURNING id INTO b_operating_expense_id;
  
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system)
  VALUES ('expense', 'Cost of Goods Sold', 'Direct costs attributable to the production of goods sold', 2, 'business', TRUE, TRUE)
  RETURNING id INTO b_cogs_id;
  
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system)
  VALUES ('expense', 'Payment Processing Fee', 'Fees for processing payments', 3, 'business', TRUE, TRUE)
  RETURNING id INTO b_payment_processing_fee_id;
  
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system)
  VALUES ('expense', 'Payroll Expense', 'Employee compensation and benefits', 4, 'business', TRUE, TRUE)
  RETURNING id INTO b_payroll_expense_id;
  
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system)
  VALUES ('expense', 'Uncategorized Expense', 'Temporary category for unclassified expenses', 5, 'business', TRUE, TRUE)
  RETURNING id INTO b_uncategorized_expense_id;
  
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system)
  VALUES ('expense', 'Loss on Foreign Exchange', 'Losses from currency exchange rate fluctuations', 6, 'business', TRUE, TRUE)
  RETURNING id INTO b_loss_on_forex_id;
  
  -- Business Equity Groups
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system, is_template)
  VALUES ('equity', 'Business Owner Contribution & Drawing', 'Owner investments and withdrawals', 1, 'business', TRUE, TRUE)
  RETURNING id INTO b_owner_contributions_id;
  
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system)
  VALUES ('equity', 'Retained Earnings: Profit', 'Accumulated profits of the business', 2, 'business', TRUE, TRUE)
  RETURNING id INTO b_retained_earnings_id;
  
  ---------------------------
  -- PERSONAL ACCOUNT GROUPS
  ---------------------------
  
  -- Personal Asset Groups
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system, is_template)
  VALUES ('asset', 'Cash & Bank', 'Cash, checking and savings accounts', 1, 'personal', TRUE, TRUE)
  RETURNING id INTO p_cash_and_bank_id;
  
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system)
  VALUES ('asset', 'Investments', 'TFSA, RRSP, RESP, and other investments', 2, 'personal', TRUE, TRUE)
  RETURNING id INTO p_investments_id;
  
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system)
  VALUES ('asset', 'Property & Vehicles', 'Home, car, and other physical assets', 3, 'personal', TRUE, TRUE)
  RETURNING id INTO p_property_vehicles_id;
  
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system)
  VALUES ('asset', 'Receivables', 'Money owed to you by others', 4, 'personal', TRUE, TRUE)
  RETURNING id INTO p_receivables_id;
  
  -- Personal Liability Groups
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system, is_template)
  VALUES ('liability', 'Credit & Loans', 'Credit cards, student loans, mortgages', 1, 'personal', TRUE, TRUE)
  RETURNING id INTO p_credit_and_loans_id;
  
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system)
  VALUES ('liability', 'Taxes Payable', 'Income tax and other taxes owed', 2, 'personal', TRUE, TRUE)
  RETURNING id INTO p_taxes_payable_id;
  
  -- Personal Income Groups
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system, is_template)
  VALUES ('income', 'Regular Income', 'Salary, wages, bonuses', 1, 'personal', TRUE, TRUE)
  RETURNING id INTO p_regular_income_id;
  
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system)
  VALUES ('income', 'Passive Income', 'Interest, dividends, rental income', 2, 'personal', TRUE, TRUE)
  RETURNING id INTO p_passive_income_id;
  
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system)
  VALUES ('income', 'Other Income', 'Gifts, one-off income', 3, 'personal', TRUE, TRUE)
  RETURNING id INTO p_other_income_id;
  
  -- Personal Expense Groups
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system, is_template)
  VALUES ('expense', 'Living', 'Groceries, utilities, rent', 1, 'personal', TRUE, TRUE)
  RETURNING id INTO p_living_expense_id;
  
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system)
  VALUES ('expense', 'Transport', 'Fuel, public transit, car maintenance', 2, 'personal', TRUE, TRUE)
  RETURNING id INTO p_transport_expense_id;
  
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system)
  VALUES ('expense', 'Personal & Family', 'Education, healthcare, childcare', 3, 'personal', TRUE, TRUE)
  RETURNING id INTO p_personal_family_expense_id;
  
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system)
  VALUES ('expense', 'Lifestyle', 'Dining out, entertainment, travel', 4, 'personal', TRUE, TRUE)
  RETURNING id INTO p_lifestyle_expense_id;
  
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system)
  VALUES ('expense', 'Savings & Investments', 'TFSA, RESP contributions', 5, 'personal', TRUE, TRUE)
  RETURNING id INTO p_savings_investments_expense_id;
  
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system)
  VALUES ('expense', 'Miscellaneous', 'Other expenses and uncategorized items', 6, 'personal', TRUE, TRUE)
  RETURNING id INTO p_miscellaneous_expense_id;
  
  -- Personal Equity Groups
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system, is_template)
  VALUES ('equity', 'Opening Balances', 'Initial net worth adjustments', 1, 'personal', TRUE, TRUE)
  RETURNING id INTO p_opening_balances_id;
  
  INSERT INTO account_groups (account_type, name, description, display_order, workspace_type, is_system)
  VALUES ('equity', 'Retained Surplus', 'Accumulated savings', 2, 'personal', TRUE, TRUE)
  RETURNING id INTO p_retained_surplus_id;

  -- Now that we have created all the account groups, we can insert default chart of accounts
  -- This will be done in the next migration file

END;
$$ LANGUAGE plpgsql;

-- Execute the function to create default account groups
SELECT create_default_account_groups();

-- Drop the function after execution
DROP FUNCTION create_default_account_groups();
