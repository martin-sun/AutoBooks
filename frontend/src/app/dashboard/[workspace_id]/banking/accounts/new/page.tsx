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

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define form schema
const formSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  description: z.string().optional(),
  chart_id: z.string().min(1, 'Please select an account type'),
  opening_balance: z.coerce.number().default(0),
  currency: z.string().min(3, 'Please select a currency').default('CAD'),
});

// Define form data type
type FormData = z.infer<typeof formSchema>;

// Chart of accounts interface definition
interface ChartOfAccount {
  id: string;
  name: string;
  type: string;
}

// Error interface definition
interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

export default function NewBankAccountPage() {
  const params = useParams();
  const workspace_id = params?.workspace_id as string;
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [chartAccounts, setChartAccounts] = useState<ChartOfAccount[]>([]);

  // Initialize form
  const form = useForm({
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
    // Load chart of accounts (asset type) for dropdown menu
    const loadChartAccounts = async () => {
      try {
        // Get chart of accounts for asset type
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
      } catch (error: unknown) {
        console.error('Error loading chart accounts:', (error as SupabaseError).message);
        toast({
          title: 'Failed to load account types',
          description: 'Unable to load account type information. Please try again later.',
          variant: 'destructive',
        });
      }
    };
    
    if (workspace_id) {
      loadChartAccounts();
    }
  }, [workspace_id, form, toast]);

  const onSubmit = async (values: FormData) => {
    try {
      setLoading(true);
      
      // Use RPC call to create bank account
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
        title: 'Account created successfully',
        description: 'Your bank account has been created successfully.',
      });
      
      // Redirect to account details page
      router.push(`/dashboard/${workspace_id}/banking/accounts/${data}`);
    } catch (error: unknown) {
      console.error('Error creating account:', (error as SupabaseError).message);
      toast({
        title: 'Failed to create account',
        description: 'Unable to create bank account. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center">
        <Link href={`/dashboard/${workspace_id}/banking/accounts`}>
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Add Bank Account</h1>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Create New Bank Account</CardTitle>
          <CardDescription>
            Add a new bank account to track your finances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Savings Account, Checking Account" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional information about the account" {...field} />
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
                    <FormLabel>Account Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account type" />
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
                      Select the asset type this account belongs to
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
                    <FormLabel>Opening Balance</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormDescription>
                      The starting balance of the account
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
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CAD">Canadian Dollar (CAD)</SelectItem>
                        <SelectItem value="USD">US Dollar (USD)</SelectItem>
                        <SelectItem value="CNY">Chinese Yuan (CNY)</SelectItem>
                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The currency used for this account
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2">
                <Link href={`/dashboard/${workspace_id}/banking/accounts`}>
                  <Button variant="outline" type="button">Cancel</Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading && <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>}
                  <Save className="mr-2 h-4 w-4" />
                  Save Account
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
