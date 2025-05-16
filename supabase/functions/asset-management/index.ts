// AutoBooks Asset Management Edge Function
// Created: 2025-05-11
// Updated: 2025-05-15 - Added GraphQL support for optimized data querying and aggregation

// Reference our local type declarations
/// <reference path="./types.d.ts" />

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { graphql } from 'https://esm.sh/graphql@16.6.0'
import { createSchema } from './graphql.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Asset {
  id?: string
  workspace_id: string
  category_id: string
  account_id: string
  name: string
  description?: string
  purchase_date?: string
  purchase_value?: number
  current_value?: number
  depreciation_method?: string
  depreciation_rate?: number
  depreciation_period?: number
  currency?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the session of the authenticated user
    const {
      data: { session },
    } = await supabaseClient.auth.getSession()

    // If no session, return 401
    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }
    
    // Parse the URL to get the path and query parameters
    const url = new URL(req.url)
    const path = url.pathname.split('/').pop()
    const workspaceId = url.searchParams.get('workspace_id')
    
    // Handle GraphQL requests
    if (path === 'graphql') {
      if (req.method === 'POST') {
        const { query, variables } = await req.json()
        
        // Create GraphQL schema with the authenticated Supabase client
        const schema = createSchema(supabaseClient)
        
        // Execute the GraphQL query
        const result = await graphql({
          schema,
          source: query,
          variableValues: variables,
          contextValue: {
            supabaseClient,
            user: session.user,
          },
        })
        
        return new Response(
          JSON.stringify(result),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }
    }

    // Handle different operations based on HTTP method and path
    if (req.method === 'GET') {
      // GET requests for fetching data
      if (path === 'categories') {
        // Get asset categories based on workspace type
        const { data: workspace } = await supabaseClient
          .from('workspaces')
          .select('type')
          .eq('id', workspaceId)
          .single()

        if (!workspace) {
          return new Response(
            JSON.stringify({ error: 'Workspace not found' }),
            {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }

        const workspaceType = workspace.type // 'personal' or 'business'

        // Fetch categories for this workspace type or 'both'
        const { data: categories, error } = await supabaseClient
          .from('asset_categories')
          .select('*')
          .or(`type.eq.${workspaceType},type.eq.both`)
          .order('name')

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }

        // Organize categories into a hierarchical structure
        const topLevelCategories = categories.filter(cat => !cat.parent_id)
        const childCategories = categories.filter(cat => cat.parent_id)

        const result = topLevelCategories.map(parent => {
          return {
            ...parent,
            children: childCategories.filter(child => child.parent_id === parent.id)
          }
        })

        return new Response(
          JSON.stringify(result),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      } else if (path === 'assets') {
        // Get assets for a specific workspace
        if (!workspaceId) {
          return new Response(
            JSON.stringify({ error: 'Workspace ID is required' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }

        const { data: assets, error } = await supabaseClient
          .from('assets')
          .select(`
            *,
            category:asset_categories(id, name, parent_id),
            account:accounts(id, name)
          `)
          .eq('workspace_id', workspaceId)
          .eq('is_deleted', false)
          .order('name')

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }

        return new Response(
          JSON.stringify(assets),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      } else if (path === 'asset') {
        // Get a specific asset by ID
        const assetId = url.searchParams.get('id')
        if (!assetId) {
          return new Response(
            JSON.stringify({ error: 'Asset ID is required' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }

        const { data: asset, error } = await supabaseClient
          .from('assets')
          .select(`
            *,
            category:asset_categories(id, name, parent_id),
            account:accounts(id, name),
            transactions:asset_transactions(*)
          `)
          .eq('id', assetId)
          .eq('is_deleted', false)
          .single()

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }

        return new Response(
          JSON.stringify(asset),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }
    } else if (req.method === 'POST') {
      // POST requests for creating or updating data
      const requestData = await req.json()

      if (path === 'create') {
        // Create a new asset
        if (!requestData.workspace_id || !requestData.category_id || !requestData.account_id || !requestData.name) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }

        const asset: Asset = {
          workspace_id: requestData.workspace_id,
          category_id: requestData.category_id,
          account_id: requestData.account_id,
          name: requestData.name,
          description: requestData.description,
          purchase_date: requestData.purchase_date,
          purchase_value: requestData.purchase_value,
          current_value: requestData.current_value || requestData.purchase_value, // Default to purchase value if not provided
          depreciation_method: requestData.depreciation_method,
          depreciation_rate: requestData.depreciation_rate,
          depreciation_period: requestData.depreciation_period,
          currency: requestData.currency || 'CAD', // Default to CAD
        }

        const { data, error } = await supabaseClient
          .from('assets')
          .insert(asset)
          .select()
          .single()

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }

        // If purchase_value is provided, create an initial asset transaction
        if (requestData.purchase_value) {
          const assetTransaction = {
            asset_id: data.id,
            type: 'purchase',
            amount: requestData.purchase_value,
            transaction_date: requestData.purchase_date || new Date().toISOString().split('T')[0],
            notes: 'Initial asset purchase'
          }

          const { error: transactionError } = await supabaseClient
            .from('asset_transactions')
            .insert(assetTransaction)

          if (transactionError) {
            console.error('Error creating asset transaction:', transactionError)
          }
        }

        return new Response(
          JSON.stringify(data),
          {
            status: 201,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      } else if (path === 'update') {
        // Update an existing asset
        if (!requestData.id) {
          return new Response(
            JSON.stringify({ error: 'Asset ID is required' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }

        const asset: Asset = {
          workspace_id: requestData.workspace_id,
          category_id: requestData.category_id,
          account_id: requestData.account_id,
          name: requestData.name,
          description: requestData.description,
          purchase_date: requestData.purchase_date,
          purchase_value: requestData.purchase_value,
          current_value: requestData.current_value,
          depreciation_method: requestData.depreciation_method,
          depreciation_rate: requestData.depreciation_rate,
          depreciation_period: requestData.depreciation_period,
          currency: requestData.currency,
        }

        const { data, error } = await supabaseClient
          .from('assets')
          .update(asset)
          .eq('id', requestData.id)
          .select()
          .single()

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }

        return new Response(
          JSON.stringify(data),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      } else if (path === 'delete') {
        // Soft delete an asset
        if (!requestData.id) {
          return new Response(
            JSON.stringify({ error: 'Asset ID is required' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }

        const { data, error } = await supabaseClient
          .from('assets')
          .update({ is_deleted: true })
          .eq('id', requestData.id)
          .select()
          .single()

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }

        return new Response(
          JSON.stringify({ success: true, id: requestData.id }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      } else if (path === 'transaction') {
        // Add a new asset transaction (for depreciation, revaluation, etc.)
        if (!requestData.asset_id || !requestData.type || !requestData.amount) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }

        const assetTransaction = {
          asset_id: requestData.asset_id,
          transaction_id: requestData.transaction_id,
          type: requestData.type,
          amount: requestData.amount,
          transaction_date: requestData.transaction_date || new Date().toISOString().split('T')[0],
          notes: requestData.notes
        }

        const { data, error } = await supabaseClient
          .from('asset_transactions')
          .insert(assetTransaction)
          .select()
          .single()

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }

        // Update the asset's current value based on the transaction type
        if (requestData.type === 'depreciation') {
          // For depreciation, reduce the current value
          await supabaseClient.rpc('update_asset_value', {
            p_asset_id: requestData.asset_id,
            p_value_change: -Math.abs(requestData.amount)
          })
        } else if (requestData.type === 'revaluation') {
          // For revaluation, set to the new value directly
          await supabaseClient
            .from('assets')
            .update({ current_value: requestData.amount })
            .eq('id', requestData.asset_id)
        }

        return new Response(
          JSON.stringify(data),
          {
            status: 201,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }
    }

    // If we get here, the request was not handled
    return new Response(
      JSON.stringify({ error: 'Not found' }),
      {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    // Handle any unexpected errors
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
