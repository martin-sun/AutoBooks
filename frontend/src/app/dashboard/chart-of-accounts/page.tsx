"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchChartOfAccounts, ChartOfAccount } from '@/lib/api/chart-of-accounts';
import { 
  Card, 
  CardContent 
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Plus, Pencil } from 'lucide-react';

export default function ChartOfAccountsPage() {
  const router = useRouter();
  const [chartOfAccounts, setChartOfAccounts] = useState<ChartOfAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

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

  useEffect(() => {
    const loadChartOfAccounts = async () => {
      if (!workspaceId) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await fetchChartOfAccounts(workspaceId);
        setChartOfAccounts(data);
      } catch (err) {
        console.error('Error loading chart of accounts:', err);
        setError('Failed to load chart of accounts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (workspaceId) {
      loadChartOfAccounts();
    }
  }, [workspaceId]);

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
    router.push('/dashboard/chart-of-accounts/new');
  };

  const handleEdit = (id: string) => {
    router.push(`/dashboard/chart-of-accounts/${id}`);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Chart of Accounts</h1>
        <Button onClick={handleAddNew} className="flex items-center">
          <Plus className="w-4 h-4 mr-1" />
          Add Account
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Spinner className="w-8 h-8" />
            </div>
          ) : chartOfAccounts.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-gray-500 mb-4">No accounts found. Please add a new account.</p>
              <Button onClick={handleAddNew}>Add Account</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chartOfAccounts.map((chart) => {
                    const typeInfo = getTypeInfo(chart.type);
                    return (
                      <TableRow key={chart.id}>
                        <TableCell>{chart.code || '-'}</TableCell>
                        <TableCell>
                          <Link href={`/dashboard/chart-of-accounts/${chart.id}`} className="text-blue-600 hover:underline">
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
                              title="编辑"
                            >
                              <Pencil className="w-4 h-4" />
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
        </CardContent>
      </Card>
    </div>
  );
}
