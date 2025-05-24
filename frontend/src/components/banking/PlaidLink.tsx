// Plaid Link 组件
'use client';

import { useState, useCallback, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/toast/use-toast';
import { getPlaidLinkToken, exchangePlaidToken } from '@/lib/api/plaid-integration';
import { Loader2, Link } from 'lucide-react';

interface PlaidLinkProps {
  workspaceId: string;
  onSuccess?: (connectionId: string) => void;
  onExit?: () => void;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export function PlaidLink({
  workspaceId,
  onSuccess,
  onExit,
  className,
  variant = 'default'
}: PlaidLinkProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  // 获取 Plaid Link Token
  useEffect(() => {
    const fetchLinkToken = async () => {
      try {
        setLoading(true);
        const token = await getPlaidLinkToken(workspaceId);
        setLinkToken(token);
      } catch (error) {
        console.error('Error fetching link token:', error);
        toast({
          title: '获取连接令牌失败',
          description: error.message || '请稍后再试',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    if (workspaceId) {
      fetchLinkToken();
    }
  }, [workspaceId, toast]);

  // 处理 Plaid Link 成功
  const handleSuccess = useCallback(
    async (publicToken: string, metadata: any) => {
      try {
        setLoading(true);
        
        // 交换公共令牌获取访问令牌并创建银行连接
        const result = await exchangePlaidToken(publicToken, workspaceId, metadata);
        
        toast({
          title: '银行账户连接成功',
          description: `已成功连接到 ${result.institution_name}，并链接了 ${result.linked_accounts.length} 个账户`,
          variant: 'default'
        });
        
        // 调用成功回调
        if (onSuccess) {
          onSuccess(result.connection_id);
        }
      } catch (error) {
        console.error('Error exchanging token:', error);
        toast({
          title: '银行账户连接失败',
          description: error.message || '请稍后再试',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    },
    [workspaceId, toast, onSuccess]
  );

  // 处理 Plaid Link 退出
  const handleExit = useCallback(() => {
    if (onExit) {
      onExit();
    }
  }, [onExit]);

  // 初始化 Plaid Link
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: handleSuccess,
    onExit: handleExit
  });

  // 处理按钮点击
  const handleClick = useCallback(() => {
    if (ready) {
      open();
    }
  }, [ready, open]);

  return (
    <Button
      onClick={handleClick}
      disabled={!ready || !linkToken || loading}
      className={className}
      variant={variant}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          连接中...
        </>
      ) : (
        <>
          <Link className="mr-2 h-4 w-4" />
          连接银行账户
        </>
      )}
    </Button>
  );
}
