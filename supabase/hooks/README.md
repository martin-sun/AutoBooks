# Supabase Hooks Configuration

This directory previously contained hook functions that needed to be manually configured in the Supabase Dashboard.

## Workspace Creation (Deprecated)

The functionality to automatically create a default personal workspace for new users has been moved to an Edge Function implementation.

### Current Implementation

The automatic workspace creation is now handled by an Edge Function located at:
`/supabase/functions/create-workspace/`

Please refer to the README in that directory for deployment and configuration instructions.

### Why Edge Functions?

- More reliable than auth hooks which require manual configuration
- Better error handling and debugging capabilities
- Can be deployed through CI/CD pipelines
- Frontend can retry if the function fails
- No need to manually configure hooks in the Supabase Dashboard

## User Synchronization: `auth.users` to `public.users`

To ensure data consistency, especially when other tables (like `workspaces`) have foreign key constraints referencing `public.users(id)`, it's crucial to keep `public.users` synchronized with `auth.users`.

The following SQL scripts facilitate this synchronization. They should be run in your Supabase project's SQL Editor.

### 1. Create User Sync Function

This function (`handle_new_user`) is responsible for inserting a new record into `public.users` whenever a new user signs up and a record is added to `auth.users`.

- **File**: `sync_auth_user_to_public_users_function.sql`
- **Action**: Run the content of this file in the Supabase SQL Editor once.

### 2. Create User Sync Trigger

This trigger (`on_auth_user_created`) automatically executes the `handle_new_user` function after every new user insertion in `auth.users`.

- **File**: `sync_auth_user_to_public_users_trigger.sql`
- **Action**: Run the content of this file in the Supabase SQL Editor once, *after* successfully creating the `handle_new_user` function.

### 3. Backfill Existing Users (One-time or as needed)

If `public.users` is currently empty or missing users that already exist in `auth.users`, this script will populate `public.users` with those existing records.

- **File**: `backfill_public_users_from_auth_users.sql`
- **Action**: Run the content of this file in the Supabase SQL Editor after setting up the function and trigger. This is primarily a one-time setup for existing data but can be re-run if necessary (it's designed to only insert missing users).

**Important Notes:**

- **Order of Execution**: It's crucial to run these scripts in the order specified (Function -> Trigger -> Backfill).
- **Customization**: The SQL scripts assume a `public.users` table with at least `id`, `email`, and `created_at` columns. If your table structure is different, or you wish to sync more/different fields from `auth.users`, you'll need to modify the `INSERT` statements within `sync_auth_user_to_public_users_function.sql` and `backfill_public_users_from_auth_users.sql` accordingly.
- **Deployment**: The function and trigger are database objects that, once created, persist and work automatically. The SQL files in this directory are for your reference, version control, and for initial setup or if you need to recreate these database objects.
