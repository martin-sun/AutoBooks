-- AutoBooks 综合数据库结构 - 第4部分：财务和会计相关函数
-- 生成日期: 2025-05-25
-- 此文件包含财务和会计相关的函数

-- 创建会计年度函数
CREATE OR REPLACE FUNCTION create_fiscal_year(
  p_workspace_id UUID,
  p_name TEXT,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_fiscal_year_id UUID;
BEGIN
  -- 验证用户有权限操作此工作空间
  IF NOT EXISTS (
    SELECT 1 FROM workspaces
    WHERE id = p_workspace_id AND (user_id = auth.uid() OR owner_id = auth.uid())
  ) THEN
    RAISE EXCEPTION 'You do not have permission to perform this action';
  END IF;
  
  -- 验证日期范围
  IF p_start_date >= p_end_date THEN
    RAISE EXCEPTION 'Start date must be before end date';
  END IF;
  
  -- 验证与现有会计年度不重叠
  IF EXISTS (
    SELECT 1 FROM fiscal_years
    WHERE workspace_id = p_workspace_id
    AND (
      (p_start_date BETWEEN start_date AND end_date) OR
      (p_end_date BETWEEN start_date AND end_date) OR
      (start_date BETWEEN p_start_date AND p_end_date) OR
      (end_date BETWEEN p_start_date AND p_end_date)
    )
  ) THEN
    RAISE EXCEPTION 'New fiscal year overlaps with existing fiscal years';
  END IF;
  
  -- 创建会计年度
  INSERT INTO fiscal_years (workspace_id, name, start_date, end_date, created_by)
  VALUES (p_workspace_id, p_name, p_start_date, p_end_date, auth.uid())
  RETURNING id INTO v_fiscal_year_id;
  
  RETURN v_fiscal_year_id;
END;
$$;

-- 关闭会计年度函数
CREATE OR REPLACE FUNCTION close_fiscal_year(
  p_fiscal_year_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_workspace_id UUID;
  v_next_year_start DATE;
  v_next_year_end DATE;
  v_next_year_name TEXT;
  v_next_year_id UUID;
BEGIN
  -- 获取会计年度信息
  SELECT workspace_id, end_date + INTERVAL '1 day', name
  INTO v_workspace_id, v_next_year_start, v_next_year_name
  FROM fiscal_years
  WHERE id = p_fiscal_year_id;
  
  -- 验证用户有权限操作此工作空间
  IF NOT EXISTS (
    SELECT 1 FROM workspaces
    WHERE id = v_workspace_id AND (user_id = auth.uid() OR owner_id = auth.uid())
  ) THEN
    RAISE EXCEPTION 'You do not have permission to perform this action';
  END IF;
  
  -- 验证会计年度未关闭
  IF EXISTS (
    SELECT 1 FROM fiscal_years
    WHERE id = p_fiscal_year_id AND is_closed = TRUE
  ) THEN
    RAISE EXCEPTION 'Fiscal year is already closed';
  END IF;
  
  -- 计算下一个会计年度的结束日期
  SELECT (v_next_year_start + INTERVAL '1 year' - INTERVAL '1 day') INTO v_next_year_end;
  
  -- 尝试解析年份并增加
  BEGIN
    v_next_year_name := (v_next_year_name::INTEGER + 1)::TEXT;
  EXCEPTION WHEN OTHERS THEN
    v_next_year_name := v_next_year_name || ' (Next)';
  END;
  
  -- 创建下一个会计年度
  INSERT INTO fiscal_years (workspace_id, name, start_date, end_date, created_by)
  VALUES (v_workspace_id, v_next_year_name, v_next_year_start, v_next_year_end, auth.uid())
  RETURNING id INTO v_next_year_id;
  
  -- 计算并更新所有账户的期末余额
  UPDATE account_year_balances
  SET 
    closing_balance = current_balance,
    is_closed = TRUE,
    updated_at = NOW()
  WHERE fiscal_year_id = p_fiscal_year_id;
  
  -- 为下一个会计年度创建期初余额
  INSERT INTO account_year_balances (
    workspace_id, account_id, fiscal_year_id, opening_balance, current_balance
  )
  SELECT 
    workspace_id, account_id, v_next_year_id, closing_balance, closing_balance
  FROM 
    account_year_balances
  WHERE 
    fiscal_year_id = p_fiscal_year_id;
  
  -- 关闭会计年度
  UPDATE fiscal_years
  SET 
    is_closed = TRUE,
    closed_by = auth.uid(),
    closed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_fiscal_year_id;
  
  RETURN TRUE;
END;
$$;

-- 获取账户余额函数
CREATE OR REPLACE FUNCTION get_account_balance(
  p_account_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS NUMERIC
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_workspace_id UUID;
  v_fiscal_year_id UUID;
  v_opening_balance NUMERIC;
  v_transaction_total NUMERIC;
  v_current_balance NUMERIC;
BEGIN
  -- 获取账户所属的工作空间
  SELECT workspace_id INTO v_workspace_id
  FROM accounts
  WHERE id = p_account_id;
  
  -- 验证用户有权限查看此账户
  IF NOT EXISTS (
    SELECT 1 FROM workspaces
    WHERE id = v_workspace_id AND (user_id = auth.uid() OR owner_id = auth.uid())
  ) THEN
    RAISE EXCEPTION 'You do not have permission to view this account';
  END IF;
  
  -- 获取包含指定日期的会计年度
  SELECT id INTO v_fiscal_year_id
  FROM fiscal_years
  WHERE workspace_id = v_workspace_id
  AND p_date BETWEEN start_date AND end_date;
  
  IF v_fiscal_year_id IS NULL THEN
    RAISE EXCEPTION 'No fiscal year found for the specified date';
  END IF;
  
  -- 获取账户在该会计年度的期初余额
  SELECT opening_balance INTO v_opening_balance
  FROM account_year_balances
  WHERE account_id = p_account_id
  AND fiscal_year_id = v_fiscal_year_id;
  
  -- 如果没有期初余额记录，则创建一个
  IF v_opening_balance IS NULL THEN
    v_opening_balance := 0;
    
    INSERT INTO account_year_balances (
      workspace_id, account_id, fiscal_year_id, opening_balance, current_balance
    )
    VALUES (
      v_workspace_id, p_account_id, v_fiscal_year_id, 0, 0
    );
  END IF;
  
  -- 计算截至指定日期的交易总额
  SELECT COALESCE(SUM(amount), 0) INTO v_transaction_total
  FROM transaction_lines tl
  JOIN transactions t ON tl.transaction_id = t.id
  WHERE tl.account_id = p_account_id
  AND t.fiscal_year_id = v_fiscal_year_id
  AND t.txn_date <= p_date
  AND t.status != 'void'
  AND t.is_deleted = FALSE;
  
  -- 计算当前余额
  v_current_balance := v_opening_balance + v_transaction_total;
  
  -- 更新账户年度余额表
  UPDATE account_year_balances
  SET current_balance = v_current_balance
  WHERE account_id = p_account_id
  AND fiscal_year_id = v_fiscal_year_id;
  
  RETURN v_current_balance;
END;
$$;

-- 创建交易函数
CREATE OR REPLACE FUNCTION create_transaction(
  p_workspace_id UUID,
  p_txn_date DATE,
  p_description TEXT,
  p_reference TEXT,
  p_notes TEXT,
  p_status TEXT DEFAULT 'posted',
  p_lines JSONB
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_transaction_id UUID;
  v_fiscal_year_id UUID;
  v_line JSONB;
  v_total NUMERIC := 0;
BEGIN
  -- 验证用户有权限操作此工作空间
  IF NOT EXISTS (
    SELECT 1 FROM workspaces
    WHERE id = p_workspace_id AND (user_id = auth.uid() OR owner_id = auth.uid())
  ) THEN
    RAISE EXCEPTION 'You do not have permission to perform this action';
  END IF;
  
  -- 验证交易状态
  IF p_status NOT IN ('draft', 'posted', 'reconciled', 'void') THEN
    RAISE EXCEPTION 'Invalid transaction status';
  END IF;
  
  -- 获取包含交易日期的会计年度
  SELECT id INTO v_fiscal_year_id
  FROM fiscal_years
  WHERE workspace_id = p_workspace_id
  AND p_txn_date BETWEEN start_date AND end_date;
  
  IF v_fiscal_year_id IS NULL THEN
    RAISE EXCEPTION 'No fiscal year found for the transaction date';
  END IF;
  
  -- 验证会计年度未关闭
  IF EXISTS (
    SELECT 1 FROM fiscal_years
    WHERE id = v_fiscal_year_id AND is_closed = TRUE
  ) THEN
    RAISE EXCEPTION 'Cannot create transaction in a closed fiscal year';
  END IF;
  
  -- 创建交易
  INSERT INTO transactions (
    workspace_id, txn_date, description, reference, notes, status, created_by, fiscal_year_id
  )
  VALUES (
    p_workspace_id, p_txn_date, p_description, p_reference, p_notes, p_status, auth.uid(), v_fiscal_year_id
  )
  RETURNING id INTO v_transaction_id;
  
  -- 添加交易明细
  FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines)
  LOOP
    -- 验证账户属于同一工作空间
    IF NOT EXISTS (
      SELECT 1 FROM accounts
      WHERE id = (v_line->>'account_id')::UUID
      AND workspace_id = p_workspace_id
    ) THEN
      RAISE EXCEPTION 'Account does not belong to this workspace';
    END IF;
    
    -- 添加交易明细
    INSERT INTO transaction_lines (
      transaction_id, account_id, description, amount
    )
    VALUES (
      v_transaction_id,
      (v_line->>'account_id')::UUID,
      v_line->>'description',
      (v_line->>'amount')::NUMERIC
    );
    
    -- 累计总额
    v_total := v_total + (v_line->>'amount')::NUMERIC;
  END LOOP;
  
  -- 验证交易平衡（借贷方相等）
  IF ABS(v_total) > 0.01 THEN
    RAISE EXCEPTION 'Transaction is not balanced. Total: %', v_total;
  END IF;
  
  RETURN v_transaction_id;
END;
$$;

-- 获取资产负债表函数
CREATE OR REPLACE FUNCTION get_balance_sheet(
  p_workspace_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  account_type TEXT,
  account_group TEXT,
  account_name TEXT,
  account_id UUID,
  balance NUMERIC
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_fiscal_year_id UUID;
BEGIN
  -- 验证用户有权限操作此工作空间
  IF NOT EXISTS (
    SELECT 1 FROM workspaces
    WHERE id = p_workspace_id AND (user_id = auth.uid() OR owner_id = auth.uid())
  ) THEN
    RAISE EXCEPTION 'You do not have permission to perform this action';
  END IF;
  
  -- 获取包含指定日期的会计年度
  SELECT id INTO v_fiscal_year_id
  FROM fiscal_years
  WHERE workspace_id = p_workspace_id
  AND p_date BETWEEN start_date AND end_date;
  
  IF v_fiscal_year_id IS NULL THEN
    RAISE EXCEPTION 'No fiscal year found for the specified date';
  END IF;
  
  RETURN QUERY
  WITH account_balances AS (
    -- 获取期初余额
    SELECT 
      a.id AS account_id,
      coa.type AS account_type,
      ag.name AS account_group,
      a.name AS account_name,
      COALESCE(ayb.opening_balance, 0) AS opening_balance,
      COALESCE((
        SELECT SUM(tl.amount)
        FROM transaction_lines tl
        JOIN transactions t ON tl.transaction_id = t.id
        WHERE tl.account_id = a.id
        AND t.fiscal_year_id = v_fiscal_year_id
        AND t.txn_date <= p_date
        AND t.status != 'void'
        AND t.is_deleted = FALSE
      ), 0) AS transaction_total
    FROM accounts a
    JOIN chart_of_accounts coa ON a.chart_id = coa.id
    LEFT JOIN account_groups ag ON coa.type = ag.account_type AND ag.workspace_id = p_workspace_id
    LEFT JOIN account_year_balances ayb ON a.id = ayb.account_id AND ayb.fiscal_year_id = v_fiscal_year_id
    WHERE a.workspace_id = p_workspace_id
    AND a.is_deleted = FALSE
    AND coa.type IN ('asset', 'liability', 'equity')
  )
  SELECT 
    account_type,
    account_group,
    account_name,
    account_id,
    (opening_balance + transaction_total) AS balance
  FROM account_balances
  ORDER BY account_type, account_group, account_name;
END;
$$;

-- 获取利润表函数
CREATE OR REPLACE FUNCTION get_income_statement(
  p_workspace_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  account_type TEXT,
  account_group TEXT,
  account_name TEXT,
  account_id UUID,
  amount NUMERIC
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  -- 验证用户有权限操作此工作空间
  IF NOT EXISTS (
    SELECT 1 FROM workspaces
    WHERE id = p_workspace_id AND (user_id = auth.uid() OR owner_id = auth.uid())
  ) THEN
    RAISE EXCEPTION 'You do not have permission to perform this action';
  END IF;
  
  RETURN QUERY
  SELECT 
    coa.type AS account_type,
    ag.name AS account_group,
    a.name AS account_name,
    a.id AS account_id,
    COALESCE(SUM(tl.amount), 0) AS amount
  FROM accounts a
  JOIN chart_of_accounts coa ON a.chart_id = coa.id
  LEFT JOIN account_groups ag ON coa.type = ag.account_type AND ag.workspace_id = p_workspace_id
  LEFT JOIN transaction_lines tl ON a.id = tl.account_id
  LEFT JOIN transactions t ON tl.transaction_id = t.id
  WHERE a.workspace_id = p_workspace_id
  AND a.is_deleted = FALSE
  AND coa.type IN ('income', 'expense')
  AND (t.id IS NULL OR (
    t.workspace_id = p_workspace_id
    AND t.txn_date BETWEEN p_start_date AND p_end_date
    AND t.status != 'void'
    AND t.is_deleted = FALSE
  ))
  GROUP BY coa.type, ag.name, a.name, a.id
  ORDER BY coa.type, ag.name, a.name;
END;
$$;

-- 创建银行账户函数
CREATE OR REPLACE FUNCTION create_bank_account(
  p_workspace_id UUID,
  p_name TEXT,
  p_chart_id UUID,
  p_currency TEXT DEFAULT 'CAD',
  p_institution TEXT DEFAULT NULL,
  p_account_number TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_opening_balance NUMERIC DEFAULT 0,
  p_opening_balance_date DATE DEFAULT CURRENT_DATE
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_account_id UUID;
  v_fiscal_year_id UUID;
  v_transaction_id UUID;
  v_equity_account_id UUID;
  v_account_type TEXT;
BEGIN
  -- 验证用户有权限操作此工作空间
  IF NOT EXISTS (
    SELECT 1 FROM workspaces
    WHERE id = p_workspace_id AND (user_id = auth.uid() OR owner_id = auth.uid())
  ) THEN
    RAISE EXCEPTION 'You do not have permission to perform this action';
  END IF;
  
  -- 验证科目属于同一工作空间
  IF NOT EXISTS (
    SELECT 1 FROM chart_of_accounts
    WHERE id = p_chart_id
    AND workspace_id = p_workspace_id
  ) THEN
    RAISE EXCEPTION 'Chart of account does not belong to this workspace';
  END IF;
  
  -- 获取科目类型
  SELECT type INTO v_account_type
  FROM chart_of_accounts
  WHERE id = p_chart_id;
  
  -- 验证科目类型是资产或负债
  IF v_account_type NOT IN ('asset', 'liability') THEN
    RAISE EXCEPTION 'Bank account must be linked to an asset or liability account type';
  END IF;
  
  -- 获取包含开户日期的会计年度
  SELECT id INTO v_fiscal_year_id
  FROM fiscal_years
  WHERE workspace_id = p_workspace_id
  AND p_opening_balance_date BETWEEN start_date AND end_date;
  
  IF v_fiscal_year_id IS NULL THEN
    RAISE EXCEPTION 'No fiscal year found for the opening balance date';
  END IF;
  
  -- 创建账户
  INSERT INTO accounts (
    workspace_id, chart_id, name, currency, institution, account_number, notes,
    opening_balance, opening_balance_date
  )
  VALUES (
    p_workspace_id, p_chart_id, p_name, p_currency, p_institution, p_account_number, p_notes,
    p_opening_balance, p_opening_balance_date
  )
  RETURNING id INTO v_account_id;
  
  -- 创建账户年度余额记录
  INSERT INTO account_year_balances (
    workspace_id, account_id, fiscal_year_id, opening_balance, current_balance
  )
  VALUES (
    p_workspace_id, v_account_id, v_fiscal_year_id, p_opening_balance, p_opening_balance
  );
  
  -- 如果有开户余额，创建开户余额交易
  IF p_opening_balance != 0 THEN
    -- 获取权益账户（留存收益或所有者权益）
    SELECT id INTO v_equity_account_id
    FROM accounts
    WHERE workspace_id = p_workspace_id
    AND chart_id IN (
      SELECT id FROM chart_of_accounts
      WHERE workspace_id = p_workspace_id
      AND type = 'equity'
      AND name LIKE '%Retained Earnings%'
      LIMIT 1
    )
    LIMIT 1;
    
    -- 如果找不到权益账户，使用第一个权益账户
    IF v_equity_account_id IS NULL THEN
      SELECT id INTO v_equity_account_id
      FROM accounts
      WHERE workspace_id = p_workspace_id
      AND chart_id IN (
        SELECT id FROM chart_of_accounts
        WHERE workspace_id = p_workspace_id
        AND type = 'equity'
        LIMIT 1
      )
      LIMIT 1;
    END IF;
    
    -- 创建开户余额交易
    IF v_account_type = 'asset' THEN
      -- 资产账户：借方为账户，贷方为权益
      INSERT INTO transactions (
        workspace_id, txn_date, description, status, created_by, fiscal_year_id
      )
      VALUES (
        p_workspace_id, p_opening_balance_date, 'Opening Balance - ' || p_name, 'posted', auth.uid(), v_fiscal_year_id
      )
      RETURNING id INTO v_transaction_id;
      
      -- 添加交易明细
      INSERT INTO transaction_lines (transaction_id, account_id, description, amount)
      VALUES (v_transaction_id, v_account_id, 'Opening Balance', p_opening_balance);
      
      INSERT INTO transaction_lines (transaction_id, account_id, description, amount)
      VALUES (v_transaction_id, v_equity_account_id, 'Opening Balance', -p_opening_balance);
    ELSE
      -- 负债账户：借方为权益，贷方为账户
      INSERT INTO transactions (
        workspace_id, txn_date, description, status, created_by, fiscal_year_id
      )
      VALUES (
        p_workspace_id, p_opening_balance_date, 'Opening Balance - ' || p_name, 'posted', auth.uid(), v_fiscal_year_id
      )
      RETURNING id INTO v_transaction_id;
      
      -- 添加交易明细
      INSERT INTO transaction_lines (transaction_id, account_id, description, amount)
      VALUES (v_transaction_id, v_account_id, 'Opening Balance', -p_opening_balance);
      
      INSERT INTO transaction_lines (transaction_id, account_id, description, amount)
      VALUES (v_transaction_id, v_equity_account_id, 'Opening Balance', p_opening_balance);
    END IF;
  END IF;
  
  RETURN v_account_id;
END;
$$;

-- 获取银行账户列表函数
CREATE OR REPLACE FUNCTION get_bank_accounts(
  p_workspace_id UUID
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  account_type TEXT,
  currency TEXT,
  institution TEXT,
  account_number TEXT,
  current_balance NUMERIC,
  last_reconciled_date DATE
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  -- 验证用户有权限操作此工作空间
  IF NOT EXISTS (
    SELECT 1 FROM workspaces
    WHERE id = p_workspace_id AND (user_id = auth.uid() OR owner_id = auth.uid())
  ) THEN
    RAISE EXCEPTION 'You do not have permission to perform this action';
  END IF;
  
  RETURN QUERY
  SELECT 
    a.id,
    a.name,
    coa.type AS account_type,
    a.currency,
    a.institution,
    a.account_number,
    COALESCE((
      SELECT current_balance
      FROM account_year_balances
      WHERE account_id = a.id
      ORDER BY fiscal_year_id DESC
      LIMIT 1
    ), 0) AS current_balance,
    a.last_reconciled_date
  FROM accounts a
  JOIN chart_of_accounts coa ON a.chart_id = coa.id
  WHERE a.workspace_id = p_workspace_id
  AND a.is_deleted = FALSE
  AND a.is_active = TRUE
  AND coa.is_payment = TRUE
  ORDER BY a.name;
END;
$$;
