-- AutoBooks 综合数据库结构 - 第5部分：资产管理和发票相关函数
-- 生成日期: 2025-05-25
-- 此文件包含资产管理和发票相关的函数

-- 资产管理函数
-- 创建资产函数
CREATE OR REPLACE FUNCTION create_asset(
  p_workspace_id UUID,
  p_name TEXT,
  p_category_id UUID,
  p_account_id UUID,
  p_purchase_date DATE,
  p_purchase_price NUMERIC,
  p_description TEXT DEFAULT NULL,
  p_depreciation_method TEXT DEFAULT 'straight_line',
  p_useful_life_years INTEGER DEFAULT NULL,
  p_salvage_value NUMERIC DEFAULT 0,
  p_depreciation_rate NUMERIC DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_asset_id UUID;
  v_transaction_id UUID;
  v_fiscal_year_id UUID;
  v_expense_account_id UUID;
BEGIN
  -- 验证用户有权限操作此工作空间
  IF NOT EXISTS (
    SELECT 1 FROM workspaces
    WHERE id = p_workspace_id AND (user_id = auth.uid() OR owner_id = auth.uid())
  ) THEN
    RAISE EXCEPTION 'You do not have permission to perform this action';
  END IF;
  
  -- 验证账户属于同一工作空间
  IF NOT EXISTS (
    SELECT 1 FROM accounts
    WHERE id = p_account_id
    AND workspace_id = p_workspace_id
  ) THEN
    RAISE EXCEPTION 'Account does not belong to this workspace';
  END IF;
  
  -- 验证折旧方法
  IF p_depreciation_method NOT IN ('straight_line', 'declining_balance', 'none') THEN
    RAISE EXCEPTION 'Invalid depreciation method';
  END IF;
  
  -- 如果使用折旧，验证必要的参数
  IF p_depreciation_method != 'none' THEN
    IF p_useful_life_years IS NULL OR p_useful_life_years <= 0 THEN
      RAISE EXCEPTION 'Useful life years must be provided for depreciation';
    END IF;
    
    IF p_depreciation_method = 'declining_balance' AND (p_depreciation_rate IS NULL OR p_depreciation_rate <= 0) THEN
      RAISE EXCEPTION 'Depreciation rate must be provided for declining balance method';
    END IF;
  END IF;
  
  -- 获取包含购买日期的会计年度
  SELECT id INTO v_fiscal_year_id
  FROM fiscal_years
  WHERE workspace_id = p_workspace_id
  AND p_purchase_date BETWEEN start_date AND end_date;
  
  IF v_fiscal_year_id IS NULL THEN
    RAISE EXCEPTION 'No fiscal year found for the purchase date';
  END IF;
  
  -- 创建资产
  INSERT INTO assets (
    workspace_id, name, description, category_id, account_id,
    purchase_date, purchase_price, current_value, depreciation_method,
    useful_life_years, salvage_value, depreciation_rate, notes,
    created_by
  )
  VALUES (
    p_workspace_id, p_name, p_description, p_category_id, p_account_id,
    p_purchase_date, p_purchase_price, p_purchase_price, p_depreciation_method,
    p_useful_life_years, p_salvage_value, p_depreciation_rate, p_notes,
    auth.uid()
  )
  RETURNING id INTO v_asset_id;
  
  -- 创建资产购买交易
  INSERT INTO asset_transactions (
    asset_id, transaction_type, amount, transaction_date, notes
  )
  VALUES (
    v_asset_id, 'purchase', p_purchase_price, p_purchase_date, 'Initial purchase'
  );
  
  -- 如果提供了账户ID，创建会计交易
  IF p_account_id IS NOT NULL AND p_purchase_price > 0 THEN
    -- 获取折旧费用账户
    SELECT id INTO v_expense_account_id
    FROM accounts
    WHERE workspace_id = p_workspace_id
    AND chart_id IN (
      SELECT id FROM chart_of_accounts
      WHERE workspace_id = p_workspace_id
      AND type = 'expense'
      AND name LIKE '%Depreciation%'
      LIMIT 1
    )
    LIMIT 1;
    
    -- 创建资产购买交易
    INSERT INTO transactions (
      workspace_id, txn_date, description, status, created_by, fiscal_year_id
    )
    VALUES (
      p_workspace_id, p_purchase_date, 'Asset Purchase - ' || p_name, 'posted', auth.uid(), v_fiscal_year_id
    )
    RETURNING id INTO v_transaction_id;
    
    -- 添加交易明细
    INSERT INTO transaction_lines (transaction_id, account_id, description, amount)
    VALUES (v_transaction_id, p_account_id, 'Asset Purchase', p_purchase_price);
    
    -- 如果找到了折旧费用账户，添加折旧明细
    IF v_expense_account_id IS NOT NULL AND p_depreciation_method != 'none' THEN
      INSERT INTO transaction_lines (transaction_id, account_id, description, amount)
      VALUES (v_transaction_id, v_expense_account_id, 'Asset Depreciation Setup', -p_purchase_price);
    END IF;
  END IF;
  
  RETURN v_asset_id;
END;
$$;

-- 计算资产折旧函数
CREATE OR REPLACE FUNCTION calculate_asset_depreciation(
  p_asset_id UUID,
  p_date DATE
)
RETURNS NUMERIC
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_asset RECORD;
  v_depreciation_amount NUMERIC := 0;
  v_months_owned INTEGER;
  v_monthly_depreciation NUMERIC;
BEGIN
  -- 获取资产详情
  SELECT * INTO v_asset FROM assets WHERE id = p_asset_id;
  
  -- 如果没有折旧方法或设置为'none'，返回0
  IF v_asset.depreciation_method IS NULL OR v_asset.depreciation_method = 'none' THEN
    RETURN 0;
  END IF;
  
  -- 计算拥有月数
  v_months_owned := EXTRACT(YEAR FROM AGE(p_date, v_asset.purchase_date)) * 12 +
                    EXTRACT(MONTH FROM AGE(p_date, v_asset.purchase_date));
  
  -- 如果资产尚未购买或已超过使用寿命，返回0
  IF v_months_owned <= 0 OR (v_asset.useful_life_years IS NOT NULL AND v_months_owned > v_asset.useful_life_years * 12) THEN
    RETURN 0;
  END IF;
  
  -- 根据折旧方法计算折旧金额
  IF v_asset.depreciation_method = 'straight_line' THEN
    -- 直线法：(购买价格 - 残值) / 使用寿命(月)
    v_monthly_depreciation := (v_asset.purchase_price - v_asset.salvage_value) / (v_asset.useful_life_years * 12);
    v_depreciation_amount := v_monthly_depreciation * v_months_owned;
    
    -- 确保折旧不超过(购买价格 - 残值)
    IF v_depreciation_amount > (v_asset.purchase_price - v_asset.salvage_value) THEN
      v_depreciation_amount := v_asset.purchase_price - v_asset.salvage_value;
    END IF;
  ELSIF v_asset.depreciation_method = 'declining_balance' THEN
    -- 余额递减法：购买价格 * (1 - (1 - 折旧率)^(月数/12))
    v_depreciation_amount := v_asset.purchase_price * (1 - POWER(1 - v_asset.depreciation_rate/100, v_months_owned/12.0));
    
    -- 确保折旧不超过(购买价格 - 残值)
    IF v_depreciation_amount > (v_asset.purchase_price - v_asset.salvage_value) THEN
      v_depreciation_amount := v_asset.purchase_price - v_asset.salvage_value;
    END IF;
  END IF;
  
  RETURN v_depreciation_amount;
END;
$$;

-- 记录资产折旧函数
CREATE OR REPLACE FUNCTION record_asset_depreciation(
  p_asset_id UUID,
  p_date DATE,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_asset RECORD;
  v_depreciation_amount NUMERIC;
  v_current_value NUMERIC;
  v_transaction_id UUID;
  v_asset_transaction_id UUID;
  v_fiscal_year_id UUID;
  v_asset_account_id UUID;
  v_expense_account_id UUID;
BEGIN
  -- 获取资产详情
  SELECT * INTO v_asset FROM assets WHERE id = p_asset_id;
  
  -- 验证用户有权限操作此工作空间
  IF NOT EXISTS (
    SELECT 1 FROM workspaces
    WHERE id = v_asset.workspace_id AND (user_id = auth.uid() OR owner_id = auth.uid())
  ) THEN
    RAISE EXCEPTION 'You do not have permission to perform this action';
  END IF;
  
  -- 计算折旧金额
  v_depreciation_amount := calculate_asset_depreciation(p_asset_id, p_date);
  
  -- 如果没有折旧，返回NULL
  IF v_depreciation_amount <= 0 THEN
    RETURN NULL;
  END IF;
  
  -- 计算当前价值
  v_current_value := v_asset.purchase_price - v_depreciation_amount;
  IF v_current_value < v_asset.salvage_value THEN
    v_current_value := v_asset.salvage_value;
  END IF;
  
  -- 获取包含折旧日期的会计年度
  SELECT id INTO v_fiscal_year_id
  FROM fiscal_years
  WHERE workspace_id = v_asset.workspace_id
  AND p_date BETWEEN start_date AND end_date;
  
  IF v_fiscal_year_id IS NULL THEN
    RAISE EXCEPTION 'No fiscal year found for the depreciation date';
  END IF;
  
  -- 更新资产当前价值
  UPDATE assets
  SET 
    current_value = v_current_value,
    last_valuation_date = p_date,
    updated_at = NOW(),
    updated_by = auth.uid()
  WHERE id = p_asset_id;
  
  -- 创建资产折旧交易记录
  INSERT INTO asset_transactions (
    asset_id, transaction_type, amount, transaction_date, notes
  )
  VALUES (
    p_asset_id, 'depreciation', v_depreciation_amount, p_date, COALESCE(p_notes, 'Depreciation as of ' || p_date)
  )
  RETURNING id INTO v_asset_transaction_id;
  
  -- 获取资产账户和折旧费用账户
  SELECT account_id INTO v_asset_account_id FROM assets WHERE id = p_asset_id;
  
  SELECT id INTO v_expense_account_id
  FROM accounts
  WHERE workspace_id = v_asset.workspace_id
  AND chart_id IN (
    SELECT id FROM chart_of_accounts
    WHERE workspace_id = v_asset.workspace_id
    AND type = 'expense'
    AND name LIKE '%Depreciation%'
    LIMIT 1
  )
  LIMIT 1;
  
  -- 如果找到了必要的账户，创建会计交易
  IF v_asset_account_id IS NOT NULL AND v_expense_account_id IS NOT NULL THEN
    -- 创建折旧交易
    INSERT INTO transactions (
      workspace_id, txn_date, description, status, created_by, fiscal_year_id
    )
    VALUES (
      v_asset.workspace_id, p_date, 'Asset Depreciation - ' || v_asset.name, 'posted', auth.uid(), v_fiscal_year_id
    )
    RETURNING id INTO v_transaction_id;
    
    -- 添加交易明细
    INSERT INTO transaction_lines (transaction_id, account_id, description, amount)
    VALUES (v_transaction_id, v_expense_account_id, 'Depreciation Expense', v_depreciation_amount);
    
    INSERT INTO transaction_lines (transaction_id, account_id, description, amount)
    VALUES (v_transaction_id, v_asset_account_id, 'Asset Value Reduction', -v_depreciation_amount);
    
    -- 关联资产交易和会计交易
    UPDATE asset_transactions
    SET transaction_id = v_transaction_id
    WHERE id = v_asset_transaction_id;
  END IF;
  
  RETURN v_asset_transaction_id;
END;
$$;

-- 获取资产列表函数
CREATE OR REPLACE FUNCTION get_assets(
  p_workspace_id UUID
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  category_name TEXT,
  purchase_date DATE,
  purchase_price NUMERIC,
  current_value NUMERIC,
  depreciation_method TEXT,
  useful_life_years INTEGER,
  status TEXT
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
    ac.name AS category_name,
    a.purchase_date,
    a.purchase_price,
    a.current_value,
    a.depreciation_method,
    a.useful_life_years,
    a.status
  FROM assets a
  LEFT JOIN asset_categories ac ON a.category_id = ac.id
  WHERE a.workspace_id = p_workspace_id
  ORDER BY a.name;
END;
$$;

-- 发票相关函数
-- 创建发票函数
CREATE OR REPLACE FUNCTION create_invoice(
  p_workspace_id UUID,
  p_customer_id UUID,
  p_issue_date DATE,
  p_due_date DATE,
  p_invoice_number TEXT,
  p_notes TEXT DEFAULT NULL,
  p_terms TEXT DEFAULT NULL,
  p_template_id UUID DEFAULT NULL,
  p_lines JSONB
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_invoice_id UUID;
  v_line JSONB;
  v_subtotal NUMERIC := 0;
  v_tax_amount NUMERIC := 0;
  v_discount_amount NUMERIC := 0;
  v_total_amount NUMERIC := 0;
  v_line_total NUMERIC;
  v_tax_rate NUMERIC;
  v_tax_id UUID;
BEGIN
  -- 验证用户有权限操作此工作空间
  IF NOT EXISTS (
    SELECT 1 FROM workspaces
    WHERE id = p_workspace_id AND (user_id = auth.uid() OR owner_id = auth.uid())
  ) THEN
    RAISE EXCEPTION 'You do not have permission to perform this action';
  END IF;
  
  -- 验证客户属于同一工作空间
  IF p_customer_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM customers
    WHERE id = p_customer_id
    AND workspace_id = p_workspace_id
  ) THEN
    RAISE EXCEPTION 'Customer does not belong to this workspace';
  END IF;
  
  -- 验证发票号码唯一性
  IF EXISTS (
    SELECT 1 FROM invoices
    WHERE workspace_id = p_workspace_id
    AND invoice_number = p_invoice_number
  ) THEN
    RAISE EXCEPTION 'Invoice number already exists';
  END IF;
  
  -- 验证模板属于同一工作空间
  IF p_template_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM invoice_templates
    WHERE id = p_template_id
    AND workspace_id = p_workspace_id
  ) THEN
    RAISE EXCEPTION 'Template does not belong to this workspace';
  END IF;
  
  -- 创建发票
  INSERT INTO invoices (
    workspace_id, customer_id, invoice_number, issue_date, due_date,
    notes, terms, template_id, created_by
  )
  VALUES (
    p_workspace_id, p_customer_id, p_invoice_number, p_issue_date, p_due_date,
    p_notes, p_terms, p_template_id, auth.uid()
  )
  RETURNING id INTO v_invoice_id;
  
  -- 添加发票明细
  FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines)
  LOOP
    -- 计算行小计
    v_line_total := (v_line->>'quantity')::NUMERIC * (v_line->>'unit_price')::NUMERIC;
    
    -- 应用折扣（如果有）
    IF (v_line->>'discount_amount') IS NOT NULL AND (v_line->>'discount_amount')::NUMERIC > 0 THEN
      v_discount_amount := v_discount_amount + (v_line->>'discount_amount')::NUMERIC;
      v_line_total := v_line_total - (v_line->>'discount_amount')::NUMERIC;
    END IF;
    
    -- 应用税金（如果有）
    v_tax_id := NULL;
    v_tax_rate := 0;
    
    IF (v_line->>'tax_id') IS NOT NULL THEN
      v_tax_id := (v_line->>'tax_id')::UUID;
      
      -- 获取税率
      SELECT rate INTO v_tax_rate
      FROM taxes
      WHERE id = v_tax_id;
      
      IF v_tax_rate > 0 THEN
        v_tax_amount := v_tax_amount + (v_line_total * v_tax_rate / 100);
      END IF;
    END IF;
    
    -- 添加发票明细
    INSERT INTO invoice_lines (
      invoice_id, product_id, description, quantity, unit_price,
      tax_id, tax_amount, discount_amount, line_total
    )
    VALUES (
      v_invoice_id,
      CASE WHEN (v_line->>'product_id') IS NOT NULL THEN (v_line->>'product_id')::UUID ELSE NULL END,
      v_line->>'description',
      (v_line->>'quantity')::NUMERIC,
      (v_line->>'unit_price')::NUMERIC,
      v_tax_id,
      CASE WHEN v_tax_rate > 0 THEN (v_line_total * v_tax_rate / 100) ELSE 0 END,
      CASE WHEN (v_line->>'discount_amount') IS NOT NULL THEN (v_line->>'discount_amount')::NUMERIC ELSE 0 END,
      v_line_total
    );
    
    -- 累计小计
    v_subtotal := v_subtotal + (v_line->>'quantity')::NUMERIC * (v_line->>'unit_price')::NUMERIC;
  END LOOP;
  
  -- 计算总金额
  v_total_amount := v_subtotal - v_discount_amount + v_tax_amount;
  
  -- 更新发票总额
  UPDATE invoices
  SET 
    subtotal = v_subtotal,
    tax_amount = v_tax_amount,
    discount_amount = v_discount_amount,
    total_amount = v_total_amount
  WHERE id = v_invoice_id;
  
  -- 记录发票创建活动
  INSERT INTO invoice_activities (
    invoice_id, activity_type, description, performed_by
  )
  VALUES (
    v_invoice_id, 'created', 'Invoice created', auth.uid()
  );
  
  RETURN v_invoice_id;
END;
$$;

-- 发送发票函数
CREATE OR REPLACE FUNCTION send_invoice(
  p_invoice_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_workspace_id UUID;
BEGIN
  -- 获取发票所属的工作空间
  SELECT workspace_id INTO v_workspace_id
  FROM invoices
  WHERE id = p_invoice_id;
  
  -- 验证用户有权限操作此工作空间
  IF NOT EXISTS (
    SELECT 1 FROM workspaces
    WHERE id = v_workspace_id AND (user_id = auth.uid() OR owner_id = auth.uid())
  ) THEN
    RAISE EXCEPTION 'You do not have permission to perform this action';
  END IF;
  
  -- 验证发票状态
  IF EXISTS (
    SELECT 1 FROM invoices
    WHERE id = p_invoice_id AND status NOT IN ('draft', 'overdue')
  ) THEN
    RAISE EXCEPTION 'Only draft or overdue invoices can be sent';
  END IF;
  
  -- 更新发票状态
  UPDATE invoices
  SET 
    status = 'sent',
    sent_at = NOW(),
    updated_at = NOW(),
    updated_by = auth.uid()
  WHERE id = p_invoice_id;
  
  -- 记录发票发送活动
  INSERT INTO invoice_activities (
    invoice_id, activity_type, description, performed_by
  )
  VALUES (
    p_invoice_id, 'sent', 'Invoice sent', auth.uid()
  );
  
  RETURN TRUE;
END;
$$;

-- 记录发票付款函数
CREATE OR REPLACE FUNCTION record_invoice_payment(
  p_invoice_id UUID,
  p_payment_date DATE,
  p_amount NUMERIC,
  p_payment_method TEXT,
  p_notes TEXT DEFAULT NULL,
  p_create_transaction BOOLEAN DEFAULT TRUE
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_payment_id UUID;
  v_workspace_id UUID;
  v_customer_id UUID;
  v_customer_name TEXT;
  v_invoice_number TEXT;
  v_transaction_id UUID;
  v_fiscal_year_id UUID;
  v_income_account_id UUID;
  v_bank_account_id UUID;
BEGIN
  -- 获取发票信息
  SELECT 
    i.workspace_id, i.customer_id, i.invoice_number,
    c.name AS customer_name
  INTO v_workspace_id, v_customer_id, v_invoice_number, v_customer_name
  FROM invoices i
  LEFT JOIN customers c ON i.customer_id = c.id
  WHERE i.id = p_invoice_id;
  
  -- 验证用户有权限操作此工作空间
  IF NOT EXISTS (
    SELECT 1 FROM workspaces
    WHERE id = v_workspace_id AND (user_id = auth.uid() OR owner_id = auth.uid())
  ) THEN
    RAISE EXCEPTION 'You do not have permission to perform this action';
  END IF;
  
  -- 验证发票状态
  IF EXISTS (
    SELECT 1 FROM invoices
    WHERE id = p_invoice_id AND status = 'cancelled'
  ) THEN
    RAISE EXCEPTION 'Cannot record payment for cancelled invoice';
  END IF;
  
  -- 获取包含付款日期的会计年度
  SELECT id INTO v_fiscal_year_id
  FROM fiscal_years
  WHERE workspace_id = v_workspace_id
  AND p_payment_date BETWEEN start_date AND end_date;
  
  IF v_fiscal_year_id IS NULL THEN
    RAISE EXCEPTION 'No fiscal year found for the payment date';
  END IF;
  
  -- 创建付款记录
  INSERT INTO invoice_payments (
    invoice_id, payment_date, amount, payment_method, notes, created_by
  )
  VALUES (
    p_invoice_id, p_payment_date, p_amount, p_payment_method, p_notes, auth.uid()
  )
  RETURNING id INTO v_payment_id;
  
  -- 记录付款活动
  INSERT INTO invoice_activities (
    invoice_id, activity_type, description, performed_by
  )
  VALUES (
    p_invoice_id, 'payment', 'Payment of ' || p_amount || ' received via ' || p_payment_method, auth.uid()
  );
  
  -- 如果需要创建会计交易
  IF p_create_transaction THEN
    -- 获取收入账户和银行账户
    SELECT id INTO v_income_account_id
    FROM accounts
    WHERE workspace_id = v_workspace_id
    AND chart_id IN (
      SELECT id FROM chart_of_accounts
      WHERE workspace_id = v_workspace_id
      AND type = 'income'
      AND name LIKE '%Sales%'
      LIMIT 1
    )
    LIMIT 1;
    
    -- 如果找不到销售收入账户，使用第一个收入账户
    IF v_income_account_id IS NULL THEN
      SELECT id INTO v_income_account_id
      FROM accounts
      WHERE workspace_id = v_workspace_id
      AND chart_id IN (
        SELECT id FROM chart_of_accounts
        WHERE workspace_id = v_workspace_id
        AND type = 'income'
        LIMIT 1
      )
      LIMIT 1;
    END IF;
    
    -- 获取第一个银行账户
    SELECT id INTO v_bank_account_id
    FROM accounts
    WHERE workspace_id = v_workspace_id
    AND chart_id IN (
      SELECT id FROM chart_of_accounts
      WHERE workspace_id = v_workspace_id
      AND type = 'asset'
      AND is_payment = TRUE
      LIMIT 1
    )
    LIMIT 1;
    
    -- 创建付款交易
    IF v_income_account_id IS NOT NULL AND v_bank_account_id IS NOT NULL THEN
      INSERT INTO transactions (
        workspace_id, txn_date, description, reference, status, created_by, fiscal_year_id
      )
      VALUES (
        v_workspace_id, 
        p_payment_date, 
        'Invoice Payment - ' || v_invoice_number || 
        CASE WHEN v_customer_name IS NOT NULL THEN ' - ' || v_customer_name ELSE '' END,
        'Invoice #' || v_invoice_number,
        'posted', 
        auth.uid(), 
        v_fiscal_year_id
      )
      RETURNING id INTO v_transaction_id;
      
      -- 添加交易明细
      INSERT INTO transaction_lines (transaction_id, account_id, description, amount)
      VALUES (v_transaction_id, v_bank_account_id, 'Invoice Payment', p_amount);
      
      INSERT INTO transaction_lines (transaction_id, account_id, description, amount)
      VALUES (v_transaction_id, v_income_account_id, 'Invoice Revenue', -p_amount);
      
      -- 关联付款和交易
      UPDATE invoice_payments
      SET transaction_id = v_transaction_id
      WHERE id = v_payment_id;
    END IF;
  END IF;
  
  RETURN v_payment_id;
END;
$$;

-- 获取发票列表函数
CREATE OR REPLACE FUNCTION get_invoices(
  p_workspace_id UUID,
  p_status TEXT DEFAULT NULL,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL,
  p_customer_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  invoice_number TEXT,
  customer_name TEXT,
  issue_date DATE,
  due_date DATE,
  total_amount NUMERIC,
  paid_amount NUMERIC,
  status TEXT,
  is_overdue BOOLEAN
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
    i.id,
    i.invoice_number,
    c.name AS customer_name,
    i.issue_date,
    i.due_date,
    i.total_amount,
    i.paid_amount,
    i.status,
    CASE WHEN i.due_date < CURRENT_DATE AND i.status NOT IN ('paid', 'cancelled') THEN TRUE ELSE FALSE END AS is_overdue
  FROM invoices i
  LEFT JOIN customers c ON i.customer_id = c.id
  WHERE i.workspace_id = p_workspace_id
  AND (p_status IS NULL OR i.status = p_status)
  AND (p_start_date IS NULL OR i.issue_date >= p_start_date)
  AND (p_end_date IS NULL OR i.issue_date <= p_end_date)
  AND (p_customer_id IS NULL OR i.customer_id = p_customer_id)
  ORDER BY i.issue_date DESC;
END;
$$;
