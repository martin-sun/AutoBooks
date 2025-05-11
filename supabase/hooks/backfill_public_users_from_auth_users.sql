-- supabase/hooks/backfill_public_users_from_auth_users.sql
-- This script is a one-time operation to populate the public.users table
-- with any existing users from auth.users who are not yet in public.users.
-- Run this AFTER setting up the sync function and trigger.

INSERT INTO public.users (id, email, created_at) -- Ensure column names match your public.users table
SELECT 
    au.id,
    au.email,
    au.created_at -- Select corresponding columns from auth.users
FROM 
    auth.users au
WHERE NOT EXISTS ( -- Only insert if the user ID doesn't already exist in public.users
    SELECT 1
    FROM public.users pu
    WHERE pu.id = au.id
);

-- You can run this script multiple times; it will only insert missing users.
