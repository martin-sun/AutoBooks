# 阶段三开发提示词：交易记录与双分录校验

## 功能概述

在这个阶段，我们将实现 AutoBooks Frontend V2 的交易记录功能和双分录校验系统。这些功能是会计系统的核心操作部分，确保所有财务记录符合会计准则。

## 技术要求

- 继续使用前两个阶段的技术栈
- 实现交易记录的 CRUD 操作
- 实现双分录校验逻辑
- 支持交易分类与标签
- 实现交易搜索与过滤
- 支持交易批量操作

## 具体任务

### 1. 交易记录界面

```
请帮我实现交易记录界面，包括：
- 交易列表视图（支持分页、排序和筛选）
- 交易创建表单（支持多行分录，自动计算借贷平衡）
- 交易编辑功能
- 交易删除功能
- 交易详情视图
- 交易附件上传（收据、发票等）
```

### 2. 双分录校验逻辑

```
请帮我实现双分录校验逻辑，包括：
- 确保每个交易的借方总额等于贷方总额
- 实时校验并提示不平衡的交易
- 防止保存不平衡的交易
- 提供自动平衡功能
- 交易提交前的最终验证
```

### 3. 交易分类与标签

```
请帮我实现交易分类与标签功能，包括：
- 交易类型定义（收入、支出、转账等）
- 交易标签管理（创建、编辑、删除标签）
- 交易创建/编辑时应用标签
- 基于标签的交易过滤
- 标签统计和报表
```

### 4. 交易搜索与过滤

```
请帮我实现交易搜索与过滤功能，包括：
- 全文搜索（描述、备注等）
- 高级过滤（日期范围、金额范围、账户、标签等）
- 保存过滤器设置
- 搜索结果导出
- 搜索历史记录
```

### 5. 交易批量操作

```
请帮我实现交易批量操作功能，包括：
- 批量选择交易
- 批量标记（如已核对、已审核）
- 批量应用标签
- 批量删除
- 批量导出
```

## 数据库表设计

需要创建或修改以下数据库表：

1. `transactions` - 存储交易记录
   - id (UUID, PK)
   - workspace_id (UUID, FK to workspaces)
   - transaction_date (DATE) - 交易日期
   - description (TEXT) - 交易描述
   - reference (TEXT) - 参考编号
   - status (ENUM: 'draft', 'posted', 'reconciled', 'void') - 交易状态
   - created_by (UUID, FK to auth.users)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

2. `transaction_lines` - 存储交易分录
   - id (UUID, PK)
   - transaction_id (UUID, FK to transactions)
   - account_id (UUID, FK to accounts) - 关联账户
   - description (TEXT) - 分录描述
   - debit_amount (DECIMAL) - 借方金额
   - credit_amount (DECIMAL) - 贷方金额
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

3. `transaction_tags` - 存储交易标签
   - id (UUID, PK)
   - workspace_id (UUID, FK to workspaces)
   - name (TEXT) - 标签名称
   - color (TEXT) - 标签颜色
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

4. `transaction_tag_mappings` - 存储交易与标签的关联
   - id (UUID, PK)
   - transaction_id (UUID, FK to transactions)
   - tag_id (UUID, FK to transaction_tags)
   - created_at (TIMESTAMP)

5. `transaction_attachments` - 存储交易附件
   - id (UUID, PK)
   - transaction_id (UUID, FK to transactions)
   - file_name (TEXT) - 文件名
   - file_path (TEXT) - 文件路径
   - file_type (TEXT) - 文件类型
   - file_size (INTEGER) - 文件大小
   - uploaded_by (UUID, FK to auth.users)
   - created_at (TIMESTAMP)

## 安全考虑

- 所有表必须启用行级安全策略(RLS)
- 基于工作空间的数据隔离
- 所有数据库函数使用 SECURITY DEFINER
- 确保工作空间成员只能访问其所属工作空间的数据
- 实现交易审计日志，记录所有交易的创建、修改和删除操作
- 确保附件存储的安全性，只允许授权用户访问

## 测试要点

- 交易 CRUD 操作
- 双分录校验逻辑
- 交易标签功能
- 搜索和过滤功能
- 批量操作功能
- 附件上传和管理
- 权限验证
- 边界条件测试（如大量交易的性能）

## 完成标准

当满足以下条件时，阶段三可视为完成：

1. 用户可以创建、编辑、删除和查看交易记录
2. 系统能够确保所有交易符合双分录原则
3. 用户可以为交易添加标签并基于标签进行过滤
4. 用户可以搜索和过滤交易记录
5. 用户可以执行交易批量操作
6. 用户可以上传和管理交易附件
7. 所有操作都受到适当的权限控制
8. 所有数据库表和安全策略正确配置
