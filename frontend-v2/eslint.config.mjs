import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// AutoBooks Frontend V2 ESLint 配置
const eslintConfig = [
  // 扩展 Next.js 的核心规则
  ...compat.extends("next/core-web-vitals"),

  // 添加命名约定规则
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      // 基本命名约定规则
      camelcase: ["warn", { properties: "never" }],
      
      // React Hook Form 相关规则
      "react-hooks/exhaustive-deps": ["warn"],
      "react-hooks/rules-of-hooks": ["error"],

      // 文件命名约定（通过注释提供指导）
      "spaced-comment": [
        "warn",
        "always",
        {
          markers: ["/"],
          exceptions: ["-", "+"],
        },
      ],

      // 组件和类型命名约定（通过注释提供指导）
      "no-warning-comments": ["off"],

      // 导入路径规则
      "sort-imports": ["off"],
      "no-duplicate-imports": ["error"],

      // 代码风格规则
      "prefer-const": ["warn"],
      "no-var": ["warn"],
      "no-unused-vars": ["warn"],

      // 注释规则
      "capitalized-comments": ["off"],
      "multiline-comment-style": ["off"],

      // 代码格式规则
      "max-len": ["off"],
      "no-multiple-empty-lines": ["warn", { max: 2, maxEOF: 1 }],
      "eol-last": ["warn"],
      "comma-dangle": ["warn", "always-multiline"],
      semi: ["warn", "always"],
      quotes: ["warn", "single", { avoidEscape: true }],

      // 导入顺序规则
      "no-restricted-imports": ["off"],
      
      // Supabase 相关规则
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "@typescript-eslint/no-unused-vars": ["warn"],
      "@typescript-eslint/no-explicit-any": ["warn"],
    },
  },

  // 页面组件规则
  {
    files: ["**/page.tsx", "**/layout.tsx", "**/*.page.tsx"],
    rules: {
      // 允许页面组件使用默认导出
      "import/no-default-export": "off",
    },
  },
  
  // React Hook Form 规则
  {
    files: ["**/hooks/**/*.ts", "**/hooks/**/*.tsx", "**/*form*.tsx"],
    rules: {
      // React Hook Form 相关规则
      "react-hooks/exhaustive-deps": ["warn"],
    },
  },
  
  // Supabase 相关规则
  {
    files: ["**/lib/supabase.ts", "**/api/**/*.ts"],
    rules: {
      // 允许在 Supabase 相关文件中使用 console.log
      "no-console": ["off"],
    },
  },
];

export default eslintConfig;
