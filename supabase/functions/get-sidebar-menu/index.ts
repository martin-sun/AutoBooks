import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// This function retrieves the sidebar menu for a specific workspace
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
        'Access-Control-Max-Age': '86400'
      }
    });
  }
  
  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Authorization, Content-Type',
            'Access-Control-Allow-Methods': 'GET, OPTIONS'
          } 
        }
      );
    }

    // Get the workspace_id from the query string
    const url = new URL(req.url);
    const workspaceId = url.searchParams.get('workspace_id');
    if (!workspaceId) {
      return new Response(
        JSON.stringify({ error: 'Missing workspace_id parameter' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          } 
        }
      );
    }

    // Create Supabase clients
    const supabaseUrl = Deno.env.get('PROJECT_URL') ?? 'https://nvzbsstwyavjultjtcuv.supabase.co';
    const supabaseServiceKey = Deno.env.get('SERVICE_ROLE_KEY') ?? '';
    const anonKey = Deno.env.get('ANON_KEY') ?? '';
    
    if (supabaseServiceKey.length === 0) {
      console.error('SERVICE_ROLE_KEY is empty. This will cause an error.');
      return new Response(
        JSON.stringify({ error: 'Server configuration error: SERVICE_ROLE_KEY is missing.' }),
        { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseClient = createClient(
      supabaseUrl,
      anonKey,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // Get the user from the JWT
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token or user not found' }),
        { 
          status: 401, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          } 
        }
      );
    }

    // Get the workspace details to determine its type
    const { data: workspace, error: workspaceError } = await supabaseAdmin
      .from('workspaces')
      .select('id, type')
      .eq('id', workspaceId)
      .single();

    if (workspaceError || !workspace) {
      return new Response(
        JSON.stringify({ error: 'Workspace not found or access denied' }),
        { 
          status: 404, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          } 
        }
      );
    }

    // Check if this workspace belongs to the user
    const { data: userWorkspace, error: userWorkspaceError } = await supabaseAdmin
      .from('workspaces')
      .select('id')
      .eq('id', workspaceId)
      .eq('user_id', user.id)
      .single();

    if (userWorkspaceError || !userWorkspace) {
      return new Response(
        JSON.stringify({ error: 'You do not have access to this workspace' }),
        { 
          status: 403, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          } 
        }
      );
    }

    // Get the workspace's menu configuration
    const { data: menuConfig, error: menuConfigError } = await supabaseAdmin
      .from('workspace_menu_configs')
      .select('template_id, customizations')
      .eq('workspace_id', workspaceId)
      .single();

    if (menuConfigError) {
      // If no menu config exists, create one based on workspace type
      const { data: template, error: templateError } = await supabaseAdmin
        .from('sidebar_templates')
        .select('id')
        .eq('workspace_type', workspace.type)
        .single();

      if (templateError) {
        return new Response(
          JSON.stringify({ error: 'No menu template found for this workspace type' }),
          { 
            status: 500, 
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            } 
          }
        );
      }

      // Create a new menu config for this workspace
      const { error: createConfigError } = await supabaseAdmin
        .from('workspace_menu_configs')
        .insert([
          {
            workspace_id: workspaceId,
            template_id: template.id,
            customizations: {}
          }
        ]);

      if (createConfigError) {
        return new Response(
          JSON.stringify({ error: 'Failed to create menu configuration' }),
          { 
            status: 500, 
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            } 
          }
        );
      }

      // Use the template ID we just found
      var templateId = template.id;
      var customizations = {};
    } else {
      // Use the existing menu configuration
      var templateId = menuConfig.template_id;
      var customizations = menuConfig.customizations || {};
    }

    // Get all menu items for this template
    const { data: menuItems, error: menuItemsError } = await supabaseAdmin
      .from('sidebar_menu_items')
      .select('*')
      .eq('template_id', templateId)
      .eq('is_active', true)
      .order('position', { ascending: true });

    if (menuItemsError) {
      return new Response(
        JSON.stringify({ error: 'Failed to retrieve menu items' }),
        { 
          status: 500, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          } 
        }
      );
    }

    // Build the menu tree
    const menuTree = buildMenuTree(menuItems);

    // Apply any customizations from the workspace config
    applyCustomizations(menuTree, customizations);
    
    // Replace :workspace_id placeholders in routes with the actual workspace ID
    const processedMenu = replaceWorkspaceIdInRoutes(menuTree, workspaceId);

    return new Response(
      JSON.stringify({ 
        workspace_type: workspace.type,
        menu: processedMenu
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      }
    );
  }
});

// Helper function to build a menu tree from flat menu items
function buildMenuTree(items) {
  // First, create a map of all items by their ID
  const itemMap = {};
  items.forEach(item => {
    itemMap[item.id] = {
      id: item.id,
      name: item.name,
      icon: item.icon,
      route: item.route,
      children: []
    };
  });

  // Then, build the tree structure
  const rootItems = [];
  items.forEach(item => {
    // If the item has a parent, add it to the parent's children
    if (item.parent_id && itemMap[item.parent_id]) {
      itemMap[item.parent_id].children.push(itemMap[item.id]);
    } 
    // Otherwise, it's a root item
    else if (!item.parent_id) {
      rootItems.push(itemMap[item.id]);
    }
  });

  return rootItems;
}

// Helper function to apply customizations to the menu tree
function applyCustomizations(menuTree, customizations) {
  // This function would apply any workspace-specific customizations to the menu
  // For now, we'll just return the menu as is
  return menuTree;
}

// Helper function to replace :workspace_id placeholders in routes with the actual workspace ID
function replaceWorkspaceIdInRoutes(menuItems, workspaceId) {
  return menuItems.map(item => {
    const newItem = { ...item };
    
    // Replace :workspace_id in the route with the actual workspace ID
    if (newItem.route) {
      newItem.route = newItem.route.replace(':workspace_id', workspaceId);
    }
    
    // Recursively process children
    if (newItem.children && newItem.children.length > 0) {
      newItem.children = replaceWorkspaceIdInRoutes(newItem.children, workspaceId);
    }
    
    return newItem;
  });
}
