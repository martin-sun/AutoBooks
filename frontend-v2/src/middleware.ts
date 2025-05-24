import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/request';

// 这是 next-intl 官方推荐的中间件配置
export default createMiddleware({
  // 支持的语言列表
  locales,
  // 默认语言
  defaultLocale,
  // 使用 'always' 确保所有语言都有前缀，包括默认语言
  localePrefix: 'always'
});

export const config = {
  // 匹配所有路径，除了静态资源和API路由
  matcher: [
    // 匹配所有路径，除了：
    // - 以 /api, /_next, /static 开头的路径
    // - 包含文件扩展名的路径 (例如 .jpg)
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};
