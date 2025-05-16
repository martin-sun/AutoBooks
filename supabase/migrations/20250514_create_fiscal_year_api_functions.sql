-- 创建获取工作区会计年度列表的函数
CREATE OR REPLACE FUNCTION get_workspace_fiscal_years(
  workspace_id_param UUID
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT,
  is_current BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fy.id,
    fy.name,
    fy.start_date,
    fy.end_date,
    fy.status,
    fy.is_current,
    fy.created_at,
    fy.updated_at
  FROM 
    fiscal_years fy
  WHERE 
    fy.workspace_id = workspace_id_param
    AND fy.is_deleted IS NOT TRUE
  ORDER BY 
    fy.start_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建获取当前会计年度的函数
CREATE OR REPLACE FUNCTION get_current_fiscal_year(
  workspace_id_param UUID
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT,
  is_current BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fy.id,
    fy.name,
    fy.start_date,
    fy.end_date,
    fy.status,
    fy.is_current,
    fy.created_at,
    fy.updated_at
  FROM 
    fiscal_years fy
  WHERE 
    fy.workspace_id = workspace_id_param
    AND fy.is_current = TRUE
    AND fy.is_deleted IS NOT TRUE
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建获取账户余额表的函数
CREATE OR REPLACE FUNCTION get_account_balance_sheet(
  workspace_id_param UUID,
  fiscal_year_id_param UUID,
  as_of_date_param DATE DEFAULT NULL
)
RETURNS TABLE (
  account_id UUID,
  account_name TEXT,
  account_type TEXT,
  opening_balance NUMERIC,
  current_balance NUMERIC,
  account_group TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH account_balances AS (
    SELECT 
      ab.account_id,
      ab.account_name,
      ab.account_type,
      ab.opening_balance,
      ab.current_balance
    FROM 
      get_accounts_balances(workspace_id_param, fiscal_year_id_param, as_of_date_param) ab
  )
  SELECT 
    ab.account_id,
    ab.account_name,
    ab.account_type,
    ab.opening_balance,
    ab.current_balance,
    CASE 
      WHEN ab.account_type = 'asset' THEN 'Assets'
      WHEN ab.account_type = 'liability' THEN 'Liabilities'
      WHEN ab.account_type = 'equity' THEN 'Equity'
      WHEN ab.account_type = 'income' THEN 'Income'
      WHEN ab.account_type = 'expense' THEN 'Expenses'
      ELSE 'Other'
    END AS account_group
  FROM 
    account_balances ab
  ORDER BY 
    account_group,
    ab.account_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建获取资产负债表摘要的函数
CREATE OR REPLACE FUNCTION get_balance_sheet_summary(
  workspace_id_param UUID,
  fiscal_year_id_param UUID,
  as_of_date_param DATE DEFAULT NULL
)
RETURNS TABLE (
  group_name TEXT,
  total_amount NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH account_balances AS (
    SELECT 
      ab.account_type,
      ab.current_balance
    FROM 
      get_accounts_balances(workspace_id_param, fiscal_year_id_param, as_of_date_param) ab
  )
  SELECT 
    CASE 
      WHEN ab.account_type = 'asset' THEN 'Total Assets'
      WHEN ab.account_type = 'liability' THEN 'Total Liabilities'
      WHEN ab.account_type = 'equity' THEN 'Total Equity'
      WHEN ab.account_type = 'income' THEN 'Total Income'
      WHEN ab.account_type = 'expense' THEN 'Total Expenses'
      ELSE 'Other'
    END AS group_name,
    SUM(ab.current_balance) AS total_amount
  FROM 
    account_balances ab
  GROUP BY 
    ab.account_type
  ORDER BY 
    group_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建获取账户余额历史的函数
CREATE OR REPLACE FUNCTION get_account_balance_history(
  account_id_param UUID,
  fiscal_year_id_param UUID,
  interval_type TEXT DEFAULT 'month'
)
RETURNS TABLE (
  period_date DATE,
  balance NUMERIC
) AS $$
DECLARE
  fiscal_start_date DATE;
  fiscal_end_date DATE;
  interval_step INTERVAL;
  current_period_date DATE;
BEGIN
  -- 获取会计年度的起止日期
  SELECT start_date, end_date INTO fiscal_start_date, fiscal_end_date
  FROM fiscal_years
  WHERE id = fiscal_year_id_param;
  
  -- 设置间隔步长
  IF interval_type = 'day' THEN
    interval_step := INTERVAL '1 day';
  ELSIF interval_type = 'week' THEN
    interval_step := INTERVAL '1 week';
  ELSIF interval_type = 'month' THEN
    interval_step := INTERVAL '1 month';
  ELSIF interval_type = 'quarter' THEN
    interval_step := INTERVAL '3 months';
  ELSE
    interval_step := INTERVAL '1 month'; -- 默认为月
  END IF;
  
  -- 创建临时表存储结果
  CREATE TEMP TABLE IF NOT EXISTS temp_balance_history (
    period_date DATE,
    balance NUMERIC
  ) ON COMMIT DROP;
  
  -- 清空临时表
  DELETE FROM temp_balance_history;
  
  -- 计算每个周期的余额
  current_period_date := fiscal_start_date;
  WHILE current_period_date <= fiscal_end_date LOOP
    INSERT INTO temp_balance_history (period_date, balance)
    VALUES (
      current_period_date,
      get_account_balance(account_id_param, fiscal_year_id_param, current_period_date)
    );
    
    current_period_date := current_period_date + interval_step;
  END LOOP;
  
  -- 返回结果
  RETURN QUERY
  SELECT 
    tbh.period_date,
    tbh.balance
  FROM 
    temp_balance_history tbh
  ORDER BY 
    tbh.period_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
