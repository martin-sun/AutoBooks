-- AutoBooks: Invoice Functionality - Part 1: Customers and Products
-- 创建时间: 2025-05-24

-- 1. 客户表
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  customer_number VARCHAR(50), -- 客户编号
  name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  billing_address JSONB, -- {street, city, province, postal_code, country}
  shipping_address JSONB,
  payment_terms INTEGER DEFAULT 30, -- 付款期限（天）
  credit_limit NUMERIC(18,2),
  tax_number VARCHAR(50), -- GST/HST number
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  is_deleted BOOLEAN DEFAULT FALSE,
  UNIQUE(workspace_id, customer_number)
);

-- 2. 产品/服务表
CREATE TABLE products_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  code VARCHAR(100),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) CHECK (type IN ('product', 'service')),
  unit_price NUMERIC(18,2),
  income_account_id UUID REFERENCES accounts(id),
  tax_id UUID REFERENCES taxes(id), -- 默认税种
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  is_deleted BOOLEAN DEFAULT FALSE,
  UNIQUE(workspace_id, code)
);

-- 3. 启用RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_services ENABLE ROW LEVEL SECURITY;

-- 4. 创建RLS策略
-- Customers策略
CREATE POLICY customers_policy ON customers
  FOR ALL
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id() OR
         id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.get_current_user_id() AND is_active = TRUE)));

-- Products_Services策略
CREATE POLICY products_services_policy ON products_services
  FOR ALL
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id() OR
         id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.get_current_user_id() AND is_active = TRUE)));

-- 5. 创建触发器
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_products_services_updated_at BEFORE UPDATE ON products_services
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER audit_customers AFTER INSERT OR UPDATE OR DELETE ON customers
  FOR EACH ROW EXECUTE PROCEDURE create_audit_log();

CREATE TRIGGER audit_products_services AFTER INSERT OR UPDATE OR DELETE ON products_services
  FOR EACH ROW EXECUTE PROCEDURE create_audit_log();

-- 6. 创建客户管理函数
CREATE OR REPLACE FUNCTION get_customers(workspace_id_param UUID)
RETURNS SETOF customers
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM customers
  WHERE workspace_id = workspace_id_param
    AND is_deleted = FALSE
  ORDER BY name;
$$;

CREATE OR REPLACE FUNCTION get_customer(customer_id_param UUID)
RETURNS customers
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM customers
  WHERE id = customer_id_param
    AND is_deleted = FALSE;
$$;

CREATE OR REPLACE FUNCTION create_customer(
  workspace_id_param UUID,
  name_param VARCHAR(255),
  customer_number_param VARCHAR(50) DEFAULT NULL,
  contact_name_param VARCHAR(255) DEFAULT NULL,
  email_param VARCHAR(255) DEFAULT NULL,
  phone_param VARCHAR(50) DEFAULT NULL,
  billing_address_param JSONB DEFAULT NULL,
  shipping_address_param JSONB DEFAULT NULL,
  payment_terms_param INTEGER DEFAULT 30,
  credit_limit_param NUMERIC(18,2) DEFAULT NULL,
  tax_number_param VARCHAR(50) DEFAULT NULL,
  notes_param TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_customer_id UUID;
BEGIN
  -- 检查权限
  IF NOT auth.user_has_permission(workspace_id_param, 'invoice', 'create') THEN
    RAISE EXCEPTION 'Permission denied: Cannot create customer';
  END IF;

  -- 生成客户编号（如果未提供）
  IF customer_number_param IS NULL THEN
    SELECT 'C-' || LPAD(COALESCE(
      (SELECT COUNT(*) + 1 FROM customers WHERE workspace_id = workspace_id_param), 
      1)::TEXT, 5, '0')
    INTO customer_number_param;
  END IF;

  -- 创建客户
  INSERT INTO customers (
    workspace_id, customer_number, name, contact_name, email, phone,
    billing_address, shipping_address, payment_terms, credit_limit,
    tax_number, notes, created_by
  ) VALUES (
    workspace_id_param, customer_number_param, name_param, contact_name_param, 
    email_param, phone_param, billing_address_param, shipping_address_param, 
    payment_terms_param, credit_limit_param, tax_number_param, notes_param,
    auth.uid()
  )
  RETURNING id INTO new_customer_id;

  RETURN new_customer_id;
END;
$$;

-- 7. 创建产品/服务管理函数
CREATE OR REPLACE FUNCTION get_products_services(workspace_id_param UUID)
RETURNS SETOF products_services
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM products_services
  WHERE workspace_id = workspace_id_param
    AND is_deleted = FALSE
    AND is_active = TRUE
  ORDER BY name;
$$;

CREATE OR REPLACE FUNCTION get_product_service(product_service_id_param UUID)
RETURNS products_services
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM products_services
  WHERE id = product_service_id_param
    AND is_deleted = FALSE;
$$;

CREATE OR REPLACE FUNCTION create_product_service(
  workspace_id_param UUID,
  name_param VARCHAR(255),
  type_param VARCHAR(20),
  code_param VARCHAR(100) DEFAULT NULL,
  description_param TEXT DEFAULT NULL,
  unit_price_param NUMERIC(18,2) DEFAULT NULL,
  income_account_id_param UUID DEFAULT NULL,
  tax_id_param UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_product_service_id UUID;
BEGIN
  -- 检查权限
  IF NOT auth.user_has_permission(workspace_id_param, 'invoice', 'create') THEN
    RAISE EXCEPTION 'Permission denied: Cannot create product/service';
  END IF;

  -- 创建产品/服务
  INSERT INTO products_services (
    workspace_id, code, name, description, type,
    unit_price, income_account_id, tax_id, created_by
  ) VALUES (
    workspace_id_param, code_param, name_param, description_param, type_param,
    unit_price_param, income_account_id_param, tax_id_param, auth.uid()
  )
  RETURNING id INTO new_product_service_id;

  RETURN new_product_service_id;
END;
$$;
