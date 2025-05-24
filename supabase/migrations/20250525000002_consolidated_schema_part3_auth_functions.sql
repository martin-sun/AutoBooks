-- AutoBooks 综合数据库结构 - 第3部分：认证和用户相关函数
-- 生成日期: 2025-05-25
-- 此文件包含认证和用户相关的函数

-- 获取当前用户ID函数
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID
LANGUAGE SQL SECURITY DEFINER
AS $$
  SELECT auth.uid()
$$;

-- 检查工作空间成员资格函数
CREATE OR REPLACE FUNCTION check_workspace_membership(workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = $1
    AND user_id = auth.uid()
    AND status = 'active'
  );
END;
$$;

-- 初始化工作空间默认设置函数
CREATE OR REPLACE FUNCTION initialize_workspace_defaults(p_workspace_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_template_id UUID;
  v_workspace_type TEXT;
  v_current_year INTEGER;
  v_fiscal_year_start DATE;
  v_fiscal_year_end DATE;
  v_fiscal_year_id UUID;
BEGIN
  -- 获取工作空间类型
  SELECT type INTO v_workspace_type
  FROM workspaces
  WHERE id = p_workspace_id;
  
  -- 设置侧边栏菜单
  SELECT id INTO v_template_id
  FROM sidebar_templates
  WHERE workspace_type = v_workspace_type
  LIMIT 1;
  
  IF v_template_id IS NOT NULL THEN
    INSERT INTO workspace_menu_configs (workspace_id, template_id)
    VALUES (p_workspace_id, v_template_id);
  END IF;
  
  -- 创建默认会计年度
  v_current_year := EXTRACT(YEAR FROM CURRENT_DATE);
  
  -- 根据工作空间设置确定会计年度的开始和结束日期
  SELECT 
    TO_DATE(v_current_year || '-' || fiscal_year_start_month || '-01', 'YYYY-MM-DD'),
    TO_DATE(v_current_year || '-' || SPLIT_PART(default_fiscal_year_end, '-', 1) || '-' || SPLIT_PART(default_fiscal_year_end, '-', 2), 'YYYY-MM-DD')
  INTO v_fiscal_year_start, v_fiscal_year_end
  FROM workspaces
  WHERE id = p_workspace_id;
  
  -- 如果结束日期早于开始日期，说明跨年，结束日期应该是下一年
  IF v_fiscal_year_end < v_fiscal_year_start THEN
    v_fiscal_year_end := v_fiscal_year_end + INTERVAL '1 year';
  END IF;
  
  -- 创建会计年度
  INSERT INTO fiscal_years (workspace_id, name, start_date, end_date, created_by)
  VALUES (p_workspace_id, v_current_year::TEXT, v_fiscal_year_start, v_fiscal_year_end, auth.uid())
  RETURNING id INTO v_fiscal_year_id;
  
  -- 如果是个人工作空间，创建默认账户组和科目
  IF v_workspace_type = 'personal' THEN
    -- 复制默认账户组
    INSERT INTO account_groups (workspace_id, account_type, name, description, display_order)
    SELECT p_workspace_id, account_type, name, description, display_order
    FROM account_groups
    WHERE workspace_type = 'personal' AND is_template = TRUE;
    
    -- 复制默认科目
    INSERT INTO chart_of_accounts (workspace_id, code, name, type, description)
    SELECT p_workspace_id, code, name, type, description
    FROM chart_of_accounts
    WHERE workspace_id IS NULL AND type IN ('asset', 'liability', 'equity', 'income', 'expense');
  
  -- 如果是商业工作空间，创建商业默认账户组和科目
  ELSIF v_workspace_type = 'business' THEN
    -- 复制默认账户组
    INSERT INTO account_groups (workspace_id, account_type, name, description, display_order)
    SELECT p_workspace_id, account_type, name, description, display_order
    FROM account_groups
    WHERE workspace_type = 'business' AND is_template = TRUE;
    
    -- 复制默认科目
    INSERT INTO chart_of_accounts (workspace_id, code, name, type, description)
    SELECT p_workspace_id, code, name, type, description
    FROM chart_of_accounts
    WHERE workspace_id IS NULL AND type IN ('asset', 'liability', 'equity', 'income', 'expense');
  END IF;
END;
$$;

-- 创建工作空间函数
CREATE OR REPLACE FUNCTION create_workspace(
  p_name TEXT,
  p_type TEXT,
  p_currency TEXT DEFAULT 'CAD'
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_workspace_id UUID;
BEGIN
  -- 验证用户已登录
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- 验证工作空间类型
  IF p_type NOT IN ('personal', 'business') THEN
    RAISE EXCEPTION 'Invalid workspace type. Must be "personal" or "business"';
  END IF;
  
  -- 创建工作空间
  INSERT INTO workspaces (user_id, name, type, currency, owner_id, created_by)
  VALUES (auth.uid(), p_name, p_type, p_currency, auth.uid(), auth.uid())
  RETURNING id INTO v_workspace_id;
  
  -- 添加用户为工作空间成员
  INSERT INTO workspace_members (workspace_id, user_id, role_id, status, invited_by)
  VALUES (v_workspace_id, auth.uid(), 
    (SELECT id FROM roles WHERE name = 'Owner' LIMIT 1),
    'active', auth.uid());
  
  RETURN v_workspace_id;
END;
$$;

-- 获取用户工作空间函数
CREATE OR REPLACE FUNCTION get_user_workspaces()
RETURNS TABLE (
  id UUID,
  name TEXT,
  type TEXT,
  currency TEXT,
  created_at TIMESTAMPTZ,
  is_owner BOOLEAN,
  role_name TEXT
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    w.id,
    w.name,
    w.type,
    w.currency,
    w.created_at,
    w.owner_id = auth.uid() AS is_owner,
    r.name AS role_name
  FROM workspaces w
  LEFT JOIN workspace_members wm ON w.id = wm.workspace_id AND wm.user_id = auth.uid()
  LEFT JOIN roles r ON wm.role_id = r.id
  WHERE (w.user_id = auth.uid() OR w.owner_id = auth.uid() OR wm.user_id = auth.uid())
    AND w.is_deleted = FALSE
    AND (wm.status = 'active' OR wm.status IS NULL)
  ORDER BY w.created_at DESC;
END;
$$;

-- 邀请用户加入工作空间函数
CREATE OR REPLACE FUNCTION invite_user_to_workspace(
  p_workspace_id UUID,
  p_email TEXT,
  p_role_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_is_owner BOOLEAN;
BEGIN
  -- 验证用户已登录
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- 验证当前用户是否是工作空间所有者
  SELECT owner_id = auth.uid() INTO v_is_owner
  FROM workspaces
  WHERE id = p_workspace_id;
  
  IF NOT v_is_owner THEN
    RAISE EXCEPTION 'Only workspace owner can invite users';
  END IF;
  
  -- 查找被邀请用户ID
  SELECT id INTO v_user_id
  FROM users
  WHERE email = p_email;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', p_email;
  END IF;
  
  -- 检查用户是否已经是工作空间成员
  IF EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = p_workspace_id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'User is already a member of this workspace';
  END IF;
  
  -- 添加用户为工作空间成员
  INSERT INTO workspace_members (workspace_id, user_id, role_id, status, invited_by)
  VALUES (p_workspace_id, v_user_id, p_role_id, 'pending', auth.uid());
  
  RETURN TRUE;
END;
$$;

-- 接受工作空间邀请函数
CREATE OR REPLACE FUNCTION accept_workspace_invitation(
  p_workspace_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  -- 验证用户已登录
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- 验证邀请存在
  IF NOT EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = p_workspace_id
    AND user_id = auth.uid()
    AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'No pending invitation found for this workspace';
  END IF;
  
  -- 更新邀请状态
  UPDATE workspace_members
  SET status = 'active', accepted_at = NOW()
  WHERE workspace_id = p_workspace_id
  AND user_id = auth.uid();
  
  RETURN TRUE;
END;
$$;
