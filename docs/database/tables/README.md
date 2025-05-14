# AutoBooks 数据库表结构

本目录包含 AutoBooks 系统中所有数据库表的详细文档。每个表的文档包括字段定义、约束、索引、关系和业务逻辑说明。

## 核心表

### 用户和工作空间
- [users](./users.md) - 用户信息表
- [workspaces](./workspaces.md) - 工作空间表，支持个人和商业类型

### 会计核心
- [chart_of_accounts](./chart_of_accounts.md) - 会计科目表
- [accounts](./accounts.md) - 账户表
- [fiscal_years](./fiscal_years.md) - 会计年度表
- [account_year_balances](./account_year_balances.md) - 账户年度余额表

### 交易相关
- [transactions](./transactions.md) - 交易主表
- [transaction_lines](./transaction_lines.md) - 交易行表（双分录）
- [transaction_tags](./transaction_tags.md) - 交易标签关联表
- [transaction_taxes](./transaction_taxes.md) - 交易税种关联表

### 资产管理
- [assets](./assets.md) - 资产表
- [asset_categories](./asset_categories.md) - 资产类别表
- [asset_transactions](./asset_transactions.md) - 资产交易关联表

### 其他功能表
- [tags](./tags.md) - 标签表
- [taxes](./taxes.md) - 税种表
- [inter_workspace_balances](./inter_workspace_balances.md) - 工作空间间余额表
- [budgets](./budgets.md) - 预算表
- [budget_items](./budget_items.md) - 预算项目表
- [audit_logs](./audit_logs.md) - 审计日志表

### 侧边栏菜单
- [sidebar_templates](./sidebar_templates.md) - 侧边栏模板表
- [sidebar_menu_items](./sidebar_menu_items.md) - 侧边栏菜单项表
- [workspace_menu_configs](./workspace_menu_configs.md) - 工作空间菜单配置表

## 表关系图

数据库关系图可在 [../diagrams/database_relationships.md](../diagrams/database_relationships.md) 中查看。

## 最近更新

- 2025-05-14: 添加了会计年度相关表结构，包括 fiscal_years 和 account_year_balances
- 2025-05-13: 更新了 chart_of_accounts 表，添加了 is_payment 字段
- 2025-05-12: 添加了图表账户相关表结构
- 2025-05-11: 添加了资产管理和侧边栏菜单相关表结构
