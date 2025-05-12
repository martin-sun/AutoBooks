"use client";

import React, { useState, useEffect } from 'react';
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

export default function ChartOfAccountDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartOfAccount | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<ChartOfAccount>>({});
  const [activeTab, setActiveTab] = useState('details');
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  
  // 账户相关状态
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountFormData, setAccountFormData] = useState<Partial<Account>>({});
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingItem, setDeletingItem] = useState<{ id: string, type: 'chart' | 'account', name: string } | null>(null);

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

  // 加载会计科目和账户数据
  useEffect(() => {
    const loadData = async () => {
      if (!id || !workspaceId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // 获取所有会计科目以找到当前科目
        const allCharts = await fetchChartOfAccounts(workspaceId);
        const currentChart = allCharts.find(chart => chart.id === id);
        
        if (!currentChart) {
          setError('未找到指定的会计科目');
          return;
        }
        
        setChartData(currentChart);
        setFormData({
          code: currentChart.code,
          name: currentChart.name,
          type: currentChart.type,
          description: currentChart.description,
        });
        
        // 获取该科目下的所有账户
        const accountsData = await fetchAccounts(id);
        setAccounts(accountsData);
        
      } catch (err) {
        console.error('Error loading chart data:', err);
        setError('加载会计科目数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    if (workspaceId) {
      loadData();
    }
  }, [id, workspaceId]);

  // 处理表单变更
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 处理选择框变更
  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, type: value as 'asset' | 'liability' | 'equity' | 'income' | 'expense' }));
  };

  // 处理账户表单变更
  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAccountFormData(prev => ({ ...prev, [name]: value }));
  };

  // 处理账户选择框变更
  const handleAccountSelectChange = (name: string, value: string) => {
    setAccountFormData(prev => ({ ...prev, [name]: value }));
  };

  // 处理数字输入
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === '' ? undefined : parseFloat(value);
    setAccountFormData(prev => ({ ...prev, [name]: numValue }));
  };

  // 切换编辑模式
  const toggleEdit = () => {
    if (isEditing) {
      // 取消编辑，恢复原始数据
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

  // 保存会计科目更改
  const handleSave = async () => {
    if (!chartData?.id || !formData.name) return;
    
    try {
      setSaving(true);
      setError(null);
      
      await updateChartOfAccount(chartData.id, formData);
      
      // 更新本地数据
      setChartData(prev => prev ? { ...prev, ...formData } : null);
      setIsEditing(false);
      
    } catch (err) {
      console.error('Error updating chart of account:', err);
      setError('更新会计科目失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  // 添加/编辑账户
  const handleAccountAction = (account?: Account) => {
    if (account) {
      // 编辑现有账户
      setEditingAccountId(account.id || null);
      setAccountFormData({
        name: account.name,
        description: account.description,
        opening_balance: account.opening_balance,
        currency: account.currency || 'CAD',
      });
    } else {
      // 添加新账户
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

  // 保存账户
  const handleSaveAccount = async () => {
    if (!chartData?.id || !workspaceId || !accountFormData.name) return;
    
    try {
      setSaving(true);
      setError(null);
      
      if (editingAccountId) {
        // 更新现有账户
        const updatedAccount = await updateAccount(editingAccountId, accountFormData);
        
        // 更新本地账户列表
        setAccounts(prev => 
          prev.map(acc => acc.id === editingAccountId ? updatedAccount : acc)
        );
      } else {
        // 创建新账户
        const newAccountData: Account = {
          workspace_id: workspaceId,
          chart_id: chartData.id,
          name: accountFormData.name,
          description: accountFormData.description,
          opening_balance: accountFormData.opening_balance,
          currency: accountFormData.currency || 'CAD',
        };
        
        const newAccount = await createAccount(newAccountData);
        
        // 添加到本地账户列表
        setAccounts(prev => [...prev, newAccount]);
      }
      
      // 关闭模态框并重置表单
      setShowAccountModal(false);
      setAccountFormData({});
      setEditingAccountId(null);
      
    } catch (err) {
      console.error('Error saving account:', err);
      setError(editingAccountId ? '更新账户失败' : '创建账户失败');
    } finally {
      setSaving(false);
    }
  };

  // 确认删除对话框
  const confirmDelete = (id: string, type: 'chart' | 'account', name: string) => {
    setDeletingItem({ id, type, name });
    setShowDeleteDialog(true);
  };

  // 执行删除
  const handleDelete = async () => {
    if (!deletingItem) return;
    
    try {
      setSaving(true);
      
      if (deletingItem.type === 'chart') {
        // 删除会计科目
        await deleteChartOfAccount(deletingItem.id);
        router.push('/dashboard/chart-of-accounts');
      } else {
        // 删除账户
        await deleteAccount(deletingItem.id);
        // 更新本地账户列表
        setAccounts(prev => prev.filter(acc => acc.id !== deletingItem.id));
      }
      
      setShowDeleteDialog(false);
      setDeletingItem(null);
      
    } catch (err) {
      console.error('Error deleting item:', err);
      setError(`删除${deletingItem.type === 'chart' ? '会计科目' : '账户'}失败`);
    } finally {
      setSaving(false);
    }
  };

  // 返回上一页
  const handleBack = () => {
    router.push('/dashboard/chart-of-accounts');
  };

  // 根据类型获取对应的颜色和标签
  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'asset':
        return { color: 'bg-blue-100 text-blue-800', label: '资产' };
      case 'liability':
        return { color: 'bg-red-100 text-red-800', label: '负债' };
      case 'equity':
        return { color: 'bg-purple-100 text-purple-800', label: '权益' };
      case 'income':
        return { color: 'bg-green-100 text-green-800', label: '收入' };
      case 'expense':
        return { color: 'bg-yellow-100 text-yellow-800', label: '支出' };
      default:
        return { color: 'bg-gray-100 text-gray-800', label: type };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert variant="destructive">
          <AlertDescription>{error || '未找到指定的会计科目'}</AlertDescription>
        </Alert>
        <Button onClick={handleBack} className="mt-4">
          返回会计科目表
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
        <h1 className="text-2xl font-bold">{chartData.name}</h1>
        <Badge className={`ml-3 ${typeInfo.color}`}>
          {typeInfo.label}
        </Badge>
        <div className="flex-grow"></div>
        <div className="flex space-x-2">
          <Button
            variant={isEditing ? "outline" : "default"}
            onClick={toggleEdit}
            disabled={saving}
          >
            {isEditing ? '取消' : '编辑'}
          </Button>
          {isEditing && (
            <Button
              onClick={handleSave}
              disabled={saving}
            >
              {saving && <Spinner className="mr-2 h-4 w-4" />}
              保存
            </Button>
          )}
          <Button
            variant="destructive"
            onClick={() => confirmDelete(chartData.id!, 'chart', chartData.name)}
            disabled={saving}
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">科目详情</TabsTrigger>
          <TabsTrigger value="accounts">关联账户</TabsTrigger>
        </TabsList>
        
        <div className="mt-4">
          <TabsContent value="details">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      科目代码
                    </label>
                    {isEditing ? (
                      <Input
                        name="code"
                        value={formData.code || ''}
                        onChange={handleChange}
                        placeholder="例如：1000"
                      />
                    ) : (
                      <p className="text-gray-900">{chartData.code || '-'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      科目类型
                    </label>
                    {isEditing ? (
                      <Select
                        value={formData.type}
                        onChange={(e) => handleSelectChange(e.target.value)}
                        className="w-full"
                      >
                        <option value="asset">资产</option>
                        <option value="liability">负债</option>
                        <option value="equity">权益</option>
                        <option value="income">收入</option>
                        <option value="expense">支出</option>
                      </Select>
                    ) : (
                      <Badge className={typeInfo.color}>
                        {typeInfo.label}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    科目名称
                  </label>
                  {isEditing ? (
                    <Input
                      name="name"
                      value={formData.name || ''}
                      onChange={handleChange}
                      placeholder="输入科目名称"
                      required
                    />
                  ) : (
                    <p className="text-gray-900">{chartData.name}</p>
                  )}
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    描述
                  </label>
                  {isEditing ? (
                    <Textarea
                      name="description"
                      value={formData.description || ''}
                      onChange={handleChange}
                      placeholder="输入科目描述"
                      rows={3}
                    />
                  ) : (
                    <p className="text-gray-900">{chartData.description || '-'}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="accounts">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">关联账户</h2>
                  <Button onClick={() => handleAccountAction()} className="flex items-center">
                    <Plus className="w-4 h-4 mr-1" />
                    添加账户
                  </Button>
                </div>
                
                {accounts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">暂无关联账户</p>
                    <Button onClick={() => handleAccountAction()}>添加账户</Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>账户名称</TableHead>
                          <TableHead>描述</TableHead>
                          <TableHead>期初余额</TableHead>
                          <TableHead>货币</TableHead>
                          <TableHead>操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {accounts.map((account) => (
                          <TableRow key={account.id}>
                            <TableCell>{account.name}</TableCell>
                            <TableCell>{account.description || '-'}</TableCell>
                            <TableCell>{account.opening_balance?.toFixed(2) || '0.00'}</TableCell>
                            <TableCell>{account.currency || 'CAD'}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleAccountAction(account)}
                                  title="编辑"
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => confirmDelete(account.id!, 'account', account.name)}
                                  title="删除"
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
        </div>
      </Tabs>

      {/* 账户表单模态框 */}
      <Dialog open={showAccountModal} onOpenChange={setShowAccountModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAccountId ? '编辑账户' : '添加账户'}</DialogTitle>
            <DialogDescription>
              {editingAccountId 
                ? '修改账户信息' 
                : `为"${chartData.name}"科目添加新账户`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                账户名称 <span className="text-red-500">*</span>
              </label>
              <Input
                name="name"
                value={accountFormData.name || ''}
                onChange={handleAccountChange}
                placeholder="输入账户名称"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                描述
              </label>
              <Textarea
                name="description"
                value={accountFormData.description || ''}
                onChange={handleAccountChange}
                placeholder="输入账户描述"
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  期初余额
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
                  货币
                </label>
                <Select
                  value={accountFormData.currency || 'CAD'}
                  onChange={(e) => handleAccountSelectChange('currency', e.target.value)}
                  className="w-full"
                >
                  <option value="CAD">加元 (CAD)</option>
                  <option value="USD">美元 (USD)</option>
                  <option value="CNY">人民币 (CNY)</option>
                  <option value="EUR">欧元 (EUR)</option>
                  <option value="GBP">英镑 (GBP)</option>
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
              取消
            </Button>
            <Button
              onClick={handleSaveAccount}
              disabled={saving || !accountFormData.name}
            >
              {saving && <Spinner className="mr-2 h-4 w-4" />}
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              确认删除
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p>
              {deletingItem?.type === 'chart' 
                ? `确定要删除会计科目"${deletingItem?.name}"吗？此操作将同时删除所有关联的账户。` 
                : `确定要删除账户"${deletingItem?.name}"吗？`
              }
            </p>
            <p className="text-red-600 mt-2">此操作不可撤销。</p>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={saving}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={saving}
            >
              {saving && <Spinner className="mr-2 h-4 w-4" />}
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
