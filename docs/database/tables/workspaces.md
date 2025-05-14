# 表名: workspaces

## 表描述
工作空间表是AutoBooks系统的核心表之一，用于存储用户的工作空间信息。每个用户可以拥有多个工作空间，包括个人工作空间和商业工作空间。工作空间是数据隔离的基本单位，所有业务数据都与特定工作空间关联。

## 表结构

| 列名 | 数据类型 | 可空 | 默认值 | 描述 |
|------|----------|------|--------|------|
| id | uuid | 否 | uuid_generate_v4() | 主键 |
| user_id | uuid | 否 | | 用户ID，外键关联users表 |
| name | text | 否 | | 工作空间名称 |
| type | text | 否 | | 工作空间类型，可选值：'personal'或'business' |
| currency | char(3) | 否 | 'CAD' | 默认货币，使用三字符ISO代码 |
| created_at | timestamptz | 否 | now() | 创建时间 |
| updated_at | timestamptz | 否 | now() | 更新时间 |
| is_deleted | boolean | 否 | false | 软删除标记 |

## 索引

| 索引名 | 列 | 类型 | 描述 |
|--------|-----|------|------|
| idx_workspaces_user | user_id | B-tree | 加速按用户ID查询工作空间 |

## 外键约束

| 约束名 | 列 | 引用表 | 引用列 | 删除行为 | 更新行为 |
|--------|-----|--------|--------|----------|----------|
| workspaces_user_id_fkey | user_id | users | id | CASCADE | RESTRICT |

## RLS 策略

| 策略名 | 操作 | 使用角色 | 使用表达式 | 描述 |
|--------|------|----------|------------|------|
| workspace_user_policy | ALL | authenticated | user_id = auth.get_current_user_id() | 确保用户只能访问自己的工作空间 |

## 触发器

| 触发器名 | 触发事件 | 触发时机 | 函数 | 描述 |
|----------|----------|----------|------|------|
| update_workspaces_updated_at | UPDATE | BEFORE | update_updated_at_column() | 自动更新updated_at字段 |
| audit_workspaces | INSERT, UPDATE, DELETE | AFTER | create_audit_log() | 记录审计日志 |
| initialize_new_workspace | INSERT | AFTER | auto_initialize_workspace() | 自动初始化工作空间默认值 |

## 相关函数

- `auto_initialize_workspace()` - 在创建新工作空间时自动初始化默认值的触发器函数
- `initialize_workspace_defaults(workspace_id UUID)` - 为新工作空间创建默认科目表、账户、税种和标签

## 业务逻辑说明

### 工作空间类型
工作空间分为两种类型：
1. **个人工作空间(personal)**：用于个人财务管理，每个用户在注册后自动创建一个个人工作空间
2. **商业工作空间(business)**：用于商业财务管理，用户可以手动创建多个商业工作空间

### 工作空间自动创建
当新用户注册时，系统会自动创建一个默认的个人工作空间。这是通过Edge Function实现的，而不是通过数据库触发器：
1. 前端dashboard页面检测到用户没有工作空间时，会调用`create-workspace` Edge Function
2. 函数验证用户JWT令牌，检查是否已存在工作空间，如不存在则创建新的个人工作空间
3. 成功创建后返回工作空间ID，前端自动重定向到该工作空间

### 工作空间初始化
当创建新工作空间时，系统会自动初始化以下默认值：
1. 默认会计科目表(chart_of_accounts)
2. 默认账户(accounts)
3. 默认税种(taxes)
4. 默认标签(tags)

### 工作空间间关系
系统支持个人-商业支出管理：
1. 跨工作空间交易链接：在个人工作空间记录支出时，可标记为商业相关并自动在商业工作空间创建对应条目
2. 支出分配：支持将个人支出部分分配给商业（如家庭办公室百分比、车辆使用）
3. 报销跟踪：自动跟踪从个人账户支付的商业费用，简化报销流程

## 示例查询

### 查询用户的所有工作空间
```sql
SELECT * FROM workspaces 
WHERE user_id = auth.uid() AND is_deleted = FALSE
ORDER BY created_at;
```

### 查询用户的默认工作空间
```sql
SELECT * FROM workspaces 
WHERE user_id = auth.uid() AND is_deleted = FALSE AND type = 'personal'
LIMIT 1;
```

### 查询用户的所有商业工作空间
```sql
SELECT * FROM workspaces 
WHERE user_id = auth.uid() AND is_deleted = FALSE AND type = 'business'
ORDER BY name;
```

## 注意事项

- 工作空间使用软删除机制，通过is_deleted标记删除状态，而不是物理删除
- 删除工作空间时，由于外键CASCADE设置，会自动删除所有关联的数据
- 每个用户应至少有一个个人工作空间

## 变更历史

| 日期 | 迁移文件 | 变更描述 |
|------|----------|----------|
| 2025-05-09 | 20250509000000_initial_schema.sql | 创建初始workspaces表结构 |
