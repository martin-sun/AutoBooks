# 表名: transactions

## 表描述
交易表是AutoBooks系统的核心财务记录表，用于存储所有财务交易的主要信息。每个交易可以包含多个交易行（双分录），并可以关联标签和税种。交易表与会计年度关联，支持按会计年度优化的余额计算方案。

## 表结构

| 列名 | 数据类型 | 可空 | 默认值 | 描述 |
|------|----------|------|--------|------|
| id | uuid | 否 | uuid_generate_v4() | 主键 |
| workspace_id | uuid | 否 | | 工作空间ID，外键关联workspaces表 |
| txn_date | date | 否 | | 交易日期 |
| reference | text | 是 | | 参考编号，如发票号/收据号 |
| memo | text | 是 | | 交易备注 |
| fiscal_year_id | uuid | 是 | | 会计年度ID，外键关联fiscal_years表 |
| is_closing_entry | boolean | 否 | false | 是否为结转分录 |
| created_at | timestamptz | 否 | now() | 创建时间 |
| updated_at | timestamptz | 否 | now() | 更新时间 |
| is_deleted | boolean | 否 | false | 软删除标记 |

## 索引

| 索引名 | 列 | 类型 | 描述 |
|--------|-----|------|------|
| idx_txn_workspace_date | workspace_id, txn_date | B-tree | 加速按工作空间和日期查询交易 |
| idx_transactions_fiscal_year | fiscal_year_id | B-tree | 加速按会计年度查询交易 |

## 外键约束

| 约束名 | 列 | 引用表 | 引用列 | 删除行为 | 更新行为 |
|--------|-----|--------|--------|----------|----------|
| transactions_workspace_id_fkey | workspace_id | workspaces | id | CASCADE | RESTRICT |
| transactions_fiscal_year_id_fkey | fiscal_year_id | fiscal_years | id | RESTRICT | RESTRICT |

## RLS 策略

| 策略名 | 操作 | 使用角色 | 使用表达式 | 描述 |
|--------|------|----------|------------|------|
| transactions_policy | ALL | authenticated | workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id()) | 确保用户只能访问自己工作空间的交易 |

## 触发器

| 触发器名 | 触发事件 | 触发时机 | 函数 | 描述 |
|----------|----------|----------|------|------|
| update_transactions_updated_at | UPDATE | BEFORE | update_updated_at_column() | 自动更新updated_at字段 |
| audit_transactions | INSERT, UPDATE, DELETE | AFTER | create_audit_log() | 记录审计日志 |
| set_transaction_fiscal_year | INSERT, UPDATE | BEFORE | set_transaction_fiscal_year() | 自动设置fiscal_year_id |

## 相关函数

- `determine_fiscal_year(workspace_id_param UUID, txn_date_param DATE)` - 根据交易日期确定适当的会计年度
- `set_transaction_fiscal_year()` - 触发器函数，在插入或更新交易时自动设置fiscal_year_id

## 业务逻辑说明

### 双重记账原则
AutoBooks系统遵循双重记账原则，每个交易必须平衡（借方=贷方）：
1. 每个交易包含多个交易行（transaction_lines）
2. 所有交易行的金额总和必须为零
3. 系统通过check_transaction_balance触发器强制执行这一原则

### 会计年度关联
交易与会计年度关联，支持按会计年度优化的余额计算：
1. 每个交易都会自动关联到适当的会计年度
2. 系统根据交易日期自动确定会计年度
3. 如果找不到匹配的会计年度，则使用当前会计年度或最近的会计年度

### 会计年度自动分配逻辑
系统会根据交易日期自动将交易分配到相应的会计年度：
1. 首先查找包含交易日期的会计年度
2. 如果找不到，使用当前会计年度
3. 如果仍然找不到，使用最近的会计年度

### 结转分录
系统支持年度结转功能：
1. 结转分录是特殊的交易，用于将一个会计年度的收入和支出结转到下一个会计年度
2. 结转分录通过is_closing_entry字段标识
3. 结转分录通常在会计年度结束时创建

## 示例查询

### 查询工作空间的所有交易
```sql
SELECT t.*, fy.name AS fiscal_year_name
FROM transactions t
LEFT JOIN fiscal_years fy ON t.fiscal_year_id = fy.id
WHERE t.workspace_id = :workspace_id AND t.is_deleted = FALSE
ORDER BY t.txn_date DESC;
```

### 查询特定会计年度的交易
```sql
SELECT t.*
FROM transactions t
WHERE t.workspace_id = :workspace_id 
  AND t.fiscal_year_id = :fiscal_year_id 
  AND t.is_deleted = FALSE
ORDER BY t.txn_date DESC;
```

### 查询特定日期范围的交易
```sql
SELECT t.*
FROM transactions t
WHERE t.workspace_id = :workspace_id 
  AND t.txn_date BETWEEN :start_date AND :end_date
  AND t.is_deleted = FALSE
ORDER BY t.txn_date DESC;
```

### 查询交易详情（包括交易行）
```sql
SELECT 
  t.*,
  json_agg(
    json_build_object(
      'id', tl.id,
      'account_id', tl.account_id,
      'account_name', a.name,
      'amount', tl.amount,
      'description', tl.description
    )
  ) AS transaction_lines
FROM 
  transactions t
JOIN 
  transaction_lines tl ON t.id = tl.transaction_id
JOIN 
  accounts a ON tl.account_id = a.id
WHERE 
  t.id = :transaction_id
  AND t.is_deleted = FALSE
GROUP BY 
  t.id;
```

## 注意事项

- 交易使用软删除机制，通过is_deleted标记删除状态，而不是物理删除
- 删除交易时，由于外键CASCADE设置，会自动删除所有关联的交易行
- 创建或修改交易时，必须确保所有交易行的金额总和为零
- 随着会计年度功能的引入，所有交易都会自动关联到适当的会计年度

## 变更历史

| 日期 | 迁移文件 | 变更描述 |
|------|----------|----------|
| 2025-05-09 | 20250509000000_initial_schema.sql | 创建初始transactions表结构 |
| 2025-05-14 | 20250514_add_fiscal_year_to_transactions.sql | 添加fiscal_year_id和is_closing_entry字段，创建自动分配会计年度的触发器 |
