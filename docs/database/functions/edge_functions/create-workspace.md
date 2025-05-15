# Create Workspace Edge Function

这个 Edge Function 负责为用户创建工作空间，特别是在用户首次登录但尚未拥有工作空间时自动创建默认的个人工作空间。

## 功能

- 检查用户是否已有工作空间
- 如果没有工作空间，自动创建默认的个人工作空间
- 记录工作空间创建操作到审计日志
- 返回工作空间 ID 供前端使用

## 部署

要将此 Edge Function 部署到 Supabase 项目：

1. 确保已安装 Supabase CLI
2. 导航到项目根目录
3. 运行以下命令：

```bash
supabase functions deploy create-workspace --project-ref your-project-ref
```

## 使用方法

函数需要 `Authorization` 头部携带有效的 JWT 令牌。

**请求：**

```typescript
const response = await fetch(
  `${supabaseUrl}/functions/v1/create-workspace`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`
    }
  }
);
```

**响应（已存在工作空间）：**

```json
{
  "message": "Workspace already exists",
  "workspace_id": "existing-workspace-uuid"
}
```

**响应（新创建工作空间）：**

```json
{
  "message": "Workspace created successfully",
  "workspace_id": "new-workspace-uuid"
}
```

## 工作流程

1. 函数首先验证请求中的 JWT 令牌
2. 使用令牌中的用户 ID 查询数据库，检查用户是否已有工作空间
3. 如果用户已有工作空间，返回现有工作空间的 ID
4. 如果用户没有工作空间，创建一个新的个人工作空间：
   - 工作空间名称：`Personal workspace`
   - 工作空间类型：`personal`
   - 默认货币：`CAD`
5. 将工作空间创建操作记录到 `audit_logs` 表
6. 返回新创建的工作空间 ID

## 错误处理

所有错误响应都遵循以下格式：

```json
{
  "error": "错误消息"
}
```

常见错误状态码：
- `401` - 未授权（无效的令牌或缺少授权头）
- `500` - 服务器内部错误（创建工作空间失败或其他意外错误）

## 安全考虑

- 所有请求都需要有效的 JWT 令牌
- 使用 Supabase Admin 客户端（带服务角色密钥）执行数据库操作，确保能够创建工作空间
- 创建工作空间后记录审计日志，保留操作记录
- 使用环境变量存储敏感信息（URL、密钥等）

## 前端集成

此 Edge Function 主要在以下场景中使用：

1. 用户首次注册后自动创建个人工作空间
2. 用户登录后，如果没有工作空间，前端检测到并调用此函数创建默认工作空间

**前端集成示例：**

```typescript
// 在用户登录后检查是否有工作空间
const checkAndCreateWorkspace = async () => {
  const { data: workspaces } = await supabase
    .from('workspaces')
    .select('id')
    .limit(1);
  
  // 如果没有工作空间，调用 Edge Function 创建一个
  if (!workspaces || workspaces.length === 0) {
    const { data, error } = await supabase.functions.invoke('create-workspace');
    
    if (error) {
      console.error('Failed to create workspace:', error);
      return null;
    }
    
    return data.workspace_id;
  }
  
  return workspaces[0].id;
};
```

## 注意事项

- 此函数仅创建个人工作空间。商业工作空间需要通过应用程序界面手动创建
- 函数使用 `SERVICE_ROLE_KEY` 环境变量，确保在部署时正确设置
- 在生产环境中，应将 CORS 头部中的 `Access-Control-Allow-Origin` 设置为特定域名，而非 `*`
- 审计日志记录可能失败，但这不会阻止工作空间创建（非关键错误）

## 未来改进

- 支持创建不同类型的工作空间（个人/商业）
- 支持自定义工作空间名称和货币
- 添加工作空间创建后的初始化步骤（如创建默认账户）
- 改进错误处理和日志记录
- 替换代码中的 TODO 注释和硬编码 URL
