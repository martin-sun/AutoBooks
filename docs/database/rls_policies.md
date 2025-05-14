# AutoBooks 行级安全策略 (RLS)

本文档详细说明了AutoBooks系统中使用的行级安全策略(Row Level Security)，这些策略确保多租户环境中的数据隔离和安全访问。

## RLS 策略概述

AutoBooks使用PostgreSQL的行级安全策略来实现以下安全目标：

1. **多租户隔离**：确保用户只能访问自己的工作空间数据
2. **数据访问控制**：根据用户身份和角色限制数据访问
3. **安全审计**：记录所有数据访问和修改操作

## 核心安全模型

AutoBooks的安全模型基于以下层次结构：

1. **用户(User)**：通过Supabase Auth进行身份验证
2. **工作空间(Workspace)**：每个用户可以拥有多个工作空间
3. **业务数据**：所有业务数据都与特定工作空间关联

## 通用RLS策略模式

大多数表使用以下两种模式之一：

### 直接工作空间关联

适用于直接包含workspace_id字段的表：

```sql
CREATE POLICY table_policy ON table_name
  FOR ALL
  USING (workspace_id IN (
    SELECT id FROM workspaces WHERE user_id = auth.uid() AND is_deleted IS NOT TRUE
  ));
```

### 间接工作空间关联

适用于通过外键间接关联到workspace_id的表：

```sql
CREATE POLICY table_policy ON table_name
  FOR ALL
  USING (parent_id IN (
    SELECT id FROM parent_table WHERE workspace_id IN (
      SELECT id FROM workspaces WHERE user_id = auth.uid() AND is_deleted IS NOT TRUE
    )
  ));
```

## 表格RLS策略详情

| 表名 | 策略名 | 策略类型 | 策略表达式 |
|------|--------|----------|------------|
| workspaces | workspace_user_policy | ALL | user_id = auth.get_current_user_id() |
| chart_of_accounts | chart_of_accounts_policy | ALL | workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id()) |
| accounts | accounts_policy | ALL | workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id()) |
| fiscal_years | fiscal_years_policy | ALL | workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id()) |
| account_year_balances | account_year_balances_workspace_isolation | ALL | workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid() AND is_deleted IS NOT TRUE) |
| transactions | transactions_policy | ALL | workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id()) |
| transaction_lines | transaction_lines_policy | ALL | transaction_id IN (SELECT id FROM transactions WHERE workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id())) |
| tags | tags_policy | ALL | workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id()) |
| transaction_tags | transaction_tags_policy | ALL | transaction_id IN (SELECT id FROM transactions WHERE workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id())) |
| taxes | taxes_policy | ALL | workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id()) |
| transaction_taxes | transaction_taxes_policy | ALL | transaction_id IN (SELECT id FROM transactions WHERE workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id())) |
| assets | assets_policy | ALL | workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id()) |
| asset_categories | asset_categories_policy | ALL | workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id()) |
| sidebar_menu_items | sidebar_menu_items_policy | ALL | template_id IN (SELECT id FROM sidebar_templates) |
| audit_logs | audit_logs_policy | ALL | workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id()) |

## 特殊RLS策略

### 工作空间间余额表

工作空间间余额表(inter_workspace_balances)需要特殊处理，因为它关联两个工作空间：

```sql
CREATE POLICY inter_workspace_balances_policy ON inter_workspace_balances
  FOR ALL
  USING (from_workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id()) OR
         to_workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id()));
```

### 侧边栏菜单项

侧边栏菜单项是系统级配置，所有用户都可以访问：

```sql
CREATE POLICY sidebar_menu_items_policy ON sidebar_menu_items
  FOR ALL
  USING (template_id IN (SELECT id FROM sidebar_templates));
```

## 安全函数

系统使用以下函数来支持RLS策略：

```sql
CREATE OR REPLACE FUNCTION auth.get_current_user_id()
RETURNS UUID
LANGUAGE sql STABLE
AS $$
  SELECT auth.uid();
$$;
```

## 最佳实践

1. **使用SECURITY DEFINER函数**：所有数据库函数都应使用SECURITY DEFINER属性，以确保它们在调用者的安全上下文中执行
2. **避免RLS递归**：在设计复杂查询时，避免RLS策略导致递归问题
3. **定期审计**：定期检查RLS策略的有效性和覆盖范围
4. **测试边缘情况**：测试各种用户角色和数据访问场景，确保RLS策略正常工作

## 常见问题

### RLS策略递归问题

在某些情况下，RLS策略可能导致递归问题，特别是在使用复杂的JOIN查询时。解决方法：

1. 使用SECURITY DEFINER函数绕过RLS
2. 简化查询结构，避免复杂的JOIN
3. 在函数中使用显式的权限检查，而不是依赖RLS

### 性能考虑

RLS策略可能影响查询性能，特别是在大型数据集上。优化建议：

1. 确保所有RLS策略中使用的字段都有适当的索引
2. 监控查询性能，识别可能的瓶颈
3. 对频繁访问的数据使用缓存策略

## 变更历史

| 日期 | 迁移文件 | 变更描述 |
|------|----------|----------|
| 2025-05-09 | 20250509000000_initial_schema.sql | 创建初始RLS策略 |
| 2025-05-11 | 20250511_fix_asset_categories_rls.sql | 修复资产类别RLS策略 |
| 2025-05-11 | 20250511_fix_audit_logs_policy.sql | 修复审计日志RLS策略 |
| 2025-05-14 | 20250514_create_account_year_balances_table.sql | 添加账户年度余额表RLS策略 |
