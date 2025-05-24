-- 修复侧边栏菜单路由，确保使用workspace_id占位符
-- 这将更新所有菜单项的路由，将硬编码的路径替换为使用{workspace_id}占位符的路径

-- 更新Sales菜单项
UPDATE public.sidebar_menu_items
SET route = REPLACE(route, '/dashboard/sales/', '/dashboard/{workspace_id}/')
WHERE route LIKE '/dashboard/sales/%';

-- 更新Purchases菜单项
UPDATE public.sidebar_menu_items
SET route = REPLACE(route, '/dashboard/purchases/', '/dashboard/{workspace_id}/')
WHERE route LIKE '/dashboard/purchases/%';

-- 更新Banking菜单项
UPDATE public.sidebar_menu_items
SET route = REPLACE(route, '/dashboard/banking/', '/dashboard/{workspace_id}/')
WHERE route LIKE '/dashboard/banking/%';

-- 更新Accounting菜单项
UPDATE public.sidebar_menu_items
SET route = REPLACE(route, '/dashboard/accounting/', '/dashboard/{workspace_id}/')
WHERE route LIKE '/dashboard/accounting/%';

-- 更新Reports菜单项
UPDATE public.sidebar_menu_items
SET route = REPLACE(route, '/dashboard/reports/', '/dashboard/{workspace_id}/')
WHERE route LIKE '/dashboard/reports/%';

-- 更新Settings菜单项
UPDATE public.sidebar_menu_items
SET route = REPLACE(route, '/dashboard/settings/', '/dashboard/{workspace_id}/')
WHERE route LIKE '/dashboard/settings/%';

-- 更新其他可能的菜单项
UPDATE public.sidebar_menu_items
SET route = REPLACE(route, '/dashboard/', '/dashboard/{workspace_id}/')
WHERE route LIKE '/dashboard/%' 
  AND route NOT LIKE '/dashboard/{workspace_id}/%'
  AND route != '/dashboard';
