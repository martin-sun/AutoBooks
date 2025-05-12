"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  fetchChartOfAccounts, 
  fetchAccounts, 
  updateChartOfAccount, 
  deleteChartOfAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  ChartOfAccount,
  Account
} from '@/lib/api/chart-of-accounts';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { 
  ArrowLeft, 
  Pencil, 
  Trash, 
  Plus,
  AlertTriangle
} from 'lucide-react';

export default function ChartOfAccountDetailPage({ params }: { params: Promise<{ workspace_id: string, id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { id, workspace_id: workspaceId } = resolvedParams;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartOfAccount | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<ChartOfAccount>>({});
  const [activeTab, setActiveTab] = useState('details');
  
  // Account related states
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountFormData, setAccountFormData] = useState<Partial<Account>>({});
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingItem, setDeletingItem] = useState<{ id: string, type: 'chart' | 'account', name: string } | null>(null);

  // Load chart of account and accounts data
  useEffect(() => {
    const loadData = async () => {
      if (!id || !workspaceId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Get all charts of accounts to find the current one
        const allCharts = await fetchChartOfAccounts(workspaceId);
        const currentChart = allCharts.find(chart => chart.id === id);
        
        if (!currentChart) {
          setError('Chart of account not found');
          return;
        }
        
        setChartData(currentChart);
        setFormData({
          code: currentChart.code,
          name: currentChart.name,
          type: currentChart.type,
          description: currentChart.description,
        });
        
        // Get all accounts for this chart of account
        const accountsData = await fetchAccounts(id);
        setAccounts(accountsData);
        
      } catch (err) {
        console.error('Error loading chart data:', err);
        setError('Failed to load chart of account data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, workspaceId]);

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, type: value as 'asset' | 'liability' | 'equity' | 'income' | 'expense' }));
  };

  // Handle account form changes
  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAccountFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle account select changes
  const handleAccountSelectChange = (name: string, value: string) => {
    setAccountFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle number input
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === '' ? 0 : parseFloat(value);
    setAccountFormData(prev => ({ ...prev, [name]: numValue }));
  };

  // Toggle edit mode
  const toggleEdit = () => {
    if (isEditing) {
      // Cancel editing, reset form data
      if (chartData) {
        setFormData({
          code: chartData.code,
          name: chartData.name,
          type: chartData.type,
          description: chartData.description,
        });
      }
    }
    setIsEditing(!isEditing);
  };

  // Save chart of account changes
  const handleSave = async () => {
    if (!chartData?.id) return;
    
    try {
      setSaving(true);
      await updateChartOfAccount(chartData.id, formData);
      
      // Refresh data
      const updatedChart = { ...chartData, ...formData };
      setChartData(updatedChart);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving chart of account:', err);
      setError('Failed to save changes. Please try again later.');
    } finally {
      setSaving(false);
    }
  };

  // Add/edit account
  const handleAccountAction = (account?: Account) => {
    if (account) {
      // Edit existing account
      setEditingAccountId(account.id || null);
      setAccountFormData({
        name: account.name,
        description: account.description,
        opening_balance: account.opening_balance,
        currency: account.currency || 'CAD',
      });
    } else {
      // Add new account
      setEditingAccountId(null);
      setAccountFormData({
        name: '',
        description: '',
        opening_balance: 0,
        currency: 'CAD',
      });
    }
    
    setShowAccountModal(true);
  };

  // Save account
  const handleSaveAccount = async () => {
    if (!chartData?.id || !workspaceId) return;
    
    try {
      setSaving(true);
      
      if (editingAccountId) {
        // Update existing account
        await updateAccount(editingAccountId, {
          ...accountFormData,
          workspace_id: workspaceId,
          chart_id: chartData.id,
        });
      } else {
        // Create new account
        await createAccount({
          workspace_id: workspaceId,
          chart_id: chartData.id,
          name: accountFormData.name || '',
          description: accountFormData.description,
          opening_balance: accountFormData.opening_balance,
          currency: accountFormData.currency,
        });
      }
      
      // Refresh accounts list
      const updatedAccounts = await fetchAccounts(chartData.id);
      setAccounts(updatedAccounts);
      
      // Close modal and reset form
      setShowAccountModal(false);
      setAccountFormData({});
      setEditingAccountId(null);
    } catch (err) {
      console.error('Error saving account:', err);
      setError('Failed to save account. Please try again later.');
    } finally {
      setSaving(false);
    }
  };

  // Confirm delete dialog
  const confirmDelete = (id: string, type: 'chart' | 'account', name: string) => {
    setDeletingItem({ id, type, name });
    setShowDeleteDialog(true);
  };

  // Execute delete
  const handleDelete = async () => {
    if (!deletingItem) return;
    
    try {
      setSaving(true);
      
      if (deletingItem.type === 'chart') {
        // Delete chart of account
        await deleteChartOfAccount(deletingItem.id);
        router.push(`/dashboard/${workspaceId}/chart-of-accounts`);
      } else {
        // Delete account
        await deleteAccount(deletingItem.id);
        
        // Refresh accounts list
        if (chartData?.id) {
          const updatedAccounts = await fetchAccounts(chartData.id);
          setAccounts(updatedAccounts);
        }
        
        setShowDeleteDialog(false);
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      setError(`Failed to delete ${deletingItem.type}. Please try again later.`);
      setShowDeleteDialog(false);
    } finally {
      setSaving(false);
    }
  };

  // Go back to previous page
  const handleBack = () => {
    router.push(`/dashboard/${workspaceId}/chart-of-accounts`);
  };

  // Get color and label based on account type
  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'asset':
        return { color: 'bg-blue-100 text-blue-800', label: 'Asset' };
      case 'liability':
        return { color: 'bg-red-100 text-red-800', label: 'Liability' };
      case 'equity':
        return { color: 'bg-purple-100 text-purple-800', label: 'Equity' };
      case 'income':
        return { color: 'bg-green-100 text-green-800', label: 'Income' };
      case 'expense':
        return { color: 'bg-yellow-100 text-yellow-800', label: 'Expense' };
      default:
        return { color: 'bg-gray-100 text-gray-800', label: type };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert variant="destructive">
          <AlertDescription>Chart of account not found or has been deleted.</AlertDescription>
        </Alert>
        <Button onClick={handleBack} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Chart of Accounts
        </Button>
      </div>
    );
  }

  const typeInfo = getTypeInfo(chartData.type);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mr-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-grow">
          <h1 className="text-2xl font-bold">{chartData.name}</h1>
          <div className="flex items-center mt-1">
            <Badge className={typeInfo.color}>
              {typeInfo.label}
            </Badge>
            {chartData.code && (
              <span className="ml-2 text-gray-500">Code: {chartData.code}</span>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={toggleEdit}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
              >
                {saving && <Spinner className="mr-2 h-4 w-4" />}
                Save
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={toggleEdit}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => confirmDelete(chartData.id || '', 'chart', chartData.name)}
              >
                <Trash className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Code
                      </label>
                      {isEditing ? (
                        <Input
                          name="code"
                          value={formData.code || ''}
                          onChange={handleChange}
                          placeholder="e.g., 1000"
                        />
                      ) : (
                        <p className="py-2">{chartData.code || '-'}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Name
                      </label>
                      {isEditing ? (
                        <Input
                          name="name"
                          value={formData.name || ''}
                          onChange={handleChange}
                          placeholder="Enter account name"
                          required
                        />
                      ) : (
                        <p className="py-2">{chartData.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Type
                      </label>
                      {isEditing ? (
                        <Select
                          value={formData.type}
                          onChange={(e) => handleSelectChange(e.target.value)}
                          className="w-full"
                        >
                          <option value="asset">Asset</option>
                          <option value="liability">Liability</option>
                          <option value="equity">Equity</option>
                          <option value="income">Income</option>
                          <option value="expense">Expense</option>
                        </Select>
                      ) : (
                        <Badge className={typeInfo.color}>
                          {typeInfo.label}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Additional Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    {isEditing ? (
                      <Textarea
                        name="description"
                        value={formData.description || ''}
                        onChange={handleChange}
                        placeholder="Enter description"
                        rows={5}
                      />
                    ) : (
                      <p className="py-2">{chartData.description || '-'}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="accounts" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Associated Accounts</h3>
                <Button onClick={() => handleAccountAction()} className="flex items-center">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Account
                </Button>
              </div>
              
              {accounts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No accounts found for this chart of account.</p>
                  <Button onClick={() => handleAccountAction()}>Add Account</Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Opening Balance</TableHead>
                        <TableHead>Currency</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accounts.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell className="font-medium">{account.name}</TableCell>
                          <TableCell>{account.description || '-'}</TableCell>
                          <TableCell>{account.opening_balance?.toFixed(2) || '0.00'}</TableCell>
                          <TableCell>{account.currency || 'CAD'}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAccountAction(account)}
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => confirmDelete(account.id || '', 'account', account.name)}
                                title="Delete"
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Account Modal */}
      <Dialog open={showAccountModal} onOpenChange={setShowAccountModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAccountId ? 'Edit Account' : 'Add Account'}</DialogTitle>
            <DialogDescription>
              {editingAccountId 
                ? 'Update the account details below.' 
                : 'Fill in the details to create a new account.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Name <span className="text-red-500">*</span>
              </label>
              <Input
                name="name"
                value={accountFormData.name || ''}
                onChange={handleAccountChange}
                placeholder="Enter account name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Textarea
                name="description"
                value={accountFormData.description || ''}
                onChange={handleAccountChange}
                placeholder="Enter account description"
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Opening Balance
                </label>
                <Input
                  type="number"
                  name="opening_balance"
                  value={accountFormData.opening_balance?.toString() || '0'}
                  onChange={handleNumberChange}
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <Select
                  value={accountFormData.currency || 'CAD'}
                  onChange={(e) => handleAccountSelectChange('currency', e.target.value)}
                  className="w-full"
                >
                  <option value="CAD">Canadian Dollar (CAD)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="CNY">Chinese Yuan (CNY)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="GBP">British Pound (GBP)</option>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAccountModal(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAccount}
              disabled={saving || !accountFormData.name}
            >
              {saving && <Spinner className="mr-2 h-4 w-4" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Confirm Delete
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p>
              {deletingItem?.type === 'chart' 
                ? `Are you sure you want to delete the chart of account "${deletingItem?.name}"? This will also delete all associated accounts.` 
                : `Are you sure you want to delete the account "${deletingItem?.name}"?`
              }
            </p>
            <p className="text-red-600 mt-2">This action cannot be undone.</p>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={saving}
            >
              {saving && <Spinner className="mr-2 h-4 w-4" />}
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
