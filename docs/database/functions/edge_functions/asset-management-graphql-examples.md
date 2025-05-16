# Asset Management GraphQL 使用示例

本文档提供了使用 Asset Management Edge Function 的 GraphQL 端点的示例。GraphQL 提供了更高效的数据查询和聚合方式，允许客户端精确指定所需数据，减少网络往返次数。

## GraphQL 端点

GraphQL 端点位于：

```
${supabaseUrl}/functions/v1/asset-management/graphql
```

所有请求都需要 `Authorization` 头部携带有效的 JWT 令牌。

## 基本查询示例

### 获取资产类别

以下查询获取特定工作空间类型的所有资产类别，包括其父子关系：

```graphql
query GetAssetCategories($workspaceType: String!) {
  assetCategories(workspace_type: $workspaceType) {
    id
    name
    type
    parent {
      id
      name
    }
    children {
      id
      name
      type
    }
  }
}
```

**变量：**

```json
{
  "workspaceType": "personal"
}
```

**JavaScript 使用示例：**

```javascript
const fetchAssetCategories = async (workspaceType) => {
  const { data } = await supabase.functions.invoke('asset-management/graphql', {
    body: {
      query: `
        query GetAssetCategories($workspaceType: String!) {
          assetCategories(workspace_type: $workspaceType) {
            id
            name
            type
            parent {
              id
              name
            }
            children {
              id
              name
              type
            }
          }
        }
      `,
      variables: {
        workspaceType
      }
    }
  });
  
  return data.data.assetCategories;
};
```

### 获取工作空间资产

以下查询获取特定工作空间的所有资产，包括其类别和账户信息：

```graphql
query GetAssets($workspaceId: ID!) {
  assets(workspace_id: $workspaceId) {
    id
    name
    description
    purchase_date
    purchase_value
    current_value
    currency
    category {
      id
      name
    }
    account {
      id
      name
      type
    }
  }
}
```

**变量：**

```json
{
  "workspaceId": "workspace-uuid"
}
```

### 获取单个资产详情

以下查询获取单个资产的详细信息，包括其所有交易记录：

```graphql
query GetAsset($id: ID!) {
  asset(id: $id) {
    id
    name
    description
    purchase_date
    purchase_value
    current_value
    currency
    category {
      id
      name
      parent {
        id
        name
      }
    }
    account {
      id
      name
      type
    }
    transactions {
      id
      type
      amount
      transaction_date
      notes
    }
  }
}
```

**变量：**

```json
{
  "id": "asset-uuid"
}
```

## 变更操作示例

### 创建新资产

```graphql
mutation CreateAsset($asset: AssetInput!) {
  createAsset(asset: $asset) {
    id
    name
    description
    purchase_date
    purchase_value
    current_value
    currency
  }
}
```

**变量：**

```json
{
  "asset": {
    "workspace_id": "workspace-uuid",
    "category_id": "category-uuid",
    "account_id": "account-uuid",
    "name": "New Equipment",
    "description": "Office equipment",
    "purchase_date": "2025-01-10",
    "purchase_value": 5000,
    "currency": "CAD"
  }
}
```

### 更新资产

```graphql
mutation UpdateAsset($asset: AssetUpdateInput!) {
  updateAsset(asset: $asset) {
    id
    name
    description
    current_value
  }
}
```

**变量：**

```json
{
  "asset": {
    "id": "asset-uuid",
    "name": "Updated Equipment Name",
    "description": "Updated description",
    "current_value": 4500
  }
}
```

### 删除资产

```graphql
mutation DeleteAsset($id: ID!) {
  deleteAsset(id: $id)
}
```

**变量：**

```json
{
  "id": "asset-uuid"
}
```

### 添加资产交易记录

```graphql
mutation AddAssetTransaction($transaction: AssetTransactionInput!) {
  addAssetTransaction(transaction: $transaction) {
    id
    asset_id
    type
    amount
    transaction_date
    notes
  }
}
```

**变量：**

```json
{
  "transaction": {
    "asset_id": "asset-uuid",
    "type": "depreciation",
    "amount": 1000,
    "transaction_date": "2025-12-31",
    "notes": "Annual depreciation"
  }
}
```

## 组合查询示例

GraphQL 的一个主要优势是能够在单个请求中获取多种相关数据。以下是一个组合查询示例：

```graphql
query AssetManagementDashboard($workspaceId: ID!, $assetId: ID!) {
  # 获取所有资产类别
  assetCategories(workspace_type: "personal") {
    id
    name
    children {
      id
      name
    }
  }
  
  # 获取工作空间的所有资产
  assets(workspace_id: $workspaceId) {
    id
    name
    current_value
    category {
      name
    }
  }
  
  # 获取特定资产的详细信息
  asset(id: $assetId) {
    id
    name
    description
    purchase_date
    purchase_value
    current_value
    transactions {
      type
      amount
      transaction_date
    }
  }
}
```

**变量：**

```json
{
  "workspaceId": "workspace-uuid",
  "assetId": "asset-uuid"
}
```

这个单一请求将返回：
1. 所有资产类别及其子类别
2. 工作空间中的所有资产摘要
3. 特定资产的详细信息，包括其交易历史

使用传统的 REST API，这将需要至少 3 个单独的 HTTP 请求。

## 与 REST API 的兼容性

为了保持向后兼容性，原有的 REST API 端点仍然可用。然而，我们建议新的实现使用 GraphQL 端点，以获得更好的性能和灵活性。

## 错误处理

GraphQL 响应中的错误会在 `errors` 字段中返回：

```json
{
  "data": null,
  "errors": [
    {
      "message": "Asset not found",
      "locations": [{ "line": 2, "column": 3 }],
      "path": ["asset"]
    }
  ]
}
```

## 性能考虑

- 只请求你需要的字段，避免过度获取数据
- 使用组合查询减少 HTTP 请求数量
- 对于复杂查询，考虑使用分页（使用自定义参数如 `limit` 和 `offset`）
- 对于大型数据集，考虑使用批处理操作

## 安全考虑

- 所有 GraphQL 请求都需要有效的 JWT 令牌
- 所有数据访问都受到与 REST API 相同的权限检查
- GraphQL 查询复杂度和深度有限制，以防止滥用
