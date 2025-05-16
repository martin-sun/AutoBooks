-- 更新 Business 工作空间的会计科目表子菜单路由
UPDATE public.sidebar_menu_items
SET route = '/dashboard/:workspace_id/chart-of-accounts'
WHERE template_id = 'b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e' 
AND name = 'Chart of Accounts';
