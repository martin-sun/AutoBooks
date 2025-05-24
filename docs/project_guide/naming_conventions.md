# AutoBooks 命名规范

## 概述

本文档定义了 AutoBooks 项目的命名规范，旨在确保代码库的一致性和可维护性。遵循这些规范可以避免由于命名不一致导致的常见问题，如导入路径大小写不匹配等。

## 文件和目录命名

### 组件文件和目录

1. **React 组件文件**：使用 **PascalCase**
   - ✅ 正确：`Button.tsx`, `Card.tsx`, `TextField.tsx`
   - ❌ 错误：`button.tsx`, `card.tsx`, `text-field.tsx`

2. **组件目录**：使用 **PascalCase**
   - ✅ 正确：`/components/ui/Button/`, `/components/ui/Card/`
   - ❌ 错误：`/components/ui/button/`, `/components/ui/card/`

3. **UI 组件库**：所有 UI 组件必须使用一致的大小写
   - 所有 shadcn/ui 组件目录和文件必须使用 **PascalCase**
   - 例如：`Button`, `Card`, `Input`, `Select`, `Textarea`, `Calendar`, `Popover` 等

### 功能模块和工具

1. **工具函数文件**：使用 **camelCase**
   - ✅ 正确：`formatDate.ts`, `calculateTotal.ts`
   - ❌ 错误：`FormatDate.ts`, `format-date.ts`

2. **React Hooks**：使用 **camelCase** 并以 `use` 开头
   - ✅ 正确：`useAuth.ts`, `useForm.ts`, `useInvoiceForm.ts`
   - ❌ 错误：`UseAuth.ts`, `auth-hook.ts`

3. **API 和服务文件**：使用 **camelCase**
   - ✅ 正确：`invoiceApi.ts`, `authService.ts`
   - ❌ 错误：`InvoiceAPI.ts`, `auth-service.ts`

### 页面和路由

1. **Next.js 页面文件**：遵循 Next.js 的命名约定
   - App Router：`page.tsx` 作为页面入口
   - 动态路由：使用方括号，如 `[id].tsx`, `[workspace_id].tsx`

2. **页面组件**：使用 **PascalCase** 并以 `Page` 结尾
   - ✅ 正确：`InvoicePage.tsx`, `DashboardPage.tsx`
   - ❌ 错误：`invoice.tsx`, `dashboard-page.tsx`

## 导入路径规范

### 组件导入

1. **导入路径大小写**：必须与文件系统的实际大小写完全匹配
   - ✅ 正确：`import { Button } from '@/components/ui/Button';`
   - ❌ 错误：`import { Button } from '@/components/ui/button';`

2. **UI 组件导入一致性**：在整个项目中，同一组件必须使用相同的导入路径
   - 所有 UI 组件导入必须使用 PascalCase：
     ```typescript
     // 正确
     import { Button } from '@/components/ui/Button';
     import { Input } from '@/components/ui/Input';
     import { Select } from '@/components/ui/Select';
     import { Textarea } from '@/components/ui/Textarea';
     import { Calendar } from '@/components/ui/Calendar';
     import { Popover } from '@/components/ui/Popover';
     
     // 错误
     import { Button } from '@/components/ui/button';
     import { Input } from '@/components/ui/input';
     ```

### 别名和路径简写

1. **路径别名**：优先使用 `@/` 别名而不是相对路径
   - ✅ 正确：`import { Button } from '@/components/ui/Button';`
   - ❌ 避免：`import { Button } from '../../../components/ui/Button';`

2. **相对路径**：仅在导入同一目录或直接子目录的文件时使用
   - ✅ 适当使用：`import { someUtil } from './utils';`
   - ❌ 避免深层嵌套：`import { Button } from '../../../../components/ui/Button';`

## 变量和函数命名

1. **变量命名**：使用 **camelCase**
   - ✅ 正确：`const userName = 'John';`, `let itemCount = 0;`
   - ❌ 错误：`const UserName = 'John';`, `let item_count = 0;`

2. **常量命名**：使用 **UPPER_SNAKE_CASE** 用于真正的常量
   - ✅ 正确：`const MAX_ITEMS = 100;`, `const API_URL = 'https://api.example.com';`
   - ❌ 错误：`const maxItems = 100;`, `const apiUrl = 'https://api.example.com';`

3. **函数命名**：使用 **camelCase** 并采用动词开头
   - ✅ 正确：`function getUserData()`, `const calculateTotal = () => {}`
   - ❌ 错误：`function UserData()`, `const total_calculation = () => {}`

4. **布尔值变量**：使用 `is`, `has`, `should` 等前缀
   - ✅ 正确：`const isLoading = true;`, `const hasPermission = false;`
   - ❌ 错误：`const loading = true;`, `const permission = false;`

5. **事件处理函数**：使用 `handle` 或 `on` 前缀
   - ✅ 正确：`const handleSubmit = () => {}`, `function onUserClick() {}`
   - ❌ 错误：`const submitForm = () => {}`, `function userClick() {}`

## 类型和接口命名

1. **类型和接口**：使用 **PascalCase**
   - ✅ 正确：`interface UserData {}`, `type FormValues = {}`
   - ❌ 错误：`interface userData {}`, `type formValues = {}`

2. **枚举**：使用 **PascalCase**
   - ✅ 正确：`enum UserRole { Admin, User }`
   - ❌ 错误：`enum userRole { admin, user }`

3. **类型导入**：优先使用 `type` 关键字导入类型
   - ✅ 正确：`import type { UserData } from './types';`
   - ✅ 也可接受：`import { UserData } from './types';`

## 最佳实践

1. **保持一致性**：如果项目中已经建立了某种命名模式，请遵循该模式，即使它与本文档的建议不同。

2. **重构现有代码**：在修改现有文件时，应该将不符合规范的命名更新为符合规范的命名。

3. **使用 ESLint**：配置 ESLint 规则来强制执行这些命名约定。

4. **代码审查**：在代码审查过程中，应该检查命名是否符合规范。

## 常见问题解决

### 导入路径大小写不一致

如果遇到类似以下错误：

```
File name '/components/ui/input/index.tsx' differs from already included file name '/components/ui/Input/index.tsx' only in casing.
```

解决方法：
1. 确保所有导入使用相同的大小写（在本项目中，使用 PascalCase）
2. 检查文件系统中的实际文件名大小写
3. 更新所有导入语句以匹配正确的大小写

### TypeScript 类型错误

当使用不一致的导入路径时，可能会导致 TypeScript 将同一组件视为两个不同的类型，从而产生类型错误。确保所有导入使用一致的路径可以解决此类问题。

## 结论

遵循这些命名规范将有助于保持代码库的一致性和可维护性，减少由命名不一致导致的错误和混淆。所有团队成员都应该熟悉并遵循这些规范。
