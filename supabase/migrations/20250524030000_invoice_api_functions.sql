-- AutoBooks: Invoice Functionality - Part 3: Invoice API Functions
-- 创建时间: 2025-05-24

-- 1. 发票模板管理函数
CREATE OR REPLACE FUNCTION get_invoice_templates(workspace_id_param UUID)
RETURNS SETOF invoice_templates
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM invoice_templates
  WHERE workspace_id = workspace_id_param
    AND is_deleted = FALSE
  ORDER BY name;
$$;

CREATE OR REPLACE FUNCTION get_default_invoice_template(workspace_id_param UUID)
RETURNS invoice_templates
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM invoice_templates
  WHERE workspace_id = workspace_id_param
    AND is_default = TRUE
    AND is_deleted = FALSE
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION create_invoice_template(
  workspace_id_param UUID,
  name_param VARCHAR(255),
  is_default_param BOOLEAN DEFAULT FALSE,
  logo_url_param TEXT DEFAULT NULL,
  header_content_param JSONB DEFAULT NULL,
  footer_content_param TEXT DEFAULT NULL,
  payment_instructions_param TEXT DEFAULT NULL,
  terms_and_conditions_param TEXT DEFAULT NULL,
  show_logo_param BOOLEAN DEFAULT TRUE,
  show_payment_instructions_param BOOLEAN DEFAULT TRUE,
  show_customer_tax_number_param BOOLEAN DEFAULT FALSE,
  invoice_number_prefix_param VARCHAR(20) DEFAULT 'INV-',
  invoice_number_format_param VARCHAR(50) DEFAULT '{prefix}{year}{month}-{sequence}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_template_id UUID;
BEGIN
  -- 检查权限
  IF NOT auth.user_has_permission(workspace_id_param, 'invoice', 'create') THEN
    RAISE EXCEPTION 'Permission denied: Cannot create invoice template';
  END IF;

  -- 如果设置为默认模板，先将其他模板设为非默认
  IF is_default_param THEN
    UPDATE invoice_templates
    SET is_default = FALSE
    WHERE workspace_id = workspace_id_param;
  END IF;

  -- 创建发票模板
  INSERT INTO invoice_templates (
    workspace_id, name, is_default, logo_url, header_content,
    footer_content, payment_instructions, terms_and_conditions,
    show_logo, show_payment_instructions, show_customer_tax_number,
    invoice_number_prefix, invoice_number_format, created_by
  ) VALUES (
    workspace_id_param, name_param, is_default_param, logo_url_param, header_content_param,
    footer_content_param, payment_instructions_param, terms_and_conditions_param,
    show_logo_param, show_payment_instructions_param, show_customer_tax_number_param,
    invoice_number_prefix_param, invoice_number_format_param, auth.uid()
  )
  RETURNING id INTO new_template_id;

  RETURN new_template_id;
END;
$$;

-- 2. 发票管理函数
CREATE OR REPLACE FUNCTION get_invoices(
  workspace_id_param UUID,
  status_param VARCHAR(20) DEFAULT NULL,
  customer_id_param UUID DEFAULT NULL,
  start_date_param DATE DEFAULT NULL,
  end_date_param DATE DEFAULT NULL,
  limit_param INTEGER DEFAULT 100,
  offset_param INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  invoice_number VARCHAR(50),
  customer_id UUID,
  customer_name VARCHAR(255),
  invoice_date DATE,
  due_date DATE,
  total_amount NUMERIC(18,2),
  paid_amount NUMERIC(18,2),
  status VARCHAR(20),
  currency CHAR(3)
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    i.id,
    i.invoice_number,
    i.customer_id,
    c.name AS customer_name,
    i.invoice_date,
    i.due_date,
    i.total_amount,
    i.paid_amount,
    i.status,
    i.currency
  FROM 
    invoices i
  JOIN 
    customers c ON i.customer_id = c.id
  WHERE 
    i.workspace_id = workspace_id_param
    AND i.is_deleted = FALSE
    AND (status_param IS NULL OR i.status = status_param)
    AND (customer_id_param IS NULL OR i.customer_id = customer_id_param)
    AND (start_date_param IS NULL OR i.invoice_date >= start_date_param)
    AND (end_date_param IS NULL OR i.invoice_date <= end_date_param)
  ORDER BY 
    i.invoice_date DESC, i.invoice_number
  LIMIT limit_param
  OFFSET offset_param;
$$;

CREATE OR REPLACE FUNCTION get_invoice(invoice_id_param UUID)
RETURNS TABLE (
  invoice_data json,
  invoice_lines json,
  invoice_payments json,
  invoice_activities json
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  workspace_id_val UUID;
BEGIN
  -- 获取工作空间ID
  SELECT workspace_id INTO workspace_id_val
  FROM invoices
  WHERE id = invoice_id_param;
  
  -- 检查权限
  IF NOT auth.user_has_permission(workspace_id_val, 'invoice', 'read') THEN
    RAISE EXCEPTION 'Permission denied: Cannot view invoice';
  END IF;

  RETURN QUERY
  WITH invoice_data AS (
    SELECT 
      i.*,
      c.name AS customer_name,
      c.contact_name AS customer_contact,
      c.email AS customer_email,
      c.phone AS customer_phone,
      c.billing_address AS customer_billing_address,
      c.shipping_address AS customer_shipping_address,
      c.tax_number AS customer_tax_number,
      t.name AS template_name,
      t.logo_url,
      t.header_content,
      t.footer_content,
      t.payment_instructions,
      t.terms_and_conditions,
      t.show_logo,
      t.show_payment_instructions,
      t.show_customer_tax_number
    FROM 
      invoices i
    JOIN 
      customers c ON i.customer_id = c.id
    LEFT JOIN 
      invoice_templates t ON i.template_id = t.id
    WHERE 
      i.id = invoice_id_param
  ),
  invoice_lines_data AS (
    SELECT 
      il.*,
      ps.name AS product_service_name,
      ps.code AS product_service_code,
      a.name AS account_name,
      t.name AS tax_name,
      t.rate AS tax_rate
    FROM 
      invoice_lines il
    LEFT JOIN 
      products_services ps ON il.product_service_id = ps.id
    LEFT JOIN 
      accounts a ON il.account_id = a.id
    LEFT JOIN 
      taxes t ON il.tax_id = t.id
    WHERE 
      il.invoice_id = invoice_id_param
    ORDER BY 
      il.line_number
  ),
  invoice_payments_data AS (
    SELECT 
      ip.*,
      u.full_name AS created_by_name
    FROM 
      invoice_payments ip
    LEFT JOIN 
      users u ON ip.created_by = u.id
    WHERE 
      ip.invoice_id = invoice_id_param
    ORDER BY 
      ip.payment_date DESC, ip.created_at DESC
  ),
  invoice_activities_data AS (
    SELECT 
      ia.*,
      u.full_name AS user_name
    FROM 
      invoice_activities ia
    LEFT JOIN 
      users u ON ia.user_id = u.id
    WHERE 
      ia.invoice_id = invoice_id_param
    ORDER BY 
      ia.created_at DESC
  )
  SELECT 
    to_json(invoice_data.*) AS invoice_data,
    COALESCE(json_agg(invoice_lines_data.*), '[]'::json) AS invoice_lines,
    COALESCE(json_agg(invoice_payments_data.*), '[]'::json) AS invoice_payments,
    COALESCE(json_agg(invoice_activities_data.*), '[]'::json) AS invoice_activities
  FROM 
    invoice_data,
    invoice_lines_data,
    invoice_payments_data,
    invoice_activities_data
  GROUP BY 
    invoice_data;
END;
$$;

-- 3. 生成发票号函数
CREATE OR REPLACE FUNCTION generate_invoice_number(workspace_id_param UUID)
RETURNS VARCHAR(50)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  template_rec RECORD;
  next_number INTEGER;
  formatted_number VARCHAR(50);
  year_str VARCHAR(4);
  month_str VARCHAR(2);
  sequence_str VARCHAR(10);
BEGIN
  -- 获取默认模板
  SELECT * INTO template_rec
  FROM invoice_templates
  WHERE workspace_id = workspace_id_param
    AND is_default = TRUE
    AND is_deleted = FALSE
  LIMIT 1;
  
  -- 如果没有默认模板，使用简单格式
  IF template_rec IS NULL THEN
    SELECT COUNT(*) + 1 INTO next_number
    FROM invoices
    WHERE workspace_id = workspace_id_param;
    
    RETURN 'INV-' || LPAD(next_number::TEXT, 5, '0');
  END IF;
  
  -- 获取下一个发票号
  next_number := template_rec.next_invoice_number;
  
  -- 更新模板的下一个发票号
  UPDATE invoice_templates
  SET next_invoice_number = next_invoice_number + 1
  WHERE id = template_rec.id;
  
  -- 格式化变量
  year_str := TO_CHAR(CURRENT_DATE, 'YYYY');
  month_str := TO_CHAR(CURRENT_DATE, 'MM');
  sequence_str := LPAD(next_number::TEXT, 5, '0');
  
  -- 应用格式
  formatted_number := template_rec.invoice_number_format;
  formatted_number := REPLACE(formatted_number, '{prefix}', COALESCE(template_rec.invoice_number_prefix, ''));
  formatted_number := REPLACE(formatted_number, '{year}', year_str);
  formatted_number := REPLACE(formatted_number, '{month}', month_str);
  formatted_number := REPLACE(formatted_number, '{sequence}', sequence_str);
  
  RETURN formatted_number;
END;
$$;

-- 4. 创建发票函数
CREATE OR REPLACE FUNCTION create_invoice(
  workspace_id_param UUID,
  customer_id_param UUID,
  invoice_date_param DATE,
  due_date_param DATE,
  template_id_param UUID DEFAULT NULL,
  currency_param CHAR(3) DEFAULT 'CAD',
  exchange_rate_param NUMERIC(10,6) DEFAULT 1,
  purchase_order_number_param VARCHAR(100) DEFAULT NULL,
  notes_param TEXT DEFAULT NULL,
  internal_notes_param TEXT DEFAULT NULL,
  invoice_lines_param JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_invoice_id UUID;
  invoice_number_val VARCHAR(50);
  line_data JSONB;
  line_id UUID;
  subtotal_val NUMERIC(18,2) := 0;
  tax_amount_val NUMERIC(18,2) := 0;
  total_amount_val NUMERIC(18,2) := 0;
  line_number_val INTEGER := 1;
  line_amount NUMERIC(18,2);
  line_tax_amount NUMERIC(18,2);
BEGIN
  -- 检查权限
  IF NOT auth.user_has_permission(workspace_id_param, 'invoice', 'create') THEN
    RAISE EXCEPTION 'Permission denied: Cannot create invoice';
  END IF;

  -- 生成发票号
  invoice_number_val := generate_invoice_number(workspace_id_param);
  
  -- 创建发票
  INSERT INTO invoices (
    workspace_id, invoice_number, customer_id, template_id,
    invoice_date, due_date, subtotal, tax_amount, total_amount,
    currency, exchange_rate, purchase_order_number, notes, internal_notes,
    status, created_by
  ) VALUES (
    workspace_id_param, invoice_number_val, customer_id_param, template_id_param,
    invoice_date_param, due_date_param, 0, 0, 0,
    currency_param, exchange_rate_param, purchase_order_number_param, notes_param, internal_notes_param,
    'draft', auth.uid()
  )
  RETURNING id INTO new_invoice_id;
  
  -- 如果提供了发票行，添加它们
  IF invoice_lines_param IS NOT NULL AND jsonb_array_length(invoice_lines_param) > 0 THEN
    FOR line_data IN SELECT * FROM jsonb_array_elements(invoice_lines_param) LOOP
      -- 计算行金额
      line_amount := (line_data->>'quantity')::NUMERIC * (line_data->>'unit_price')::NUMERIC;
      
      -- 如果有折扣，应用折扣
      IF (line_data->>'discount_percent') IS NOT NULL AND (line_data->>'discount_percent')::NUMERIC > 0 THEN
        line_amount := line_amount * (1 - (line_data->>'discount_percent')::NUMERIC / 100);
      END IF;
      
      -- 计算税额
      line_tax_amount := 0;
      IF (line_data->>'tax_id') IS NOT NULL THEN
        SELECT line_amount * rate INTO line_tax_amount
        FROM taxes
        WHERE id = (line_data->>'tax_id')::UUID;
      END IF;
      
      -- 插入发票行
      INSERT INTO invoice_lines (
        invoice_id, product_service_id, line_number, description,
        quantity, unit_price, discount_percent, amount,
        tax_id, tax_amount, account_id
      ) VALUES (
        new_invoice_id, 
        CASE WHEN (line_data->>'product_service_id') = '' THEN NULL ELSE (line_data->>'product_service_id')::UUID END,
        line_number_val,
        line_data->>'description',
        COALESCE((line_data->>'quantity')::NUMERIC, 1),
        (line_data->>'unit_price')::NUMERIC,
        COALESCE((line_data->>'discount_percent')::NUMERIC, 0),
        line_amount,
        CASE WHEN (line_data->>'tax_id') = '' THEN NULL ELSE (line_data->>'tax_id')::UUID END,
        line_tax_amount,
        (line_data->>'account_id')::UUID
      )
      RETURNING id INTO line_id;
      
      -- 更新合计
      subtotal_val := subtotal_val + line_amount;
      tax_amount_val := tax_amount_val + line_tax_amount;
      line_number_val := line_number_val + 1;
    END LOOP;
    
    -- 计算总金额
    total_amount_val := subtotal_val + tax_amount_val;
    
    -- 更新发票合计
    UPDATE invoices
    SET subtotal = subtotal_val,
        tax_amount = tax_amount_val,
        total_amount = total_amount_val
    WHERE id = new_invoice_id;
  END IF;
  
  RETURN new_invoice_id;
END;
$$;
