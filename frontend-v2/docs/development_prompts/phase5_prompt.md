# 阶段五开发提示词：报表与优化

## 功能概述

在这个阶段，我们将实现 AutoBooks Frontend V2 的基础报表功能并进行系统优化。这些功能将使专业记账人员能够生成财务报表，并确保系统运行高效、稳定。

## 技术要求

- 继续使用前四个阶段的技术栈
- 实现基础财务报表
- 进行性能优化
- 完善用户界面
- 增强错误处理与日志
- 实现用户反馈收集机制

## 具体任务

### 1. 基础财务报表

```
请帮我实现基础财务报表功能，包括：
- 资产负债表（支持不同日期点的快照）
- 利润表（支持不同时间段的比较）
- 现金流量表
- 试算平衡表
- 报表导出（PDF、Excel）
- 报表打印优化
```

### 2. 性能优化

```
请帮我进行系统性能优化，包括：
- 前端组件优化（减少不必要的重渲染）
- 数据加载优化（分页、懒加载）
- 数据库查询优化
- 缓存策略实现
- 大数据集处理优化
- 前端资源优化（代码分割、懒加载）
```

### 3. 用户界面完善

```
请帮我完善用户界面，包括：
- 统一设计语言应用
- 响应式布局优化
- 交互体验改进
- 辅助功能支持（无障碍）
- 国际化支持（至少支持英文和中文）
- 用户引导和提示
```

### 4. 错误处理与日志

```
请帮我增强错误处理与日志功能，包括：
- 全局错误处理机制
- 用户友好的错误提示
- 详细的错误日志
- 性能监控
- 用户操作审计
- 系统健康检查
```

### 5. 用户反馈收集机制

```
请帮我实现用户反馈收集机制，包括：
- 反馈表单
- 问题报告工具
- 功能请求渠道
- 用户满意度调查
- 反馈管理后台
- 反馈分析工具
```

## 数据库表设计

需要创建或修改以下数据库表：

1. `report_templates` - 存储报表模板
   - id (UUID, PK)
   - workspace_id (UUID, FK to workspaces)
   - name (TEXT) - 模板名称
   - type (ENUM: 'balance_sheet', 'income_statement', 'cash_flow', 'trial_balance') - 报表类型
   - config (JSONB) - 模板配置
   - is_default (BOOLEAN) - 是否默认模板
   - created_by (UUID, FK to auth.users)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

2. `saved_reports` - 存储已保存的报表
   - id (UUID, PK)
   - workspace_id (UUID, FK to workspaces)
   - template_id (UUID, FK to report_templates)
   - name (TEXT) - 报表名称
   - parameters (JSONB) - 报表参数
   - created_by (UUID, FK to auth.users)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

3. `user_feedback` - 存储用户反馈
   - id (UUID, PK)
   - user_id (UUID, FK to auth.users)
   - feedback_type (ENUM: 'bug', 'feature_request', 'general') - 反馈类型
   - title (TEXT) - 反馈标题
   - content (TEXT) - 反馈内容
   - status (ENUM: 'open', 'in_progress', 'resolved', 'closed') - 处理状态
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

4. `system_logs` - 存储系统日志
   - id (UUID, PK)
   - log_level (ENUM: 'debug', 'info', 'warning', 'error', 'critical') - 日志级别
   - component (TEXT) - 组件名称
   - message (TEXT) - 日志消息
   - details (JSONB) - 详细信息
   - user_id (UUID, FK to auth.users, nullable) - 相关用户
   - created_at (TIMESTAMP)

## 安全考虑

- 所有表必须启用行级安全策略(RLS)
- 基于工作空间的数据隔离
- 所有数据库函数使用 SECURITY DEFINER
- 确保工作空间成员只能访问其所属工作空间的数据
- 实现报表访问权限控制
- 确保日志中不包含敏感信息

## 测试要点

- 报表生成和导出
- 系统性能（响应时间、资源使用）
- 用户界面在不同设备上的表现
- 错误处理和恢复
- 国际化支持
- 辅助功能支持
- 用户反馈功能

## 完成标准

当满足以下条件时，阶段五可视为完成：

1. 用户可以生成和导出基础财务报表
2. 系统性能达到预期目标（页面加载时间、数据处理速度）
3. 用户界面在不同设备上表现良好
4. 系统能够适当处理错误并提供有用的反馈
5. 用户可以提交反馈并获得响应
6. 系统支持多语言（至少英文和中文）
7. 所有操作都受到适当的权限控制
8. 所有数据库表和安全策略正确配置
