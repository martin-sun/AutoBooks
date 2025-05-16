# AutoBooks 项目最佳实践

本文档定义了 AutoBooks 项目的最佳实践和开发规则，以确保代码质量、性能和可维护性。这些规则基于项目的技术栈和业务需求，旨在为开发团队提供一致的指导。

## 职责划分

### 读操作

- 前端可直接使用 Supabase JS 客户端或 GraphQL 进行查询操作
- 所有读操作必须依赖 RLS 策略确保安全性
- 查询应尽量精确，避免获取不必要的数据
- 示例：
  ```typescript
  // ✅ 推荐：直接在前端查询数据
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('workspace_id', workspaceId);
  ```

### 写操作与复杂业务逻辑

- 所有写操作或复杂业务逻辑必须通过 Postgres RPC 或 Edge Function 实现
- 前端不应直接拼装复杂的业务逻辑
- 规则：若一次调用会修改 ≥2 张表或需要权限提升，必须使用 Edge Function 或 RPC
- 示例：
  ```typescript
  // ✅ 推荐：通过 Edge Function 处理复杂业务逻辑
  const { data, error } = await supabase.functions.invoke('create-transaction', {
    body: { transaction: newTransaction }
  });
  
  // ❌ 避免：在前端直接处理复杂业务逻辑
  // const { error: txError } = await supabase.from('transactions').insert([...]);
  // const { error: lineError } = await supabase.from('transaction_lines').insert([...]);
  ```

## GraphQL API 使用指南

### 前端查询

- 使用 GraphQL 进行复杂的多实体级联查询
- 适合报表和需要关联多个表的数据获取
- RLS 策略自动应用于 GraphQL 查询
- 示例：
  ```typescript
  // ✅ 推荐：使用 GraphQL 进行复杂查询
  const { data } = await supabase.graphql.query({
    query: `
      query GetAccountWithTransactions($id: UUID!) {
        accountsCollection(filter: { id: { eq: $id } }) {
          edges {
            node {
              name
              balance
              transactionLinesCollection {
                edges {
                  node {
                    amount
                    description
                  }
                }
              }
            }
          }
        }
      }
    `,
    variables: { id: accountId }
  });
  ```

### 服务端聚合

- 在 Edge Function 内部使用 GraphQL 进行服务端数据聚合
- 减少前端多次请求的往返延迟
- 示例：
  ```typescript
  // Edge Function 内部
  const { data } = await supabaseAdmin.graphql.request(`
    query GetDashboardData($workspace_id: UUID!) {
      // 复杂查询...
    }
  `, { workspace_id });
  
  // 处理并返回聚合数据
  return { data: processData(data) };
  ```

## Edge Function 最佳实践

### 突破限制

#### 处理超时问题

- 将长时间运行的任务拆分为短事务和异步任务
- 使用 Background Edge Function + Supabase Queues 处理重量级任务
- 对于超长时间任务，考虑触发外部 Job Run
- 示例：
  ```typescript
  // ✅ 推荐：将长时间任务拆分
  // 1. 创建任务记录
  const { data: task } = await supabaseAdmin
    .from('async_tasks')
    .insert({ type: 'generate_report', params: { year, month } })
    .select()
    .single();
  
  // 2. 返回任务 ID，前端可以轮询状态
  return { taskId: task.id };
  
  // 3. 在另一个 Background Function 或 Cron Job 中处理任务
  // ...处理并更新任务状态
  ```

#### 版本控制

- 函数代码应保存在 Git 仓库中
- 使用 Git Tag + 后缀进行灰度发布
- 示例：部署新版本时使用 `get-sidebar-menu_v2` 命名

#### 资源利用

- Edge Function 内部可以复用 Postgres 扩展（如 plv8、pg_graphql）
- 可以调用外部 HTTP 服务扩展功能
- 示例：
  ```typescript
  // 在 Edge Function 中调用外部服务
  const response = await fetch('https://api.example.com/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ param: value })
  });
  ```

## 性能优化策略

### 复杂报表与预算计算

#### 物化视图

- 对于复杂的报表查询，使用物化视图预计算结果
- 定期刷新物化视图以保持数据最新
- 示例：
  ```sql
  -- 创建物化视图
  CREATE MATERIALIZED VIEW mv_account_balances AS
  SELECT 
    a.id, 
    a.name, 
    a.workspace_id,
    COALESCE(SUM(tl.amount), 0) as balance
  FROM 
    accounts a
  LEFT JOIN 
    transaction_lines tl ON a.id = tl.account_id
  GROUP BY 
    a.id, a.name, a.workspace_id;
  
  -- 刷新物化视图
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_account_balances;
  ```

#### 长耗时运算

- 对于 AI 处理、预算计算等长耗时运算：
  1. 使用 Edge Function 创建任务记录
  2. 通过 Deno cron 或 Vercel Cron 定期处理任务
  3. 处理完成后更新任务状态和结果
- 示例：
  ```typescript
  // 创建 AI 处理任务
  const { data: task } = await supabaseAdmin
    .from('ai_tasks')
    .insert({ 
      type: 'analyze_expenses', 
      status: 'pending',
      data: { period: '2025-Q1' } 
    })
    .select()
    .single();
  
  // 返回任务 ID
  return { taskId: task.id };
  
  // 在 Cron Job 中处理任务
  // ...
  ```

## Supabase 部署与同步规范

### 数据库更改

- 所有数据库更改必须先在本地创建 migration 文件（位于 `supabase/migrations` 目录）
- 所有 migration 必须通过 Supabase MCP 服务器应用到数据库
- 禁止直接在 Supabase Dashboard 上进行数据库更改
- 每次应用 migration 后，必须更新 TypeScript 类型定义
- 示例：
  ```typescript
  // ✅ 推荐：使用 Supabase MCP 应用 migration
  await mcp0_apply_migration({
    project_id: 'your-project-id',
    name: 'add_is_payment_field',
    query: 'ALTER TABLE chart_of_accounts ADD COLUMN is_payment BOOLEAN DEFAULT FALSE;'
  });
  
  // 更新 TypeScript 类型
  await mcp0_generate_typescript_types({
    project_id: 'your-project-id'
  });
  ```

### Edge Functions 部署

- 所有 Edge Functions 必须先在本地开发和测试
- 所有 Edge Functions 更改必须通过 Supabase MCP 服务器部署到 Supabase
- 禁止直接在 Supabase Dashboard 上编辑 Edge Functions
- 每次部署 Edge Function 后，必须更新相应的文档
- 示例：
  ```typescript
  // ✅ 推荐：使用 Supabase MCP 部署 Edge Function
  await mcp0_deploy_edge_function({
    project_id: 'your-project-id',
    name: 'asset-management',
    entrypoint_path: 'index.ts',
    files: [
      { name: 'index.ts', content: '...' },
      { name: 'graphql.ts', content: '...' }
    ]
  });
  ```

## 实施指南

1. 所有新功能开发必须遵循上述规则
2. 现有代码在重构时应逐步迁移到这些最佳实践
3. 代码审查过程中应检查是否符合这些规则
4. 团队成员应定期分享实施这些最佳实践的经验和挑战
5. 所有本地开发的数据库更改和 Edge Functions 必须通过 Supabase MCP 同步到 Supabase 服务端

## 目录

1. [数据库规范](#数据库规范)
2. [Supabase 最佳实践](#supabase-最佳实践)
3. [前端开发规范](#前端开发规范)
4. [安全与权限](#安全与权限)
5. [工作流程与部署](#工作流程与部署)
6. [参考资源](#参考资源)

## 数据库规范

### 基本要求

- **时间戳字段**：所有表必须包含 `created_at` 和 `updated_at` 字段
- **软删除**：所有表必须支持软删除，使用 `is_deleted` 字段
- **主键类型**：使用 UUID 作为主键
- **行级安全**：所有表必须启用行级安全策略(RLS)
- **审计日志**：所有重要操作必须记录审计日志
- **多租户隔离**：使用 `workspace_id` 字段实现工作空间隔离

### 必须包含的表

项目必须包含以下核心表：

- `users`：用户信息
- `workspaces`：工作空间
- `chart_of_accounts`：会计科目表
- `accounts`：账户
- `transactions`：交易
- `transaction_lines`：交易行
- `inter_workspace_balances`：跨工作空间余额
- `tags`：标签
- `transaction_tags`：交易标签关联
- `taxes`：税种
- `transaction_taxes`：交易税费
- `audit_logs`：审计日志
- `budgets`：预算
- `budget_items`：预算项目
- `sidebar_templates`：侧边栏模板
- `sidebar_menu_items`：侧边栏菜单项
- `workspace_menu_configs`：工作空间菜单配置

### 命名规范

- **表名**：使用 snake_case
- **列名**：使用 snake_case
- **函数名**：使用 snake_case
- **触发器名**：使用 snake_case

## 参考资源

- [Supabase 文档](https://supabase.io/docs)
- [Next.js 文档](https://nextjs.org/docs)
- [Supabase Edge Functions 文档](https://supabase.com/docs/guides/functions)
- [Supabase GraphQL 文档](https://supabase.com/docs/guides/graphql)
- [PostgreSQL 物化视图文档](https://www.postgresql.org/docs/current/rules-materializedviews.html)
