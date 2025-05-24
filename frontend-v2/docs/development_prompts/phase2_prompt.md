# 阶段二开发提示词：科目表与账户管理

## 功能概述

在这个阶段，我们将实现 AutoBooks Frontend V2 的科目表和账户管理功能。这些功能是会计系统的核心组成部分，为交易记录和财务报表提供基础。

## 技术要求

- 继续使用阶段一的技术栈
- 实现科目表和账户的 CRUD 操作
- 支持科目表模板
- 实现科目与账户的关联管理
- 实现账户余额查询与显示

## 具体任务

### 1. 科目表管理

```
请帮我实现科目表管理功能，包括：
- 科目列表视图（支持层级显示和分页）
- 科目创建表单（支持设置科目编码、名称、类型、描述等）
- 科目编辑功能
- 科目删除功能（检查依赖关系）
- 科目搜索和过滤
- 科目导入/导出功能
```

### 2. 科目表模板

```
请帮我实现科目表模板功能，包括：
- 预定义科目表模板（适用于不同类型企业）
- 模板选择和应用
- 模板自定义和保存
- 从现有工作空间复制科目表
```

### 3. 账户管理

```
请帮我实现账户管理功能，包括：
- 账户列表视图
- 账户创建表单（关联到科目表中的科目）
- 账户编辑功能
- 账户删除功能（检查依赖关系）
- 账户搜索和过滤
- 账户状态管理（激活/停用）
```

### 4. 账户与科目关联

```
请帮我实现账户与科目的关联管理，包括：
- 账户创建/编辑时选择关联科目
- 科目详情页显示关联账户
- 关联关系的修改和删除
- 关联规则验证（确保账户只能关联到特定类型的科目）
```

### 5. 账户余额查询

```
请帮我实现账户余额查询功能，包括：
- 账户当前余额显示
- 余额历史记录
- 余额趋势图表
- 按时间段查询余额
- 余额导出功能
```

## 数据库表设计

需要创建或修改以下数据库表：

1. `chart_of_accounts` - 存储科目表信息
   - id (UUID, PK)
   - workspace_id (UUID, FK to workspaces)
   - code (TEXT) - 科目编码
   - name (TEXT) - 科目名称
   - type (ENUM: 'asset', 'liability', 'equity', 'revenue', 'expense') - 科目类型
   - parent_id (UUID, FK to chart_of_accounts) - 父级科目ID
   - description (TEXT) - 科目描述
   - is_active (BOOLEAN) - 是否激活
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

2. `accounts` - 存储账户信息
   - id (UUID, PK)
   - workspace_id (UUID, FK to workspaces)
   - chart_of_account_id (UUID, FK to chart_of_accounts) - 关联的科目ID
   - name (TEXT) - 账户名称
   - account_number (TEXT) - 账户编号
   - description (TEXT) - 账户描述
   - is_active (BOOLEAN) - 是否激活
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

3. `account_balances` - 存储账户余额信息
   - id (UUID, PK)
   - account_id (UUID, FK to accounts)
   - balance (DECIMAL) - 余额
   - as_of_date (DATE) - 余额日期
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

4. `chart_of_account_templates` - 存储科目表模板
   - id (UUID, PK)
   - name (TEXT) - 模板名称
   - description (TEXT) - 模板描述
   - industry (TEXT) - 适用行业
   - template_data (JSONB) - 模板数据
   - is_system (BOOLEAN) - 是否系统预定义
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

## 安全考虑

- 所有表必须启用行级安全策略(RLS)
- 基于工作空间的数据隔离
- 所有数据库函数使用 SECURITY DEFINER
- 确保工作空间成员只能访问其所属工作空间的数据
- 实现适当的权限检查，确保只有具有相应权限的用户才能执行特定操作

## 测试要点

- 科目表 CRUD 操作
- 科目表模板应用
- 账户 CRUD 操作
- 账户与科目关联
- 账户余额查询
- 权限验证
- 边界条件测试（如删除有依赖关系的科目）

## 完成标准

当满足以下条件时，阶段二可视为完成：

1. 用户可以创建、编辑、删除和查看科目表
2. 用户可以应用预定义的科目表模板
3. 用户可以创建、编辑、删除和查看账户
4. 用户可以将账户关联到科目表中的科目
5. 用户可以查询账户余额和余额历史
6. 所有操作都受到适当的权限控制
7. 所有数据库表和安全策略正确配置
