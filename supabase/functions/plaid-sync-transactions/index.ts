// Plaid 交易同步函数
// 用于同步银行交易数据

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

    // 从请求体中获取连接ID
    const { connection_id } = await req.json();
    if (!connection_id) {
      return new Response(
        JSON.stringify({ error: 'Missing connection_id' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 获取银行连接信息
    const { data: connection, error: connectionError } = await supabase
      .from('bank_connections')
      .select(`
        id, 
        workspace_id, 
        plaid_access_token, 
        institution_name, 
        last_synced_at,
        workspaces!inner(user_id)
      `)
      .eq('id', connection_id)
      .eq('is_deleted', false)
      .single();

    if (connectionError || !connection) {
      return new Response(
        JSON.stringify({ error: 'Bank connection not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 验证用户是否有权访问该连接
    if (connection.workspaces.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const accessToken = connection.plaid_access_token;
    const workspaceId = connection.workspace_id;

    // 获取银行账户链接
    const { data: accountLinks, error: accountLinksError } = await supabase
      .from('bank_account_links')
      .select('id, plaid_account_id, account_id')
      .eq('connection_id', connection_id)
      .eq('is_deleted', false);

    if (accountLinksError) {
      throw new Error(`Error getting account links: ${accountLinksError.message}`);
    }

    // 如果没有链接的账户，返回错误
    if (!accountLinks || accountLinks.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No linked accounts found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 计算同步起始日期（默认为30天前）
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const startDateStr = startDate.toISOString().split('T')[0];

    // 计算结束日期（今天）
    const endDate = new Date();
    const endDateStr = endDate.toISOString().split('T')[0];

    // 获取交易数据
    const transactionsResponse = await plaidClient.transactionsGet({
      access_token: accessToken,
      start_date: startDateStr,
      end_date: endDateStr,
      options: {
        include_personal_finance_category: true
      }
    });

    const transactions = transactionsResponse.data.transactions;
    
    // 处理交易数据
    const results = {
      total: transactions.length,
      imported: 0,
      updated: 0,
      accounts: {} as Record<string, { imported: number, updated: number }>
    };

    for (const transaction of transactions) {
      // 找到对应的账户链接
      const accountLink = accountLinks.find(link => link.plaid_account_id === transaction.account_id);
      if (!accountLink) continue;

      // 初始化账户统计
      if (!results.accounts[accountLink.account_id]) {
        results.accounts[accountLink.account_id] = { imported: 0, updated: 0 };
      }

      // 准备交易数据
      const transactionData = {
        account_link_id_param: accountLink.id,
        plaid_transaction_id_param: transaction.transaction_id,
        amount_param: transaction.amount,
        date_param: transaction.date,
        name_param: transaction.name,
        merchant_name_param: transaction.merchant_name || null,
        pending_param: transaction.pending || false,
        category_id_param: transaction.category_id || null,
        category_param: transaction.category || null,
        location_param: transaction.location ? JSON.stringify(transaction.location) : null,
        payment_meta_param: transaction.payment_meta ? JSON.stringify(transaction.payment_meta) : null
      };

      // 检查交易是否已存在
      const { data: existingTransaction } = await supabase
        .from('bank_transactions')
        .select('id')
        .eq('account_link_id', accountLink.id)
        .eq('plaid_transaction_id', transaction.transaction_id)
        .limit(1);

      // 导入或更新交易
      const { data: transactionId, error: transactionError } = await supabase.rpc(
        'import_bank_transaction',
        transactionData
      );

      if (transactionError) {
        console.error(`Error importing transaction ${transaction.transaction_id}:`, transactionError);
        continue;
      }

      // 更新统计数据
      if (existingTransaction && existingTransaction.length > 0) {
        results.updated++;
        results.accounts[accountLink.account_id].updated++;
      } else {
        results.imported++;
        results.accounts[accountLink.account_id].imported++;
      }
    }

    // 更新银行连接的最后同步时间
    await supabase.rpc(
      'update_bank_connection_status',
      {
        connection_id_param: connection_id,
        status_param: 'active',
        error_param: null
      }
    );

    return new Response(
      JSON.stringify({
        success: true,
        connection_id,
        institution_name: connection.institution_name,
        results
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error syncing transactions:', error);
    
    // 如果是特定的连接ID错误，更新连接状态
    try {
      const { connection_id } = await req.json();
      if (connection_id) {
        await supabase.rpc(
          'update_bank_connection_status',
          {
            connection_id_param: connection_id,
            status_param: 'error',
            error_param: error.message || 'Unknown error'
          }
        );
      }
    } catch (e) {
      // 忽略错误
    }
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
