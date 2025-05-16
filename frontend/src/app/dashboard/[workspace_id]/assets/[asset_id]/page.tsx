"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Calendar, 
  DollarSign, 
  Tag, 
  FileText,
  Clock,
  BarChart
} from "lucide-react";
import Link from "next/link";
import { fetchAsset, Asset, deleteAsset } from '@/lib/api/asset-management';

type Workspace = {
  id: string;
  name: string;
  type: string;
  currency: string;
  user_id: string;
};

export default function AssetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const workspaceId = params?.workspace_id as string | undefined;
  const assetId = params?.asset_id as string | undefined;

  const handleDelete = useCallback(async () => {
    if (!asset?.id || !workspaceId) return;

    setDeleting(true);
    setError(null); 
    try {
      await deleteAsset(asset.id);
      router.push(`/dashboard/${workspaceId}/assets`); 
    } catch (err) {
      console.error("Error deleting asset:", err);
      setError(err instanceof Error ? err.message : 'Failed to delete asset');
      setDeleting(false); 
    } finally {
      setDeleteConfirm(false); 
    }
  }, [asset, workspaceId, router, setDeleting, setError, setDeleteConfirm]); 

  useEffect(() => {
    if (!workspaceId) return; 
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(workspaceId)) {
      router.push('/dashboard');
    }
  }, [workspaceId, router]);

  useEffect(() => {
    if (!workspaceId || !assetId) return; 

    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: workspaceData } = await supabase
          .from('workspaces')
          .select('*')
          .eq('id', workspaceId)
          .single();

        if (!workspaceData) {
          setError('Workspace not found'); 
          setLoading(false);
          return;
        }
        setWorkspace(workspaceData);

        const assetData = await fetchAsset(assetId);
        setAsset(assetData);
        setError(null); 
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : 'Failed to load asset data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [workspaceId, assetId]); 

  if (!params?.workspace_id || !params?.asset_id) {
    return <div>Loading parameters or invalid URL...</div>; 
  }

  const formatCurrency = (amount: number): string => {
    return `${workspace?.currency || '$'}${amount.toFixed(2)}`;
  };

  if (loading && !asset) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="flex flex-col items-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-2" />
          <p className="text-gray-600">Loading asset details...</p>
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

  if (!asset) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="bg-yellow-50 text-yellow-600 p-4 rounded-lg max-w-md">
          <h3 className="font-semibold mb-2">Asset Not Found</h3>
          <p>The requested asset could not be found.</p>
          <Link 
            href={`/dashboard/${workspaceId}/assets`}
            className="mt-4 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 rounded-md text-yellow-700 transition-colors inline-block"
          >
            Back to Assets
          </Link>
        </div>
      </div>
    );
  }

  const isBusinessWorkspace = workspace?.type === 'business';

  const sortedTransactions = asset.transactions 
    ? [...asset.transactions].sort((a, b) => 
        new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
      )
    : [];

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
          <h1 className="text-2xl font-bold text-gray-800">{asset.name}</h1>
        </div>
        <div className="flex items-center">
          <Link 
            href={`/dashboard/${workspaceId}/assets/${asset.id}/edit`}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-3 hover:bg-gray-50 transition-colors flex items-center"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Link>
          {!deleteConfirm ? (
            <button 
              onClick={() => setDeleteConfirm(true)}
              className="px-4 py-2 border border-red-300 rounded-md text-red-600 hover:bg-red-50 transition-colors flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          ) : (
            <div className="flex items-center">
              <span className="mr-2 text-sm text-red-600">Confirm?</span>
              <button 
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 py-1 bg-red-600 text-white rounded-md mr-2 hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes'}
              </button>
              <button 
                onClick={() => setDeleteConfirm(false)}
                className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                No
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Asset Information */}
        <div className="md:col-span-2 space-y-6">
          {/* Asset Details Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-800">Asset Details</h2>
            </div>
            <div className="p-6">
              {asset.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                  <p className="text-gray-800">{asset.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Category</h3>
                  <div className="flex items-center">
                    <Tag className="w-4 h-4 text-blue-500 mr-2" />
                    <p className="text-gray-800">{asset.category?.name || 'Unknown Category'}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Account</h3>
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-green-500 mr-2" />
                    <p className="text-gray-800">{asset.account?.name || 'Unknown Account'}</p>
                  </div>
                </div>
                
                {asset.purchase_date && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Purchase Date</h3>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-indigo-500 mr-2" />
                      <p className="text-gray-800">{new Date(asset.purchase_date).toLocaleDateString('en-CA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</p>
                    </div>
                  </div>
                )}
                
                {asset.purchase_value !== undefined && asset.purchase_value !== null && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Purchase Value</h3>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 text-yellow-500 mr-2" />
                      <p className="text-gray-800">{formatCurrency(asset.purchase_value)}</p>
                    </div>
                  </div>
                )}
                
                {asset.current_value !== undefined && asset.current_value !== null && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Current Value</h3>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 text-green-500 mr-2" />
                      <p className="text-gray-800 font-semibold">{formatCurrency(asset.current_value)}</p>
                    </div>
                  </div>
                )}
                
                {/* Depreciation Information (for business assets) */}
                {isBusinessWorkspace && asset.depreciation_method && asset.depreciation_method !== 'none' && (
                  <>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Depreciation Method</h3>
                      <div className="flex items-center">
                        <BarChart className="w-4 h-4 text-purple-500 mr-2" />
                        <p className="text-gray-800">
                          {asset.depreciation_method === 'straight_line' ? 'Straight Line' : 'Reducing Balance'}
                        </p>
                      </div>
                    </div>
                    
                    {asset.depreciation_rate && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Depreciation Rate</h3>
                        <p className="text-gray-800">{asset.depreciation_rate}%</p>
                      </div>
                    )}
                    
                    {asset.depreciation_period && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Depreciation Period</h3>
                        <p className="text-gray-800">{asset.depreciation_period} months</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Transaction History */}
          {sortedTransactions.length > 0 && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h2 className="font-semibold text-gray-800">Transaction History</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{new Date(transaction.transaction_date).toLocaleDateString('en-CA', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            transaction.type === 'purchase' ? 'bg-blue-100 text-blue-800' :
                            transaction.type === 'sale' ? 'bg-green-100 text-green-800' :
                            transaction.type === 'depreciation' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatCurrency(transaction.amount)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{transaction.notes || '-'}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Value Summary Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-800">Value Summary</h2>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Current Value</h3>
                <p className="text-2xl font-bold text-green-600">
                  {asset.current_value ? formatCurrency(asset.current_value) : '-'}
                </p>
              </div>
              
              {asset.purchase_value && asset.current_value && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Value Change</h3>
                  <div className="flex items-center">
                    {asset.current_value > asset.purchase_value ? (
                      <span className="text-green-600 font-semibold">
                        +{formatCurrency(asset.current_value - asset.purchase_value)}
                      </span>
                    ) : asset.current_value < asset.purchase_value ? (
                      <span className="text-red-600 font-semibold">
                        {formatCurrency(asset.current_value - asset.purchase_value)}
                      </span>
                    ) : (
                      <span className="text-gray-600">No change</span>
                    )}
                  </div>
                </div>
              )}
              
              {asset.purchase_date && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Age</h3>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-blue-500 mr-2" />
                    <p className="text-gray-800">
                      {(() => {
                        const purchaseDate = new Date(asset.purchase_date);
                        const now = new Date();
                        const diffTime = Math.abs(now.getTime() - purchaseDate.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        if (diffDays < 30) {
                          return `${diffDays} days`;
                        } else if (diffDays < 365) {
                          const months = Math.floor(diffDays / 30);
                          return `${months} month${months !== 1 ? 's' : ''}`;
                        } else {
                          const years = Math.floor(diffDays / 365);
                          const remainingMonths = Math.floor((diffDays % 365) / 30);
                          return `${years} year${years !== 1 ? 's' : ''}${remainingMonths > 0 ? `, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}` : ''}`;
                        }
                      })()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Actions Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-800">Actions</h2>
            </div>
            <div className="p-6 space-y-3">
              <Link 
                href={`/dashboard/${workspaceId}/assets/${asset.id}/edit`}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Asset
              </Link>
              
              {isBusinessWorkspace && (
                <Link 
                  href={`/dashboard/${workspaceId}/assets/${asset.id}/depreciate`}
                  className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors flex items-center justify-center"
                >
                  <BarChart className="w-4 h-4 mr-2" />
                  Record Depreciation
                </Link>
              )}
              
              <button 
                onClick={() => setDeleteConfirm(true)}
                className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Asset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
