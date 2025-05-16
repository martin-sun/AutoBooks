# Get Sidebar Menu Edge Function

This Edge Function retrieves the sidebar menu for a specific workspace based on its type (Personal or Business).

## Functionality

- Retrieves the sidebar menu structure for a given workspace ID
- Builds a hierarchical menu tree from flat menu items
- Supports workspace-specific menu customizations
- Returns the menu in a format ready to be consumed by the frontend

## Deployment

To deploy this Edge Function to your Supabase project:

1. Make sure you have the Supabase CLI installed
2. Navigate to the root of the project
3. Run the following command:

```bash
supabase functions deploy get-sidebar-menu --project-ref your-project-ref
```

## Usage

The function expects a `workspace_id` query parameter and an `Authorization` header with a valid JWT token.

Example request:

```typescript
const response = await fetch(
  `${supabaseUrl}/functions/v1/get-sidebar-menu?workspace_id=${workspaceId}`,
  {
    headers: {
      Authorization: `Bearer ${session.access_token}`
    }
  }
);

const data = await response.json();
// data.menu contains the menu tree
// data.workspace_type contains the workspace type ('personal' or 'business')
```

## Response Format

The function returns a JSON object with the following structure:

```json
{
  "workspace_type": "personal", // or "business"
  "menu": [
    {
      "id": "uuid",
      "name": "Dashboard",
      "icon": "LayoutDashboard",
      "route": "/dashboard",
      "children": []
    },
    {
      "id": "uuid",
      "name": "Transactions",
      "icon": "Receipt",
      "route": "/dashboard/transactions",
      "children": [
        {
          "id": "uuid",
          "name": "All Transactions",
          "icon": "List",
          "route": "/dashboard/transactions/all",
          "children": []
        },
        // More child menu items...
      ]
    },
    // More top-level menu items...
  ]
}
```
