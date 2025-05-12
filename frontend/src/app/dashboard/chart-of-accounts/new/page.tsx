"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createChartOfAccount, ChartOfAccount } from '@/lib/api/chart-of-accounts';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { ArrowLeft } from 'lucide-react';

export default function NewChartOfAccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ChartOfAccount>>({
    code: '',
    name: '',
    type: 'asset',
    description: '',
  });

  useEffect(() => {
    // 从 localStorage 获取当前工作空间 ID
    const currentWorkspace = localStorage.getItem('currentWorkspace');
    if (currentWorkspace) {
      try {
        const workspace = JSON.parse(currentWorkspace);
        setWorkspaceId(workspace.id);
      } catch (err) {
        console.error('Error parsing workspace from localStorage:', err);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, type: value as 'asset' | 'liability' | 'equity' | 'income' | 'expense' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!workspaceId) {
      setError('Workspace information unavailable. Please refresh the page and try again.');
      return;
    }
    
    if (!formData.name) {
      setError('Account name cannot be empty.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const chartData: ChartOfAccount = {
        workspace_id: workspaceId,
        code: formData.code || undefined,
        name: formData.name,
        type: formData.type as 'asset' | 'liability' | 'equity' | 'income' | 'expense',
        description: formData.description || undefined,
      };
      
      await createChartOfAccount(chartData);
      router.push('/dashboard/chart-of-accounts');
    } catch (err) {
      console.error('Error creating chart of account:', err);
      setError('Failed to create chart of account. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={handleCancel}
          className="mr-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">Add Chart of Account</h1>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                  Account Code
                </label>
                <Input
                  id="code"
                  name="code"
                  value={formData.code || ''}
                  onChange={handleChange}
                  placeholder="e.g., 1000"
                />
              </div>
              
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Account Type <span className="text-red-500">*</span>
                </label>
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
              </div>
            </div>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Account Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                placeholder="Enter account name"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                placeholder="Enter account description"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading && <Spinner className="mr-2 h-4 w-4" />}
                Save
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
