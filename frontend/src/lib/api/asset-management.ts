// Asset Management API
// Created: 2025-05-11

// 模拟数据实现，避免使用 Edge Functions 和数据库查询

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
export async function fetchAssetCategories(workspaceId: string): Promise<AssetCategory[]> {
  try {
    // 模拟工作空间数据
    console.log(`Fetching mock workspace data for ID: ${workspaceId}`);
    
    // 根据工作空间 ID 的最后一个字符决定类型，仅作演示用途
    const workspaceType = workspaceId.endsWith('1') || workspaceId.endsWith('3') || workspaceId.endsWith('5') || workspaceId.endsWith('7') || workspaceId.endsWith('9') ? 'business' : 'personal';
    
    const workspace = {
      id: workspaceId,
      type: workspaceType
    };
    
    console.log(`Using workspace type: ${workspace.type} for workspace ID: ${workspaceId}`)
    
    console.log(`Returning mock asset categories for ${workspace.type} workspace: ${workspaceId}`);
    
    // 根据工作空间类型创建不同的模拟数据
    // 两种工作空间类型都可以使用的类别
    const bothCategories: AssetCategory[] = [
      {
        id: 'cat1',
        name: 'Computer Equipment',
        type: 'both',
        parent_id: null,
        system_defined: true,
        children: [
          {
            id: 'cat1-1',
            name: 'Laptops',
            type: 'both',
            parent_id: 'cat1',
            system_defined: true,
            children: []
          },
          {
            id: 'cat1-2',
            name: 'Desktops',
            type: 'both',
            parent_id: 'cat1',
            system_defined: true,
            children: []
          },
          {
            id: 'cat1-3',
            name: 'Monitors',
            type: 'both',
            parent_id: 'cat1',
            system_defined: true,
            children: []
          }
        ]
      },
      {
        id: 'cat2',
        name: 'Office Furniture',
        type: 'both',
        parent_id: null,
        system_defined: true,
        children: [
          {
            id: 'cat2-1',
            name: 'Desks',
            type: 'both',
            parent_id: 'cat2',
            system_defined: true,
            children: []
          },
          {
            id: 'cat2-2',
            name: 'Chairs',
            type: 'both',
            parent_id: 'cat2',
            system_defined: true,
            children: []
          }
        ]
      },
      {
        id: 'cat4',
        name: 'Software',
        type: 'both',
        parent_id: null,
        system_defined: true,
        children: []
      }
    ];
    
    // 仅商业工作空间可使用的类别
    const businessCategories: AssetCategory[] = [
      {
        id: 'cat3',
        name: 'Vehicles',
        type: 'business',
        parent_id: null,
        system_defined: true,
        children: [
          {
            id: 'cat3-1',
            name: 'Cars',
            type: 'business',
            parent_id: 'cat3',
            system_defined: true,
            children: []
          },
          {
            id: 'cat3-2',
            name: 'Trucks',
            type: 'business',
            parent_id: 'cat3',
            system_defined: true,
            children: []
          }
        ]
      },
      {
        id: 'cat7',
        name: 'Real Estate',
        type: 'business',
        parent_id: null,
        system_defined: true,
        children: []
      },
      {
        id: 'cat8',
        name: 'Manufacturing Equipment',
        type: 'business',
        parent_id: null,
        system_defined: true,
        children: []
      }
    ];
    
    // 仅个人工作空间可使用的类别
    const personalCategories: AssetCategory[] = [
      {
        id: 'cat5',
        name: 'Personal Electronics',
        type: 'personal',
        parent_id: null,
        system_defined: true,
        children: []
      },
      {
        id: 'cat6',
        name: 'Mobile Devices',
        type: 'personal',
        parent_id: null,
        system_defined: true,
        children: []
      },
      {
        id: 'cat9',
        name: 'Home Office',
        type: 'personal',
        parent_id: null,
        system_defined: true,
        children: []
      }
    ];
    
    // 根据工作空间类型返回不同的类别
    if (workspace.type === 'business') {
      console.log(`Returning categories for business workspace: ${bothCategories.length + businessCategories.length}`);
      return [...bothCategories, ...businessCategories];
    } else {
      console.log(`Returning categories for personal workspace: ${bothCategories.length + personalCategories.length}`);
      return [...bothCategories, ...personalCategories];
    }
  } catch (error) {
    console.error('Error fetching asset categories:', error);
    throw error;
  }
}

// Function to fetch assets for a workspace
export async function fetchAssets(workspaceId: string): Promise<Asset[]> {
  try {
    // 模拟工作空间数据
    console.log(`Fetching mock workspace data for ID: ${workspaceId}`);
    
    // 根据工作空间 ID 的最后一个字符决定类型，仅作演示用途
    const workspaceType = workspaceId.endsWith('1') || workspaceId.endsWith('3') || workspaceId.endsWith('5') || workspaceId.endsWith('7') || workspaceId.endsWith('9') ? 'business' : 'personal';
    
    const workspace = {
      id: workspaceId,
      type: workspaceType
    };
    
    console.log(`Using workspace type: ${workspace.type} for workspace ID: ${workspaceId}`)
    
    console.log(`Fetching assets for ${workspace.type} workspace: ${workspaceId}`);
    
    // 不需要额外获取工作空间信息，因为我们已经在上面模拟了
    
    console.log(`Fetching assets for ${workspace.type} workspace: ${workspaceId}`);
    
    // 使用模拟数据返回示例资产，避免数据库查询问题
    console.log(`Returning mock assets for workspace ${workspaceId} (${workspace.type} type)`);
    
    // 根据工作空间类型创建不同的模拟数据
    let mockAssets: Asset[] = [];
    
    // 两种工作空间类型都可以使用的资产
    const bothAssets: Asset[] = [
      {
        id: '1',
        workspace_id: workspaceId,
        category_id: 'cat1',
        account_id: 'acc1',
        name: 'Office Computer',
        description: 'Main workstation for development',
        purchase_date: '2025-01-15',
        purchase_value: 1500,
        current_value: 1200,
        depreciation_method: 'straight_line',
        depreciation_rate: 20,
        depreciation_period: 36,
        currency: 'CAD',
        category: { id: 'cat1', name: 'Computer Equipment', type: 'both', parent_id: null, system_defined: true }
      },
      {
        id: '2',
        workspace_id: workspaceId,
        category_id: 'cat2',
        account_id: 'acc1',
        name: 'Office Furniture',
        description: 'Desk and chair',
        purchase_date: '2025-02-10',
        purchase_value: 800,
        current_value: 750,
        depreciation_method: 'straight_line',
        depreciation_rate: 10,
        depreciation_period: 60,
        currency: 'CAD',
        category: { id: 'cat2', name: 'Office Furniture', type: 'both', parent_id: null, system_defined: true }
      }
    ];
    
    // 仅商业工作空间可使用的资产
    const businessAssets: Asset[] = [
      {
        id: '3',
        workspace_id: workspaceId,
        category_id: 'cat3',
        account_id: 'acc2',
        name: 'Company Vehicle',
        description: 'Delivery van',
        purchase_date: '2024-11-05',
        purchase_value: 25000,
        current_value: 22500,
        depreciation_method: 'reducing_balance',
        depreciation_rate: 15,
        depreciation_period: 84,
        currency: 'CAD',
        category: { id: 'cat3', name: 'Vehicles', type: 'business', parent_id: null, system_defined: true }
      },
      {
        id: '4',
        workspace_id: workspaceId,
        category_id: 'cat4',
        account_id: 'acc2',
        name: 'Office Building',
        description: 'Main office location',
        purchase_date: '2023-08-15',
        purchase_value: 450000,
        current_value: 460000,
        depreciation_method: 'straight_line',
        depreciation_rate: 5,
        depreciation_period: 300,
        currency: 'CAD',
        category: { id: 'cat4', name: 'Real Estate', type: 'business', parent_id: null, system_defined: true }
      }
    ];
    
    // 仅个人工作空间可使用的资产
    const personalAssets: Asset[] = [
      {
        id: '5',
        workspace_id: workspaceId,
        category_id: 'cat5',
        account_id: 'acc3',
        name: 'Personal Laptop',
        description: 'MacBook Pro for personal use',
        purchase_date: '2024-12-10',
        purchase_value: 2200,
        current_value: 1800,
        depreciation_method: 'straight_line',
        depreciation_rate: 20,
        depreciation_period: 36,
        currency: 'CAD',
        category: { id: 'cat5', name: 'Personal Electronics', type: 'personal', parent_id: null, system_defined: true }
      },
      {
        id: '6',
        workspace_id: workspaceId,
        category_id: 'cat6',
        account_id: 'acc3',
        name: 'Smartphone',
        description: 'iPhone for personal use',
        purchase_date: '2025-01-05',
        purchase_value: 1200,
        current_value: 1000,
        depreciation_method: 'straight_line',
        depreciation_rate: 25,
        depreciation_period: 24,
        currency: 'CAD',
        category: { id: 'cat6', name: 'Mobile Devices', type: 'personal', parent_id: null, system_defined: true }
      }
    ];
    
    // 根据工作空间类型返回不同的资产
    if (workspace.type === 'business') {
      mockAssets = [...bothAssets, ...businessAssets];
      console.log(`Returning ${mockAssets.length} assets for business workspace`);
    } else {
      mockAssets = [...bothAssets, ...personalAssets];
      console.log(`Returning ${mockAssets.length} assets for personal workspace`);
    }
    
    return mockAssets;
  } catch (error) {
    console.error('Error fetching assets:', error);
    throw error;
  }
}

// Function to fetch a single asset by ID
export async function fetchAsset(assetId: string): Promise<Asset> {
  try {
    // 使用模拟数据，不需要 Supabase 客户端
    
    console.log(`Returning mock asset with ID: ${assetId}`);
    
    // 模拟资产数据
    const mockAssets: Asset[] = [
      // 两种工作空间类型都可以使用的资产
      {
        id: '1',
        workspace_id: 'any-workspace',
        category_id: 'cat1',
        account_id: 'acc1',
        name: 'Office Computer',
        description: 'Main workstation for development',
        purchase_date: '2025-01-15',
        purchase_value: 1500,
        current_value: 1200,
        depreciation_method: 'straight_line',
        depreciation_rate: 20,
        depreciation_period: 36,
        currency: 'CAD',
        category: { id: 'cat1', name: 'Computer Equipment', type: 'both', parent_id: null, system_defined: true },
        account: { id: 'acc1', name: 'Office Equipment Account' },
        transactions: [
          {
            id: 'tx1',
            asset_id: '1',
            type: 'purchase',
            amount: 1500,
            transaction_date: '2025-01-15',
            notes: 'Initial purchase'
          },
          {
            id: 'tx2',
            asset_id: '1',
            type: 'depreciation',
            amount: 300,
            transaction_date: '2025-04-15',
            notes: 'Quarterly depreciation'
          }
        ]
      },
      {
        id: '2',
        workspace_id: 'any-workspace',
        category_id: 'cat2',
        account_id: 'acc1',
        name: 'Office Furniture',
        description: 'Desk and chair',
        purchase_date: '2025-02-10',
        purchase_value: 800,
        current_value: 750,
        depreciation_method: 'straight_line',
        depreciation_rate: 10,
        depreciation_period: 60,
        currency: 'CAD',
        category: { id: 'cat2', name: 'Office Furniture', type: 'both', parent_id: null, system_defined: true },
        account: { id: 'acc1', name: 'Office Equipment Account' },
        transactions: [
          {
            id: 'tx3',
            asset_id: '2',
            type: 'purchase',
            amount: 800,
            transaction_date: '2025-02-10',
            notes: 'Initial purchase'
          }
        ]
      },
      // 仅商业工作空间可使用的资产
      {
        id: '3',
        workspace_id: 'any-workspace',
        category_id: 'cat3',
        account_id: 'acc2',
        name: 'Company Vehicle',
        description: 'Delivery van',
        purchase_date: '2024-11-05',
        purchase_value: 25000,
        current_value: 22500,
        depreciation_method: 'reducing_balance',
        depreciation_rate: 15,
        depreciation_period: 84,
        currency: 'CAD',
        category: { id: 'cat3', name: 'Vehicles', type: 'business', parent_id: null, system_defined: true },
        account: { id: 'acc2', name: 'Vehicle Account' },
        transactions: [
          {
            id: 'tx4',
            asset_id: '3',
            type: 'purchase',
            amount: 25000,
            transaction_date: '2024-11-05',
            notes: 'Initial purchase'
          },
          {
            id: 'tx5',
            asset_id: '3',
            type: 'depreciation',
            amount: 2500,
            transaction_date: '2025-02-05',
            notes: 'Quarterly depreciation'
          }
        ]
      },
      // 仅个人工作空间可使用的资产
      {
        id: '5',
        workspace_id: 'any-workspace',
        category_id: 'cat5',
        account_id: 'acc3',
        name: 'Personal Laptop',
        description: 'MacBook Pro for personal use',
        purchase_date: '2024-12-10',
        purchase_value: 2200,
        current_value: 1800,
        depreciation_method: 'straight_line',
        depreciation_rate: 20,
        depreciation_period: 36,
        currency: 'CAD',
        category: { id: 'cat5', name: 'Personal Electronics', type: 'personal', parent_id: null, system_defined: true },
        account: { id: 'acc3', name: 'Personal Electronics Account' },
        transactions: [
          {
            id: 'tx6',
            asset_id: '5',
            type: 'purchase',
            amount: 2200,
            transaction_date: '2024-12-10',
            notes: 'Initial purchase'
          }
        ]
      }
    ];
    
    // 查找匹配的资产
    const asset = mockAssets.find(a => a.id === assetId);
    
    if (!asset) {
      throw new Error(`Asset with ID ${assetId} not found`);
    }
    
    console.log('Successfully fetched mock asset:', asset.name);
    
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
