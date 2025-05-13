'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/Table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { useToast } from '@/components/ui/toast/use-toast';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Download, 
  Upload, 
  RefreshCw, 
  Calendar,
  DollarSign,
  CreditCard
} from 'lucide-react';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { createClient } from '@supabase/supabase-js';

// 初始化 Supabase 客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 银行账户接口定义
interface BankAccount {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  account_type: string;
  opening_balance: number;
  current_balance: number;
  currency: string;
  is_active: boolean;
  last_reconciled_date: string | null;
  created_at: string;
  updated_at: string;
}

// 交易记录接口定义
interface Transaction {
  id: string;
  transaction_id: string;
  txn_date: string;
  description: string;
  amount: number;
  reference: string | null;
  created_at: string;
}

// 格式化货币函数
function formatCurrency(amount: number, currency: string = 'CAD'): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

// 格式化日期函数
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export default function BankAccountDetailsPage() {
  const params = useParams();
  const workspaceId = params?.workspace_id as string;
  const accountId = params?.id as string;
  const router = useRouter();
  const { toast } = useToast();
  const [account, setAccount] = useState<BankAccount | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (workspaceId && accountId) {
      loadAccountDetails();
      loadTransactions();
    }
  }, [workspaceId, accountId]);

  const loadAccountDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('id', accountId)
        .eq('workspace_id', workspaceId)
        .single();

      if (error) throw error;
      setAccount(data);
    } catch (error: any) {
      console.error('Error loading account details:', error.message);
      toast({
        title: 'Error',
        description: 'Failed to load account details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      setTransactionsLoading(true);
      
      // 使用 RPC 调用获取银行账户交易记录
      const { data, error } = await supabase.rpc('get_bank_account_transactions', {
        account_id_param: accountId,
        limit_param: 20,
        offset_param: 0
      });
      
      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      console.error('Error loading transactions:', error.message);
      toast({
        title: '加载交易记录失败',
        description: '无法加载账户交易记录，请稍后再试。',
        variant: 'destructive',
      });
    } finally {
      setTransactionsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Bank account has been deleted',
      });

      router.push(`/dashboard/${workspaceId}/banking/accounts`);
    } catch (error: any) {
      console.error('Error deleting account:', error.message);
      toast({
        title: 'Delete Failed',
        description: 'Could not delete bank account. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setIsDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold">账户未找到</h2>
          <p className="text-muted-foreground mt-2">无法找到请求的银行账户</p>
          <Link href={`/dashboard/${workspaceId}/banking/accounts`}>
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回账户列表
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href={`/dashboard/${workspaceId}/banking/accounts`}>
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{account.name}</h1>
            {account.description && (
              <p className="text-muted-foreground">{account.description}</p>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <Link href={`/dashboard/${workspaceId}/banking/accounts/${accountId}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              编辑
            </Button>
          </Link>
          <Button variant="destructive" onClick={() => setIsDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            删除
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/${workspaceId}/banking/accounts/${accountId}/reconcile`)}
          >
            <FileCheck className="w-4 h-4 mr-2" />
            Reconcile
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/${workspaceId}/banking/accounts/${accountId}/import`)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import Transactions
          </Button>
        </div>
      </div>

      {/* 账户摘要 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">当前余额</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">
                {formatCurrency(account.current_balance, account.currency)}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">账户类型</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">{account.account_type}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">初始余额</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">
                {formatCurrency(account.opening_balance, account.currency)}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">创建日期</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-primary mr-2" />
              <div className="text-lg font-bold">
                {formatDate(account.created_at)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 交易记录 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>交易记录</CardTitle>
              <CardDescription>最近的账户交易记录</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadTransactions}>
              <RefreshCw className="mr-2 h-4 w-4" />
              刷新
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Link href={`/dashboard/${workspaceId}/banking/accounts`}>
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Accounts
                  </Button>
                </Link>
              </div>

              <div className="flex items-center space-x-2">
                <Link href={`/dashboard/${workspaceId}/banking/accounts/${accountId}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Account
                  </Button>
                </Link>
                <Link href={`/dashboard/${workspaceId}/transactions/new`}>
                  <Button size="sm">
                    <DollarSign className="mr-2 h-4 w-4" />
                    添加交易
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>日期</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead>参考号</TableHead>
                  <TableHead className="text-right">金额</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{formatDate(transaction.txn_date)}</TableCell>
                    <TableCell>
                      <Link 
                        href={`/dashboard/${workspaceId}/transactions/${transaction.transaction_id}`}
                        className="hover:underline"
                      >
                        {transaction.description || '无描述'}
                      </Link>
                    </TableCell>
                    <TableCell>{transaction.reference || '-'}</TableCell>
                    <TableCell className="text-right">
                      <span className={transaction.amount < 0 ? 'text-destructive' : 'text-green-600'}>
                        {formatCurrency(transaction.amount, account.currency)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableCaption>
                <div className="flex justify-center">
                  <Button variant="link" size="sm">
                    查看更多交易
                  </Button>
                </div>
              </TableCaption>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 删除确认对话框 */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this bank account? This action cannot be undone, and all related transactions will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
