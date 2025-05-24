// Plaid 集成 API 客户端
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

// 初始化 Supabase 客户端
const supabase = createClientComponentClient<Database>();

/**
 * 获取 Plaid Link Token
 * @param workspaceId 工作空间ID
 * @returns Link Token
 */
export async function getPlaidLinkToken(workspaceId: string): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('plaid-link-token', {
      body: { workspace_id: workspaceId },
    });

    if (error) throw new Error(error.message);
    if (!data || !data.link_token) throw new Error('Failed to get link token');

    return data.link_token;
  } catch (error) {
    console.error('Error getting Plaid link token:', error);
    throw error;
  }
}

/**
 * 交换 Plaid 公共令牌获取访问令牌并创建银行连接
 * @param publicToken Plaid 公共令牌
 * @param workspaceId 工作空间ID
 * @param metadata Plaid Link 元数据
 * @returns 银行连接信息
 */
export async function exchangePlaidToken(
  publicToken: string,
  workspaceId: string,
  metadata: any
): Promise<{
  connection_id: string;
  institution_name: string;
  linked_accounts: Array<{
    id: string;
    name: string;
    type: string;
    subtype: string;
    mask: string;
  }>;
}> {
  try {
    const { data, error } = await supabase.functions.invoke('plaid-exchange-token', {
      body: {
        public_token: publicToken,
        workspace_id: workspaceId,
        metadata
      },
    });

    if (error) throw new Error(error.message);
    if (!data || !data.success) throw new Error('Failed to exchange token');

    return {
      connection_id: data.connection_id,
      institution_name: data.institution_name,
      linked_accounts: data.linked_accounts
    };
  } catch (error) {
    console.error('Error exchanging Plaid token:', error);
    throw error;
  }
}

/**
 * 同步银行交易
 * @param connectionId 银行连接ID
 * @returns 同步结果
 */
export async function syncBankTransactions(connectionId: string): Promise<{
  success: boolean;
  results: {
    total: number;
    imported: number;
    updated: number;
    accounts: Record<string, { imported: number; updated: number }>;
  };
}> {
  try {
    const { data, error } = await supabase.functions.invoke('plaid-sync-transactions', {
      body: { connection_id: connectionId },
    });

    if (error) throw new Error(error.message);
    if (!data || !data.success) throw new Error('Failed to sync transactions');

    return data;
  } catch (error) {
    console.error('Error syncing bank transactions:', error);
    throw error;
  }
}

/**
 * 获取银行连接列表
 * @param workspaceId 工作空间ID
 * @returns 银行连接列表
 */
export async function getBankConnections(workspaceId: string) {
  try {
    const { data, error } = await supabase.rpc('get_bank_connections', {
      workspace_id_param: workspaceId
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting bank connections:', error);
    throw error;
  }
}

/**
 * 获取银行账户链接
 * @param connectionId 银行连接ID
 * @returns 银行账户链接列表
 */
export async function getBankAccountLinks(connectionId: string) {
  try {
    const { data, error } = await supabase.rpc('get_bank_account_links', {
      connection_id_param: connectionId
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting bank account links:', error);
    throw error;
  }
}

/**
 * 获取未匹配的银行交易
 * @param workspaceId 工作空间ID
 * @param limit 限制数量
 * @param offset 偏移量
 * @returns 未匹配的银行交易
 */
export async function getUnmatchedBankTransactions(
  workspaceId: string,
  limit = 50,
  offset = 0
) {
  try {
    const { data, error } = await supabase.rpc('get_unmatched_bank_transactions', {
      workspace_id_param: workspaceId,
      limit_param: limit,
      offset_param: offset
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting unmatched bank transactions:', error);
    throw error;
  }
}

/**
 * 匹配银行交易到会计交易
 * @param bankTransactionId 银行交易ID
 * @param targetAccountId 目标账户ID
 * @param description 交易描述
 * @returns 创建的会计交易ID
 */
export async function matchBankTransaction(
  bankTransactionId: string,
  targetAccountId: string,
  description?: string
) {
  try {
    const { data, error } = await supabase.rpc('match_bank_transaction', {
      bank_transaction_id_param: bankTransactionId,
      target_account_id_param: targetAccountId,
      description_param: description
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error matching bank transaction:', error);
    throw error;
  }
}

/**
 * 删除银行连接
 * @param connectionId 银行连接ID
 * @returns 是否成功
 */
export async function deleteBankConnection(connectionId: string) {
  try {
    const { data, error } = await supabase.rpc('delete_bank_connection', {
      connection_id_param: connectionId
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deleting bank connection:', error);
    throw error;
  }
}
