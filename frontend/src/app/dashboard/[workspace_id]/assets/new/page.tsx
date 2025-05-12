"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { 
  fetchAssetCategories, 
  AssetCategory, 
  createAsset 
} from "@/lib/api/asset-management";

// 确保使用硬编码的 API URL 和密钥，因为环境变量可能没有正确加载
// 使用共享的Supabase客户端实例

export default function NewAssetPage() {
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
  
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    account_id: "",
    purchase_date: "",
    purchase_value: "",
    current_value: "",
    depreciation_method: "none",
    depreciation_rate: "",
    depreciation_period: "",
    currency: "CAD"
  });
  
  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});

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
        
        // 先检查工作空间是否存在
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
        setFormData(prev => ({ ...prev, currency: ws.currency }));
        
        // Load asset categories
        const categoriesData = await fetchAssetCategories(workspaceId);
        setCategories(categoriesData);
        
        // Load accounts for this workspace
        const { data: accountsData, error: accountsError } = await supabase
          .from('accounts')
          .select(`
            id, 
            name,
            chart_id,
            chart:chart_of_accounts(id, name, type)
          `)
          .eq('workspace_id', workspaceId)
          .eq('is_deleted', false);
          
        if (accountsError) {
          console.error("Error loading accounts:", accountsError);
          setError("Failed to load accounts");
          return;
        }
        
        // Filter to only show asset accounts
        const assetAccounts = accountsData.filter(acc => acc.chart?.type === 'asset');
        setAccounts(assetAccounts);
        
      } catch (err) {
        console.error("Error loading form data:", err);
        setError(err instanceof Error ? err.message : "Failed to load form data");
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [workspaceId]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Special case: if current_value is empty and purchase_value is set, use purchase_value
    if (name === 'purchase_value' && value && !formData.current_value) {
      setFormData(prev => ({ ...prev, current_value: value }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.category_id) {
      newErrors.category_id = "Category is required";
    }
    
    if (!formData.account_id) {
      newErrors.account_id = "Account is required";
    }
    
    if (formData.purchase_value && isNaN(Number(formData.purchase_value))) {
      newErrors.purchase_value = "Must be a valid number";
    }
    
    if (formData.current_value && isNaN(Number(formData.current_value))) {
      newErrors.current_value = "Must be a valid number";
    }
    
    if (formData.depreciation_method !== 'none') {
      if (!formData.depreciation_rate || isNaN(Number(formData.depreciation_rate))) {
        newErrors.depreciation_rate = "Required for depreciation";
      }
      
      if (!formData.depreciation_period || isNaN(Number(formData.depreciation_period))) {
        newErrors.depreciation_period = "Required for depreciation";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Prepare asset data
      const assetData = {
        workspace_id: workspaceId,
        name: formData.name,
        description: formData.description || undefined,
        category_id: formData.category_id,
        account_id: formData.account_id,
        purchase_date: formData.purchase_date || undefined,
        purchase_value: formData.purchase_value ? Number(formData.purchase_value) : undefined,
        current_value: formData.current_value ? Number(formData.current_value) : undefined,
        depreciation_method: formData.depreciation_method === 'none' ? null : formData.depreciation_method,
        depreciation_rate: formData.depreciation_rate ? Number(formData.depreciation_rate) : undefined,
        depreciation_period: formData.depreciation_period ? Number(formData.depreciation_period) : undefined,
        currency: formData.currency
      };
      
      // Create the asset
      const newAsset = await createAsset(assetData);
      
      // Redirect to the asset details page
      router.push(`/dashboard/${workspaceId}/assets/${newAsset.id}`);
      
    } catch (err) {
      console.error("Error creating asset:", err);
      setError(err instanceof Error ? err.message : "Failed to create asset");
      setSubmitting(false);
    }
  };

  // Find all child categories for a given parent category
  const getAllChildCategories = (categories: AssetCategory[], parentId: string | null = null): AssetCategory[] => {
    const result: AssetCategory[] = [];
    
    // First add the parent if it exists
    if (parentId) {
      const parent = categories.find(cat => cat.id === parentId);
      if (parent) {
        result.push(parent);
      }
    }
    
    // Then add all children
    categories.forEach(category => {
      if (category.parent_id === parentId) {
        result.push(category);
        // Also add any children of this category
        if (category.children) {
          result.push(...category.children);
        }
      }
    });
    
    return result;
  };

  // Organize categories for display in select dropdown
  const getCategoryOptions = () => {
    const topLevelCategories = categories.filter(cat => !cat.parent_id);
    
    return topLevelCategories.map(parent => {
      const children = categories.filter(child => child.parent_id === parent.id);
      return (
        <optgroup key={parent.id} label={parent.name}>
          <option value={parent.id}>{parent.name}</option>
          {children.map(child => (
            <option key={child.id} value={child.id}>
              &nbsp;&nbsp;{child.name}
            </option>
          ))}
        </optgroup>
      );
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
          <p className="text-gray-600">Loading...</p>
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
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-md text-red-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Determine if we should show business-specific fields
  const isBusinessWorkspace = workspace?.type === 'business';

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Link 
          href={`/dashboard/${workspaceId}/assets`}
          className="mr-4 p-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Add New Asset</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Basic Information</h2>
            </div>
            
            {/* Name */}
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Asset Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter asset name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>
            
            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter asset description"
              />
            </div>
            
            {/* Category */}
            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.category_id ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Select a category</option>
                {getCategoryOptions()}
              </select>
              {errors.category_id && <p className="mt-1 text-sm text-red-500">{errors.category_id}</p>}
            </div>
            
            {/* Account */}
            <div>
              <label htmlFor="account_id" className="block text-sm font-medium text-gray-700 mb-1">
                Account <span className="text-red-500">*</span>
              </label>
              <select
                id="account_id"
                name="account_id"
                value={formData.account_id}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.account_id ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Select an account</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
              {errors.account_id && <p className="mt-1 text-sm text-red-500">{errors.account_id}</p>}
            </div>
            
            {/* Value Information */}
            <div className="md:col-span-2 mt-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Value Information</h2>
            </div>
            
            {/* Purchase Date */}
            <div>
              <label htmlFor="purchase_date" className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Date
              </label>
              <input
                type="date"
                id="purchase_date"
                name="purchase_date"
                value={formData.purchase_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Purchase Value */}
            <div>
              <label htmlFor="purchase_value" className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Value
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="text"
                  id="purchase_value"
                  name="purchase_value"
                  value={formData.purchase_value}
                  onChange={handleChange}
                  className={`w-full pl-7 pr-3 py-2 border ${errors.purchase_value ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="0.00"
                />
              </div>
              {errors.purchase_value && <p className="mt-1 text-sm text-red-500">{errors.purchase_value}</p>}
            </div>
            
            {/* Current Value */}
            <div>
              <label htmlFor="current_value" className="block text-sm font-medium text-gray-700 mb-1">
                Current Value
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="text"
                  id="current_value"
                  name="current_value"
                  value={formData.current_value}
                  onChange={handleChange}
                  className={`w-full pl-7 pr-3 py-2 border ${errors.current_value ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="0.00"
                />
              </div>
              {errors.current_value && <p className="mt-1 text-sm text-red-500">{errors.current_value}</p>}
            </div>
            
            {/* Currency */}
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>
            
            {/* Depreciation (only for business workspaces) */}
            {isBusinessWorkspace && (
              <>
                <div className="md:col-span-2 mt-4">
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">Depreciation</h2>
                </div>
                
                {/* Depreciation Method */}
                <div>
                  <label htmlFor="depreciation_method" className="block text-sm font-medium text-gray-700 mb-1">
                    Depreciation Method
                  </label>
                  <select
                    id="depreciation_method"
                    name="depreciation_method"
                    value={formData.depreciation_method}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="none">None</option>
                    <option value="straight_line">Straight Line</option>
                    <option value="reducing_balance">Reducing Balance</option>
                  </select>
                </div>
                
                {/* Depreciation Rate */}
                {formData.depreciation_method !== 'none' && (
                  <div>
                    <label htmlFor="depreciation_rate" className="block text-sm font-medium text-gray-700 mb-1">
                      Depreciation Rate (%)
                    </label>
                    <input
                      type="text"
                      id="depreciation_rate"
                      name="depreciation_rate"
                      value={formData.depreciation_rate}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${errors.depreciation_rate ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="e.g. 10"
                    />
                    {errors.depreciation_rate && <p className="mt-1 text-sm text-red-500">{errors.depreciation_rate}</p>}
                  </div>
                )}
                
                {/* Depreciation Period */}
                {formData.depreciation_method !== 'none' && (
                  <div>
                    <label htmlFor="depreciation_period" className="block text-sm font-medium text-gray-700 mb-1">
                      Depreciation Period (months)
                    </label>
                    <input
                      type="text"
                      id="depreciation_period"
                      name="depreciation_period"
                      value={formData.depreciation_period}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${errors.depreciation_period ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="e.g. 60"
                    />
                    {errors.depreciation_period && <p className="mt-1 text-sm text-red-500">{errors.depreciation_period}</p>}
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <Link
              href={`/dashboard/${workspaceId}/assets`}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-4 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Asset
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
