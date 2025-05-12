"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { Plus, RefreshCw, Filter, Download, Search, FileDown } from "lucide-react";
import { fetchAssets, Asset, AssetCategory, fetchAssetCategories } from "@/lib/api/asset-management";
import Link from "next/link";

// 使用共享的Supabase客户端实例

export default function AssetsPage() {
  const router = useRouter();
  const params = useParams();
  const workspaceId = Array.isArray(params.workspace_id) ? params.workspace_id[0] : params.workspace_id as string;
  
  // 确保 workspaceId 是有效的 UUID 格式
  useEffect(() => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!workspaceId || !uuidRegex.test(workspaceId)) {
      console.log('Invalid workspace ID format, redirecting to dashboard');
      router.push('/dashboard');
      return;
    }
  }, [workspaceId, router]);
  
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState<any>(null);
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        // 首先检查会话
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log('No session found, redirecting to register');
          router.push('/register');
          return;
        }
        
        console.log('Loading data for workspace ID:', workspaceId);
        
        // 使用更可靠的方法获取工作空间信息
        if (!workspaceId || typeof workspaceId !== 'string') {
          console.error('Invalid workspace ID:', workspaceId);
          router.push('/dashboard');
          return;
        }
        
        // 检查是否是有效的 UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(workspaceId)) {
          console.error('Invalid UUID format:', workspaceId);
          router.push('/dashboard');
          return;
        }
        
        // 先检查工作空间是否存在
        console.log('Fetching workspace with ID:', workspaceId);
        const workspacesResponse = await supabase
          .from('workspaces')
          .select('id, name, type, currency, user_id')
          .eq('id', workspaceId);
        
        console.log('Workspace response:', workspacesResponse);
        
        if (workspacesResponse.error) {
          console.error('Error fetching workspace:', workspacesResponse.error);
          setError(`Error fetching workspace: ${workspacesResponse.error.message}`);
          return;
        }
        
        if (!workspacesResponse.data || workspacesResponse.data.length === 0) {
          console.error('Workspace not found');
          setError('Workspace not found');
          router.push('/dashboard');
          return;
        }
        
        const ws = workspacesResponse.data[0];
        console.log('Found workspace:', ws);
        setWorkspace(ws);
        
        // Load assets
        const assetsData = await fetchAssets(workspaceId);
        setAssets(assetsData);
        
        // Load asset categories
        const categoriesData = await fetchAssetCategories(workspaceId);
        setCategories(categoriesData);
      } catch (err) {
        console.error("Error loading assets:", err);
        setError(err instanceof Error ? err.message : "Failed to load assets");
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [workspaceId]);

  // Filter assets by category and search term
  const filteredAssets = assets.filter(asset => {
    const matchesCategory = !selectedCategory || asset.category_id === selectedCategory;
    const matchesSearch = !searchTerm || 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.description && asset.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  // Group assets by category for display
  const groupedAssets: Record<string, Asset[]> = {};
  
  filteredAssets.forEach(asset => {
    const categoryId = asset.category_id;
    if (!groupedAssets[categoryId]) {
      groupedAssets[categoryId] = [];
    }
    groupedAssets[categoryId].push(asset);
  });

  // Calculate total assets value
  const totalValue = filteredAssets.reduce((sum, asset) => sum + (asset.current_value || 0), 0);

  // Find category name by ID
  const getCategoryName = (categoryId: string): string => {
    // First check top-level categories
    const category = categories.find(cat => cat.id === categoryId);
    if (category) return category.name;
    
    // Then check children categories
    for (const parentCat of categories) {
      if (parentCat.children) {
        const childCat = parentCat.children.find(child => child.id === categoryId);
        if (childCat) return childCat.name;
      }
    }
    
    return "Unknown Category";
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-CA', { 
      style: 'currency', 
      currency: workspace?.currency || 'CAD' 
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="flex flex-col items-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-2" />
          <p className="text-gray-600">Loading assets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg max-w-md">
          <h3 className="font-semibold mb-2">Error</h3>
          <p>{error}</p>
          <button 
            onClick={() => router.refresh()}
            className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-md text-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Assets</h1>
        <div className="flex gap-2">
          <button
            onClick={() => router.refresh()}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              // 导出资产数据为 CSV
              const headers = ['Name', 'Category', 'Purchase Value', 'Current Value', 'Purchase Date'];
              const csvData = [
                headers.join(','),
                ...filteredAssets.map(asset => [
                  asset.name,
                  getCategoryName(asset.category_id),
                  asset.purchase_value,
                  asset.current_value,
                  asset.purchase_date
                ].join(','))
              ].join('\n');
              
              const blob = new Blob([csvData], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `assets-${new Date().toISOString().split('T')[0]}.csv`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors flex items-center"
            title="Export to CSV"
          >
            <FileDown className="w-4 h-4" />
          </button>
          <Link 
            href={`/dashboard/${workspaceId}/assets/new`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Asset
          </Link>
        </div>
      </div>
      
      {/* Summary Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Assets Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-md p-4">
            <p className="text-sm text-blue-600 mb-1">Total Value</p>
            <p className="text-2xl font-bold text-blue-700">{formatCurrency(totalValue)}</p>
          </div>
          <div className="bg-green-50 rounded-md p-4">
            <p className="text-sm text-green-600 mb-1">Total Assets</p>
            <p className="text-2xl font-bold text-green-700">{filteredAssets.length}</p>
          </div>
          <div className="bg-purple-50 rounded-md p-4">
            <p className="text-sm text-purple-600 mb-1">Categories</p>
            <p className="text-2xl font-bold text-purple-700">{Object.keys(groupedAssets).length}</p>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search assets..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
          <div className="w-full md:w-64">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              id="category"
              value={selectedCategory || ""}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <optgroup key={category.id} label={category.name}>
                  <option value={category.id}>{category.name}</option>
                  {category.children?.map(child => (
                    <option key={child.id} value={child.id}>
                      &nbsp;&nbsp;{child.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={() => {
                setSelectedCategory(null);
                setSearchTerm("");
              }}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </button>
          </div>
        </div>
      </div>
      
      {/* Assets List */}
      {filteredAssets.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 mb-4">No assets found.</p>
          <Link 
            href={`/dashboard/${workspaceId}/assets/new`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Asset
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedAssets).map(([categoryId, categoryAssets]) => (
            <div key={categoryId} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h3 className="font-medium text-gray-800">{getCategoryName(categoryId)}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Purchase Value
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Value
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Purchase Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categoryAssets.map((asset) => (
                      <tr key={asset.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                          {asset.description && (
                            <div className="text-sm text-gray-500">{asset.description}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {asset.purchase_value ? formatCurrency(asset.purchase_value) : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {asset.current_value ? formatCurrency(asset.current_value) : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {asset.purchase_date || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/dashboard/${workspaceId}/assets/${asset.id}`}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            View
                          </Link>
                          <Link
                            href={`/dashboard/${workspaceId}/assets/${asset.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
