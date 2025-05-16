// Asset Management API
// Created: 2025-05-11

import { supabase } from '../supabase-client';

// 使用 Supabase 客户端直接查询数据库，避免使用 Edge Functions

// Define types for asset management
export interface AssetCategory {
  id: string;
  name: string;
  type: 'personal' | 'business' | 'both';
  parent_id: string | null;
  system_defined: boolean;
  children?: AssetCategory[];
}

export interface Asset {
  id?: string;
  workspace_id: string;
  category_id: string;
  account_id: string;
  name: string;
  description?: string;
  purchase_date?: string;
  purchase_value?: number;
  current_value?: number;
  depreciation_method?: 'straight_line' | 'reducing_balance' | 'none' | null;
  depreciation_rate?: number;
  depreciation_period?: number;
  currency?: string;
  category?: AssetCategory;
  account?: { id: string; name: string };
  transactions?: AssetTransaction[];
  created_at?: string;
  updated_at?: string;
  is_deleted?: boolean;
}

export interface AssetTransaction {
  id?: string;
  asset_id: string;
  transaction_id?: string;
  type: 'purchase' | 'sale' | 'depreciation' | 'revaluation';
  amount: number;
  transaction_date: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  is_deleted?: boolean;
}

// Function to fetch asset categories for a workspace
export async function fetchAssetCategories(workspaceIdOrType: string): Promise<AssetCategory[]> {
  try {
    console.log(`Fetching asset categories for: ${workspaceIdOrType}`);
    
    // 使用共享的Supabase客户端实例
    
    // 确定工作空间类型
    let workspaceType: string;
    
    // 检查是否是工作空间类型而不是UUID
    if (['personal', 'business', 'both'].includes(workspaceIdOrType)) {
      // 直接使用提供的工作空间类型
      workspaceType = workspaceIdOrType;
      console.log(`Using provided workspace type: ${workspaceType}`);
    } else {
      // 假设是工作空间ID，尝试获取工作空间信息
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .select('id, type')
        .eq('id', workspaceIdOrType)
        .single();
      
      if (workspaceError || !workspace) {
        console.error('Error fetching workspace:', workspaceError);
        throw new Error(workspaceError?.message || 'Workspace not found');
      }
      
      workspaceType = workspace.type;
      console.log(`Fetching categories for ${workspaceType} workspace: ${workspaceIdOrType}`);
    }
    
    // 获取所有资产类别
    const { data: allCategories, error: categoriesError } = await supabase
      .from('asset_categories')
      .select('*')
      .eq('is_deleted', false)
      .order('name');
    
    if (categoriesError || !allCategories) {
      console.error('Error fetching asset categories:', categoriesError);
      throw new Error(categoriesError?.message || 'Failed to fetch asset categories');
    }
    
    // 根据工作空间类型过滤类别
    const filteredCategories = allCategories.filter(category => 
      category.type === 'both' || category.type === workspaceType
    );
    
    // 组织类别为层级结构
    const topLevelCategories = filteredCategories.filter(cat => !cat.parent_id);
    const childCategories = filteredCategories.filter(cat => cat.parent_id);
    
    // 构建层级结构
    const result = topLevelCategories.map(parent => {
      return {
        ...parent,
        children: childCategories
          .filter(child => child.parent_id === parent.id)
          .map(child => ({
            ...child,
            children: []
          }))
      };
    });
    
    console.log(`Successfully fetched ${result.length} top-level categories for ${workspaceType} workspace`);
    return result;
  } catch (error) {
    console.error('Error fetching asset categories:', error);
    throw error;
  }
}

// Function to fetch assets for a workspace
export async function fetchAssets(workspaceId: string): Promise<Asset[]> {
  try {
    console.log(`Fetching assets for workspace ID: ${workspaceId}`);
    
    // 使用共享的Supabase客户端实例
    
    // 直接查询当前工作空间的资产
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select(`
        *,
        category:asset_categories(id, name, type, parent_id, system_defined),
        account:accounts(id, name)
      `)
      .eq('workspace_id', workspaceId)
      .eq('is_deleted', false)
      .order('name');
    
    if (assetsError || !assets) {
      console.error('Error fetching assets:', assetsError);
      throw new Error(assetsError?.message || 'Failed to fetch assets');
    }
    
    console.log(`Successfully fetched ${assets.length} assets for workspace ${workspaceId}`);
    return assets;
  } catch (error) {
    console.error('Error fetching assets:', error);
    throw error;
  }
}

// Function to fetch a single asset by ID
export async function fetchAsset(assetId: string): Promise<Asset> {
  try {
    console.log(`Fetching asset with ID: ${assetId}`);
    
    // 使用共享的Supabase客户端实例
    
    // 查询单个资产及其相关信息
    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .select(`
        *,
        category:asset_categories(id, name, type, parent_id, system_defined),
        account:accounts(id, name),
        transactions:asset_transactions(*)
      `)
      .eq('id', assetId)
      .eq('is_deleted', false)
      .single();
    
    if (assetError || !asset) {
      console.error('Error fetching asset:', assetError);
      throw new Error(assetError?.message || `Asset with ID ${assetId} not found`);
    }
    
    console.log('Successfully fetched asset:', asset.name);
    
    return asset;
  } catch (error) {
    console.error('Error fetching asset:', error);
    throw error;
  }
}

// Function to create a new asset
export async function createAsset(asset: Asset): Promise<Asset> {
  try {
    // 使用模拟数据而不是实际的 API 调用
    console.log('Creating mock asset:', asset);
    
    // 模拟创建资产的过程
    // 生成一个新的 UUID 作为 ID
    const createdAsset: Asset = {
      ...asset,
      id: `new-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Created mock asset:', createdAsset);
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return createdAsset;
  } catch (error) {
    console.error('Error creating asset:', error);
    throw error;
  }
}

// Function to update an existing asset
export async function updateAsset(asset: Asset): Promise<Asset> {
  try {
    // 使用模拟数据而不是实际的 API 调用
    console.log('Updating mock asset:', asset);
    
    if (!asset.id) {
      throw new Error('Asset ID is required for update');
    }
    
    // 模拟更新资产的过程
    const updatedAsset: Asset = {
      ...asset,
      updated_at: new Date().toISOString()
    };
    
    console.log('Updated mock asset:', updatedAsset);
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return updatedAsset;
  } catch (error) {
    console.error('Error updating asset:', error);
    throw error;
  }
}

// Function to delete an asset
export async function deleteAsset(assetId: string): Promise<{ success: boolean; id: string }> {
  try {
    // 使用模拟数据而不是实际的 API 调用
    console.log(`Deleting mock asset with ID ${assetId}`);
    
    // 模拟删除资产的过程
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true, id: assetId };
  } catch (error) {
    console.error('Error deleting asset:', error);
    throw error;
  }
}

// Function to add a transaction to an asset
export async function addAssetTransaction(transaction: AssetTransaction): Promise<AssetTransaction> {
  try {
    // 使用模拟数据而不是实际的 API 调用
    console.log('Adding mock asset transaction:', transaction);
    
    // 模拟创建资产交易的过程
    const createdTransaction: AssetTransaction = {
      ...transaction,
      id: `tx-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Created mock asset transaction:', createdTransaction);
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return createdTransaction;
  } catch (error) {
    console.error('Error adding asset transaction:', error);
    throw error;
  }
}
