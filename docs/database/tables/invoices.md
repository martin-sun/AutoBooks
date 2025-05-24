# 表名: invoices

## 表描述
发票表是AutoBooks系统的核心业务表之一，用于存储所有客户发票的主要信息。每个发票可以包含多个发票明细行，并可以记录付款历史和活动日志。发票表与会计年度关联，支持按会计年度优化的余额计算方案，同时也支持多用户权限控制。

## 表结构

| 列名 | 数据类型 | 可空 | 默认值 | 描述 |
|------|----------|------|--------|------|
| id | uuid | 否 | uuid_generate_v4() | 主键 |
| workspace_id | uuid | 否 | | 工作空间ID，外键关联workspaces表 |
| invoice_number | varchar(50) | 否 | | 发票编号，工作空间内唯一 |
| customer_id | uuid | 否 | | 客户ID，外键关联customers表 |
| template_id | uuid | 是 | | 发票模板ID，外键关联invoice_templates表 |
| invoice_date | date | 否 | | 发票日期 |
| due_date | date | 否 | | 到期日期 |
| subtotal | numeric(18,2) | 否 | | 小计金额（不含税） |
| tax_amount | numeric(18,2) | 否 | 0 | 税额 |
| discount_amount | numeric(18,2) | 否 | 0 | 折扣金额 |
| total_amount | numeric(18,2) | 否 | | 总金额 |
| paid_amount | numeric(18,2) | 否 | 0 | 已付金额 |
| status | varchar(20) | 否 | 'draft' | 发票状态：draft, sent, viewed, partial, paid, overdue, cancelled |
| currency | char(3) | 否 | 'CAD' | 货币代码 |
| exchange_rate | numeric(10,6) | 否 | 1 | 汇率 |
| purchase_order_number | varchar(100) | 是 | | 采购订单号 |
| notes | text | 是 | | 发票备注（显示给客户） |
| internal_notes | text | 是 | | 内部备注（不显示给客户） |
| transaction_id | uuid | 是 | | 关联交易ID，外键关联transactions表 |
| fiscal_year_id | uuid | 是 | | 会计年度ID，外键关联fiscal_years表 |
| created_at | timestamptz | 否 | now() | 创建时间 |
| updated_at | timestamptz | 否 | now() | 更新时间 |
| created_by | uuid | 是 | | 创建用户ID，外键关联users表 |
| updated_by | uuid | 是 | | 更新用户ID，外键关联users表 |
| approved_by | uuid | 是 | | 审批用户ID，外键关联users表 |
| approved_at | timestamptz | 是 | | 审批时间 |
| sent_at | timestamptz | 是 | | 发送时间 |
| viewed_at | timestamptz | 是 | | 客户查看时间 |
| paid_at | timestamptz | 是 | | 完全支付时间 |
| is_deleted | boolean | 否 | false | 软删除标记 |

## 索引

| 索引名 | 列 | 类型 | 描述 |
|--------|-----|------|------|
| invoices_pkey | id | B-tree | 主键索引 |
| idx_invoices_workspace | workspace_id | B-tree | 加速按工作空间查询 |
| idx_invoices_customer | customer_id | B-tree | 加速按客户查询 |
| idx_invoices_fiscal_year | fiscal_year_id | B-tree | 加速按会计年度查询 |
| idx_invoices_status | status | B-tree | 加速按状态查询 |
| idx_invoices_date | invoice_date | B-tree | 加速按日期查询 |
| idx_invoices_number | workspace_id, invoice_number | B-tree | 确保工作空间内发票号唯一 |

## 外键约束

| 约束名 | 列 | 引用表 | 引用列 | 删除行为 | 更新行为 |
|--------|-----|--------|--------|----------|----------|
| invoices_workspace_id_fkey | workspace_id | workspaces | id | CASCADE | RESTRICT |
| invoices_customer_id_fkey | customer_id | customers | id | RESTRICT | RESTRICT |
| invoices_template_id_fkey | template_id | invoice_templates | id | RESTRICT | RESTRICT |
| invoices_transaction_id_fkey | transaction_id | transactions | id | RESTRICT | RESTRICT |
| invoices_fiscal_year_id_fkey | fiscal_year_id | fiscal_years | id | RESTRICT | RESTRICT |
| invoices_created_by_fkey | created_by | users | id | RESTRICT | RESTRICT |
| invoices_updated_by_fkey | updated_by | users | id | RESTRICT | RESTRICT |
| invoices_approved_by_fkey | approved_by | users | id | RESTRICT | RESTRICT |

## RLS 策略

| 策略名 | 操作 | 使用角色 | 使用表达式 | 描述 |
|--------|------|----------|------------|------|
| invoices_policy | ALL | authenticated | workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id() OR id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.get_current_user_id() AND is_active = TRUE)) | 确保用户只能访问自己工作空间或被授权工作空间的发票 |

## 触发器

| 触发器名 | 触发事件 | 触发时机 | 函数 | 描述 |
|----------|----------|----------|------|------|
| update_invoices_updated_at | UPDATE | BEFORE | update_updated_at_column() | 自动更新updated_at字段 |
| audit_invoices | INSERT, UPDATE, DELETE | AFTER | create_audit_log() | 记录审计日志 |
| set_invoice_fiscal_year_trigger | INSERT, UPDATE | BEFORE | set_invoice_fiscal_year() | 自动设置fiscal_year_id |
| update_invoice_status_trigger | INSERT, UPDATE | BEFORE | update_invoice_status() | 自动更新发票状态 |
| log_invoice_activity_trigger | INSERT, UPDATE | AFTER | log_invoice_activity() | 记录发票活动日志 |

## 相关函数

- `set_invoice_fiscal_year()` - 触发器函数，在插入或更新发票时自动设置fiscal_year_id
- `update_invoice_status()` - 触发器函数，自动更新发票状态
- `log_invoice_activity()` - 触发器函数，记录发票活动日志
- `generate_invoice_number(workspace_id UUID)` - 生成新的发票编号
- `get_invoices(workspace_id UUID, status VARCHAR, customer_id UUID, start_date DATE, end_date DATE, limit INTEGER, offset INTEGER)` - 获取发票列表
- `get_invoice(invoice_id UUID)` - 获取发票详情
- `create_invoice(workspace_id UUID, customer_id UUID, invoice_date DATE, due_date DATE, ...)` - 创建新发票

## 业务逻辑说明

### 发票状态流转
发票状态按照以下逻辑自动流转：
1. **草稿(draft)**: 新创建的发票默认为草稿状态
2. **已发送(sent)**: 发票发送给客户后的状态
3. **已查看(viewed)**: 客户查看发票后的状态
4. **部分支付(partial)**: 客户支付了部分金额
5. **已支付(paid)**: 客户支付了全部金额
6. **逾期(overdue)**: 发票已过期但未完全支付
7. **已取消(cancelled)**: 发票被取消

### 发票与会计年度关联
发票与会计年度关联，支持按会计年度优化的余额计算：
1. 每个发票都会自动关联到适当的会计年度
2. 系统根据发票日期自动确定会计年度
3. 如果找不到匹配的会计年度，则使用当前会计年度或最近的会计年度

### 发票与交易关联
发票可以关联到交易记录，实现双重记账：
1. 创建发票时，可以同时创建对应的交易记录
2. 发票支付时，可以创建对应的收款交易记录
3. 通过transaction_id字段建立发票和交易的关联

### 多用户权限控制
发票支持多用户权限控制：
1. 不同角色的用户对发票有不同的操作权限
2. 发票记录创建者、更新者和审批者
3. 高额发票可能需要审批流程

## 示例查询

### 查询工作空间的所有发票
```sql
SELECT 
  i.id, i.invoice_number, i.invoice_date, i.due_date, 
  i.total_amount, i.paid_amount, i.status,
  c.name AS customer_name
FROM 
  invoices i
JOIN 
  customers c ON i.customer_id = c.id
WHERE 
  i.workspace_id = :workspace_id 
  AND i.is_deleted = FALSE
ORDER BY 
  i.invoice_date DESC;
```

### 查询特定状态的发票
```sql
SELECT 
  i.id, i.invoice_number, i.invoice_date, i.due_date, 
  i.total_amount, i.paid_amount, i.status,
  c.name AS customer_name
FROM 
  invoices i
JOIN 
  customers c ON i.customer_id = c.id
WHERE 
  i.workspace_id = :workspace_id 
  AND i.status = :status
  AND i.is_deleted = FALSE
ORDER BY 
  i.invoice_date DESC;
```

### 查询发票详情（包括发票行）
```sql
SELECT 
  i.*,
  c.name AS customer_name,
  json_agg(
    json_build_object(
      'id', il.id,
      'description', il.description,
      'quantity', il.quantity,
      'unit_price', il.unit_price,
      'amount', il.amount,
      'tax_amount', il.tax_amount
    )
  ) AS invoice_lines
FROM 
  invoices i
JOIN 
  customers c ON i.customer_id = c.id
LEFT JOIN 
  invoice_lines il ON i.id = il.invoice_id
WHERE 
  i.id = :invoice_id
  AND i.is_deleted = FALSE
GROUP BY 
  i.id, c.name;
```

## 注意事项

- 发票使用软删除机制，通过is_deleted标记删除状态，而不是物理删除
- 删除发票时，由于外键CASCADE设置，会自动删除所有关联的发票行、付款记录和活动日志
- 发票编号在工作空间内必须唯一
- 发票状态会根据付款情况和日期自动更新
- 创建或修改发票时，会自动记录操作用户和时间

## 变更历史

| 日期 | 迁移文件 | 变更描述 |
|------|----------|----------|
| 2025-05-24 | 20250524020000_invoice_templates_invoices.sql | 创建初始invoices表结构 |
| 2025-05-24 | 20250524030000_invoice_api_functions.sql | 添加发票管理API函数 |
