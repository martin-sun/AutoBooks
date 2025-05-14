# AutoBooks 数据库文档

这个目录包含 AutoBooks 项目的数据库设计文档，用于帮助开发者理解数据库结构、关系和业务逻辑。

## 目录结构

- `tables/` - 包含所有表的详细文档
- `schemas/` - 数据库模式的说明文档
- `functions/` - 数据库函数的说明文档
- `migrations/` - 迁移历史和最佳实践
- `diagrams/` - 数据库关系图和其他可视化文档

## 数据库更新流程

根据项目规定，所有数据库更改必须遵循以下流程：

1. 创建本地migration文件（位于supabase/migrations目录）
2. 使用Supabase MCP服务器应用migration
3. 生成更新的TypeScript类型
4. 更新相应的数据库文档

## 最佳实践

- 禁止直接在Supabase控制台修改数据库结构
- 所有数据库更改必须通过migration文件记录
- 定期检查migration状态与实际数据库状态是否一致
- 更新数据库结构时同时更新文档
