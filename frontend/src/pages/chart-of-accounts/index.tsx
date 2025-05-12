import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useWorkspace } from '../../lib/hooks/useWorkspace';
import { fetchChartOfAccounts, ChartOfAccount } from '@/lib/api/chart-of-accounts';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableHeader
} from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { Plus as PlusIcon, Pencil as PencilIcon } from 'lucide-react';
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
        setError('Failed to load chart of accounts. Please try again later.');
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
          <h1 className="text-2xl font-bold">Chart of Accounts</h1>
          <Button onClick={handleAddNew} className="flex items-center">
            <PlusIcon className="w-5 h-5 mr-1" />
            Add Account
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
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
              <p className="text-gray-500 mb-4">No accounts found. Please add a new account.</p>
              <Button onClick={handleAddNew}>Add Account</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Account Code</TableHeader>
                    <TableHeader>Account Name</TableHeader>
                    <TableHeader>Type</TableHeader>
                    <TableHeader>Description</TableHeader>
                    <TableHeader>Actions</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {chartOfAccounts.map((chart) => {
                    const typeInfo = getTypeInfo(chart.type);
                    return (
                      <TableRow key={chart.id}>
                        <TableCell>{chart.code || '-'}</TableCell>
                        <TableCell>
                          <Link href={`/chart-of-accounts/${chart.id}`} className="text-blue-600 hover:underline">
                            {chart.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge className={typeInfo.color}>
                            {typeInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{chart.description || '-'}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => chart.id && handleEdit(chart.id)}
                              title="Edit"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ChartOfAccountsPage;
