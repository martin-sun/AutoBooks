-- AutoBooks Auto-Create Workspace Hook
-- Creation Date: 2025-05-10
-- Description: Automatically creates a default personal workspace for new users upon registration

-- Create a function that automatically creates a default workspace after user registration
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  default_workspace_id UUID;
BEGIN
  -- Insert user record into public.users table (if it doesn't exist)
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  
  -- Check if the user already has a workspace
  PERFORM id FROM public.workspaces WHERE user_id = NEW.id LIMIT 1;
  
  -- If no workspace exists, create a default one
  IF NOT FOUND THEN
    INSERT INTO public.workspaces (user_id, name, type, currency)
    VALUES (NEW.id, 'Personal workspace', 'personal', 'CAD')
    RETURNING id INTO default_workspace_id;
    
    -- Log the action (if audit_logs table exists)
    BEGIN
      INSERT INTO public.audit_logs (
        workspace_id,
        user_id,
        table_name,
        record_id,
        action,
        new_data
      ) VALUES (
        default_workspace_id,
        NEW.id,
        'workspaces',
        default_workspace_id,
        'auto_create',
        json_build_object('reason', 'New user registration')
      );
    EXCEPTION
      WHEN undefined_table THEN
        -- If audit_logs table doesn't exist, ignore the error
        NULL;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: After creating this function, you need to manually configure the hook in Supabase Dashboard:
-- 1. Navigate to Authentication > Hooks
-- 2. Click "Add new hook"
-- 3. Select event type: "After a user is created"
-- 4. Select function: "public.handle_new_user"
-- 5. Save the settings
