// Plaid Webhook 处理函数
// 用于接收 Plaid 的实时通知

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

// 验证 webhook 请求
async function verifyWebhook(req: Request): Promise<boolean> {
  // 在生产环境中，应该验证 Plaid 的 webhook 签名
  // 详见：https://plaid.com/docs/api/webhooks/webhook-verification/
  
  // 简化版本，仅检查基本参数
  try {
    const body = await req.json();
    return body && body.webhook_type && body.webhook_code && body.item_id;
  } catch (error) {
    return false;
  }
}

serve(async (req) => {
  // 验证 webhook 请求
  if (!await verifyWebhook(req)) {
    return new Response(
      JSON.stringify({ error: 'Invalid webhook request' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.json();
    const { webhook_type, webhook_code, item_id } = body;
    
    console.log(`Received webhook: ${webhook_type} - ${webhook_code} for item ${item_id}`);
    
    // 获取银行连接信息
    const { data: connection, error: connectionError } = await supabase
      .from('bank_connections')
      .select('id, plaid_access_token, workspace_id')
      .eq('plaid_item_id', item_id)
      .eq('is_deleted', false)
      .single();
    
    if (connectionError || !connection) {
      console.error(`Bank connection not found for item ${item_id}`);
      return new Response(
        JSON.stringify({ received: true, status: 'connection_not_found' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // 处理不同类型的 webhook
    switch (webhook_type) {
      case 'TRANSACTIONS':
        await handleTransactionsWebhook(webhook_code, connection, body);
        break;
      
      case 'ITEM':
        await handleItemWebhook(webhook_code, connection, body);
        break;
      
      default:
        console.log(`Unhandled webhook type: ${webhook_type}`);
    }
    
    return new Response(
      JSON.stringify({ received: true, status: 'success' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ received: true, status: 'error', message: error.message }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

// 处理交易相关的 webhook
async function handleTransactionsWebhook(
  webhookCode: string,
  connection: any,
  body: any
) {
  const connectionId = connection.id;
  const accessToken = connection.plaid_access_token;
  const workspaceId = connection.workspace_id;
  
  switch (webhookCode) {
    case 'INITIAL_UPDATE':
    case 'HISTORICAL_UPDATE':
    case 'DEFAULT_UPDATE':
      // 同步最新交易
      await syncTransactions(connectionId, accessToken, workspaceId);
      break;
    
    case 'TRANSACTIONS_REMOVED':
      // 处理已删除的交易
      if (body.removed_transactions && body.removed_transactions.length > 0) {
        await handleRemovedTransactions(connectionId, body.removed_transactions);
      }
      break;
    
    default:
      console.log(`Unhandled transactions webhook code: ${webhookCode}`);
  }
}

// 处理项目相关的 webhook
async function handleItemWebhook(
  webhookCode: string,
  connection: any,
  body: any
) {
  const connectionId = connection.id;
  
  switch (webhookCode) {
    case 'ERROR':
      // 更新连接状态为错误
      await supabase.rpc(
        'update_bank_connection_status',
        {
          connection_id_param: connectionId,
          status_param: 'error',
          error_param: body.error?.message || 'Unknown error'
        }
      );
      break;
    
    case 'PENDING_EXPIRATION':
      // 标记连接即将过期
      await supabase.rpc(
        'update_bank_connection_status',
        {
          connection_id_param: connectionId,
          status_param: 'pending_expiration',
          error_param: 'Access token is pending expiration'
        }
      );
      break;
    
    case 'USER_PERMISSION_REVOKED':
      // 用户撤销了权限
      await supabase.rpc(
        'update_bank_connection_status',
        {
          connection_id_param: connectionId,
          status_param: 'revoked',
          error_param: 'User permission revoked'
        }
      );
      break;
    
    default:
      console.log(`Unhandled item webhook code: ${webhookCode}`);
  }
}

// 同步交易
async function syncTransactions(
  connectionId: string,
  accessToken: string,
  workspaceId: string
) {
  try {
    // 获取银行账户链接
    const { data: accountLinks, error: accountLinksError } = await supabase
      .from('bank_account_links')
      .select('id, plaid_account_id, account_id')
      .eq('connection_id', connectionId)
      .eq('is_deleted', false);

    if (accountLinksError || !accountLinks || accountLinks.length === 0) {
      throw new Error('No linked accounts found');
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
    let imported = 0;
    let updated = 0;

    // 处理交易数据
    for (const transaction of transactions) {
      // 找到对应的账户链接
      const accountLink = accountLinks.find(link => link.plaid_account_id === transaction.account_id);
      if (!accountLink) continue;

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
      const { error: transactionError } = await supabase.rpc(
        'import_bank_transaction',
        transactionData
      );

      if (transactionError) {
        console.error(`Error importing transaction ${transaction.transaction_id}:`, transactionError);
        continue;
      }

      // 更新统计数据
      if (existingTransaction && existingTransaction.length > 0) {
        updated++;
      } else {
        imported++;
      }
    }

    // 更新银行连接的最后同步时间
    await supabase.rpc(
      'update_bank_connection_status',
      {
        connection_id_param: connectionId,
        status_param: 'active',
        error_param: null
      }
    );

    console.log(`Synced ${imported} new and ${updated} updated transactions for connection ${connectionId}`);
  } catch (error) {
    console.error(`Error syncing transactions for connection ${connectionId}:`, error);
    
    // 更新连接状态为错误
    await supabase.rpc(
      'update_bank_connection_status',
      {
        connection_id_param: connectionId,
        status_param: 'error',
        error_param: error.message || 'Unknown error'
      }
    );
  }
}

// 处理已删除的交易
async function handleRemovedTransactions(
  connectionId: string,
  removedTransactionIds: string[]
) {
  try {
    // 获取银行账户链接
    const { data: accountLinks, error: accountLinksError } = await supabase
      .from('bank_account_links')
      .select('id')
      .eq('connection_id', connectionId)
      .eq('is_deleted', false);

    if (accountLinksError || !accountLinks || accountLinks.length === 0) {
      throw new Error('No linked accounts found');
    }

    const accountLinkIds = accountLinks.map(link => link.id);

    // 标记已删除的交易
    const { error: updateError } = await supabase
      .from('bank_transactions')
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .in('account_link_id', accountLinkIds)
      .in('plaid_transaction_id', removedTransactionIds);

    if (updateError) {
      throw new Error(`Error marking transactions as deleted: ${updateError.message}`);
    }

    console.log(`Marked ${removedTransactionIds.length} transactions as deleted for connection ${connectionId}`);
  } catch (error) {
    console.error(`Error handling removed transactions for connection ${connectionId}:`, error);
  }
}
