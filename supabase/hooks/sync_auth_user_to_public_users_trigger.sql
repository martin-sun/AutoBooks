-- supabase/hooks/sync_auth_user_to_public_users_trigger.sql
-- This trigger calls the handle_new_user function after a new user is inserted into auth.users.

-- Ensure the public.handle_new_user() function is created before creating this trigger.
-- See sync_auth_user_to_public_users_function.sql

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- To apply this trigger, run this script in your Supabase SQL Editor AFTER
-- you have successfully created the public.handle_new_user() function.

-- If you need to update the trigger or function, you might need to drop the old trigger first:
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
