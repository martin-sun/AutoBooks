import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// This function handles the creation of a workspace for a user if one doesn't exist
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*', // TODO: 在生产环境中替换为特定域名，例如 'https://your-production-domain.com'
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
            'Access-Control-Allow-Origin': '*', // TODO: 在生产环境中替换为特定域名
            'Access-Control-Allow-Headers': 'Authorization, Content-Type',
            'Access-Control-Allow-Methods': 'POST, OPTIONS'
          } 
        }
      );
    }

    // Create a Supabase client with the service role key (for admin privileges)
    // Using PROJECT_URL and SERVICE_ROLE_KEY instead of SUPABASE_ prefixed names to avoid CLI restrictions
    const supabaseUrl = Deno.env.get('PROJECT_URL') ?? 'https://nvzbsstwyavjultjtcuv.supabase.co';
    const supabaseServiceKey = Deno.env.get('SERVICE_ROLE_KEY') ?? '';
    
    // 新增的日志记录
    console.log(`Attempting to initialize Supabase clients.`);
    console.log(`PROJECT_URL: ${supabaseUrl}`);
    console.log(`SERVICE_ROLE_KEY length: ${supabaseServiceKey.length}`);
    const anonKey = Deno.env.get('ANON_KEY') ?? '';
    console.log(`ANON_KEY length: ${anonKey.length}`);

    if (supabaseServiceKey.length === 0) {
      console.error('SERVICE_ROLE_KEY is empty. This will cause an error.');
      // 可以在这里提前返回错误，而不是等待 Supabase client 抛出错误
      return new Response(
        JSON.stringify({ error: 'Server configuration error: SERVICE_ROLE_KEY is missing.' }),
        { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }
    if (anonKey.length === 0) {
      console.warn('ANON_KEY is empty. This might cause issues for user-specific operations if not intended.');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Create a client with the user's JWT
    const supabaseClient = createClient(
      supabaseUrl,
      anonKey, // 使用上面获取的 anonKey
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
            'Access-Control-Allow-Origin': '*', // TODO: 在生产环境中替换为特定域名
            'Access-Control-Allow-Headers': 'Authorization, Content-Type',
            'Access-Control-Allow-Methods': 'POST, OPTIONS'
          } 
        }
      );
    }

    // Check if the user already has a workspace
    const { data: existingWorkspaces, error: wsError } = await supabaseAdmin
      .from('workspaces')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1);

    // If workspace exists, return it
    if (existingWorkspaces && existingWorkspaces.length > 0) {
      return new Response(
        JSON.stringify({ 
          message: 'Workspace already exists', 
          workspace_id: existingWorkspaces[0].id 
        }),
        { 
          status: 200, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*' // TODO: 在生产环境中替换为特定域名
          } 
        }
      );
    }

    // If no workspace exists, create a default personal workspace
    const { data: newWorkspace, error: createError } = await supabaseAdmin
      .from('workspaces')
      .insert([
        { 
          user_id: user.id, 
          name: 'Personal workspace', 
          type: 'personal', 
          currency: 'CAD' 
        }
      ])
      .select('id')
      .single();

    if (createError) {
      console.error('Error creating workspace:', createError);
      return new Response(
        JSON.stringify({ error: 'Failed to create workspace' }),
        { 
          status: 500, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*' // TODO: 在生产环境中替换为特定域名
          } 
        }
      );
    }

    // Log the action in audit_logs if the table exists
    try {
      await supabaseAdmin
        .from('audit_logs')
        .insert([
          {
            workspace_id: newWorkspace.id,
            user_id: user.id,
            table_name: 'workspaces',
            record_id: newWorkspace.id,
            action: 'auto_create',
            new_data: { reason: 'Edge function: New user login without workspace' }
          }
        ]);
    } catch (auditError) {
      // If audit_logs table doesn't exist or other error, just log and continue
      console.log('Audit log error (non-critical):', auditError);
    }

    return new Response(
      JSON.stringify({ 
        message: 'Workspace created successfully', 
        workspace_id: newWorkspace.id 
      }),
      { 
        status: 201, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*' // TODO: 在生产环境中替换为特定域名
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
          'Access-Control-Allow-Origin': '*' // TODO: 在生产环境中替换为特定域名
        } 
      }
    );
  }
});
