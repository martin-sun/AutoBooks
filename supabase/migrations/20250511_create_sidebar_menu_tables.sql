-- 创建菜单模板表 (定义不同类型工作空间的菜单结构)
CREATE TABLE IF NOT EXISTS public.sidebar_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  workspace_type TEXT NOT NULL, -- 'personal' 或 'business'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建菜单项表 (定义菜单项及其层级关系)
CREATE TABLE IF NOT EXISTS public.sidebar_menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES public.sidebar_templates(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.sidebar_menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  route TEXT,
  position INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  requires_permission TEXT, -- 可选的权限控制
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建工作空间菜单配置表 (每个工作空间的具体菜单配置)
CREATE TABLE IF NOT EXISTS public.workspace_menu_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.sidebar_templates(id),
  customizations JSONB DEFAULT '{}'::JSONB, -- 存储工作空间特定的菜单自定义设置
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id)
);

-- 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS sidebar_menu_items_template_id_idx ON public.sidebar_menu_items(template_id);
CREATE INDEX IF NOT EXISTS sidebar_menu_items_parent_id_idx ON public.sidebar_menu_items(parent_id);
CREATE INDEX IF NOT EXISTS workspace_menu_configs_workspace_id_idx ON public.workspace_menu_configs(workspace_id);

-- 添加触发器以自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sidebar_templates_updated_at
BEFORE UPDATE ON public.sidebar_templates
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sidebar_menu_items_updated_at
BEFORE UPDATE ON public.sidebar_menu_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspace_menu_configs_updated_at
BEFORE UPDATE ON public.workspace_menu_configs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 启用行级安全 (Row Level Security)
ALTER TABLE public.sidebar_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sidebar_menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_menu_configs ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
CREATE POLICY "Admins can manage sidebar templates"
  ON public.sidebar_templates
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can manage sidebar menu items"
  ON public.sidebar_menu_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view their workspace menu configs"
  ON public.workspace_menu_configs
  FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT id FROM public.workspaces
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage workspace menu configs"
  ON public.workspace_menu_configs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
