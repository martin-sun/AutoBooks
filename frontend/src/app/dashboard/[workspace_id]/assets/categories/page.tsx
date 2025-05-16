"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { ArrowLeft, RefreshCw, Plus } from "lucide-react";
import { fetchAssetCategories, AssetCategory } from "@/lib/api/asset-management";
import Link from "next/link";

export default function AssetCategoriesPage() {
  const router = useRouter();
  const params = useParams();
  const workspaceId = params?.workspace_id as string;
  
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState<any>(null);
  
  useEffect(() => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!workspaceId || !uuidRegex.test(workspaceId)) {
      console.log('Invalid workspace ID format, redirecting to dashboard');
      router.push('/dashboard');
      return;
    }
  }, [workspaceId, router]);
  
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        // Check workspace
        const { data: workspaceData, error: workspaceError } = await supabase
          .from('workspaces')
          .select('id, name, type, currency, user_id')
          .eq('id', workspaceId)
          .single();
        
        if (workspaceError) {
          console.error('Error fetching workspace:', workspaceError);
          setError(`Error fetching workspace: ${workspaceError.message}`);
          setLoading(false);
          return;
        }
        
        setWorkspace(workspaceData);
        
        // Load asset categories
        const categoriesData = await fetchAssetCategories(workspaceData.type);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }
    
    if (workspaceId) {
      loadData();
    }
  }, [workspaceId]);
  
  // Organize categories into a hierarchical structure
  const topLevelCategories = categories.filter(cat => !cat.parent_id);
  const childCategories = categories.filter(cat => cat.parent_id);
  
  const getCategoryChildren = (parentId: string) => {
    return childCategories.filter(child => child.parent_id === parentId);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="flex flex-col items-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-2" />
          <p className="text-gray-600">Loading asset categories...</p>
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
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link 
            href={`/dashboard/${workspaceId}/assets`}
            className="mr-4 p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Asset Categories</h1>
        </div>
        <Link
          href={`/dashboard/${workspaceId}/assets/categories/new`}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Category
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parent Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  System Defined
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topLevelCategories.map((category) => (
                <React.Fragment key={category.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{category.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        category.type === 'personal' ? 'bg-blue-100 text-blue-800' :
                        category.type === 'business' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {category.type === 'both' ? 'Personal & Business' : 
                          category.type.charAt(0).toUpperCase() + category.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">-</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{category.system_defined ? 'Yes' : 'No'}</div>
                    </td>
                  </tr>
                  
                  {/* Render child categories */}
                  {getCategoryChildren(category.id).map((child) => (
                    <tr key={child.id} className="hover:bg-gray-50 bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 pl-6">↳ {child.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          child.type === 'personal' ? 'bg-blue-100 text-blue-800' :
                          child.type === 'business' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {child.type === 'both' ? 'Personal & Business' : 
                            child.type.charAt(0).toUpperCase() + child.type.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{category.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{child.system_defined ? 'Yes' : 'No'}</div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
              
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No asset categories found. Create your first category to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
