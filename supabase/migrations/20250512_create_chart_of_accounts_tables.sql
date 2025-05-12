-- 创建会计科目表和账户表
-- Created: 2025-05-12

-- 创建会计科目表
CREATE TABLE IF NOT EXISTS public.chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  code VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('asset', 'liability', 'equity', 'income', 'expense')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  is_deleted BOOLEAN DEFAULT false NOT NULL
);

-- 创建账户表
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  chart_id UUID NOT NULL REFERENCES public.chart_of_accounts(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  opening_balance DECIMAL(15, 2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'CAD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  is_deleted BOOLEAN DEFAULT false NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS chart_of_accounts_workspace_id_idx ON public.chart_of_accounts(workspace_id);
CREATE INDEX IF NOT EXISTS chart_of_accounts_type_idx ON public.chart_of_accounts(type);
CREATE INDEX IF NOT EXISTS accounts_workspace_id_idx ON public.accounts(workspace_id);
CREATE INDEX IF NOT EXISTS accounts_chart_id_idx ON public.accounts(chart_id);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为会计科目表添加更新时间触发器
CREATE TRIGGER update_chart_of_accounts_updated_at
BEFORE UPDATE ON public.chart_of_accounts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 为账户表添加更新时间触发器
CREATE TRIGGER update_accounts_updated_at
BEFORE UPDATE ON public.accounts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 设置行级安全策略
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- 为会计科目表添加RLS策略
CREATE POLICY "用户可以查看自己工作空间的会计科目表"
  ON public.chart_of_accounts
  FOR SELECT
  USING (
    workspace_id IN (
      SELECT id FROM public.workspaces
      WHERE id = workspace_id AND (
        auth.uid() = owner_id OR
        auth.uid() IN (
          SELECT user_id FROM public.workspace_members
          WHERE workspace_id = public.chart_of_accounts.workspace_id
        )
      )
    )
  );

CREATE POLICY "用户可以创建自己工作空间的会计科目表"
  ON public.chart_of_accounts
  FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT id FROM public.workspaces
      WHERE id = workspace_id AND (
        auth.uid() = owner_id OR
        auth.uid() IN (
          SELECT user_id FROM public.workspace_members
          WHERE workspace_id = public.chart_of_accounts.workspace_id
        )
      )
    )
  );

CREATE POLICY "用户可以更新自己工作空间的会计科目表"
  ON public.chart_of_accounts
  FOR UPDATE
  USING (
    workspace_id IN (
      SELECT id FROM public.workspaces
      WHERE id = workspace_id AND (
        auth.uid() = owner_id OR
        auth.uid() IN (
          SELECT user_id FROM public.workspace_members
          WHERE workspace_id = public.chart_of_accounts.workspace_id
        )
      )
    )
  );

CREATE POLICY "用户可以删除自己工作空间的会计科目表"
  ON public.chart_of_accounts
  FOR DELETE
  USING (
    workspace_id IN (
      SELECT id FROM public.workspaces
      WHERE id = workspace_id AND (
        auth.uid() = owner_id OR
        auth.uid() IN (
          SELECT user_id FROM public.workspace_members
          WHERE workspace_id = public.chart_of_accounts.workspace_id
        )
      )
    )
  );

-- 为账户表添加RLS策略
CREATE POLICY "用户可以查看自己工作空间的账户"
  ON public.accounts
  FOR SELECT
  USING (
    workspace_id IN (
      SELECT id FROM public.workspaces
      WHERE id = workspace_id AND (
        auth.uid() = owner_id OR
        auth.uid() IN (
          SELECT user_id FROM public.workspace_members
          WHERE workspace_id = public.accounts.workspace_id
        )
      )
    )
  );

CREATE POLICY "用户可以创建自己工作空间的账户"
  ON public.accounts
  FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT id FROM public.workspaces
      WHERE id = workspace_id AND (
        auth.uid() = owner_id OR
        auth.uid() IN (
          SELECT user_id FROM public.workspace_members
          WHERE workspace_id = public.accounts.workspace_id
        )
      )
    )
  );

CREATE POLICY "用户可以更新自己工作空间的账户"
  ON public.accounts
  FOR UPDATE
  USING (
    workspace_id IN (
      SELECT id FROM public.workspaces
      WHERE id = workspace_id AND (
        auth.uid() = owner_id OR
        auth.uid() IN (
          SELECT user_id FROM public.workspace_members
          WHERE workspace_id = public.accounts.workspace_id
        )
      )
    )
  );

CREATE POLICY "用户可以删除自己工作空间的账户"
  ON public.accounts
  FOR DELETE
  USING (
    workspace_id IN (
      SELECT id FROM public.workspaces
      WHERE id = workspace_id AND (
        auth.uid() = owner_id OR
        auth.uid() IN (
          SELECT user_id FROM public.workspace_members
          WHERE workspace_id = public.accounts.workspace_id
        )
      )
    )
  );
