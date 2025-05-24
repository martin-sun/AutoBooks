# 阶段一开发提示词：基础架构与工作空间管理

## 功能概述

在这个阶段，我们将建立 AutoBooks Frontend V2 的基础架构，并实现工作空间管理功能。这是整个系统的基础，将为后续功能开发奠定框架。

## 技术要求

- 使用 Next.js 14+ (App Router)
- TypeScript 严格模式
- Tailwind CSS 用于样式设计
- Supabase 用于认证和数据存储
- React Hook Form 用于表单处理
- Zod 用于表单验证

## 具体任务

### 1. 项目初始化与配置

```
我已经创建一个新的 Next.js 项目，在 frontend-v2 目录下，已经使用 App Router，并配置了 TypeScript 严格模式。
请帮我完成以下配置：
- 多语言支持（中文，英文，法文）
- ESLint 配置（包括 React Hook Form 和 Supabase 相关规则）
- 项目目录结构（按功能模块组织）
- 环境变量配置（开发和生产环境）
```

### 2. Supabase 集成

```
请帮我实现 Supabase 认证集成，包括：
- 用户注册和登录流程（使用 Supabase 提供的认证功能， 只支持邮箱链接登录和Google登录）
- 会话管理
- 认证中间件（保护需要认证的路由）
- 认证状态持久化
```

### 3. 工作空间管理

```
请帮我实现工作空间管理功能，包括：
- 创建新工作空间（支持公司和个人类型）
- 工作空间切换
- 工作空间设置（名称、类型、货币、会计年度等）
- 工作空间成员管理（邀请、权限设置）
- 工作空间列表视图
```

### 4. 新用户/企业初始化导航

```
请帮我设计并实现新用户/企业的初始化导航流程，包括：
- 欢迎页面
- 工作空间类型选择（公司/个人）
- 基本信息收集（公司名称、行业、规模等）
- 会计设置（会计年度、货币等）
- 初始科目表模板选择
- 角色设置（Bookkeeper/普通用户）
- 完成设置并引导至主界面
```

### 5. 角色系统

```
请帮我实现角色系统，支持 Bookkeeper 和普通用户两种角色：
- 角色权限定义
- 基于角色的 UI 调整
- 角色切换功能
- 权限检查中间件
```

### 6. 布局与导航

```
请帮我设计并实现应用的基础布局和导航系统：
- 响应式侧边栏
- 顶部导航栏
- 面包屑导航
- 工作空间切换器
- 用户菜单
- 深色/浅色模式切换
```

## 数据库表设计

需要创建或修改以下数据库表：

1. `workspaces` - 存储工作空间信息

   - id (UUID, PK)
   - name (TEXT)
   - type (ENUM: 'company', 'personal')
   - currency (TEXT)
   - fiscal_year_start (DATE)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)
   - owner_id (UUID, FK to auth.users)

2. `workspace_members` - 存储工作空间成员关系

   - id (UUID, PK)
   - workspace_id (UUID, FK to workspaces)
   - user_id (UUID, FK to auth.users)
   - role (ENUM: 'bookkeeper', 'user', 'admin')
   - permissions (JSONB)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

3. `workspace_settings` - 存储工作空间设置
   - id (UUID, PK)
   - workspace_id (UUID, FK to workspaces)
   - settings_key (TEXT)
   - settings_value (JSONB)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

## 安全考虑

- 所有表必须启用行级安全策略(RLS)
- 基于工作空间的数据隔离
- 所有数据库函数使用 SECURITY DEFINER
- 确保工作空间成员只能访问其所属工作空间的数据

## 测试要点

- 用户注册和登录流程
- 工作空间创建和切换
- 角色权限验证
- 初始化导航流程
- 响应式设计在不同设备上的表现

## 完成标准

当满足以下条件时，阶段一可视为完成：

1. 用户可以注册、登录和管理其账户
2. 用户可以创建、编辑和切换工作空间
3. 新用户可以完成初始化导航流程
4. 角色系统正常工作，不同角色看到不同的 UI 和功能
5. 基础布局和导航系统响应式且美观
6. 所有数据库表和安全策略正确配置
