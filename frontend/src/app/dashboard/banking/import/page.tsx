'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useToast } from '@/components/ui/toast/use-toast';
import { 
  RefreshCw, 
  ArrowRight, 
  Calendar, 
  DollarSign, 
  Store, 
  Tag, 
  CreditCard,
  Link,
  Check
} from 'lucide-react';
import { PlaidLink } from '@/components/banking/PlaidLink';
import { 
  getUnmatchedBankTransactions, 
  matchBankTransaction 
} from '@/lib/api/plaid-integration';
import { createClient } from '@supabase/supabase-js';

// 初始化 Supabase 客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 未匹配交易接口
interface UnmatchedTransaction {
  id: string;
  account_link_id: string;
  account_id: string;
  account_name: string;
  plaid_transaction_id: string;
  amount: number;
  date: string;
  name: string;
  merchant_name: string | null;
  category: string[] | null;
  imported_at: string;
}

// 账户接口
interface Account {
  id: string;
  name: string;
  account_type: string;
}

// 格式化货币
function formatCurrency(amount: number, currency: string = 'CAD'): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

// 格式化日期
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

export default function ImportTransactionsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params?.workspace_id as string;
  const [transactions, setTransactions] = useState<UnmatchedTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<UnmatchedTransaction | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [matchingTransaction, setMatchingTransaction] = useState<string | null>(null);
  const { toast } = useToast();

  // 加载未匹配的交易
  useEffect(() => {
    if (workspaceId) {
      loadTransactions();
      loadAccounts();
    }
  }, [workspaceId]);

  // 加载未匹配的交易
  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await getUnmatchedBankTransactions(workspaceId);
      setTransactions(data);
    } catch (error) {
      console.error('Error loading unmatched transactions:', error);
      toast({
        title: '加载未匹配交易失败',
        description: error.message || '请稍后再试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 加载账户
  const loadAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select(`
          id,
          name,
          chart_of_accounts!inner(type)
        `)
        .eq('workspace_id', workspaceId)
        .eq('is_deleted', false)
        .order('name');
      
      if (error) throw error;
      
      setAccounts(data.map(item => ({
        id: item.id,
        name: item.name,
        account_type: item.chart_of_accounts.type
      })));
    } catch (error) {
      console.error('Error loading accounts:', error);
      toast({
        title: '加载账户失败',
        description: error.message || '请稍后再试',
        variant: 'destructive'
      });
    }
  };

  // 打开匹配对话框
  const openMatchDialog = (transaction: UnmatchedTransaction) => {
    setSelectedTransaction(transaction);
    setDescription(transaction.merchant_name || transaction.name);
    
    // 根据交易类型预选账户
    const amount = transaction.amount;
    const suggestedType = amount > 0 ? 'income' : 'expense';
    
    const suggestedAccount = accounts.find(account => 
      account.account_type === suggestedType
    );
    
    if (suggestedAccount) {
      setSelectedAccountId(suggestedAccount.id);
    } else {
      setSelectedAccountId('');
    }
  };

  // 关闭匹配对话框
  const closeMatchDialog = () => {
    setSelectedTransaction(null);
    setSelectedAccountId('');
    setDescription('');
  };

  // 匹配交易
  const handleMatch = async () => {
    if (!selectedTransaction || !selectedAccountId) return;
    
    try {
      setMatchingTransaction(selectedTransaction.id);
      
      await matchBankTransaction(
        selectedTransaction.id,
        selectedAccountId,
        description
      );
      
      toast({
        title: '匹配成功',
        description: '银行交易已成功匹配到会计交易',
        variant: 'default'
      });
      
      // 从列表中移除已匹配的交易
      setTransactions(prev => 
        prev.filter(t => t.id !== selectedTransaction.id)
      );
      
      closeMatchDialog();
    } catch (error) {
      console.error('Error matching transaction:', error);
      toast({
        title: '匹配交易失败',
        description: error.message || '请稍后再试',
        variant: 'destructive'
      });
    } finally {
      setMatchingTransaction(null);
    }
  };

  // 前往银行连接页面
  const goToConnectPage = () => {
    router.push(`/dashboard/${workspaceId}/banking/connect`);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">导入交易</h1>
          <p className="text-muted-foreground">匹配和分类您的银行交易</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadTransactions}>
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
          <Button onClick={goToConnectPage}>
            <Link className="h-4 w-4 mr-2" />
            管理银行连接
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : transactions.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>没有未匹配的交易</CardTitle>
            <CardDescription>
              所有导入的银行交易都已匹配到会计交易
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="text-center mb-6">
              <p className="mb-4">您可以：</p>
              <ul className="text-left list-disc pl-6 mb-6">
                <li>连接新的银行账户</li>
                <li>同步现有的银行连接</li>
                <li>查看已匹配的交易</li>
              </ul>
            </div>
            <Button onClick={goToConnectPage}>
              <Link className="h-4 w-4 mr-2" />
              管理银行连接
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>未匹配的银行交易</CardTitle>
            <CardDescription>
              这些交易已从您的银行账户导入，但尚未匹配到会计交易
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>日期</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead>账户</TableHead>
                  <TableHead>类别</TableHead>
                  <TableHead className="text-right">金额</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map(transaction => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        {formatDate(transaction.date)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{transaction.merchant_name || transaction.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                        {transaction.account_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {transaction.category && transaction.category.length > 0 ? (
                        <div className="flex items-center">
                          <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                          {transaction.category[0]}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">未分类</span>
                      )}
                    </TableCell>
                    <TableCell className={`text-right ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openMatchDialog(transaction)}
                        disabled={matchingTransaction === transaction.id}
                      >
                        {matchingTransaction === transaction.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <ArrowRight className="h-4 w-4 mr-1" />
                            匹配
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* 匹配对话框 */}
      <Dialog open={!!selectedTransaction} onOpenChange={(open) => !open && closeMatchDialog()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>匹配银行交易</DialogTitle>
            <DialogDescription>
              选择要将此银行交易匹配到的会计账户
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">交易详情</span>
                    <span className={`font-medium ${selectedTransaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(selectedTransaction.amount)}
                    </span>
                  </div>
                  <Card className="p-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        {formatDate(selectedTransaction.date)}
                      </div>
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                        {selectedTransaction.account_name}
                      </div>
                      <div className="flex items-center col-span-2">
                        <Store className="h-4 w-4 mr-2 text-muted-foreground" />
                        {selectedTransaction.merchant_name || selectedTransaction.name}
                      </div>
                      {selectedTransaction.category && selectedTransaction.category.length > 0 && (
                        <div className="flex items-center col-span-2">
                          <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                          {selectedTransaction.category.join(' > ')}
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
                
                <div className="col-span-4">
                  <Label htmlFor="account">目标账户</Label>
                  <Select 
                    value={selectedAccountId} 
                    onValueChange={setSelectedAccountId}
                  >
                    <SelectTrigger id="account">
                      <SelectValue placeholder="选择账户" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">选择账户</SelectItem>
                      {accounts
                        .filter(account => account.account_type === 'income' || account.account_type === 'expense')
                        .map(account => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name} ({account.account_type === 'income' ? '收入' : '支出'})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="col-span-4">
                  <Label htmlFor="description">交易描述</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="输入交易描述"
                  />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={closeMatchDialog}>取消</Button>
            <Button 
              onClick={handleMatch} 
              disabled={!selectedAccountId || matchingTransaction !== null}
            >
              {matchingTransaction !== null ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  匹配中...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  确认匹配
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
