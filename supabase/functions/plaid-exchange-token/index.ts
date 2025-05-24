// Plaid Exchange Token 函数
// 用于交换公共令牌获取访问令牌，并创建银行连接

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Configuration, PlaidApi, PlaidEnvironments } from 'https://esm.sh/plaid@14.0.0';

// 初始化 Supabase 客户端
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 初始化 Plaid 客户端
const PLAID_CLIENT_ID = Deno.env.get('PLAID_CLIENT_ID') ?? '';
const PLAID_SECRET = Deno.env.get('PLAID_SECRET') ?? '';
const PLAID_ENV = Deno.env.get('PLAID_ENV') ?? 'sandbox';

const configuration = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
      'PLAID-SECRET': PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

serve(async (req) => {
  // 验证请求方法
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // 从请求中获取 Supabase 会话
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 从请求体中获取公共令牌和工作空间ID
    const { public_token, workspace_id, metadata } = await req.json();
    if (!public_token || !workspace_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 验证用户是否有权访问该工作空间
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', workspace_id)
      .eq('user_id', user.id)
      .single();

    if (workspaceError || !workspace) {
      return new Response(
        JSON.stringify({ error: 'Workspace not found or access denied' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 交换公共令牌获取访问令牌
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: public_token
    });

    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    // 获取机构信息
    const itemResponse = await plaidClient.itemGet({
      access_token: accessToken
    });

    const institutionId = itemResponse.data.item.institution_id || '';
    
    // 获取机构名称
    let institutionName = 'Unknown Institution';
    if (institutionId) {
      try {
        const institutionResponse = await plaidClient.institutionsGetById({
          institution_id: institutionId,
          country_codes: ['CA', 'US']
        });
        institutionName = institutionResponse.data.institution.name;
      } catch (error) {
        console.error('Error getting institution:', error);
      }
    }

    // 创建银行连接
    const { data: connectionData, error: connectionError } = await supabase.rpc(
      'create_bank_connection',
      {
        workspace_id_param: workspace_id,
        plaid_item_id_param: itemId,
        plaid_access_token_param: accessToken,
        institution_id_param: institutionId,
        institution_name_param: institutionName
      }
    );

    if (connectionError) {
      throw new Error(`Error creating bank connection: ${connectionError.message}`);
    }

    const connectionId = connectionData;

    // 获取账户信息
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken
    });

    const accounts = accountsResponse.data.accounts;
    const linkedAccounts = [];

    // 处理每个账户
    for (const account of accounts) {
      // 确定账户类型对应的会计科目
      let accountType = 'asset';
      if (account.type === 'credit' || account.type === 'loan') {
        accountType = 'liability';
      }
      
      // 获取对应类型的会计科目
      const { data: chartOfAccounts, error: coaError } = await supabase
        .from('chart_of_accounts')
        .select('id')
        .eq('workspace_id', workspace_id)
        .eq('type', accountType)
        .eq('is_payment', true)
        .order('name', { ascending: true })
        .limit(1);
      
      if (coaError || !chartOfAccounts || chartOfAccounts.length === 0) {
        console.error(`Error finding chart of accounts for type ${accountType}:`, coaError);
        continue;
      }
      
      const chartId = chartOfAccounts[0].id;
      
      // 创建银行账户并链接
      const { data: accountId, error: accountError } = await supabase.rpc(
        'link_bank_account',
        {
          connection_id_param: connectionId,
          plaid_account_id_param: account.account_id,
          account_name_param: account.name,
          official_name_param: account.official_name || account.name,
          account_type_param: account.type,
          account_subtype_param: account.subtype || null,
          mask_param: account.mask || null,
          chart_id_param: chartId,
          opening_balance_param: account.balances.current || 0,
          currency_param: account.balances.iso_currency_code || 'CAD'
        }
      );
      
      if (accountError) {
        console.error(`Error linking bank account ${account.account_id}:`, accountError);
        continue;
      }
      
      linkedAccounts.push({
        id: accountId,
        name: account.name,
        type: account.type,
        subtype: account.subtype,
        mask: account.mask
      });
    }

    // 触发初始交易同步
    // 这里可以调用另一个 Edge Function 或直接在这里实现
    // 为了简化，我们将在前端触发同步

    return new Response(
      JSON.stringify({
        success: true,
        connection_id: connectionId,
        institution_name: institutionName,
        linked_accounts: linkedAccounts
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error exchanging token:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
