# Create Workspace Edge Function

This Edge Function automatically creates a default personal workspace for users who don't have one yet.

## Overview

Instead of using database triggers or authentication hooks, this Edge Function provides a more flexible approach to workspace creation. The frontend will call this function when it detects that a user has logged in but doesn't have a workspace.

## Deployment

To deploy this Edge Function to your Supabase project:

```bash
# Navigate to the project root
cd /path/to/AutoBooks

# Deploy the function using Supabase CLI
supabase functions deploy create-workspace --project-ref your-project-ref
```

## How It Works

1. When a user logs in, the frontend checks if they have any workspaces
2. If no workspace is found, the frontend calls this Edge Function
3. The function verifies the user's JWT token
4. It checks again if a workspace exists (to handle race conditions)
5. If no workspace exists, it creates a new personal workspace
6. It returns the workspace ID to the frontend, which then redirects to that workspace

## Environment Variables

This function requires the following environment variables:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for admin operations)
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key

You can set these using the Supabase CLI:

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key --project-ref your-project-ref
```

## Security Considerations

This function uses the service role key to create resources, but it first validates the user's JWT token to ensure they're authenticated. The service role key is never exposed to the client.

## Testing

You can test this function locally using the Supabase CLI:

```bash
supabase functions serve create-workspace --env-file .env.local
```

Then make a request with a valid JWT token:

```bash
curl -i --request POST 'http://localhost:54321/functions/v1/create-workspace' \
  --header 'Authorization: Bearer YOUR_JWT_TOKEN'
```
