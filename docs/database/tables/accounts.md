# 表名: accounts

## 表描述
账户表存储工作空间中的具体账户信息，是实际财务记录的基础。每个账户都关联到会计科目表中的特定科目类型，如银行账户、信用卡、收入账户、费用账户等。账户是交易记录的直接载体，所有交易都通过账户进行记录。

## 表结构

| 列名 | 数据类型 | 可空 | 默认值 | 描述 |
|------|----------|------|--------|------|
| id | uuid | 否 | uuid_generate_v4() | 主键 |
| workspace_id | uuid | 否 | | 工作空间ID，外键关联workspaces表 |
| chart_id | uuid | 否 | | 会计科目ID，外键关联chart_of_accounts表 |
| name | text | 否 | | 账户名称 |
| description | text | 是 | | 账户描述 |
| opening_balance | numeric(18,2) | 否 | 0 | 期初余额 |
| currency | char(3) | 否 | 'CAD' | 账户货币，使用三字符ISO代码 |
| created_at | timestamptz | 否 | now() | 创建时间 |
| updated_at | timestamptz | 否 | now() | 更新时间 |
| is_deleted | boolean | 否 | false | 软删除标记 |

## 索引

| 索引名 | 列 | 类型 | 描述 |
|--------|-----|------|------|
| idx_accounts_workspace | workspace_id | B-tree | 加速按工作空间ID查询账户 |

## 外键约束

| 约束名 | 列 | 引用表 | 引用列 | 删除行为 | 更新行为 |
|--------|-----|--------|--------|----------|----------|
| accounts_workspace_id_fkey | workspace_id | workspaces | id | CASCADE | RESTRICT |
| accounts_chart_id_fkey | chart_id | chart_of_accounts | id | RESTRICT | RESTRICT |

## RLS 策略

| 策略名 | 操作 | 使用角色 | 使用表达式 | 描述 |
|--------|------|----------|------------|------|
| accounts_policy | ALL | authenticated | workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id()) | 确保用户只能访问自己工作空间的账户 |

## 触发器

| 触发器名 | 触发事件 | 触发时机 | 函数 | 描述 |
|----------|----------|----------|------|------|
| update_accounts_updated_at | UPDATE | BEFORE | update_updated_at_column() | 自动更新updated_at字段 |
| audit_accounts | INSERT, UPDATE, DELETE | AFTER | create_audit_log() | 记录审计日志 |

## 相关函数

- `get_bank_accounts(workspace_id_param UUID)` - 获取工作空间中的银行账户列表
- `create_bank_account(...)` - 创建新的银行账户，包括双重记账处理
- `update_bank_account(...)` - 更新银行账户信息
- `delete_bank_account(...)` - 删除银行账户（软删除）

## 业务逻辑说明

### 账户与科目的关系
每个账户都必须关联到会计科目表中的一个科目。这种关系确定了账户的类型和行为：
1. 资产类账户：如银行账户、现金账户、应收账款等
2. 负债类账户：如信用卡、贷款、应付账款等
3. 权益类账户：如所有者权益、留存收益等
4. 收入类账户：如销售收入、服务收入等
5. 支出类账户：如租金支出、工资支出等

### 余额计算
根据按会计年度优化的余额计算方案，账户余额的计算方式为：
1. **不存储实时余额**：账户表中的opening_balance仅表示初始设置的期初余额
2. **按会计年度分割数据**：通过account_year_balances表存储每个会计年度的期初余额
3. **余额计算公式**：当前余额 = 年度期初余额 + 当年交易总和

### 银行账户管理
系统对银行相关账户（如银行账户、信用卡等）提供特殊处理：
1. 只有关联到被标记为is_payment=TRUE的会计科目的账户才会显示在银行账户列表中
2. 银行账户创建时会自动处理期初余额的双重记账
3. 银行账户支持对账功能，通过last_reconciled_date记录最后对账日期

### 账户初始化
当创建新工作空间时，系统会自动创建一些默认账户：
1. Cash（现金）- 资产类
2. Accounts Receivable（应收账款）- 资产类
3. Accounts Payable（应付账款）- 负债类
4. Sales Revenue（销售收入）- 收入类
5. Office Supplies（办公用品）- 支出类
6. Rent（租金）- 支出类

## 示例查询

### 查询工作空间的所有账户
```sql
SELECT a.*, c.type AS account_type
FROM accounts a
JOIN chart_of_accounts c ON a.chart_id = c.id
WHERE a.workspace_id = :workspace_id AND a.is_deleted = FALSE
ORDER BY c.type, a.name;
```

### 查询银行账户及其余额
```sql
SELECT 
  a.id,
  a.name,
  a.description,
  c.type AS account_type,
  a.opening_balance,
  (a.opening_balance + COALESCE(SUM(tl.amount), 0)) AS current_balance,
  a.currency
FROM 
  accounts a
JOIN 
  chart_of_accounts c ON a.chart_id = c.id
LEFT JOIN 
  transaction_lines tl ON a.id = tl.account_id
LEFT JOIN
  transactions t ON tl.transaction_id = t.id AND t.is_deleted = FALSE
WHERE 
  a.workspace_id = :workspace_id
  AND a.is_deleted = FALSE
  AND c.is_payment = TRUE
GROUP BY 
  a.id, a.name, a.description, c.type, a.opening_balance, a.currency
ORDER BY 
  a.name;
```

### 查询特定类型的账户
```sql
SELECT a.*
FROM accounts a
JOIN chart_of_accounts c ON a.chart_id = c.id
WHERE a.workspace_id = :workspace_id 
  AND c.type = :type 
  AND a.is_deleted = FALSE
ORDER BY a.name;
```

## 注意事项

- 账户使用软删除机制，通过is_deleted标记删除状态，而不是物理删除
- 创建银行账户时，需要正确处理期初余额的双重记账
- 随着会计年度功能的引入，账户余额计算已经从直接使用opening_balance转变为使用account_year_balances表
- 删除账户前应确保没有关联的交易，或者将关联交易一并标记为删除

## 变更历史

| 日期 | 迁移文件 | 变更描述 |
|------|----------|----------|
| 2025-05-09 | 20250509000000_initial_schema.sql | 创建初始accounts表结构 |
| 2025-05-10 | 20250510120000_add_is_payment_to_accounts.sql | 添加is_payment字段（后被移至chart_of_accounts表） |
| 2025-05-13 | 20250513_create_bank_accounts_functions.sql | 创建银行账户管理函数 |
| 2025-05-13 | 20250513_fix_bank_account_creation.sql | 修复银行账户创建逻辑 |
