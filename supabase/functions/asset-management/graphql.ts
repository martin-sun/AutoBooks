// GraphQL schema and resolvers for Asset Management
import { gql } from 'https://esm.sh/graphql-tag@2.12.6'
import { makeExecutableSchema } from 'https://esm.sh/@graphql-tools/schema@9.0.0'
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Define GraphQL schema
export const typeDefs = gql`
  type AssetCategory {
    id: ID!
    name: String!
    parent_id: ID
    type: String!
    parent: AssetCategory
    children: [AssetCategory]
  }

  type Account {
    id: ID!
    name: String!
    type: String!
    workspace_id: ID!
  }

  type AssetTransaction {
    id: ID!
    asset_id: ID!
    type: String!
    amount: Float!
    transaction_date: String!
    notes: String
  }

  type Asset {
    id: ID!
    workspace_id: ID!
    category_id: ID!
    account_id: ID!
    name: String!
    description: String
    purchase_date: String
    purchase_value: Float
    current_value: Float
    depreciation_method: String
    depreciation_rate: Float
    depreciation_period: Int
    currency: String
    is_deleted: Boolean
    category: AssetCategory
    account: Account
    transactions: [AssetTransaction]
  }

  input AssetInput {
    workspace_id: ID!
    category_id: ID!
    account_id: ID!
    name: String!
    description: String
    purchase_date: String
    purchase_value: Float
    current_value: Float
    depreciation_method: String
    depreciation_rate: Float
    depreciation_period: Int
    currency: String
  }

  input AssetUpdateInput {
    id: ID!
    category_id: ID
    account_id: ID
    name: String
    description: String
    purchase_date: String
    purchase_value: Float
    current_value: Float
    depreciation_method: String
    depreciation_rate: Float
    depreciation_period: Int
    currency: String
  }

  input AssetTransactionInput {
    asset_id: ID!
    type: String!
    amount: Float!
    transaction_date: String
    notes: String
  }

  type Query {
    assetCategories(workspace_type: String!): [AssetCategory]
    assets(workspace_id: ID!): [Asset]
    asset(id: ID!): Asset
  }

  type Mutation {
    createAsset(asset: AssetInput!): Asset
    updateAsset(asset: AssetUpdateInput!): Asset
    deleteAsset(id: ID!): Boolean
    addAssetTransaction(transaction: AssetTransactionInput!): AssetTransaction
  }
`

// Define resolvers
export const createResolvers = (supabaseClient: SupabaseClient) => ({
  Query: {
    // Get asset categories based on workspace type
    assetCategories: async (_: any, { workspace_type }: { workspace_type: string }) => {
      const { data: categories, error } = await supabaseClient
        .from('asset_categories')
        .select('*')
        .or(`type.eq.${workspace_type},type.eq.both`)
        .order('name')

      if (error) throw new Error(error.message)
      
      // We'll handle parent-child relationships in the AssetCategory resolver
      return categories
    },

    // Get assets for a specific workspace
    assets: async (_: any, { workspace_id }: { workspace_id: string }) => {
      const { data: assets, error } = await supabaseClient
        .from('assets')
        .select('*')
        .eq('workspace_id', workspace_id)
        .eq('is_deleted', false)
        .order('name')

      if (error) throw new Error(error.message)
      return assets
    },

    // Get a specific asset by ID
    asset: async (_: any, { id }: { id: string }) => {
      const { data: asset, error } = await supabaseClient
        .from('assets')
        .select('*')
        .eq('id', id)
        .eq('is_deleted', false)
        .single()

      if (error) throw new Error(error.message)
      return asset
    },
  },

  Mutation: {
    // Create a new asset
    createAsset: async (_: any, { asset }: { asset: any }) => {
      const newAsset = {
        ...asset,
        current_value: asset.current_value || asset.purchase_value, // Default to purchase value if not provided
        currency: asset.currency || 'CAD', // Default to CAD
      }

      const { data, error } = await supabaseClient
        .from('assets')
        .insert(newAsset)
        .select()
        .single()

      if (error) throw new Error(error.message)

      // If purchase_value is provided, create an initial asset transaction
      if (asset.purchase_value) {
        const assetTransaction = {
          asset_id: data.id,
          type: 'purchase',
          amount: asset.purchase_value,
          transaction_date: asset.purchase_date || new Date().toISOString().split('T')[0],
          notes: 'Initial asset purchase'
        }

        const { error: transactionError } = await supabaseClient
          .from('asset_transactions')
          .insert(assetTransaction)

        if (transactionError) {
          console.error('Error creating asset transaction:', transactionError)
        }
      }

      return data
    },

    // Update an existing asset
    updateAsset: async (_: any, { asset }: { asset: any }) => {
      const { id, ...updateData } = asset
      
      const { data, error } = await supabaseClient
        .from('assets')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    },

    // Soft delete an asset
    deleteAsset: async (_: any, { id }: { id: string }) => {
      const { error } = await supabaseClient
        .from('assets')
        .update({ is_deleted: true })
        .eq('id', id)

      if (error) throw new Error(error.message)
      return true
    },

    // Add a new asset transaction
    addAssetTransaction: async (_: any, { transaction }: { transaction: any }) => {
      const assetTransaction = {
        ...transaction,
        transaction_date: transaction.transaction_date || new Date().toISOString().split('T')[0],
      }

      const { data, error } = await supabaseClient
        .from('asset_transactions')
        .insert(assetTransaction)
        .select()
        .single()

      if (error) throw new Error(error.message)

      // Update the asset's current value based on the transaction type
      if (transaction.type === 'depreciation') {
        // For depreciation, reduce the current value
        await supabaseClient.rpc('update_asset_value', {
          p_asset_id: transaction.asset_id,
          p_value_change: -Math.abs(transaction.amount)
        })
      } else if (transaction.type === 'revaluation') {
        // For revaluation, set to the new value directly
        await supabaseClient
          .from('assets')
          .update({ current_value: transaction.amount })
          .eq('id', transaction.asset_id)
      }

      return data
    },
  },

  // Resolver for AssetCategory to handle parent-child relationships
  AssetCategory: {
    parent: async (category: any) => {
      if (!category.parent_id) return null
      
      const { data, error } = await supabaseClient
        .from('asset_categories')
        .select('*')
        .eq('id', category.parent_id)
        .single()
        
      if (error) return null
      return data
    },
    
    children: async (category: any) => {
      const { data, error } = await supabaseClient
        .from('asset_categories')
        .select('*')
        .eq('parent_id', category.id)
        
      if (error) return []
      return data
    },
  },

  // Resolver for Asset to fetch related data
  Asset: {
    category: async (asset: any) => {
      const { data, error } = await supabaseClient
        .from('asset_categories')
        .select('*')
        .eq('id', asset.category_id)
        .single()
        
      if (error) return null
      return data
    },
    
    account: async (asset: any) => {
      const { data, error } = await supabaseClient
        .from('accounts')
        .select('*')
        .eq('id', asset.account_id)
        .single()
        
      if (error) return null
      return data
    },
    
    transactions: async (asset: any) => {
      const { data, error } = await supabaseClient
        .from('asset_transactions')
        .select('*')
        .eq('asset_id', asset.id)
        .order('transaction_date', { ascending: false })
        
      if (error) return []
      return data
    },
  },
})

// Create executable schema
export const createSchema = (supabaseClient: SupabaseClient) => {
  return makeExecutableSchema({
    typeDefs,
    resolvers: createResolvers(supabaseClient),
  })
}
