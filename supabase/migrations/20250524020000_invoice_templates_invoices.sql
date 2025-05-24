-- AutoBooks: Invoice Functionality - Part 2: Invoice Templates and Invoices
-- 创建时间: 2025-05-24

-- 1. 发票模板表
CREATE TABLE invoice_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  -- 模板设置
  logo_url TEXT,
  header_content JSONB, -- {company_name, address, phone, email, tax_numbers}
  footer_content TEXT,
  payment_instructions TEXT,
  terms_and_conditions TEXT,
  -- 显示选项
  show_logo BOOLEAN DEFAULT TRUE,
  show_payment_instructions BOOLEAN DEFAULT TRUE,
  show_customer_tax_number BOOLEAN DEFAULT FALSE,
  -- 编号格式
  invoice_number_prefix VARCHAR(20), -- 如 'INV-'
  invoice_number_format VARCHAR(50), -- 如 '{prefix}{year}{month}-{sequence}'
  next_invoice_number INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- 2. 发票主表
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  invoice_number VARCHAR(50) NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id),
  template_id UUID REFERENCES invoice_templates(id),
  -- 日期信息
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  -- 金额信息
  subtotal NUMERIC(18,2) NOT NULL,
  tax_amount NUMERIC(18,2) DEFAULT 0,
  discount_amount NUMERIC(18,2) DEFAULT 0,
  total_amount NUMERIC(18,2) NOT NULL,
  -- 支付信息
  paid_amount NUMERIC(18,2) DEFAULT 0,
  status VARCHAR(20) CHECK (status IN ('draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled')),
  -- 其他信息
  currency CHAR(3) DEFAULT 'CAD',
  exchange_rate NUMERIC(10,6) DEFAULT 1,
  purchase_order_number VARCHAR(100),
  notes TEXT,
  internal_notes TEXT, -- 内部备注，不显示给客户
  -- 关联交易
  transaction_id UUID REFERENCES transactions(id),
  fiscal_year_id UUID REFERENCES fiscal_years(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT FALSE,
  UNIQUE(workspace_id, invoice_number)
);

-- 3. 发票明细行
CREATE TABLE invoice_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  product_service_id UUID REFERENCES products_services(id),
  line_number INTEGER NOT NULL,
  description TEXT NOT NULL,
  quantity NUMERIC(18,4) DEFAULT 1,
  unit_price NUMERIC(18,2) NOT NULL,
  discount_percent NUMERIC(5,2) DEFAULT 0,
  discount_amount NUMERIC(18,2) DEFAULT 0,
  amount NUMERIC(18,2) NOT NULL, -- quantity * unit_price - discount
  tax_id UUID REFERENCES taxes(id),
  tax_amount NUMERIC(18,2) DEFAULT 0,
  account_id UUID REFERENCES accounts(id), -- 收入账户
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 发票付款记录
CREATE TABLE invoice_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id),
  transaction_id UUID REFERENCES transactions(id),
  payment_date DATE NOT NULL,
  amount NUMERIC(18,2) NOT NULL,
  payment_method VARCHAR(50), -- cash, cheque, e-transfer, credit_card
  reference_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- 5. 发票历史/活动日志
CREATE TABLE invoice_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id),
  user_id UUID REFERENCES users(id),
  activity_type VARCHAR(50) NOT NULL, -- created, updated, sent, viewed, paid, etc.
  description TEXT,
  metadata JSONB, -- 存储额外信息
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 循环发票设置
CREATE TABLE recurring_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  template_invoice_id UUID REFERENCES invoices(id),
  frequency VARCHAR(20) CHECK (frequency IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  next_invoice_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- 7. 启用RLS
ALTER TABLE invoice_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_invoices ENABLE ROW LEVEL SECURITY;

-- 8. 创建RLS策略
-- Invoice_Templates策略
CREATE POLICY invoice_templates_policy ON invoice_templates
  FOR ALL
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id() OR
         id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.get_current_user_id() AND is_active = TRUE)));

-- Invoices策略
CREATE POLICY invoices_policy ON invoices
  FOR ALL
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id() OR
         id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.get_current_user_id() AND is_active = TRUE)));

-- Invoice_Lines策略
CREATE POLICY invoice_lines_policy ON invoice_lines
  FOR ALL
  USING (invoice_id IN (SELECT id FROM invoices WHERE workspace_id IN 
         (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id() OR
          id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.get_current_user_id() AND is_active = TRUE))));

-- Invoice_Payments策略
CREATE POLICY invoice_payments_policy ON invoice_payments
  FOR ALL
  USING (invoice_id IN (SELECT id FROM invoices WHERE workspace_id IN 
         (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id() OR
          id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.get_current_user_id() AND is_active = TRUE))));

-- Invoice_Activities策略
CREATE POLICY invoice_activities_policy ON invoice_activities
  FOR ALL
  USING (invoice_id IN (SELECT id FROM invoices WHERE workspace_id IN 
         (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id() OR
          id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.get_current_user_id() AND is_active = TRUE))));

-- Recurring_Invoices策略
CREATE POLICY recurring_invoices_policy ON recurring_invoices
  FOR ALL
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id() OR
         id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.get_current_user_id() AND is_active = TRUE)));

-- 9. 创建触发器
CREATE TRIGGER update_invoice_templates_updated_at BEFORE UPDATE ON invoice_templates
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_invoice_lines_updated_at BEFORE UPDATE ON invoice_lines
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_recurring_invoices_updated_at BEFORE UPDATE ON recurring_invoices
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER audit_invoice_templates AFTER INSERT OR UPDATE OR DELETE ON invoice_templates
  FOR EACH ROW EXECUTE PROCEDURE create_audit_log();

CREATE TRIGGER audit_invoices AFTER INSERT OR UPDATE OR DELETE ON invoices
  FOR EACH ROW EXECUTE PROCEDURE create_audit_log();

CREATE TRIGGER audit_invoice_lines AFTER INSERT OR UPDATE OR DELETE ON invoice_lines
  FOR EACH ROW EXECUTE PROCEDURE create_audit_log();

CREATE TRIGGER audit_invoice_payments AFTER INSERT OR UPDATE OR DELETE ON invoice_payments
  FOR EACH ROW EXECUTE PROCEDURE create_audit_log();

CREATE TRIGGER audit_recurring_invoices AFTER INSERT OR UPDATE OR DELETE ON recurring_invoices
  FOR EACH ROW EXECUTE PROCEDURE create_audit_log();

-- 10. 创建自动设置会计年度的触发器
CREATE OR REPLACE FUNCTION set_invoice_fiscal_year()
RETURNS TRIGGER AS $$
BEGIN
  -- 如果未设置fiscal_year_id，自动设置
  IF NEW.fiscal_year_id IS NULL THEN
    SELECT id INTO NEW.fiscal_year_id
    FROM fiscal_years
    WHERE workspace_id = NEW.workspace_id
      AND NEW.invoice_date BETWEEN start_date AND end_date;
      
    -- 如果找不到匹配的会计年度，使用当前会计年度
    IF NEW.fiscal_year_id IS NULL THEN
      SELECT id INTO NEW.fiscal_year_id
      FROM fiscal_years
      WHERE workspace_id = NEW.workspace_id
        AND is_current = TRUE;
    END IF;
    
    -- 如果仍然找不到，使用最近的会计年度
    IF NEW.fiscal_year_id IS NULL THEN
      SELECT id INTO NEW.fiscal_year_id
      FROM fiscal_years
      WHERE workspace_id = NEW.workspace_id
      ORDER BY end_date DESC
      LIMIT 1;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_invoice_fiscal_year_trigger
BEFORE INSERT OR UPDATE ON invoices
FOR EACH ROW EXECUTE PROCEDURE set_invoice_fiscal_year();

-- 11. 创建发票状态自动更新触发器
CREATE OR REPLACE FUNCTION update_invoice_status()
RETURNS TRIGGER AS $$
BEGIN
  -- 计算已付金额
  SELECT COALESCE(SUM(amount), 0) INTO NEW.paid_amount
  FROM invoice_payments
  WHERE invoice_id = NEW.id;
  
  -- 更新状态
  IF NEW.status = 'cancelled' THEN
    -- 如果已取消，保持取消状态
    NULL;
  ELSIF NEW.paid_amount >= NEW.total_amount THEN
    -- 如果已全额支付
    NEW.status := 'paid';
    IF NEW.paid_at IS NULL THEN
      NEW.paid_at := NOW();
    END IF;
  ELSIF NEW.paid_amount > 0 THEN
    -- 如果部分支付
    NEW.status := 'partial';
  ELSIF NEW.sent_at IS NOT NULL AND NEW.due_date < CURRENT_DATE THEN
    -- 如果已发送且已过期
    NEW.status := 'overdue';
  ELSIF NEW.sent_at IS NOT NULL AND NEW.viewed_at IS NOT NULL THEN
    -- 如果已发送且已查看
    NEW.status := 'viewed';
  ELSIF NEW.sent_at IS NOT NULL THEN
    -- 如果已发送
    NEW.status := 'sent';
  ELSE
    -- 默认为草稿
    NEW.status := 'draft';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invoice_status_trigger
BEFORE INSERT OR UPDATE ON invoices
FOR EACH ROW EXECUTE PROCEDURE update_invoice_status();

-- 12. 创建发票活动日志触发器
CREATE OR REPLACE FUNCTION log_invoice_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- 记录创建活动
    INSERT INTO invoice_activities (invoice_id, user_id, activity_type, description)
    VALUES (NEW.id, auth.uid(), 'created', '发票已创建');
  ELSIF TG_OP = 'UPDATE' THEN
    -- 记录状态变更
    IF OLD.status != NEW.status THEN
      INSERT INTO invoice_activities (invoice_id, user_id, activity_type, description)
      VALUES (NEW.id, auth.uid(), 'status_changed', '发票状态从 ' || OLD.status || ' 变更为 ' || NEW.status);
    END IF;
    
    -- 记录发送
    IF OLD.sent_at IS NULL AND NEW.sent_at IS NOT NULL THEN
      INSERT INTO invoice_activities (invoice_id, user_id, activity_type, description)
      VALUES (NEW.id, auth.uid(), 'sent', '发票已发送');
    END IF;
    
    -- 记录查看
    IF OLD.viewed_at IS NULL AND NEW.viewed_at IS NOT NULL THEN
      INSERT INTO invoice_activities (invoice_id, user_id, activity_type, description)
      VALUES (NEW.id, auth.uid(), 'viewed', '客户已查看发票');
    END IF;
    
    -- 记录支付
    IF OLD.paid_at IS NULL AND NEW.paid_at IS NOT NULL THEN
      INSERT INTO invoice_activities (invoice_id, user_id, activity_type, description)
      VALUES (NEW.id, auth.uid(), 'paid', '发票已全额支付');
    END IF;
    
    -- 记录审批
    IF OLD.approved_at IS NULL AND NEW.approved_at IS NOT NULL THEN
      INSERT INTO invoice_activities (invoice_id, user_id, activity_type, description)
      VALUES (NEW.id, NEW.approved_by, 'approved', '发票已审批');
    END IF;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_invoice_activity_trigger
AFTER INSERT OR UPDATE ON invoices
FOR EACH ROW EXECUTE PROCEDURE log_invoice_activity();

-- 13. 创建发票付款记录触发器
CREATE OR REPLACE FUNCTION update_invoice_after_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- 更新发票的已付金额和状态
  UPDATE invoices
  SET updated_at = NOW()
  WHERE id = NEW.invoice_id;
  
  -- 记录付款活动
  INSERT INTO invoice_activities (invoice_id, user_id, activity_type, description, metadata)
  VALUES (
    NEW.invoice_id, 
    auth.uid(), 
    'payment_received', 
    '收到付款 ' || NEW.amount || ' ' || (SELECT currency FROM invoices WHERE id = NEW.invoice_id),
    jsonb_build_object(
      'amount', NEW.amount,
      'payment_method', NEW.payment_method,
      'reference_number', NEW.reference_number
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invoice_after_payment_trigger
AFTER INSERT ON invoice_payments
FOR EACH ROW EXECUTE PROCEDURE update_invoice_after_payment();
