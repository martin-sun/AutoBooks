import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useWorkspace } from '@/lib/hooks/use-workspace';
import { fetchChartOfAccounts, ChartOfAccount } from '@/lib/api/chart-of-accounts';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { Plus as PlusIcon, Pencil as PencilIcon, Trash as TrashIcon } from 'lucide-react';
import Link from 'next/link';

const ChartOfAccountsPage: React.FC = () => {
  const router = useRouter();
  const { workspace } = useWorkspace();
  const [chartOfAccounts, setChartOfAccounts] = useState<ChartOfAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChartOfAccounts = async () => {
      if (!workspace?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await fetchChartOfAccounts(workspace.id);
        setChartOfAccounts(data);
      } catch (err) {
        console.error('Error loading chart of accounts:', err);
        setError('加载会计科目表失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    loadChartOfAccounts();
  }, [workspace?.id]);

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

  const handleAddNew = () => {
    router.push('/chart-of-accounts/new');
  };

  const handleEdit = (id: string) => {
    router.push(`/chart-of-accounts/${id}`);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">会计科目表</h1>
          <Button onClick={handleAddNew} className="flex items-center">
            <PlusIcon className="w-5 h-5 mr-1" />
            添加科目
          </Button>
        </div>

        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        <Card>
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Spinner size="lg" />
            </div>
          ) : chartOfAccounts.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-gray-500 mb-4">暂无会计科目，请添加新科目</p>
              <Button onClick={handleAddNew}>添加科目</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <Table.Head>
                  <Table.Row>
                    <Table.Cell>科目代码</Table.Cell>
                    <Table.Cell>科目名称</Table.Cell>
                    <Table.Cell>类型</Table.Cell>
                    <Table.Cell>描述</Table.Cell>
                    <Table.Cell>操作</Table.Cell>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  {chartOfAccounts.map((chart) => {
                    const typeInfo = getTypeInfo(chart.type);
                    return (
                      <Table.Row key={chart.id}>
                        <Table.Cell>{chart.code || '-'}</Table.Cell>
                        <Table.Cell>
                          <Link href={`/chart-of-accounts/${chart.id}`} className="text-blue-600 hover:underline">
                            {chart.name}
                          </Link>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge className={typeInfo.color}>
                            {typeInfo.label}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>{chart.description || '-'}</Table.Cell>
                        <Table.Cell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => chart.id && handleEdit(chart.id)}
                              title="编辑"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ChartOfAccountsPage;
