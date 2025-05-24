-- Plaid 集成数据库函数
-- Created: 2025-05-23

-- 1. 创建银行连接
CREATE OR REPLACE FUNCTION create_bank_connection(
  workspace_id_param UUID,
  plaid_item_id_param TEXT,
  plaid_access_token_param TEXT,
  institution_id_param TEXT,
  institution_name_param TEXT
)
RETURNS UUID AS $$
DECLARE
  new_connection_id UUID;
BEGIN
  INSERT INTO bank_connections (
    workspace_id,
    plaid_item_id,
    plaid_access_token,
    institution_id,
    institution_name,
    status,
    last_synced_at
  )
  VALUES (
    workspace_id_param,
    plaid_item_id_param,
    plaid_access_token_param,
    institution_id_param,
    institution_name_param,
    'active',
    NOW()
  )
  RETURNING id INTO new_connection_id;
  
  RETURN new_connection_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 链接银行账户
CREATE OR REPLACE FUNCTION link_bank_account(
  connection_id_param UUID,
  plaid_account_id_param TEXT,
  account_name_param TEXT,
  official_name_param TEXT,
  account_type_param TEXT,
  account_subtype_param TEXT,
  mask_param TEXT,
  chart_id_param UUID,
  opening_balance_param NUMERIC(18,2) DEFAULT 0,
  currency_param CHAR(3) DEFAULT 'CAD'
)
RETURNS UUID AS $$
DECLARE
  workspace_id_val UUID;
  new_account_id UUID;
  new_link_id UUID;
BEGIN
  -- 获取工作空间ID
  SELECT workspace_id INTO workspace_id_val
  FROM bank_connections
  WHERE id = connection_id_param;
  
  -- 创建账户
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
    workspace_id_val,
    chart_id_param,
    account_name_param,
    official_name_param,
    opening_balance_param,
    currency_param,
    TRUE
  )
  RETURNING id INTO new_account_id;
  
  -- 创建账户链接
  INSERT INTO bank_account_links (
    connection_id,
    account_id,
    plaid_account_id,
    mask,
    official_name,
    type,
    subtype,
    sync_enabled
  )
  VALUES (
    connection_id_param,
    new_account_id,
    plaid_account_id_param,
    mask_param,
    official_name_param,
    account_type_param,
    account_subtype_param,
    TRUE
  )
  RETURNING id INTO new_link_id;
  
  -- 如果有期初余额，创建初始交易
  IF opening_balance_param <> 0 THEN
    PERFORM create_opening_balance_transaction(
      new_account_id,
      opening_balance_param,
      currency_param
    );
  END IF;
  
  RETURN new_account_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 创建期初余额交易
CREATE OR REPLACE FUNCTION create_opening_balance_transaction(
  account_id_param UUID,
  opening_balance_param NUMERIC(18,2),
  currency_param CHAR(3) DEFAULT 'CAD'
)
RETURNS UUID AS $$
DECLARE
  workspace_id_val UUID;
  new_transaction_id UUID;
  equity_account_id UUID;
  account_type_val TEXT;
BEGIN
  -- 获取工作空间ID和账户类型
  SELECT a.workspace_id, coa.type INTO workspace_id_val, account_type_val
  FROM accounts a
  JOIN chart_of_accounts coa ON a.chart_id = coa.id
  WHERE a.id = account_id_param;
  
  -- 找到权益账户（期初余额权益）
  SELECT id INTO equity_account_id
  FROM accounts
  WHERE workspace_id = workspace_id_val
    AND name = 'Opening Balance Equity'
    AND is_deleted = FALSE
  LIMIT 1;
  
  -- 如果没有权益账户，创建一个
  IF equity_account_id IS NULL THEN
    -- 找到权益类型的会计科目
    DECLARE
      equity_chart_id UUID;
    BEGIN
      SELECT id INTO equity_chart_id
      FROM chart_of_accounts
      WHERE workspace_id = workspace_id_val
        AND type = 'equity'
        AND is_deleted = FALSE
      LIMIT 1;
      
      -- 创建期初余额权益账户
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
        workspace_id_val,
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
  
  -- 创建期初余额交易
  INSERT INTO transactions (
    workspace_id,
    txn_date,
    reference,
    memo
  )
  VALUES (
    workspace_id_val,
    CURRENT_DATE,
    'Opening Balance',
    'Initial balance'
  )
  RETURNING id INTO new_transaction_id;
  
  -- 根据账户类型确定借贷方向
  -- 资产账户：借方为正，贷方为负
  -- 负债账户：借方为负，贷方为正
  IF account_type_val = 'asset' THEN
    -- 资产账户的期初余额
    INSERT INTO transaction_lines (
      transaction_id,
      account_id,
      amount,
      description
    )
    VALUES
    (
      new_transaction_id,
      account_id_param,
      opening_balance_param,
      'Opening Balance'
    ),
    (
      new_transaction_id,
      equity_account_id,
      -opening_balance_param,
      'Opening Balance Equity'
    );
  ELSE
    -- 负债账户的期初余额
    INSERT INTO transaction_lines (
      transaction_id,
      account_id,
      amount,
      description
    )
    VALUES
    (
      new_transaction_id,
      account_id_param,
      opening_balance_param,
      'Opening Balance'
    ),
    (
      new_transaction_id,
      equity_account_id,
      -opening_balance_param,
      'Opening Balance Equity'
    );
  END IF;
  
  RETURN new_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 获取银行连接
CREATE OR REPLACE FUNCTION get_bank_connections(workspace_id_param UUID)
RETURNS TABLE (
  id UUID,
  institution_id TEXT,
  institution_name TEXT,
  status TEXT,
  error TEXT,
  last_synced_at TIMESTAMPTZ,
  account_count INTEGER,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bc.id,
    bc.institution_id,
    bc.institution_name,
    bc.status,
    bc.error,
    bc.last_synced_at,
    COUNT(bal.id)::INTEGER AS account_count,
    bc.created_at
  FROM 
    bank_connections bc
  LEFT JOIN 
    bank_account_links bal ON bc.id = bal.connection_id AND bal.is_deleted = FALSE
  WHERE 
    bc.workspace_id = workspace_id_param
    AND bc.is_deleted = FALSE
  GROUP BY 
    bc.id
  ORDER BY 
    bc.institution_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 获取银行账户链接
CREATE OR REPLACE FUNCTION get_bank_account_links(connection_id_param UUID)
RETURNS TABLE (
  id UUID,
  account_id UUID,
  account_name TEXT,
  plaid_account_id TEXT,
  mask TEXT,
  official_name TEXT,
  type TEXT,
  subtype TEXT,
  sync_enabled BOOLEAN,
  current_balance NUMERIC(18,2),
  currency CHAR(3)
) AS $$
BEGIN
  RETURN QUERY
  WITH account_balances AS (
    SELECT 
      a.id,
      (a.opening_balance + COALESCE(SUM(tl.amount), 0)) AS balance
    FROM 
      accounts a
    LEFT JOIN 
      transaction_lines tl ON a.id = tl.account_id
    LEFT JOIN 
      transactions t ON tl.transaction_id = t.id AND t.is_deleted = FALSE
    WHERE 
      a.is_deleted = FALSE
    GROUP BY 
      a.id
  )
  SELECT 
    bal.id,
    bal.account_id,
    a.name AS account_name,
    bal.plaid_account_id,
    bal.mask,
    bal.official_name,
    bal.type,
    bal.subtype,
    bal.sync_enabled,
    COALESCE(ab.balance, a.opening_balance) AS current_balance,
    a.currency
  FROM 
    bank_account_links bal
  JOIN 
    accounts a ON bal.account_id = a.id
  LEFT JOIN 
    account_balances ab ON a.id = ab.id
  WHERE 
    bal.connection_id = connection_id_param
    AND bal.is_deleted = FALSE
  ORDER BY 
    a.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 导入银行交易
CREATE OR REPLACE FUNCTION import_bank_transaction(
  account_link_id_param UUID,
  plaid_transaction_id_param TEXT,
  amount_param NUMERIC(18,2),
  date_param DATE,
  name_param TEXT,
  merchant_name_param TEXT,
  pending_param BOOLEAN DEFAULT FALSE,
  category_id_param TEXT DEFAULT NULL,
  category_param TEXT[] DEFAULT NULL,
  location_param JSONB DEFAULT NULL,
  payment_meta_param JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_transaction_id UUID;
BEGIN
  -- 检查交易是否已存在
  IF EXISTS (
    SELECT 1 FROM bank_transactions 
    WHERE account_link_id = account_link_id_param 
      AND plaid_transaction_id = plaid_transaction_id_param
  ) THEN
    -- 更新现有交易
    UPDATE bank_transactions
    SET 
      amount = amount_param,
      date = date_param,
      name = name_param,
      merchant_name = merchant_name_param,
      pending = pending_param,
      category_id = category_id_param,
      category = category_param,
      location = location_param,
      payment_meta = payment_meta_param,
      updated_at = NOW()
    WHERE 
      account_link_id = account_link_id_param 
      AND plaid_transaction_id = plaid_transaction_id_param
    RETURNING id INTO new_transaction_id;
  ELSE
    -- 创建新交易
    INSERT INTO bank_transactions (
      account_link_id,
      plaid_transaction_id,
      amount,
      date,
      name,
      merchant_name,
      pending,
      category_id,
      category,
      location,
      payment_meta
    )
    VALUES (
      account_link_id_param,
      plaid_transaction_id_param,
      amount_param,
      date_param,
      name_param,
      merchant_name_param,
      pending_param,
      category_id_param,
      category_param,
      location_param,
      payment_meta_param
    )
    RETURNING id INTO new_transaction_id;
  END IF;
  
  RETURN new_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 获取未匹配的银行交易
CREATE OR REPLACE FUNCTION get_unmatched_bank_transactions(
  workspace_id_param UUID,
  limit_param INTEGER DEFAULT 50,
  offset_param INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  account_link_id UUID,
  account_id UUID,
  account_name TEXT,
  plaid_transaction_id TEXT,
  amount NUMERIC(18,2),
  date DATE,
  name TEXT,
  merchant_name TEXT,
  category TEXT[],
  imported_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bt.id,
    bt.account_link_id,
    bal.account_id,
    a.name AS account_name,
    bt.plaid_transaction_id,
    bt.amount,
    bt.date,
    bt.name,
    bt.merchant_name,
    bt.category,
    bt.imported_at
  FROM 
    bank_transactions bt
  JOIN 
    bank_account_links bal ON bt.account_link_id = bal.id
  JOIN 
    accounts a ON bal.account_id = a.id
  JOIN 
    bank_connections bc ON bal.connection_id = bc.id
  WHERE 
    bc.workspace_id = workspace_id_param
    AND bt.transaction_id IS NULL
    AND bt.is_deleted = FALSE
    AND NOT bt.pending
  ORDER BY 
    bt.date DESC, bt.imported_at DESC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. 匹配银行交易到会计交易
CREATE OR REPLACE FUNCTION match_bank_transaction(
  bank_transaction_id_param UUID,
  target_account_id_param UUID,
  description_param TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  bt RECORD;
  bal RECORD;
  a RECORD;
  new_transaction_id UUID;
  target_account_type TEXT;
BEGIN
  -- 获取银行交易信息
  SELECT 
    bt.*,
    bal.account_id,
    a.workspace_id,
    a.currency
  INTO bt
  FROM 
    bank_transactions bt
  JOIN 
    bank_account_links bal ON bt.account_link_id = bal.id
  JOIN 
    accounts a ON bal.account_id = a.id
  WHERE 
    bt.id = bank_transaction_id_param
    AND bt.transaction_id IS NULL;
  
  IF bt IS NULL THEN
    RAISE EXCEPTION 'Bank transaction not found or already matched';
  END IF;
  
  -- 获取目标账户类型
  SELECT coa.type INTO target_account_type
  FROM accounts a
  JOIN chart_of_accounts coa ON a.chart_id = coa.id
  WHERE a.id = target_account_id_param;
  
  -- 创建会计交易
  INSERT INTO transactions (
    workspace_id,
    txn_date,
    reference,
    memo
  )
  VALUES (
    bt.workspace_id,
    bt.date,
    'PLAID-' || bt.plaid_transaction_id,
    COALESCE(description_param, bt.merchant_name, bt.name)
  )
  RETURNING id INTO new_transaction_id;
  
  -- 创建交易行（双分录）
  INSERT INTO transaction_lines (
    transaction_id,
    account_id,
    amount,
    description
  )
  VALUES
  (
    new_transaction_id,
    bt.account_id,
    bt.amount,
    COALESCE(description_param, bt.merchant_name, bt.name)
  ),
  (
    new_transaction_id,
    target_account_id_param,
    -bt.amount,
    COALESCE(description_param, bt.merchant_name, bt.name)
  );
  
  -- 更新银行交易，标记为已匹配
  UPDATE bank_transactions
  SET 
    transaction_id = new_transaction_id,
    matched_at = NOW()
  WHERE 
    id = bank_transaction_id_param;
  
  RETURN new_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. 更新银行连接状态
CREATE OR REPLACE FUNCTION update_bank_connection_status(
  connection_id_param UUID,
  status_param TEXT,
  error_param TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE bank_connections
  SET 
    status = status_param,
    error = error_param,
    updated_at = NOW(),
    last_synced_at = CASE WHEN status_param = 'active' THEN NOW() ELSE last_synced_at END
  WHERE 
    id = connection_id_param;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. 删除银行连接（软删除）
CREATE OR REPLACE FUNCTION delete_bank_connection(connection_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- 标记银行连接为已删除
  UPDATE bank_connections
  SET 
    is_deleted = TRUE,
    updated_at = NOW()
  WHERE 
    id = connection_id_param;
  
  -- 标记关联的银行账户链接为已删除
  UPDATE bank_account_links
  SET 
    is_deleted = TRUE,
    updated_at = NOW()
  WHERE 
    connection_id = connection_id_param;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
