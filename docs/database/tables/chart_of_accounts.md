# 表名: chart_of_accounts

## 表描述
会计科目表是AutoBooks系统的核心会计结构，用于定义工作空间中的会计科目类型。它提供了一个分类框架，用于组织和跟踪所有财务交易。每个工作空间都有自己的会计科目表，包含资产、负债、权益、收入和支出五大类科目。

## 表结构

| 列名 | 数据类型 | 可空 | 默认值 | 描述 |
|------|----------|------|--------|------|
| id | uuid | 否 | uuid_generate_v4() | 主键 |
| workspace_id | uuid | 否 | | 工作空间ID，外键关联workspaces表 |
| code | text | 是 | | 可选科目编码，如1000, 2000等 |
| name | text | 否 | | 科目名称 |
| type | text | 否 | | 科目类型，可选值：'asset'、'liability'、'equity'、'income'、'expense' |
| description | text | 是 | | 科目描述 |
| is_payment | boolean | 否 | false | 是否为支付相关科目，用于标识银行账户类型 |
| created_at | timestamptz | 否 | now() | 创建时间 |
| updated_at | timestamptz | 否 | now() | 更新时间 |
| is_deleted | boolean | 否 | false | 软删除标记 |

## 索引

| 索引名 | 列 | 类型 | 描述 |
|--------|-----|------|------|
| idx_coa_workspace | workspace_id | B-tree | 加速按工作空间ID查询科目 |

## 外键约束

| 约束名 | 列 | 引用表 | 引用列 | 删除行为 | 更新行为 |
|--------|-----|--------|--------|----------|----------|
| chart_of_accounts_workspace_id_fkey | workspace_id | workspaces | id | CASCADE | RESTRICT |

## RLS 策略

| 策略名 | 操作 | 使用角色 | 使用表达式 | 描述 |
|--------|------|----------|------------|------|
| chart_of_accounts_policy | ALL | authenticated | workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id()) | 确保用户只能访问自己工作空间的科目 |

## 触发器

| 触发器名 | 触发事件 | 触发时机 | 函数 | 描述 |
|----------|----------|----------|------|------|
| update_chart_of_accounts_updated_at | UPDATE | BEFORE | update_updated_at_column() | 自动更新updated_at字段 |
| audit_chart_of_accounts | INSERT, UPDATE, DELETE | AFTER | create_audit_log() | 记录审计日志 |

## 业务逻辑说明

### 科目类型
会计科目表支持五种基本类型：
1. **资产(asset)**：公司拥有的有价值的资源，如现金、银行账户、应收账款、设备等
2. **负债(liability)**：公司欠他人的债务，如应付账款、贷款、信用卡等
3. **权益(equity)**：所有者在公司中的权益，如所有者投资、留存收益等
4. **收入(income)**：增加公司价值的交易，如销售收入、服务收入等
5. **支出(expense)**：减少公司价值的交易，如租金、工资、办公用品等

### 科目层次结构
会计科目表支持两级结构：
1. **父级科目**：如"Assets"、"Liabilities"等大类
2. **子级科目**：如"Bank Accounts"、"Credit Cards"等具体类型

### 银行账户标识
通过`is_payment`字段标识哪些科目类型适合作为银行账户：
1. **资产类型**中的银行相关科目（如银行账户、支票账户、储蓄账户、现金等）
2. **负债类型**中的信用相关科目（如信用卡、贷款、信用额度等）

这种实现避免了硬编码，使系统更加灵活和可维护。

### 科目初始化
当创建新工作空间时，系统会自动创建默认的会计科目表，包括：
1. 资产类科目：如Cash、Accounts Receivable等
2. 负债类科目：如Accounts Payable等
3. 权益类科目：如Owner's Equity等
4. 收入类科目：如Sales Revenue等
5. 支出类科目：如Office Supplies、Rent等

## 示例查询

### 查询工作空间的所有会计科目
```sql
SELECT * FROM chart_of_accounts 
WHERE workspace_id = :workspace_id AND is_deleted = FALSE
ORDER BY type, name;
```

### 查询适合作为银行账户的科目
```sql
SELECT * FROM chart_of_accounts 
WHERE workspace_id = :workspace_id 
  AND is_deleted = FALSE
  AND is_payment = TRUE
ORDER BY type, name;
```

### 按类型查询会计科目
```sql
SELECT * FROM chart_of_accounts 
WHERE workspace_id = :workspace_id 
  AND type = :type 
  AND is_deleted = FALSE
ORDER BY name;
```

## 注意事项

- 会计科目表使用软删除机制，通过is_deleted标记删除状态，而不是物理删除
- 在Banking功能中，只有被标记为is_payment=TRUE的科目才会显示在银行账户列表中
- 父级科目（如"Assets"、"Liabilities"）不应作为实际的银行账户类型被选择

## 变更历史

| 日期 | 迁移文件 | 变更描述 |
|------|----------|----------|
| 2025-05-09 | 20250509000000_initial_schema.sql | 创建初始chart_of_accounts表结构 |
| 2025-05-13 | 20250513_add_is_payment_to_chart_of_accounts.sql | 添加is_payment字段，用于标识银行账户类型 |
