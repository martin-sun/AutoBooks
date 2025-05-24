# 环境变量配置

本文档描述了 AutoBooks Frontend V2 所需的环境变量配置。

## 开发环境

在开发环境中，您需要在项目根目录创建一个 `.env.local` 文件，并配置以下环境变量：

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 生产环境

在生产环境中，您需要在部署平台（如 Vercel）上配置以下环境变量：

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-production-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-supabase-anon-key

# 应用配置
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
```

## 获取 Supabase 配置

1. 登录 [Supabase 控制台](https://app.supabase.io/)
2. 选择您的项目
3. 在左侧菜单中点击"Settings"
4. 点击"API"
5. 在"Project URL"部分找到您的 Supabase URL
6. 在"Project API keys"部分找到您的 anon/public key

请确保不要将包含这些密钥的 `.env.local` 文件提交到版本控制系统中。
