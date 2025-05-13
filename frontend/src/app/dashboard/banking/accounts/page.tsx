'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
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
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
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
import { useToast } from '@/components/ui/toast/use-toast';
import { 
  PlusCircle, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  CreditCard, 
  DollarSign, 
  Wallet 
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// 初始化 Supabase 客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 银行账户接口定义
interface BankAccount {
  id: string;
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

// 格式化货币函数
function formatCurrency(amount: number, currency: string = 'CAD'): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export default function BankAccountsPage() {
  const params = useParams();
  const workspace_id = params?.workspace_id as string;
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (workspace_id) {
      loadAccounts();
    }
  }, [workspace_id]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      
      // 使用 RPC 调用获取银行账户
      const { data, error } = await supabase.rpc('get_bank_accounts', {
        workspace_id_param: workspace_id
      });
      
      if (error) throw error;
      setAccounts(data || []);
    } catch (error: any) {
      console.error('Error loading accounts:', error.message);
      toast({
        title: '加载账户失败',
        description: '无法加载银行账户信息，请稍后再试。',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!accountToDelete) return;
    
    try {
      // 使用 RPC 调用删除银行账户
      const { error } = await supabase.rpc('delete_bank_account', {
        account_id_param: accountToDelete
      });
      
      if (error) throw error;
      
      setAccounts(accounts.filter(account => account.id !== accountToDelete));
      toast({
        title: '账户已删除',
        description: '银行账户已成功删除。',
      });
    } catch (error: any) {
      console.error('Error deleting account:', error.message);
      toast({
        title: '删除账户失败',
        description: '无法删除银行账户，请稍后再试。',
        variant: 'destructive',
      });
    } finally {
      setAccountToDelete(null);
    }
  };

  // 计算总余额
  const totalBalance = accounts.reduce((sum, account) => sum + account.current_balance, 0);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">银行账户概览</h1>
          <p className="text-muted-foreground">管理您的所有个人银行账户</p>
        </div>
        
        <Link href={`/dashboard/${workspace_id}/banking/accounts/new`}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            添加银行账户
          </Button>
        </Link>
      </div>

      {/* 摘要卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">总账户数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">{accounts.length}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">总余额</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">{formatCurrency(totalBalance, 'CAD')}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">活跃账户</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Wallet className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">
                {accounts.filter(account => account.is_active).length}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 账户表格 */}
      <Card>
        <CardHeader>
          <CardTitle>银行账户</CardTitle>
          <CardDescription>您的所有个人银行账户列表</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">暂无银行账户</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                您还没有添加任何银行账户。点击下方按钮添加您的第一个账户。
              </p>
              <Link href={`/dashboard/${workspace_id}/banking/accounts/new`}>
                <Button className="mt-4">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  添加银行账户
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>账户名称</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead className="text-right">当前余额</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">
                      <Link 
                        href={`/dashboard/${workspace_id}/banking/accounts/${account.id}`}
                        className="hover:underline"
                      >
                        {account.name}
                      </Link>
                      {account.description && (
                        <p className="text-xs text-muted-foreground">{account.description}</p>
                      )}
                    </TableCell>
                    <TableCell>{account.account_type}</TableCell>
                    <TableCell className="text-right">
                      <span className={account.current_balance < 0 ? 'text-destructive' : 'text-green-600'}>
                        {formatCurrency(account.current_balance, account.currency)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link href={`/dashboard/${workspace_id}/banking/accounts/${account.id}`}>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              查看详情
                            </DropdownMenuItem>
                          </Link>
                          <Link href={`/dashboard/${workspace_id}/banking/accounts/${account.id}/edit`}>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              编辑账户
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => setAccountToDelete(account.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            删除账户
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 删除确认对话框 */}
      <AlertDialog open={!!accountToDelete} onOpenChange={(open) => !open && setAccountToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除账户</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除此银行账户吗？此操作无法撤销，如果账户有交易记录，将会被标记为已删除但保留在系统中。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
