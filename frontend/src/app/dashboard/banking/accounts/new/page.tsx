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
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/Select';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { useToast } from '@/components/ui/toast/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// 初始化 Supabase 客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 定义表单模式
const formSchema = z.object({
  name: z.string().min(1, '账户名称不能为空'),
  description: z.string().optional(),
  chart_id: z.string().min(1, '请选择账户类型'),
  opening_balance: z.coerce.number().default(0),
  currency: z.string().min(3, '请选择货币').default('CAD'),
});

// 科目表接口定义
interface ChartOfAccount {
  id: string;
  name: string;
  type: string;
}

export default function NewBankAccountPage() {
  const params = useParams();
  const workspace_id = params?.workspace_id as string;
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [chartAccounts, setChartAccounts] = useState<ChartOfAccount[]>([]);

  // 初始化表单
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      chart_id: '',
      opening_balance: 0,
      currency: 'CAD',
    },
  });

  useEffect(() => {
    // 加载科目表（资产类型）用于下拉菜单
    const loadChartAccounts = async () => {
      try {
        // 获取资产类型的科目表
        const { data, error } = await supabase
          .from('chart_of_accounts')
          .select('id, name, type')
          .eq('workspace_id', workspace_id)
          .eq('type', 'asset')
          .eq('is_deleted', false);
          
        if (error) throw error;
        setChartAccounts(data || []);
        
        // 如果至少有一个账户，将其设为默认值
        if (data && data.length > 0) {
          form.setValue('chart_id', data[0].id);
        }
      } catch (error) {
        console.error('Error loading chart accounts:', error);
        toast({
          title: '加载账户类型失败',
          description: '无法加载账户类型信息，请稍后再试。',
          variant: 'destructive',
        });
      }
    };
    
    if (workspace_id) {
      loadChartAccounts();
    }
  }, [workspace_id, form, toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      
      // 使用 RPC 调用创建银行账户
      const { data, error } = await supabase.rpc('create_bank_account', {
        workspace_id_param: workspace_id,
        name_param: values.name,
        description_param: values.description || '',
        chart_id_param: values.chart_id,
        opening_balance_param: values.opening_balance,
        currency_param: values.currency
      });
      
      if (error) throw error;
      
      toast({
        title: '账户创建成功',
        description: '您的银行账户已成功创建。',
      });
      
      // 重定向到账户详情页面
      router.push(`/dashboard/${workspace_id}/banking/accounts/${data}`);
    } catch (error: any) {
      console.error('Error creating account:', error.message);
      toast({
        title: '创建账户失败',
        description: '无法创建银行账户，请稍后再试。',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center mb-6">
        <Link href={`/dashboard/${workspace_id}/banking/accounts`}>
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">添加银行账户</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>账户信息</CardTitle>
          <CardDescription>添加一个新的银行账户到您的个人财务</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>账户名称</FormLabel>
                    <FormControl>
                      <Input placeholder="例如：招商银行储蓄卡" {...field} />
                    </FormControl>
                    <FormDescription>
                      为您的账户起一个易于识别的名称
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>描述（可选）</FormLabel>
                    <FormControl>
                      <Textarea placeholder="账户的额外信息" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="chart_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>账户类型</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择账户类型" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {chartAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      选择此账户所属的资产类型
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="opening_balance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>初始余额</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormDescription>
                      账户的起始余额
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>货币</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择货币" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CAD">加元 (CAD)</SelectItem>
                        <SelectItem value="USD">美元 (USD)</SelectItem>
                        <SelectItem value="CNY">人民币 (CNY)</SelectItem>
                        <SelectItem value="EUR">欧元 (EUR)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      账户使用的货币类型
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2">
                <Link href={`/dashboard/${workspace_id}/banking/accounts`}>
                  <Button variant="outline" type="button">取消</Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading && <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>}
                  <Save className="mr-2 h-4 w-4" />
                  保存账户
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
