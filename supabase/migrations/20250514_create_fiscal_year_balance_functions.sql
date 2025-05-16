-- 创建获取账户在特定会计年度余额的函数
CREATE OR REPLACE FUNCTION get_account_balance(
  account_id_param UUID,
  fiscal_year_id_param UUID,
  as_of_date_param DATE DEFAULT NULL
)
RETURNS NUMERIC AS $$
DECLARE
  year_opening_balance NUMERIC;
  year_transactions_sum NUMERIC;
  fiscal_year_start_date DATE;
  fiscal_year_end_date DATE;
BEGIN
  -- 获取会计年度的起止日期
  SELECT start_date, end_date INTO fiscal_year_start_date, fiscal_year_end_date
  FROM fiscal_years
  WHERE id = fiscal_year_id_param;
  
  -- 获取年度期初余额
  SELECT opening_balance INTO year_opening_balance
  FROM account_year_balances
  WHERE account_id = account_id_param 
    AND fiscal_year_id = fiscal_year_id_param
    AND is_deleted = FALSE;
  
  -- 如果没有找到期初余额记录，默认为0
  IF year_opening_balance IS NULL THEN
    year_opening_balance := 0;
  END IF;
  
  -- 设置截止日期
  IF as_of_date_param IS NULL THEN
    as_of_date_param := fiscal_year_end_date;
  END IF;
  
  -- 确保截止日期在会计年度内
  IF as_of_date_param < fiscal_year_start_date THEN
    as_of_date_param := fiscal_year_start_date;
  ELSIF as_of_date_param > fiscal_year_end_date THEN
    as_of_date_param := fiscal_year_end_date;
  END IF;
  
  -- 计算当年交易总和
  SELECT COALESCE(SUM(tl.amount), 0) INTO year_transactions_sum
  FROM transaction_lines tl
  JOIN transactions t ON tl.transaction_id = t.id
  WHERE tl.account_id = account_id_param
    AND t.fiscal_year_id = fiscal_year_id_param
    AND t.txn_date <= as_of_date_param
    AND t.is_deleted = FALSE;
  
  -- 返回计算的余额
  RETURN year_opening_balance + year_transactions_sum;
END;
$$ LANGUAGE plpgsql;

-- 创建获取多个账户余额的函数
CREATE OR REPLACE FUNCTION get_accounts_balances(
  workspace_id_param UUID,
  fiscal_year_id_param UUID,
  as_of_date_param DATE DEFAULT NULL
)
RETURNS TABLE (
  account_id UUID,
  account_name TEXT,
  account_type TEXT,
  opening_balance NUMERIC,
  current_balance NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH account_transactions AS (
    SELECT 
      a.id AS account_id,
      a.name AS account_name,
      coa.type AS account_type,
      COALESCE(ayb.opening_balance, 0) AS opening_balance,
      COALESCE(SUM(tl.amount), 0) AS transactions_sum
    FROM 
      accounts a
    JOIN 
      chart_of_accounts coa ON a.chart_id = coa.id
    LEFT JOIN 
      account_year_balances ayb ON a.id = ayb.account_id 
                              AND ayb.fiscal_year_id = fiscal_year_id_param
                              AND ayb.is_deleted = FALSE
    LEFT JOIN 
      transaction_lines tl ON a.id = tl.account_id
    LEFT JOIN 
      transactions t ON tl.transaction_id = t.id 
                    AND t.fiscal_year_id = fiscal_year_id_param 
                    AND t.is_deleted = FALSE
                    AND (as_of_date_param IS NULL OR t.txn_date <= as_of_date_param)
    WHERE 
      a.workspace_id = workspace_id_param
      AND a.is_deleted = FALSE
    GROUP BY 
      a.id, a.name, coa.type, ayb.opening_balance
  )
  SELECT 
    at.account_id,
    at.account_name,
    at.account_type,
    at.opening_balance,
    (at.opening_balance + at.transactions_sum) AS current_balance
  FROM 
    account_transactions at
  ORDER BY 
    at.account_name;
END;
$$ LANGUAGE plpgsql;

-- 创建年度结转函数
CREATE OR REPLACE FUNCTION close_fiscal_year(
  workspace_id_param UUID,
  fiscal_year_id_param UUID,
  closed_by_param UUID
)
RETURNS UUID AS $$
DECLARE
  next_fiscal_year_id UUID;
  closing_entry_id UUID;
  retained_earnings_account_id UUID;
  current_fiscal_year RECORD;
  account_record RECORD;
  income_expense_net NUMERIC := 0;
  closing_date DATE;
BEGIN
  -- 获取当前会计年度信息
  SELECT * INTO current_fiscal_year
  FROM fiscal_years
  WHERE id = fiscal_year_id_param AND workspace_id = workspace_id_param;
  
  IF current_fiscal_year IS NULL THEN
    RAISE EXCEPTION 'Fiscal year not found';
  END IF;
  
  IF current_fiscal_year.status = 'closed' THEN
    RAISE EXCEPTION 'Fiscal year already closed';
  END IF;
  
  -- 设置结转日期为会计年度的最后一天
  closing_date := current_fiscal_year.end_date;
  
  -- 查找或创建下一个会计年度
  SELECT id INTO next_fiscal_year_id
  FROM fiscal_years
  WHERE workspace_id = workspace_id_param
    AND start_date = current_fiscal_year.end_date + INTERVAL '1 day'
  LIMIT 1;
  
  IF next_fiscal_year_id IS NULL THEN
    -- 创建新的会计年度
    INSERT INTO fiscal_years (
      workspace_id,
      name,
      start_date,
      end_date,
      status,
      is_current
    ) VALUES (
      workspace_id_param,
      current_fiscal_year.name || ' + 1',
      current_fiscal_year.end_date + INTERVAL '1 day',
      (current_fiscal_year.end_date + INTERVAL '1 year')::DATE,
      'active',
      TRUE
    )
    RETURNING id INTO next_fiscal_year_id;
    
    -- 将当前会计年度设为非当前
    UPDATE fiscal_years
    SET is_current = FALSE
    WHERE id = fiscal_year_id_param;
  END IF;
  
  -- 查找留存收益账户
  SELECT id INTO retained_earnings_account_id
  FROM accounts a
  JOIN chart_of_accounts coa ON a.chart_id = coa.id
  WHERE a.workspace_id = workspace_id_param
    AND a.name = 'Retained Earnings'
    AND coa.type = 'equity'
    AND a.is_deleted = FALSE
  LIMIT 1;
  
  -- 如果没有留存收益账户，创建一个
  IF retained_earnings_account_id IS NULL THEN
    -- 首先找到或创建equity类型的chart_of_accounts
    DECLARE
      equity_chart_id UUID;
    BEGIN
      SELECT id INTO equity_chart_id
      FROM chart_of_accounts
      WHERE workspace_id = workspace_id_param
        AND type = 'equity'
        AND name = 'Equity'
        AND is_deleted = FALSE
      LIMIT 1;
      
      IF equity_chart_id IS NULL THEN
        INSERT INTO chart_of_accounts (
          workspace_id,
          name,
          type,
          description
        ) VALUES (
          workspace_id_param,
          'Equity',
          'equity',
          'Equity accounts'
        )
        RETURNING id INTO equity_chart_id;
      END IF;
      
      -- 创建留存收益账户
      INSERT INTO accounts (
        workspace_id,
        chart_id,
        name,
        description
      ) VALUES (
        workspace_id_param,
        equity_chart_id,
        'Retained Earnings',
        'Account for accumulated earnings'
      )
      RETURNING id INTO retained_earnings_account_id;
    END;
  END IF;
  
  -- 创建结转交易
  INSERT INTO transactions (
    workspace_id,
    fiscal_year_id,
    txn_date,
    memo,
    reference,
    is_closing_entry
  ) VALUES (
    workspace_id_param,
    fiscal_year_id_param,
    closing_date,
    'Year-end closing entry',
    'CLOSING-' || TO_CHAR(closing_date, 'YYYY'),
    TRUE
  )
  RETURNING id INTO closing_entry_id;
  
  -- 处理每个账户的期末余额
  FOR account_record IN 
    SELECT 
      a.id, 
      a.name, 
      coa.type,
      get_account_balance(a.id, fiscal_year_id_param) AS ending_balance
    FROM 
      accounts a
    JOIN 
      chart_of_accounts coa ON a.chart_id = coa.id
    WHERE 
      a.workspace_id = workspace_id_param
      AND a.is_deleted = FALSE
  LOOP
    -- 更新或插入账户年度余额
    INSERT INTO account_year_balances (
      workspace_id,
      account_id,
      fiscal_year_id,
      opening_balance,
      closing_balance
    ) VALUES (
      workspace_id_param,
      account_record.id,
      fiscal_year_id_param,
      0, -- 如果之前没有设置期初余额，默认为0
      account_record.ending_balance
    )
    ON CONFLICT (account_id, fiscal_year_id) 
    DO UPDATE SET 
      closing_balance = account_record.ending_balance,
      updated_at = NOW();
    
    -- 为下一年度创建期初余额记录
    INSERT INTO account_year_balances (
      workspace_id,
      account_id,
      fiscal_year_id,
      opening_balance
    ) VALUES (
      workspace_id_param,
      account_record.id,
      next_fiscal_year_id,
      account_record.ending_balance
    )
    ON CONFLICT (account_id, fiscal_year_id) 
    DO UPDATE SET 
      opening_balance = account_record.ending_balance,
      updated_at = NOW();
    
    -- 累计收入和费用账户的净额，用于结转到留存收益
    IF account_record.type IN ('income', 'expense') THEN
      -- 收入增加留存收益，费用减少留存收益
      IF account_record.type = 'income' THEN
        income_expense_net := income_expense_net + account_record.ending_balance;
      ELSE
        income_expense_net := income_expense_net - account_record.ending_balance;
      END IF;
      
      -- 创建结转分录，将收入/费用账户余额清零
      IF account_record.ending_balance <> 0 THEN
        INSERT INTO transaction_lines (
          transaction_id,
          account_id,
          amount,
          description
        ) VALUES (
          closing_entry_id,
          account_record.id,
          -account_record.ending_balance, -- 反向金额，清零账户
          'Year-end closing - ' || account_record.name
        );
      END IF;
    END IF;
  END LOOP;
  
  -- 创建留存收益的结转分录
  IF income_expense_net <> 0 THEN
    INSERT INTO transaction_lines (
      transaction_id,
      account_id,
      amount,
      description
    ) VALUES (
      closing_entry_id,
      retained_earnings_account_id,
      income_expense_net, -- 收入和费用的净额转入留存收益
      'Year-end closing - Net income transfer to retained earnings'
    );
  END IF;
  
  -- 更新会计年度状态为已关闭
  UPDATE fiscal_years
  SET 
    status = 'closed',
    updated_at = NOW()
  WHERE id = fiscal_year_id_param;
  
  RETURN closing_entry_id;
END;
$$ LANGUAGE plpgsql;
