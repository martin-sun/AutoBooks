# AutoBooks 多用户权限系统

## 系统概述

AutoBooks 多用户权限系统是一个基于角色的访问控制（RBAC）系统，允许工作空间所有者邀请其他用户加入工作空间并分配不同的角色和权限。该系统支持细粒度的权限控制，审批工作流，以及自定义权限分配。

## 核心组件

### 1. 角色（Roles）

角色是权限的集合，定义了用户在系统中可以执行的操作。系统预定义了以下角色：

| 角色名 | 描述 | 系统预定义 |
|--------|------|------------|
| owner | 工作空间所有者，拥有所有权限 | 是 |
| admin | 管理员，可以管理用户和大部分设置 | 是 |
| accountant | 会计师，可以处理所有财务操作 | 是 |
| bookkeeper | 记账员，可以创建和编辑交易 | 是 |
| approver | 审批人，可以审批发票和支出 | 是 |
| viewer | 查看者，只能查看报表和数据 | 是 |

### 2. 权限（Permissions）

权限定义了对特定资源的特定操作。权限由资源（resource）和操作（action）组成：

| 资源类型 | 可用操作 | 描述 |
|----------|----------|------|
| invoice | create, read, update, delete, send, approve | 发票相关操作 |
| transaction | create, read, update, delete, reconcile | 交易相关操作 |
| report | view_financial, view_tax, export | 报表相关操作 |
| settings | manage_users, manage_company, manage_chart_of_accounts | 设置相关操作 |

### 3. 工作空间成员（Workspace Members）

工作空间成员表示用户在特定工作空间中的成员资格和角色：

- 每个用户可以是多个工作空间的成员
- 每个工作空间成员都有一个指定的角色
- 成员可以被邀请加入工作空间，需要接受邀请
- 成员可以被激活或停用

### 4. 自定义权限（Custom Permissions）

除了基于角色的权限外，系统还支持为特定成员分配自定义权限：

- 可以授予或撤销特定权限
- 自定义权限可以设置过期时间
- 自定义权限优先级高于角色权限

### 5. 审批工作流（Approval Workflows）

审批工作流允许为特定操作设置审批要求：

- 可以基于金额、类型等条件设置审批规则
- 可以指定特定角色或用户作为审批人
- 支持审批历史记录和审批状态跟踪

## 数据库结构

### 表关系图

```
workspaces
    ↑
    |
    +-- workspace_members -- users
    |       ↑
    |       |
    |       +-- roles -- role_permissions -- permissions
    |       |
    |       +-- workspace_custom_permissions
    |
    +-- approval_workflows
            |
            +-- approvals
```

### 主要表说明

1. **roles**: 存储系统角色定义
2. **permissions**: 存储系统权限定义
3. **role_permissions**: 角色和权限的多对多关联
4. **workspace_members**: 用户在工作空间中的成员资格
5. **workspace_custom_permissions**: 工作空间级别的自定义权限
6. **approval_workflows**: 审批工作流配置
7. **approvals**: 审批记录

## 权限检查机制

系统提供了 `auth.user_has_permission()` 函数来检查用户是否拥有特定权限：

```sql
SELECT auth.user_has_permission(
  workspace_id_param UUID,  -- 工作空间ID
  resource_param TEXT,      -- 资源类型，如'invoice'
  action_param TEXT         -- 操作类型，如'create'
)
```

权限检查逻辑如下：
1. 检查用户是否是工作空间所有者，如果是则拥有所有权限
2. 检查用户通过角色是否拥有权限
3. 检查用户是否有自定义权限授予或撤销

## 工作流程示例

### 邀请新成员

1. 工作空间所有者或管理员创建邀请
2. 系统创建工作空间成员记录，设置invited_at时间
3. 系统发送邀请邮件给用户
4. 用户接受邀请，系统设置accepted_at时间
5. 用户现在可以访问工作空间，权限基于分配的角色

### 审批工作流

1. 用户创建需要审批的资源（如高额发票）
2. 系统检查是否触发审批工作流条件
3. 如果需要审批，创建审批记录
4. 通知审批人有待处理的审批
5. 审批人审批或拒绝请求
6. 系统更新资源状态和审批记录

## 最佳实践

1. **角色分配**:
   - 为每个用户分配最小必要权限的角色
   - 避免过多用户拥有owner或admin角色

2. **自定义权限**:
   - 使用自定义权限解决临时权限需求
   - 为敏感操作设置权限过期时间

3. **审批工作流**:
   - 为高风险操作设置审批工作流
   - 确保审批人与操作执行人不是同一人

4. **权限审计**:
   - 定期审查用户权限
   - 检查未使用的账户和过期的自定义权限

## API 函数

系统提供以下API函数用于权限管理：

```sql
-- 检查用户权限
SELECT auth.user_has_permission(workspace_id, 'invoice', 'create');

-- 获取用户在工作空间的角色
SELECT role_id FROM workspace_members 
WHERE workspace_id = :workspace_id AND user_id = auth.uid();

-- 获取角色的所有权限
SELECT p.* FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
WHERE rp.role_id = :role_id;

-- 获取用户的自定义权限
SELECT p.* FROM permissions p
JOIN workspace_custom_permissions wcp ON p.id = wcp.permission_id
JOIN workspace_members wm ON wcp.member_id = wm.id
WHERE wm.workspace_id = :workspace_id 
  AND wm.user_id = auth.uid()
  AND wcp.granted = TRUE
  AND (wcp.expires_at IS NULL OR wcp.expires_at > NOW());
```

## 变更历史

| 日期 | 迁移文件 | 变更描述 |
|------|----------|----------|
| 2025-05-24 | 20250524000000_multi_user_permissions.sql | 创建多用户权限系统的初始结构 |
