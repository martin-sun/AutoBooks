# Supabase Hooks Configuration

This directory contains hook functions and triggers that need to be manually configured in the Supabase Dashboard.

## Auto-Create Workspace Hook

Automatically creates a default personal workspace for new users upon registration.

### Configuration Steps

1. Log in to the Supabase Dashboard
2. Select the AutoBooks project
3. Navigate to the SQL Editor
4. Execute the SQL code in the `auto_create_workspace.sql` file
5. Navigate to Authentication > Hooks
6. Click "Add new hook"
7. Select event type: "After a user is created"
8. Select function: "public.handle_new_user"
9. Save the settings

### Functionality

This hook implements the following features:
- Automatically creates a user record in the `public.users` table when a new user registers
- Checks if the user already has a workspace
- If not, creates a default "Personal workspace"
- The frontend code automatically queries the user's workspace and redirects to the appropriate dashboard page

### Important Notes

- This hook requires manual configuration because Supabase's auth schema is protected and cannot be directly modified through regular migration files
- If you modify the hook function logic, you need to re-execute it in the SQL Editor and update the hook configuration
