-- supabase/hooks/sync_auth_user_to_public_users_function.sql
-- This function is triggered when a new user signs up in auth.users.
-- It copies relevant user information to the public.users table.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public -- Ensure 'public' is your schema for public.users
AS $$
BEGIN
  -- Insert the new user's ID, email, and creation timestamp into public.users.
  -- Adjust the column names and NEW.column references if your public.users table
  -- or the data you want to sync from auth.users differs.
  INSERT INTO public.users (id, email, created_at)
  VALUES (NEW.id, NEW.email, NEW.created_at);
  RETURN NEW;
END;
$$;

-- To apply this function, run this script in your Supabase SQL Editor.
-- After applying, you also need to create a trigger that uses this function.
-- See sync_auth_user_to_public_users_trigger.sql for the trigger definition.
