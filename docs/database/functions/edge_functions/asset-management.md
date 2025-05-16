# Asset Management Edge Function

这个 Edge Function 提供了完整的资产管理功能，支持资产的查询、创建、更新和删除，以及资产交易记录管理。

## 功能

- 获取资产类别列表（基于工作空间类型）
- 获取特定工作空间的所有资产
- 获取单个资产的详细信息（包括交易记录）
- 创建新资产
- 更新现有资产
- 软删除资产
- 添加资产交易记录（如折旧、重估等）

## 部署

要将此 Edge Function 部署到 Supabase 项目：

1. 确保已安装 Supabase CLI
2. 导航到项目根目录
3. 运行以下命令：

```bash
supabase functions deploy asset-management --project-ref your-project-ref
```

## 使用方法

函数需要 `Authorization` 头部携带有效的 JWT 令牌，并根据操作类型接受不同的路径和参数。

### 获取资产类别

**请求：**

```typescript
const response = await fetch(
  `${supabaseUrl}/functions/v1/asset-management/categories?workspace_id=${workspaceId}`,
  {
    headers: {
      Authorization: `Bearer ${session.access_token}`
    }
  }
);
```

**响应：**

```json
[
  {
    "id": "uuid",
    "name": "Vehicles",
    "parent_id": null,
    "type": "both",
    "children": [
      {
        "id": "uuid",
        "name": "Cars",
        "parent_id": "parent-uuid",
        "type": "both"
      }
    ]
  }
]
```

### 获取资产列表

**请求：**

```typescript
const response = await fetch(
  `${supabaseUrl}/functions/v1/asset-management/assets?workspace_id=${workspaceId}`,
  {
    headers: {
      Authorization: `Bearer ${session.access_token}`
    }
  }
);
```

**响应：**

```json
[
  {
    "id": "uuid",
    "workspace_id": "workspace-uuid",
    "name": "Company Car",
    "description": "Toyota Camry 2023",
    "purchase_date": "2023-01-15",
    "purchase_value": 35000,
    "current_value": 32000,
    "category": {
      "id": "category-uuid",
      "name": "Cars",
      "parent_id": "parent-category-uuid"
    },
    "account": {
      "id": "account-uuid",
      "name": "Vehicles"
    }
  }
]
```

### 获取单个资产详情

**请求：**

```typescript
const response = await fetch(
  `${supabaseUrl}/functions/v1/asset-management/asset?id=${assetId}`,
  {
    headers: {
      Authorization: `Bearer ${session.access_token}`
    }
  }
);
```

**响应：**

```json
{
  "id": "uuid",
  "workspace_id": "workspace-uuid",
  "name": "Company Car",
  "description": "Toyota Camry 2023",
  "purchase_date": "2023-01-15",
  "purchase_value": 35000,
  "current_value": 32000,
  "category": {
    "id": "category-uuid",
    "name": "Cars",
    "parent_id": "parent-category-uuid"
  },
  "account": {
    "id": "account-uuid",
    "name": "Vehicles"
  },
  "transactions": [
    {
      "id": "transaction-uuid",
      "asset_id": "asset-uuid",
      "type": "purchase",
      "amount": 35000,
      "transaction_date": "2023-01-15",
      "notes": "Initial purchase"
    },
    {
      "id": "transaction-uuid",
      "asset_id": "asset-uuid",
      "type": "depreciation",
      "amount": 3000,
      "transaction_date": "2023-12-31",
      "notes": "Annual depreciation"
    }
  ]
}
```

### 创建新资产

**请求：**

```typescript
const response = await fetch(
  `${supabaseUrl}/functions/v1/asset-management/create`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      workspace_id: 'workspace-uuid',
      category_id: 'category-uuid',
      account_id: 'account-uuid',
      name: 'New Equipment',
      description: 'Office equipment',
      purchase_date: '2025-01-10',
      purchase_value: 5000,
      currency: 'CAD'
    })
  }
);
```

**响应：**

```json
{
  "id": "new-asset-uuid",
  "workspace_id": "workspace-uuid",
  "category_id": "category-uuid",
  "account_id": "account-uuid",
  "name": "New Equipment",
  "description": "Office equipment",
  "purchase_date": "2025-01-10",
  "purchase_value": 5000,
  "current_value": 5000,
  "currency": "CAD"
}
```

### 更新资产

**请求：**

```typescript
const response = await fetch(
  `${supabaseUrl}/functions/v1/asset-management/update`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: 'asset-uuid',
      name: 'Updated Equipment Name',
      description: 'Updated description',
      current_value: 4500
    })
  }
);
```

**响应：**

```json
{
  "id": "asset-uuid",
  "name": "Updated Equipment Name",
  "description": "Updated description",
  "current_value": 4500
  // 其他字段...
}
```

### 删除资产

**请求：**

```typescript
const response = await fetch(
  `${supabaseUrl}/functions/v1/asset-management/delete`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: 'asset-uuid'
    })
  }
);
```

**响应：**

```json
{
  "success": true,
  "id": "asset-uuid"
}
```

### 添加资产交易记录

**请求：**

```typescript
const response = await fetch(
  `${supabaseUrl}/functions/v1/asset-management/transaction`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      asset_id: 'asset-uuid',
      type: 'depreciation',
      amount: 1000,
      transaction_date: '2025-12-31',
      notes: 'Annual depreciation'
    })
  }
);
```

**响应：**

```json
{
  "id": "transaction-uuid",
  "asset_id": "asset-uuid",
  "type": "depreciation",
  "amount": 1000,
  "transaction_date": "2025-12-31",
  "notes": "Annual depreciation"
}
```

## 错误处理

所有错误响应都遵循以下格式：

```json
{
  "error": "错误消息"
}
```

常见错误状态码：
- `400` - 请求参数缺失或无效
- `401` - 未授权（无效的令牌）
- `404` - 资源未找到
- `500` - 服务器内部错误

## 安全考虑

- 所有请求都需要有效的 JWT 令牌
- 函数验证用户是否有权访问请求的工作空间
- 所有数据操作都受 RLS 策略保护
- 使用软删除而非硬删除，保留审计记录

## 当前实现的局限性

当前的实现存在以下局限性：

1. **数据聚合方式**: 当前实现使用多个单独的查询而非 GraphQL 进行数据聚合，这可能导致：
   - 多次网络往返，增加延迟
   - 数据过度获取或获取不足
   - 前端需要手动组合多个查询结果

2. **长时间运行任务**: 对于资产批量导入或复杂报表生成等长时间运行的任务，当前实现没有异步处理机制。

3. **硬编码 URL**: 函数中存在一些硬编码的 URL，应替换为环境变量。

## 未来改进

- **实现资产批量导入功能**: 添加支持 CSV/Excel 导入的端点，使用异步处理大量数据。

- **添加资产报表生成功能**: 实现资产价值变化、折旧分析等报表。

- **实现资产折旧自动计算**: 基于不同折旧方法（直线法、余额递减法等）自动计算资产折旧。

- **优化长时间运行任务的处理方式**: 实现任务队列或 WebSocket 通知机制，避免 HTTP 请求超时。

- **使用 GraphQL 优化数据查询和聚合**: 
  - 替换当前的多个 REST 端点为单一 GraphQL 端点
  - 允许客户端指定所需的确切数据
  - 减少网络往返次数
  - 实现更高效的数据关联和聚合
  - 例如，可以在一个请求中获取资产、其类别、账户和交易记录
