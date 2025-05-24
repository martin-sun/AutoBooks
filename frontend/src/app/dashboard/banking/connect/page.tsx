'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  RefreshCw, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ExternalLink 
} from 'lucide-react';
import { PlaidLink } from '@/components/banking/PlaidLink';
import { 
  getBankConnections, 
  getBankAccountLinks, 
  syncBankTransactions, 
  deleteBankConnection 
} from '@/lib/api/plaid-integration';

// 银行连接接口
interface BankConnection {
  id: string;
  institution_id: string;
  institution_name: string;
  status: string;
  error: string | null;
  last_synced_at: string | null;
  account_count: number;
  created_at: string;
}

// 银行账户链接接口
interface BankAccountLink {
  id: string;
  account_id: string;
  account_name: string;
  plaid_account_id: string;
  mask: string | null;
  official_name: string | null;
  type: string;
  subtype: string | null;
  sync_enabled: boolean;
  current_balance: number;
  currency: string;
}

// 格式化货币
function formatCurrency(amount: number, currency: string = 'CAD'): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

// 格式化日期时间
function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '从未';
  
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(date);
}

// 获取状态标签颜色
function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'text-green-600';
    case 'error':
      return 'text-red-600';
    case 'pending_expiration':
      return 'text-amber-600';
    default:
      return 'text-gray-600';
  }
}

// 获取状态图标
function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'active':
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case 'error':
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    case 'pending_expiration':
      return <Clock className="h-5 w-5 text-amber-600" />;
    default:
      return <AlertCircle className="h-5 w-5 text-gray-600" />;
  }
}

export default function BankConnectionsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params?.workspace_id as string;
  const [connections, setConnections] = useState<BankConnection[]>([]);
  const [accountLinks, setAccountLinks] = useState<Record<string, BankAccountLink[]>>({});
  const [expandedConnection, setExpandedConnection] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncingConnection, setSyncingConnection] = useState<string | null>(null);
  const [connectionToDelete, setConnectionToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  // 加载银行连接
  useEffect(() => {
    if (workspaceId) {
      loadConnections();
    }
  }, [workspaceId]);

  // 加载银行连接
  const loadConnections = async () => {
    try {
      setLoading(true);
      const data = await getBankConnections(workspaceId);
      setConnections(data);
    } catch (error) {
      console.error('Error loading bank connections:', error);
      toast({
        title: '加载银行连接失败',
        description: error.message || '请稍后再试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 加载银行账户链接
  const loadAccountLinks = async (connectionId: string) => {
    try {
      const data = await getBankAccountLinks(connectionId);
      setAccountLinks(prev => ({
        ...prev,
        [connectionId]: data
      }));
    } catch (error) {
      console.error('Error loading bank account links:', error);
      toast({
        title: '加载银行账户失败',
        description: error.message || '请稍后再试',
        variant: 'destructive'
      });
    }
  };

  // 切换展开/折叠连接
  const toggleConnection = async (connectionId: string) => {
    if (expandedConnection === connectionId) {
      setExpandedConnection(null);
    } else {
      setExpandedConnection(connectionId);
      if (!accountLinks[connectionId]) {
        await loadAccountLinks(connectionId);
      }
    }
  };

  // 同步银行交易
  const handleSync = async (connectionId: string) => {
    try {
      setSyncingConnection(connectionId);
      const result = await syncBankTransactions(connectionId);
      
      toast({
        title: '同步成功',
        description: `已导入 ${result.results.imported} 笔新交易，更新 ${result.results.updated} 笔现有交易`,
        variant: 'default'
      });
      
      // 重新加载连接和账户
      await loadConnections();
      if (expandedConnection === connectionId) {
        await loadAccountLinks(connectionId);
      }
    } catch (error) {
      console.error('Error syncing transactions:', error);
      toast({
        title: '同步交易失败',
        description: error.message || '请稍后再试',
        variant: 'destructive'
      });
    } finally {
      setSyncingConnection(null);
    }
  };

  // 删除银行连接
  const handleDelete = async () => {
    if (!connectionToDelete) return;
    
    try {
      await deleteBankConnection(connectionToDelete);
      
      toast({
        title: '删除成功',
        description: '银行连接已成功删除',
        variant: 'default'
      });
      
      // 重新加载连接
      await loadConnections();
      setExpandedConnection(null);
      setConnectionToDelete(null);
    } catch (error) {
      console.error('Error deleting bank connection:', error);
      toast({
        title: '删除银行连接失败',
        description: error.message || '请稍后再试',
        variant: 'destructive'
      });
    }
  };

  // 处理连接成功
  const handleConnectionSuccess = async (connectionId: string) => {
    await loadConnections();
    setExpandedConnection(connectionId);
    await loadAccountLinks(connectionId);
  };

  // 查看未匹配的交易
  const viewUnmatchedTransactions = () => {
    router.push(`/dashboard/${workspaceId}/banking/import`);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">银行连接</h1>
          <p className="text-muted-foreground">管理您的银行连接和账户</p>
        </div>
        <div className="flex gap-2">
          <PlaidLink 
            workspaceId={workspaceId} 
            onSuccess={handleConnectionSuccess}
          />
          <Button variant="outline" onClick={viewUnmatchedTransactions}>
            查看未匹配交易
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : connections.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>开始连接您的银行账户</CardTitle>
            <CardDescription>
              连接您的银行账户，自动导入交易并简化记账流程
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="text-center mb-6">
              <p className="mb-4">通过安全的 Plaid 连接，您可以：</p>
              <ul className="text-left list-disc pl-6 mb-6">
                <li>自动导入银行交易</li>
                <li>保持账户余额最新</li>
                <li>减少手动输入错误</li>
                <li>节省记账时间</li>
              </ul>
            </div>
            <PlaidLink 
              workspaceId={workspaceId} 
              onSuccess={handleConnectionSuccess}
              variant="default"
              className="w-full sm:w-auto"
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {connections.map(connection => (
            <Card key={connection.id} className="overflow-hidden">
              <CardHeader className="cursor-pointer" onClick={() => toggleConnection(connection.id)}>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <StatusIcon status={connection.status} />
                    <span className="ml-2">{connection.institution_name}</span>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${getStatusColor(connection.status)}`}>
                      {connection.status === 'active' ? '已连接' : 
                       connection.status === 'error' ? '连接错误' : 
                       connection.status === 'pending_expiration' ? '即将过期' : 
                       connection.status}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSync(connection.id);
                      }}
                      disabled={syncingConnection === connection.id}
                    >
                      <RefreshCw 
                        className={`h-4 w-4 ${syncingConnection === connection.id ? 'animate-spin' : ''}`} 
                      />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConnectionToDelete(connection.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {connection.account_count} 个账户 · 
                  最后同步: {formatDateTime(connection.last_synced_at)}
                </CardDescription>
              </CardHeader>
              
              {expandedConnection === connection.id && (
                <CardContent>
                  <h3 className="text-lg font-semibold mb-2">链接的账户</h3>
                  {!accountLinks[connection.id] ? (
                    <div className="flex justify-center items-center h-24">
                      <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : accountLinks[connection.id].length === 0 ? (
                    <p className="text-muted-foreground">没有链接的账户</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>账户名称</TableHead>
                          <TableHead>类型</TableHead>
                          <TableHead>账号末四位</TableHead>
                          <TableHead className="text-right">当前余额</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {accountLinks[connection.id].map(account => (
                          <TableRow key={account.id}>
                            <TableCell className="font-medium">{account.account_name}</TableCell>
                            <TableCell>
                              {account.type === 'depository' ? '存款账户' :
                               account.type === 'credit' ? '信用卡' :
                               account.type === 'loan' ? '贷款' :
                               account.type === 'investment' ? '投资账户' :
                               account.type}
                              {account.subtype && ` (${account.subtype})`}
                            </TableCell>
                            <TableCell>{account.mask || 'N/A'}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(account.current_balance, account.currency)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              )}
              
              {connection.error && expandedConnection === connection.id && (
                <CardFooter className="bg-red-50 dark:bg-red-950 p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-destructive">连接错误</p>
                      <p className="text-sm text-muted-foreground">{connection.error}</p>
                    </div>
                  </div>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* 删除确认对话框 */}
      <AlertDialog open={!!connectionToDelete} onOpenChange={(open) => !open && setConnectionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除这个银行连接吗？这将移除所有关联的账户链接，但不会删除已导入的交易。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
