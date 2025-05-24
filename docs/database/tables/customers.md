# 表名: customers

## 表描述
客户表是AutoBooks系统的核心业务表之一，用于存储所有客户的基本信息。客户信息与工作空间关联，支持发票管理、交易记录和报表生成等功能。客户表支持多用户权限控制，确保数据安全和隔离。

## 表结构

| 列名 | 数据类型 | 可空 | 默认值 | 描述 |
|------|----------|------|--------|------|
| id | uuid | 否 | uuid_generate_v4() | 主键 |
| workspace_id | uuid | 否 | | 工作空间ID，外键关联workspaces表 |
| customer_number | varchar(50) | 是 | | 客户编号，工作空间内唯一 |
| name | varchar(255) | 否 | | 客户名称 |
| contact_name | varchar(255) | 是 | | 联系人姓名 |
| email | varchar(255) | 是 | | 电子邮箱 |
| phone | varchar(50) | 是 | | 电话号码 |
| billing_address | jsonb | 是 | | 账单地址，JSON格式：{street, city, province, postal_code, country} |
| shipping_address | jsonb | 是 | | 送货地址，JSON格式：{street, city, province, postal_code, country} |
| payment_terms | integer | 否 | 30 | 付款期限（天） |
| credit_limit | numeric(18,2) | 是 | | 信用额度 |
| tax_number | varchar(50) | 是 | | 税号，如GST/HST号码 |
| notes | text | 是 | | 客户备注 |
| created_at | timestamptz | 否 | now() | 创建时间 |
| updated_at | timestamptz | 否 | now() | 更新时间 |
| created_by | uuid | 是 | | 创建用户ID，外键关联users表 |
| updated_by | uuid | 是 | | 更新用户ID，外键关联users表 |
| is_deleted | boolean | 否 | false | 软删除标记 |

## 索引

| 索引名 | 列 | 类型 | 描述 |
|--------|-----|------|------|
| customers_pkey | id | B-tree | 主键索引 |
| idx_customers_workspace | workspace_id | B-tree | 加速按工作空间查询 |
| idx_customers_number | workspace_id, customer_number | B-tree | 确保工作空间内客户编号唯一 |
| idx_customers_name | name | B-tree | 加速按名称查询 |

## 外键约束

| 约束名 | 列 | 引用表 | 引用列 | 删除行为 | 更新行为 |
|--------|-----|--------|--------|----------|----------|
| customers_workspace_id_fkey | workspace_id | workspaces | id | CASCADE | RESTRICT |
| customers_created_by_fkey | created_by | users | id | RESTRICT | RESTRICT |
| customers_updated_by_fkey | updated_by | users | id | RESTRICT | RESTRICT |

## RLS 策略

| 策略名 | 操作 | 使用角色 | 使用表达式 | 描述 |
|--------|------|----------|------------|------|
| customers_policy | ALL | authenticated | workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id() OR id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.get_current_user_id() AND is_active = TRUE)) | 确保用户只能访问自己工作空间或被授权工作空间的客户 |

## 触发器

| 触发器名 | 触发事件 | 触发时机 | 函数 | 描述 |
|----------|----------|----------|------|------|
| update_customers_updated_at | UPDATE | BEFORE | update_updated_at_column() | 自动更新updated_at字段 |
| audit_customers | INSERT, UPDATE, DELETE | AFTER | create_audit_log() | 记录审计日志 |

## 相关函数

- `get_customers(workspace_id UUID)` - 获取工作空间的所有客户
- `get_customer(customer_id UUID)` - 获取客户详情
- `create_customer(workspace_id UUID, name VARCHAR, ...)` - 创建新客户

## 业务逻辑说明

### 客户编号生成
客户编号可以手动指定，也可以由系统自动生成：
1. 如果手动指定，系统会检查工作空间内是否已存在相同编号
2. 如果未指定，系统会自动生成格式为"C-00001"的编号，其中数字部分递增

### 客户地址管理
客户可以有不同的账单地址和送货地址：
1. 地址信息使用JSONB格式存储，包含街道、城市、省份、邮编和国家等信息
2. 在创建发票时，可以选择使用客户的账单地址或送货地址
3. 地址信息可以单独更新，不需要更新整个客户记录

### 客户与发票关联
客户与发票是一对多关系：
1. 一个客户可以有多个发票
2. 发票必须关联到一个有效的客户
3. 客户的付款条款会作为发票的默认付款条款

### 多用户权限控制
客户信息支持多用户权限控制：
1. 不同角色的用户对客户信息有不同的操作权限
2. 客户记录记录创建者和更新者
3. 通过RLS策略确保数据隔离和安全

## 示例查询

### 查询工作空间的所有客户
```sql
SELECT * FROM customers
WHERE workspace_id = :workspace_id
  AND is_deleted = FALSE
ORDER BY name;
```

### 查询客户详情及其发票
```sql
SELECT 
  c.*,
  json_agg(
    json_build_object(
      'id', i.id,
      'invoice_number', i.invoice_number,
      'invoice_date', i.invoice_date,
      'total_amount', i.total_amount,
      'status', i.status
    )
  ) AS invoices
FROM 
  customers c
LEFT JOIN 
  invoices i ON c.id = i.customer_id AND i.is_deleted = FALSE
WHERE 
  c.id = :customer_id
  AND c.is_deleted = FALSE
GROUP BY 
  c.id;
```

### 查询客户的未付发票
```sql
SELECT 
  i.id, i.invoice_number, i.invoice_date, i.due_date,
  i.total_amount, i.paid_amount, i.status
FROM 
  invoices i
WHERE 
  i.customer_id = :customer_id
  AND i.is_deleted = FALSE
  AND i.status IN ('draft', 'sent', 'viewed', 'partial', 'overdue')
ORDER BY 
  i.due_date;
```

## 注意事项

- 客户使用软删除机制，通过is_deleted标记删除状态，而不是物理删除
- 删除客户前，应检查是否有关联的发票和交易
- 客户编号在工作空间内必须唯一
- 创建或修改客户时，会自动记录操作用户和时间

## 变更历史

| 日期 | 迁移文件 | 变更描述 |
|------|----------|----------|
| 2025-05-24 | 20250524010000_invoice_customers_products.sql | 创建初始customers表结构 |
