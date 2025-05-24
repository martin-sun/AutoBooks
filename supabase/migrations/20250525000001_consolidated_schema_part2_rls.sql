-- AutoBooks 综合数据库结构 - 第2部分：RLS策略和触发器
-- 生成日期: 2025-05-25
-- 此文件包含所有RLS策略和触发器

-- 启用RLS策略
ALTER TABLE account_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_year_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiscal_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE inter_workspace_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sidebar_menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sidebar_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE taxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_taxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_custom_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_menu_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
-- 工作空间RLS策略
CREATE POLICY workspace_access_policy ON workspaces
  FOR ALL
  TO PUBLIC
  USING ((user_id = auth.get_current_user_id()) OR (owner_id = auth.get_current_user_id()));

CREATE POLICY workspace_member_access_policy ON workspaces
  FOR ALL
  TO PUBLIC
  USING (auth.check_workspace_membership(id));

-- 账户组RLS策略
CREATE POLICY account_groups_policy ON account_groups
  FOR ALL
  TO PUBLIC
  USING (((workspace_id IN ( SELECT workspaces.id FROM workspaces WHERE (workspaces.user_id = get_current_user_id()))) OR (workspace_id IS NULL)));

-- 账户年度余额RLS策略
CREATE POLICY account_year_balances_workspace_isolation ON account_year_balances
  FOR ALL
  TO PUBLIC
  USING ((workspace_id IN ( SELECT workspaces.id FROM workspaces WHERE ((workspaces.user_id = auth.uid()) AND (workspaces.is_deleted = false)))));

-- 账户RLS策略
CREATE POLICY accounts_policy ON accounts
  FOR ALL
  TO PUBLIC
  USING ((workspace_id IN ( SELECT workspaces.id FROM workspaces WHERE (workspaces.user_id = auth.get_current_user_id()))));

-- 审批工作流RLS策略
CREATE POLICY approval_workflows_policy ON approval_workflows
  FOR ALL
  TO PUBLIC
  USING ((workspace_id IN ( SELECT workspaces.id FROM workspaces WHERE (workspaces.user_id = auth.get_current_user_id()))));

-- 审批RLS策略
CREATE POLICY approvals_policy ON approvals
  FOR ALL
  TO PUBLIC
  USING (((workspace_id IN ( SELECT workspaces.id FROM workspaces WHERE (workspaces.user_id = auth.get_current_user_id()))) OR (requested_by = auth.get_current_user_id()) OR (approved_by = auth.get_current_user_id())));

-- 资产类别RLS策略
CREATE POLICY asset_categories_modify_policy ON asset_categories
  FOR ALL
  TO PUBLIC
  USING ((NOT system_defined));

CREATE POLICY asset_categories_select_policy ON asset_categories
  FOR SELECT
  TO PUBLIC
  USING (true);

-- 资产交易RLS策略
CREATE POLICY asset_transactions_policy ON asset_transactions
  FOR ALL
  TO PUBLIC
  USING ((asset_id IN ( SELECT assets.id FROM assets WHERE (assets.workspace_id IN ( SELECT workspaces.id FROM workspaces WHERE (workspaces.user_id = auth.get_current_user_id()))))));

-- 资产RLS策略
CREATE POLICY assets_policy ON assets
  FOR ALL
  TO PUBLIC
  USING ((workspace_id IN ( SELECT workspaces.id FROM workspaces WHERE (workspaces.user_id = auth.get_current_user_id()))));

-- 审计日志RLS策略
CREATE POLICY audit_logs_policy ON audit_logs
  FOR ALL
  TO PUBLIC
  USING ((workspace_id IN ( SELECT workspaces.id FROM workspaces WHERE (workspaces.user_id = auth.get_current_user_id()))));

-- 预算项目RLS策略
CREATE POLICY budget_items_policy ON budget_items
  FOR ALL
  TO PUBLIC
  USING ((budget_id IN ( SELECT budgets.id FROM budgets WHERE (budgets.workspace_id IN ( SELECT workspaces.id FROM workspaces WHERE (workspaces.user_id = auth.get_current_user_id()))))));

-- 预算RLS策略
CREATE POLICY budgets_policy ON budgets
  FOR ALL
  TO PUBLIC
  USING ((workspace_id IN ( SELECT workspaces.id FROM workspaces WHERE (workspaces.user_id = auth.get_current_user_id()))));

-- 科目表RLS策略
CREATE POLICY chart_of_accounts_policy ON chart_of_accounts
  FOR ALL
  TO PUBLIC
  USING ((workspace_id IN ( SELECT workspaces.id FROM workspaces WHERE (workspaces.user_id = auth.get_current_user_id()))));

-- 客户RLS策略
CREATE POLICY customers_policy ON customers
  FOR ALL
  TO PUBLIC
  USING ((workspace_id IN ( SELECT workspaces.id FROM workspaces WHERE (workspaces.user_id = auth.get_current_user_id()))));

-- 会计年度RLS策略
CREATE POLICY fiscal_years_policy ON fiscal_years
  FOR ALL
  TO PUBLIC
  USING ((workspace_id IN ( SELECT workspaces.id FROM workspaces WHERE (workspaces.user_id = auth.get_current_user_id()))));

-- 跨工作空间余额RLS策略
CREATE POLICY inter_workspace_balances_policy ON inter_workspace_balances
  FOR ALL
  TO PUBLIC
  USING (((source_workspace_id IN ( SELECT workspaces.id FROM workspaces WHERE (workspaces.user_id = auth.get_current_user_id()))) OR (target_workspace_id IN ( SELECT workspaces.id FROM workspaces WHERE (workspaces.user_id = auth.get_current_user_id())))));

-- 发票活动RLS策略
CREATE POLICY invoice_activities_policy ON invoice_activities
  FOR ALL
  TO PUBLIC
  USING ((invoice_id IN ( SELECT invoices.id FROM invoices WHERE (invoices.workspace_id IN ( SELECT workspaces.id FROM workspaces WHERE (workspaces.user_id = auth.get_current_user_id()))))));

-- 发票明细RLS策略
CREATE POLICY invoice_lines_policy ON invoice_lines
  FOR ALL
  TO PUBLIC
  USING ((invoice_id IN ( SELECT invoices.id FROM invoices WHERE (invoices.workspace_id IN ( SELECT workspaces.id FROM workspaces WHERE (workspaces.user_id = auth.get_current_user_id()))))));

-- 发票支付RLS策略
CREATE POLICY invoice_payments_policy ON invoice_payments
  FOR ALL
  TO PUBLIC
  USING ((invoice_id IN ( SELECT invoices.id FROM invoices WHERE (invoices.workspace_id IN ( SELECT workspaces.id FROM workspaces WHERE (workspaces.user_id = auth.get_current_user_id()))))));

-- 发票模板RLS策略
CREATE POLICY invoice_templates_policy ON invoice_templates
  FOR ALL
  TO PUBLIC
  USING ((workspace_id IN ( SELECT workspaces.id FROM workspaces WHERE (workspaces.user_id = auth.get_current_user_id()))));

-- 发票RLS策略
CREATE POLICY invoices_policy ON invoices
  FOR ALL
  TO PUBLIC
  USING ((workspace_id IN ( SELECT workspaces.id FROM workspaces WHERE (workspaces.user_id = auth.get_current_user_id()))));

-- 权限RLS策略
CREATE POLICY permissions_policy ON permissions
  FOR ALL
  TO PUBLIC
  USING (true);

-- 产品和服务RLS策略
CREATE POLICY products_services_policy ON products_services
  FOR ALL
  TO PUBLIC
  USING ((workspace_id IN ( SELECT workspaces.id FROM workspaces WHERE (workspaces.user_id = auth.get_current_user_id()))));

-- 问题RLS策略
CREATE POLICY questions_policy ON questions
  FOR ALL
  TO PUBLIC
  USING (((workspace_id IN ( SELECT workspaces.id FROM workspaces WHERE (workspaces.user_id = auth.get_current_user_id()))) OR (user_id = auth.get_current_user_id())));

-- 定期发票RLS策略
CREATE POLICY recurring_invoices_policy ON recurring_invoices
  FOR ALL
  TO PUBLIC
  USING ((workspace_id IN ( SELECT workspaces.id FROM workspaces WHERE (workspaces.user_id = auth.get_current_user_id()))));

-- 角色权限RLS策略
CREATE POLICY role_permissions_policy ON role_permissions
  FOR ALL
  TO PUBLIC
  USING (true);

-- 角色RLS策略
CREATE POLICY roles_policy ON roles
  FOR ALL
  TO PUBLIC
  USING (true);

-- 侧边栏菜单项RLS策略
CREATE POLICY sidebar_menu_items_policy ON sidebar_menu_items
  FOR ALL
  TO PUBLIC
  USING (true);

-- 侧边栏模板RLS策略
CREATE POLICY sidebar_templates_policy ON sidebar_templates
  FOR ALL
  TO PUBLIC
  USING (true);

-- 标签RLS策略
CREATE POLICY tags_policy ON tags
  FOR ALL
  TO PUBLIC
  USING ((workspace_id IN ( SELECT workspaces.id FROM workspaces WHERE (workspaces.user_id = auth.get_current_user_id()))));

-- 税务RLS策略
CREATE POLICY taxes_policy ON taxes
  FOR ALL
  TO PUBLIC
  USING ((workspace_id IN ( SELECT workspaces.id FROM workspaces WHERE (workspaces.user_id = auth.get_current_user_id()))));

-- 交易明细RLS策略
CREATE POLICY transaction_lines_policy ON transaction_lines
  FOR ALL
  TO PUBLIC
  USING ((transaction_id IN ( SELECT transactions.id FROM transactions WHERE (transactions.workspace_id IN ( SELECT workspaces.id FROM workspaces WHERE (workspaces.user_id = auth.get_current_user_id()))))));

-- 交易标签RLS策略
CREATE POLICY transaction_tags_policy ON transaction_tags
  FOR ALL
  TO PUBLIC
  USING ((transaction_id IN ( SELECT transactions.id FROM transactions WHERE (transactions.workspace_id IN ( SELECT workspaces.id FROM workspaces WHERE (workspaces.user_id = auth.get_current_user_id()))))));

-- 交易税务RLS策略
CREATE POLICY transaction_taxes_policy ON transaction_taxes
  FOR ALL
  TO PUBLIC
  USING ((transaction_id IN ( SELECT transactions.id FROM transactions WHERE (transactions.workspace_id IN ( SELECT workspaces.id FROM workspaces WHERE (workspaces.user_id = auth.get_current_user_id()))))));

-- 交易RLS策略
CREATE POLICY transactions_policy ON transactions
  FOR ALL
  TO PUBLIC
  USING ((workspace_id IN ( SELECT workspaces.id FROM workspaces WHERE (workspaces.user_id = auth.get_current_user_id()))));

-- 工作空间自定义权限RLS策略
CREATE POLICY workspace_custom_permissions_policy ON workspace_custom_permissions
  FOR ALL
  TO PUBLIC
  USING ((workspace_id IN ( SELECT workspaces.id FROM workspaces WHERE (workspaces.user_id = auth.get_current_user_id()))));

-- 工作空间成员RLS策略
CREATE POLICY workspace_members_policy ON workspace_members
  FOR ALL
  TO PUBLIC
  USING (((user_id = auth.get_current_user_id()) OR (workspace_id IN ( SELECT workspaces.id FROM workspaces WHERE ((workspaces.user_id = auth.get_current_user_id()) OR (workspaces.owner_id = auth.get_current_user_id()))))));

-- 工作空间菜单配置RLS策略
CREATE POLICY "Admins can manage workspace menu configs" ON workspace_menu_configs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view their workspace menu configs" ON workspace_menu_configs
  FOR SELECT
  TO authenticated
  USING ((workspace_id IN ( SELECT workspaces.id FROM workspaces WHERE (workspaces.user_id = auth.uid()))));

-- 创建触发器
-- 更新时间戳触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为所有带有updated_at列的表创建触发器
CREATE TRIGGER update_account_groups_updated_at
BEFORE UPDATE ON account_groups
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_account_year_balances_updated_at
BEFORE UPDATE ON account_year_balances
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at
BEFORE UPDATE ON accounts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_approval_workflows_updated_at
BEFORE UPDATE ON approval_workflows
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asset_categories_updated_at
BEFORE UPDATE ON asset_categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asset_transactions_updated_at
BEFORE UPDATE ON asset_transactions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at
BEFORE UPDATE ON assets
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_items_updated_at
BEFORE UPDATE ON budget_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
BEFORE UPDATE ON budgets
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chart_of_accounts_updated_at
BEFORE UPDATE ON chart_of_accounts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON customers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fiscal_years_updated_at
BEFORE UPDATE ON fiscal_years
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inter_workspace_balances_updated_at
BEFORE UPDATE ON inter_workspace_balances
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_lines_updated_at
BEFORE UPDATE ON invoice_lines
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_payments_updated_at
BEFORE UPDATE ON invoice_payments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_templates_updated_at
BEFORE UPDATE ON invoice_templates
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON invoices
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permissions_updated_at
BEFORE UPDATE ON permissions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_services_updated_at
BEFORE UPDATE ON products_services
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_invoices_updated_at
BEFORE UPDATE ON recurring_invoices
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at
BEFORE UPDATE ON roles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sidebar_menu_items_updated_at
BEFORE UPDATE ON sidebar_menu_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sidebar_templates_updated_at
BEFORE UPDATE ON sidebar_templates
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tags_updated_at
BEFORE UPDATE ON tags
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_taxes_updated_at
BEFORE UPDATE ON taxes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transaction_lines_updated_at
BEFORE UPDATE ON transaction_lines
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON transactions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspace_custom_permissions_updated_at
BEFORE UPDATE ON workspace_custom_permissions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspace_members_updated_at
BEFORE UPDATE ON workspace_members
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspace_menu_configs_updated_at
BEFORE UPDATE ON workspace_menu_configs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspaces_updated_at
BEFORE UPDATE ON workspaces
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 审计日志触发器
CREATE OR REPLACE FUNCTION audit_account_year_balances_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (
      workspace_id,
      table_name,
      record_id,
      action,
      old_data,
      new_data,
      changed_by
    ) VALUES (
      NEW.workspace_id,
      'account_year_balances',
      NEW.id,
      'INSERT',
      NULL,
      row_to_json(NEW),
      auth.uid()
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (
      workspace_id,
      table_name,
      record_id,
      action,
      old_data,
      new_data,
      changed_by
    ) VALUES (
      NEW.workspace_id,
      'account_year_balances',
      NEW.id,
      'UPDATE',
      row_to_json(OLD),
      row_to_json(NEW),
      auth.uid()
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (
      workspace_id,
      table_name,
      record_id,
      action,
      old_data,
      new_data,
      changed_by
    ) VALUES (
      OLD.workspace_id,
      'account_year_balances',
      OLD.id,
      'DELETE',
      row_to_json(OLD),
      NULL,
      auth.uid()
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_account_year_balances_trigger
AFTER INSERT OR UPDATE OR DELETE ON account_year_balances
FOR EACH ROW EXECUTE FUNCTION audit_account_year_balances_changes();

-- 发票状态更新触发器
CREATE OR REPLACE FUNCTION update_invoice_status()
RETURNS TRIGGER AS $$
BEGIN
  -- 计算已付金额
  SELECT COALESCE(SUM(amount), 0) INTO NEW.paid_amount
  FROM invoice_payments
  WHERE invoice_id = NEW.id;
  
  -- 更新状态
  IF NEW.status = 'cancelled' THEN
    -- 如果已取消，保持取消状态
    NULL;
  ELSIF NEW.paid_amount >= NEW.total_amount THEN
    -- 如果已全额支付
    NEW.status := 'paid';
    IF NEW.paid_at IS NULL THEN
      NEW.paid_at := NOW();
    END IF;
  ELSIF NEW.paid_amount > 0 THEN
    -- 如果部分支付
    NEW.status := 'partial';
  ELSIF NEW.sent_at IS NOT NULL AND NEW.due_date < CURRENT_DATE THEN
    -- 如果已发送且已过期
    NEW.status := 'overdue';
  ELSIF NEW.sent_at IS NOT NULL AND NEW.viewed_at IS NOT NULL THEN
    -- 如果已发送且已查看
    NEW.status := 'viewed';
  ELSIF NEW.sent_at IS NOT NULL THEN
    -- 如果已发送
    NEW.status := 'sent';
  ELSE
    -- 默认为草稿
    NEW.status := 'draft';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invoice_status_trigger
BEFORE INSERT OR UPDATE ON invoices
FOR EACH ROW EXECUTE FUNCTION update_invoice_status();

-- 工作空间初始化触发器
CREATE OR REPLACE FUNCTION auto_initialize_workspace()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM initialize_workspace_defaults(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_initialize_workspace_trigger
AFTER INSERT ON workspaces
FOR EACH ROW EXECUTE FUNCTION auto_initialize_workspace();
