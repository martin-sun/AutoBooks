# 阶段四开发提示词：银行数据导入与规则记忆

## 功能概述

在这个阶段，我们将实现 AutoBooks Frontend V2 的银行数据导入功能和导入规则记忆系统。这些功能将大大提高记账效率，特别是对于需要处理大量银行交易的专业记账人员。

## 技术要求

- 继续使用前三个阶段的技术栈
- 实现 CSV/Excel 文件解析
- 实现数据映射和预览
- 实现导入规则创建和管理
- 实现规则记忆与自动应用
- 实现导入历史记录

## 具体任务

### 1. CSV/Excel 导入界面

```
请帮我实现 CSV/Excel 导入界面，包括：
- 文件上传组件（支持拖放）
- 文件类型验证
- 文件预览
- 导入选项设置（日期格式、分隔符等）
- 错误处理和提示
```

### 2. 导入数据映射与预览

```
请帮我实现导入数据映射与预览功能，包括：
- 列映射界面（将文件列映射到系统字段）
- 数据预览表格
- 数据验证（检查必填字段、格式等）
- 映射模板保存和加载
- 自定义字段映射
```

### 3. 导入规则创建与管理

```
请帮我实现导入规则创建与管理功能，包括：
- 规则列表视图
- 规则创建表单（条件设置、动作设置）
- 规则编辑功能
- 规则删除功能
- 规则优先级设置
- 规则测试功能
```

### 4. 规则记忆与自动应用

```
请帮我实现规则记忆与自动应用功能，包括：
- 交易模式识别
- 基于历史数据的规则建议
- 规则自动应用到匹配交易
- 规则应用结果预览
- 规则应用覆盖率统计
```

### 5. 导入历史记录

```
请帮我实现导入历史记录功能，包括：
- 导入历史列表
- 导入详情查看
- 导入结果统计
- 导入撤销功能
- 导入日志导出
```

## 数据库表设计

需要创建或修改以下数据库表：

1. `import_sessions` - 存储导入会话信息
   - id (UUID, PK)
   - workspace_id (UUID, FK to workspaces)
   - file_name (TEXT) - 导入文件名
   - file_type (TEXT) - 文件类型（CSV/Excel）
   - status (ENUM: 'in_progress', 'completed', 'failed', 'reverted') - 导入状态
   - total_rows (INTEGER) - 总行数
   - imported_rows (INTEGER) - 成功导入行数
   - error_rows (INTEGER) - 错误行数
   - imported_by (UUID, FK to auth.users)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

2. `import_mappings` - 存储导入映射模板
   - id (UUID, PK)
   - workspace_id (UUID, FK to workspaces)
   - name (TEXT) - 模板名称
   - description (TEXT) - 模板描述
   - file_type (TEXT) - 适用文件类型
   - mapping_config (JSONB) - 映射配置
   - created_by (UUID, FK to auth.users)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

3. `import_rules` - 存储导入规则
   - id (UUID, PK)
   - workspace_id (UUID, FK to workspaces)
   - name (TEXT) - 规则名称
   - description (TEXT) - 规则描述
   - conditions (JSONB) - 规则条件
   - actions (JSONB) - 规则动作
   - priority (INTEGER) - 规则优先级
   - is_active (BOOLEAN) - 是否激活
   - created_by (UUID, FK to auth.users)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

4. `import_rule_applications` - 存储规则应用记录
   - id (UUID, PK)
   - import_session_id (UUID, FK to import_sessions)
   - rule_id (UUID, FK to import_rules)
   - transaction_id (UUID, FK to transactions)
   - applied_at (TIMESTAMP)

5. `import_errors` - 存储导入错误
   - id (UUID, PK)
   - import_session_id (UUID, FK to import_sessions)
   - row_number (INTEGER) - 错误行号
   - error_message (TEXT) - 错误信息
   - row_data (JSONB) - 行数据
   - created_at (TIMESTAMP)

## 安全考虑

- 所有表必须启用行级安全策略(RLS)
- 基于工作空间的数据隔离
- 所有数据库函数使用 SECURITY DEFINER
- 确保工作空间成员只能访问其所属工作空间的数据
- 实现导入审计日志，记录所有导入操作
- 确保敏感数据在导入过程中的安全处理

## 测试要点

- 文件上传和解析
- 数据映射和预览
- 规则创建和应用
- 规则记忆功能
- 导入历史记录
- 错误处理
- 大文件导入性能
- 权限验证

## 完成标准

当满足以下条件时，阶段四可视为完成：

1. 用户可以上传 CSV/Excel 文件并预览内容
2. 用户可以创建和管理列映射模板
3. 用户可以创建、编辑和管理导入规则
4. 系统能够基于历史数据记忆并建议规则
5. 规则能够自动应用到匹配的交易
6. 用户可以查看导入历史和详情
7. 导入过程中的错误得到适当处理和提示
8. 所有操作都受到适当的权限控制
9. 所有数据库表和安全策略正确配置
