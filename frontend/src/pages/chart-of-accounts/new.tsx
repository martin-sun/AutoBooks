import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useWorkspace } from '@/lib/hooks/useWorkspace';
import { createChartOfAccount, ChartOfAccount } from '@/lib/api/chart-of-accounts';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Button, Card, Input, Select, Textarea, Alert, Spinner } from '@/components/ui';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const NewChartOfAccountPage: React.FC = () => {
  const router = useRouter();
  const { workspace } = useWorkspace();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ChartOfAccount>>({
    code: '',
    name: '',
    type: 'asset',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!workspace?.id) {
      setError('工作空间信息不可用，请刷新页面重试');
      return;
    }
    
    if (!formData.name) {
      setError('科目名称不能为空');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const chartData: ChartOfAccount = {
        workspace_id: workspace.id,
        code: formData.code || undefined,
        name: formData.name,
        type: formData.type as 'asset' | 'liability' | 'equity' | 'income' | 'expense',
        description: formData.description || undefined,
      };
      
      await createChartOfAccount(chartData);
      router.push('/chart-of-accounts');
    } catch (err) {
      console.error('Error creating chart of account:', err);
      setError('创建会计科目失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="mr-4"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">添加会计科目</h1>
        </div>

        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        <Card className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                  科目代码
                </label>
                <Input
                  id="code"
                  name="code"
                  value={formData.code || ''}
                  onChange={handleChange}
                  placeholder="例如：1000"
                />
              </div>
              
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  科目类型 <span className="text-red-500">*</span>
                </label>
                <Select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="asset">资产</option>
                  <option value="liability">负债</option>
                  <option value="equity">权益</option>
                  <option value="income">收入</option>
                  <option value="expense">支出</option>
                </Select>
              </div>
            </div>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                科目名称 <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                placeholder="输入科目名称"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                描述
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                placeholder="输入科目描述"
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
                取消
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? <Spinner size="sm" className="mr-2" /> : null}
                保存
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default NewChartOfAccountPage;
