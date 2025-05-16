-- 更新Banking菜单项的路由，使其包含workspace_id参数
-- 首先更新Business工作空间的Banking菜单项

-- 获取Business工作空间Banking子菜单的ID
DO $$
DECLARE
  banking_id UUID;
BEGIN
  -- 获取Banking菜单ID
  SELECT id INTO banking_id FROM public.sidebar_menu_items 
  WHERE template_id = 'b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e' AND name = 'Banking';
  
  -- 更新Banking子菜单项的路由
  UPDATE public.sidebar_menu_items
  SET route = '/dashboard/{workspace_id}/banking/accounts'
  WHERE template_id = 'b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e' 
    AND parent_id = banking_id 
    AND name = 'Accounts Overview';
  
  UPDATE public.sidebar_menu_items
  SET route = '/dashboard/{workspace_id}/banking/reconciliation'
  WHERE template_id = 'b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e' 
    AND parent_id = banking_id 
    AND name = 'Reconciliation';
  
  UPDATE public.sidebar_menu_items
  SET route = '/dashboard/{workspace_id}/banking/import'
  WHERE template_id = 'b2c3d4e5-f6a7-5b6c-0d8e-9f0a1b2c3d4e' 
    AND parent_id = banking_id 
    AND name = 'Import Transactions';
END;
$$;

-- 更新Personal工作空间的Banking菜单项
DO $$
DECLARE
  banking_id UUID;
BEGIN
  -- 获取Banking菜单ID
  SELECT id INTO banking_id FROM public.sidebar_menu_items 
  WHERE template_id = 'a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d' AND name = 'Banking';
  
  -- 更新Banking子菜单项的路由
  UPDATE public.sidebar_menu_items
  SET route = '/dashboard/{workspace_id}/banking/accounts'
  WHERE template_id = 'a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d' 
    AND parent_id = banking_id 
    AND name = 'Accounts Overview';
  
  UPDATE public.sidebar_menu_items
  SET route = '/dashboard/{workspace_id}/banking/reconciliation'
  WHERE template_id = 'a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d' 
    AND parent_id = banking_id 
    AND name = 'Reconciliation';
  
  UPDATE public.sidebar_menu_items
  SET route = '/dashboard/{workspace_id}/banking/import'
  WHERE template_id = 'a1b2c3d4-e5f6-4a5b-9c7d-8e9f0a1b2c3d' 
    AND parent_id = banking_id 
    AND name = 'Import Transactions';
END;
$$;
