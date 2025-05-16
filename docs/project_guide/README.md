# AutoBooks 项目指南

## 项目概述

AutoBooks 是一个多租户 Bookkeeping 系统，类似于 Wave，专为加拿大的个体户和小企业主设计。系统支持个人和商业工作空间，提供全面的会计功能，包括银行账户管理、资产管理、会计科目表管理、交易记录和财务报表。

### 核心功能

- **多工作空间管理**：支持个人和商业工作空间
- **Banking**：银行账户管理、交易记录
- **会计科目表**：自定义会计科目和账户
- **资产管理**：跟踪和管理资产
- **按会计年度优化的余额计算**：高效的财务数据处理
- **个人-商业支出管理**：跨工作空间交易链接
- **AI对话式会计**：自然语言处理生成交易记录

## 技术栈

- **前端**：Next.js (App Router), React, TypeScript, Tailwind CSS
- **后端**：Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **部署**：Vercel (前端), Supabase (后端)

## 项目结构

```
/
├── docs/                     # 项目文档
│   ├── database/             # 数据库文档
│   └── project_guide/        # 项目指南
├── frontend/                 # 前端代码
│   ├── src/
│   │   ├── app/              # Next.js App Router
│   │   ├── components/       # React组件
│   │   ├── lib/              # 工具函数和库
│   │   └── types/            # TypeScript类型定义
├── supabase/                 # Supabase配置和迁移
│   ├── functions/            # Edge Functions
│   └── migrations/           # 数据库迁移文件
└── .windsurf.json            # Windsurf配置文件
```

## 开发规范

### 代码风格

- 使用TypeScript严格模式
- 遵循ESLint和Prettier配置
- 组件使用函数式组件和React Hooks
- 使用Tailwind CSS进行样式设计

### 命名规范

- **文件命名**：
  - React组件：PascalCase (例如: `WorkspaceSwitcher.tsx`)
  - 工具函数：camelCase (例如: `formatCurrency.ts`)
  - 页面文件：小写，使用连字符 (例如: `page.tsx`, `[workspace_id]/page.tsx`)

- **变量命名**：
  - 变量和函数：camelCase
  - 类型和接口：PascalCase
  - 常量：UPPER_SNAKE_CASE

### 分支管理

- `main`: 生产环境分支
- `develop`: 开发环境分支
- 功能分支: `feature/feature-name`
- 修复分支: `fix/bug-description`

## 数据库管理

### 数据库更新规则

1. 所有Supabase数据库操作必须先更新本地migration文件
2. 所有Supabase表更新必须通过Supabase MCP服务器执行
3. 禁止直接在数据库上进行更改
4. 任何数据库更新后必须同步更新docs/database目录下的文档

### 数据库更新流程

1. 创建本地migration文件（位于supabase/migrations目录）
2. 使用Supabase MCP服务器应用migration
3. 生成更新的TypeScript类型
4. 更新docs/database目录下的相关文档

## 核心业务逻辑

### 工作空间管理

- 每个用户可以有多个工作空间（个人和商业）
- 用户注册后自动创建一个个人工作空间
- 工作空间是数据隔离的基本单位

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

### 双重记账原则

- 每个交易必须平衡（借方=贷方）
- 所有交易行的金额总和必须为零
- 系统通过check_transaction_balance触发器强制执行这一原则

### 个人-商业支出管理

- 跨工作空间交易链接：在个人工作空间记录支出时，可标记为商业相关并自动在商业工作空间创建对应条目
- 支出分配：支持将个人支出部分分配给商业（如家庭办公室百分比、车辆使用）
- 报销跟踪：自动跟踪从个人账户支付的商业费用，简化报销流程

## 安全与权限

### 行级安全策略 (RLS)

- 所有表都启用了行级安全策略
- 基于工作空间的数据隔离
- 用户只能访问自己工作空间的数据

### 认证与授权

- 使用Supabase Auth进行用户认证
- 基于JWT令牌的API访问控制
- 所有数据库函数使用SECURITY DEFINER确保安全性

## 测试策略

- 单元测试：使用Jest测试工具函数和组件
- 集成测试：测试API和数据库交互
- E2E测试：使用Cypress测试关键用户流程

## 部署流程

1. 代码推送到GitHub仓库
2. GitHub Actions运行测试
3. 测试通过后，自动部署到开发环境
4. 手动触发生产环境部署

## 文档规范

- 所有主要功能必须有文档说明
- 数据库更改必须更新相应的数据库文档
- API接口必须有清晰的文档说明
- 复杂的业务逻辑必须有流程图或说明

## 常见问题解决

### 数据库迁移问题

- 问题：本地migration与实际数据库不一致
- 解决：使用Supabase MCP工具列出已应用的migrations，与本地比对并解决差异

### RLS策略递归问题

- 问题：在某些情况下，RLS策略可能导致递归问题
- 解决：使用SECURITY DEFINER函数绕过RLS，或简化查询结构

## 资源与参考

- [Supabase 文档](https://supabase.io/docs)
- [Next.js 文档](https://nextjs.org/docs)
- [React 文档](https://reactjs.org/docs)
- [TypeScript 文档](https://www.typescriptlang.org/docs)

## 贡献指南

1. Fork 仓库
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 联系方式

如有问题，请联系项目维护者。
