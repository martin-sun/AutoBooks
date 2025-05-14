# 表名: fiscal_years

## 表描述
会计年度表，用于定义工作空间的会计年度周期，支持按会计年度优化的余额计算方案。

## 表结构

| 列名 | 数据类型 | 可空 | 默认值 | 描述 |
|------|----------|------|--------|------|
| id | uuid | 否 | uuid_generate_v4() | 主键 |
| workspace_id | uuid | 否 | | 工作空间ID，外键关联workspaces表 |
| name | text | 否 | | 会计年度名称，例如"2025财年" |
| start_date | date | 否 | | 会计年度开始日期 |
| end_date | date | 否 | | 会计年度结束日期 |
| is_current | boolean | 否 | false | 是否为当前会计年度 |
| is_closed | boolean | 否 | false | 会计年度是否已关闭 |
| created_at | timestamptz | 否 | now() | 创建时间 |
| updated_at | timestamptz | 否 | now() | 更新时间 |
| is_deleted | boolean | 否 | false | 软删除标志 |

## 相关表

### account_year_balances
存储每个账户在每个会计年度的期初/期末余额。

| 列名 | 数据类型 | 可空 | 默认值 | 描述 |
|------|----------|------|--------|------|
| id | uuid | 否 | uuid_generate_v4() | 主键 |
| workspace_id | uuid | 否 | | 工作空间ID |
| account_id | uuid | 否 | | 账户ID，关联accounts表 |
| fiscal_year_id | uuid | 否 | | 会计年度ID，关联fiscal_years表 |
| opening_balance | numeric(18,2) | 否 | 0 | 期初余额 |
| closing_balance | numeric(18,2) | 是 | | 期末余额 |
| last_reconciled_date | timestamptz | 是 | | 最后对账日期 |
| created_at | timestamptz | 否 | now() | 创建时间 |
| updated_at | timestamptz | 否 | now() | 更新时间 |
| is_deleted | boolean | 否 | false | 软删除标志 |

### transactions (相关字段)
交易表中与会计年度相关的字段。

| 列名 | 数据类型 | 可空 | 默认值 | 描述 |
|------|----------|------|--------|------|
| fiscal_year_id | uuid | 是 | | 会计年度ID，关联fiscal_years表 |
| is_closing_entry | boolean | 否 | false | 是否为结转分录 |

## 业务逻辑说明

### 按会计年度优化的余额计算方案

1. **不存储实时余额，保持数据规范性**
   - 账户余额不直接存储在accounts表中
   - 而是通过交易记录和期初余额计算得出

2. **按会计年度分割数据，限制每次计算的数据量**
   - 每个会计年度有独立的期初余额记录
   - 余额计算只需考虑当前会计年度的交易

3. **年度结转时生成期初余额表，为下一年度提供计算起点**
   - 当会计年度结束时，计算所有账户的期末余额
   - 将期末余额作为下一年度的期初余额

### 余额计算方式
当前余额 = 年度期初余额 + 当年交易总和

### 会计年度自动分配
系统会根据交易日期自动将交易分配到相应的会计年度：
1. 首先查找包含交易日期的会计年度
2. 如果找不到，使用当前会计年度
3. 如果仍然找不到，使用最近的会计年度

## 相关函数

### determine_fiscal_year(workspace_id_param UUID, txn_date_param DATE)
根据工作空间ID和交易日期确定适当的会计年度ID。

### set_transaction_fiscal_year()
触发器函数，在插入或更新交易时自动设置fiscal_year_id。

## 注意事项

- 确保每个工作空间至少有一个会计年度
- 会计年度的日期范围不应重叠
- 每个工作空间只能有一个当前会计年度(is_current=TRUE)
- 关闭会计年度前应确保所有账户的期末余额已计算完成

## 变更历史

| 日期 | 迁移文件 | 变更描述 |
|------|----------|----------|
| 2025-05-14 | 20250514_create_account_year_balances_table.sql | 创建account_year_balances表 |
| 2025-05-14 | 20250514_add_fiscal_year_to_transactions.sql | 向transactions表添加fiscal_year_id字段 |
