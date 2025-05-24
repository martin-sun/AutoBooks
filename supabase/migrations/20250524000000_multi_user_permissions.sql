-- AutoBooks: Multi-User Permissions System
-- 创建时间: 2025-05-24

-- 1. 修改 workspaces 表
ALTER TABLE workspaces 
ADD COLUMN owner_id UUID REFERENCES users(id),
ADD COLUMN created_by UUID REFERENCES users(id);

-- 更新现有数据，将user_id设置为owner_id和created_by
UPDATE workspaces SET owner_id = user_id, created_by = user_id;

-- 2. 角色表
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE, -- 系统预定义角色
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 权限表
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource VARCHAR(50) NOT NULL, -- 资源名称：invoice, transaction, report等
  action VARCHAR(50) NOT NULL, -- 操作：create, read, update, delete, approve等
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(resource, action)
);

-- 4. 角色权限关联表
CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (role_id, permission_id)
);

-- 5. 工作空间成员表
CREATE TABLE workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id),
  invited_by UUID REFERENCES users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- 6. 自定义权限（工作空间级别的特殊权限）
CREATE TABLE workspace_custom_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES workspace_members(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id),
  granted BOOLEAN DEFAULT TRUE, -- TRUE=授予，FALSE=撤销
  granted_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- 7. 审批工作流配置
CREATE TABLE approval_workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  workflow_type VARCHAR(50) NOT NULL, -- invoice_over_amount, expense_over_amount等
  conditions JSONB NOT NULL, -- {amount_threshold: 5000, currency: 'CAD'}
  approver_role_id UUID REFERENCES roles(id),
  approver_user_id UUID REFERENCES users(id), -- 可以指定具体用户
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. 审批记录
CREATE TABLE approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES approval_workflows(id),
  resource_type VARCHAR(50) NOT NULL, -- invoice, expense, journal_entry等
  resource_id UUID NOT NULL,
  requested_by UUID NOT NULL REFERENCES users(id),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. 为所有业务表添加操作用户跟踪
ALTER TABLE transactions 
ADD COLUMN created_by UUID REFERENCES users(id),
ADD COLUMN updated_by UUID REFERENCES users(id),
ADD COLUMN approved_by UUID REFERENCES users(id),
ADD COLUMN approved_at TIMESTAMPTZ;

-- 10. 启用RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_custom_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;

-- 11. 创建RLS策略
-- Roles策略 (系统表，所有认证用户可读)
CREATE POLICY roles_read_policy ON roles
  FOR SELECT
  USING (true);

-- Permissions策略 (系统表，所有认证用户可读)
CREATE POLICY permissions_read_policy ON permissions
  FOR SELECT
  USING (true);

-- Role_Permissions策略 (系统表，所有认证用户可读)
CREATE POLICY role_permissions_read_policy ON role_permissions
  FOR SELECT
  USING (true);

-- Workspace_Members策略
CREATE POLICY workspace_members_policy ON workspace_members
  FOR ALL
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id()) OR 
         user_id = auth.get_current_user_id());

-- Workspace_Custom_Permissions策略
CREATE POLICY workspace_custom_permissions_policy ON workspace_custom_permissions
  FOR ALL
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id()));

-- Approval_Workflows策略
CREATE POLICY approval_workflows_policy ON approval_workflows
  FOR ALL
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id()));

-- Approvals策略
CREATE POLICY approvals_policy ON approvals
  FOR ALL
  USING (workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.get_current_user_id()) OR
         requested_by = auth.get_current_user_id() OR
         approved_by = auth.get_current_user_id());

-- 12. 创建触发器
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_workspace_members_updated_at BEFORE UPDATE ON workspace_members
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_approval_workflows_updated_at BEFORE UPDATE ON approval_workflows
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER audit_roles AFTER INSERT OR UPDATE OR DELETE ON roles
  FOR EACH ROW EXECUTE PROCEDURE create_audit_log();

CREATE TRIGGER audit_workspace_members AFTER INSERT OR UPDATE OR DELETE ON workspace_members
  FOR EACH ROW EXECUTE PROCEDURE create_audit_log();

CREATE TRIGGER audit_approval_workflows AFTER INSERT OR UPDATE OR DELETE ON approval_workflows
  FOR EACH ROW EXECUTE PROCEDURE create_audit_log();

CREATE TRIGGER audit_approvals AFTER INSERT OR UPDATE OR DELETE ON approvals
  FOR EACH ROW EXECUTE PROCEDURE create_audit_log();

-- 13. 插入系统预定义角色
INSERT INTO roles (name, description, is_system) VALUES
('owner', '工作空间所有者，拥有所有权限', TRUE),
('admin', '管理员，可以管理用户和大部分设置', TRUE),
('accountant', '会计师，可以处理所有财务操作', TRUE),
('bookkeeper', '记账员，可以创建和编辑交易', TRUE),
('approver', '审批人，可以审批发票和支出', TRUE),
('viewer', '查看者，只能查看报表和数据', TRUE);

-- 14. 插入基础权限
INSERT INTO permissions (resource, action, description) VALUES
-- 发票权限
('invoice', 'create', '创建发票'),
('invoice', 'read', '查看发票'),
('invoice', 'update', '更新发票'),
('invoice', 'delete', '删除发票'),
('invoice', 'send', '发送发票'),
('invoice', 'approve', '审批发票'),
-- 交易权限
('transaction', 'create', '创建交易'),
('transaction', 'read', '查看交易'),
('transaction', 'update', '更新交易'),
('transaction', 'delete', '删除交易'),
('transaction', 'reconcile', '对账'),
-- 报表权限
('report', 'view_financial', '查看财务报表'),
('report', 'view_tax', '查看税务报表'),
('report', 'export', '导出报表'),
-- 设置权限
('settings', 'manage_users', '管理用户'),
('settings', 'manage_company', '管理公司信息'),
('settings', 'manage_chart_of_accounts', '管理会计科目表');

-- 15. 为角色分配权限
-- Owner角色 - 所有权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE name = 'owner'),
  id
FROM permissions;

-- Admin角色 - 除了某些高级财务操作外的所有权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE name = 'admin'),
  id
FROM permissions
WHERE NOT (resource = 'report' AND action = 'export');

-- Accountant角色 - 所有财务操作权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE name = 'accountant'),
  id
FROM permissions
WHERE resource IN ('invoice', 'transaction', 'report');

-- Bookkeeper角色 - 基本记账权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE name = 'bookkeeper'),
  id
FROM permissions
WHERE (resource = 'invoice' AND action IN ('create', 'read', 'update')) OR
      (resource = 'transaction' AND action IN ('create', 'read', 'update', 'reconcile'));

-- Approver角色 - 审批权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE name = 'approver'),
  id
FROM permissions
WHERE action = 'approve' OR (resource IN ('invoice', 'transaction') AND action = 'read');

-- Viewer角色 - 只读权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE name = 'viewer'),
  id
FROM permissions
WHERE action = 'read' OR action = 'view_financial' OR action = 'view_tax';

-- 16. 创建工作空间成员迁移函数
CREATE OR REPLACE FUNCTION migrate_workspace_members()
RETURNS void AS $$
DECLARE
  workspace_rec RECORD;
  owner_role_id UUID;
BEGIN
  -- 获取owner角色ID
  SELECT id INTO owner_role_id FROM roles WHERE name = 'owner';
  
  -- 为每个工作空间创建一个成员记录
  FOR workspace_rec IN SELECT id, user_id, owner_id FROM workspaces WHERE is_deleted = FALSE LOOP
    -- 如果owner_id为空，使用user_id
    IF workspace_rec.owner_id IS NULL THEN
      UPDATE workspaces SET owner_id = workspace_rec.user_id WHERE id = workspace_rec.id;
    END IF;
    
    -- 插入工作空间成员记录
    INSERT INTO workspace_members (workspace_id, user_id, role_id, accepted_at)
    VALUES (workspace_rec.id, COALESCE(workspace_rec.owner_id, workspace_rec.user_id), owner_role_id, NOW())
    ON CONFLICT (workspace_id, user_id) DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 执行迁移
SELECT migrate_workspace_members();

-- 17. 更新工作空间RLS策略
DROP POLICY IF EXISTS workspace_user_policy ON workspaces;

-- 新的工作空间策略：用户是工作空间的所有者或成员
CREATE POLICY workspace_access_policy ON workspaces
  FOR ALL
  USING (
    user_id = auth.get_current_user_id() OR 
    owner_id = auth.get_current_user_id() OR
    id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.get_current_user_id() AND is_active = TRUE
    )
  );

-- 18. 创建权限检查函数
CREATE OR REPLACE FUNCTION auth.user_has_permission(
  workspace_id_param UUID,
  resource_param TEXT,
  action_param TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  has_permission BOOLEAN;
BEGIN
  -- 检查用户是否是工作空间的所有者
  IF EXISTS (SELECT 1 FROM workspaces WHERE id = workspace_id_param AND owner_id = auth.uid()) THEN
    RETURN TRUE;
  END IF;
  
  -- 检查用户是否通过角色拥有权限
  SELECT EXISTS (
    SELECT 1
    FROM workspace_members wm
    JOIN role_permissions rp ON wm.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE wm.workspace_id = workspace_id_param
      AND wm.user_id = auth.uid()
      AND wm.is_active = TRUE
      AND p.resource = resource_param
      AND p.action = action_param
  ) INTO has_permission;
  
  -- 如果通过角色没有权限，检查自定义权限
  IF NOT has_permission THEN
    SELECT EXISTS (
      SELECT 1
      FROM workspace_custom_permissions wcp
      JOIN workspace_members wm ON wcp.member_id = wm.id
      JOIN permissions p ON wcp.permission_id = p.id
      WHERE wm.workspace_id = workspace_id_param
        AND wm.user_id = auth.uid()
        AND wm.is_active = TRUE
        AND p.resource = resource_param
        AND p.action = action_param
        AND wcp.granted = TRUE
        AND (wcp.expires_at IS NULL OR wcp.expires_at > NOW())
    ) INTO has_permission;
  END IF;
  
  RETURN has_permission;
END;
$$;
