'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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
import { PlusCircle, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Error interface definition
interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

// Bank account interface definition
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

// Currency formatting function
function formatCurrency(amount: number, currency: string = 'CAD'): string {
  return new Intl.NumberFormat('en-US', {
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
    const loadAccounts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.rpc('get_bank_accounts', {
          workspace_id_param: workspace_id
        });
        if (error) throw error;
        setAccounts(data || []);
      } catch (error: unknown) {
        console.error('Error loading accounts:', (error as SupabaseError).message);
        toast({
          title: 'Failed to load accounts',
          description: 'Unable to load bank account information. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace_id]);

  const handleDeleteAccount = async () => {
    if (!accountToDelete) return;
    
    try {
      // Use RPC call to delete bank account
      const { error } = await supabase.rpc('delete_bank_account', {
        account_id_param: accountToDelete
      });
      
      if (error) throw error;
      
      setAccounts(accounts.filter(account => account.id !== accountToDelete));
      toast({
        title: 'Account deleted',
        description: 'Bank account has been successfully deleted.',
      });
    } catch (error: any) {
      console.error('Error deleting account:', error.message);
      toast({
        title: 'Failed to delete account',
        description: 'Unable to delete bank account. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setAccountToDelete(null);
    }
  };

  // Calculate total balance
  const totalBalance = accounts.reduce((sum, account) => sum + account.current_balance, 0);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Bank Accounts Overview</h1>
          <p className="text-muted-foreground">Manage all your personal bank accounts</p>
        </div>
        
        <Link href={`/dashboard/${workspace_id}/banking/accounts/new`}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            添加银行账户
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
          <CardDescription>
            Total Balance: <span className={totalBalance < 0 ? 'text-destructive' : 'text-green-600 font-medium'}>
              {formatCurrency(totalBalance)}
            </span>
          </CardDescription>
          <CardDescription>Manage all your bank accounts</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-12">
              <Eye className="mx-auto h-12 w-12 text-muted-foreground" />
              <h2 className="text-lg font-medium">No Bank Accounts</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                You haven&apos;t added any bank accounts yet. Click the button below to add your first account.
              </p>
              <Link href={`/dashboard/${workspace_id}/banking/accounts/new`}>
                <Button className="mt-4">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Bank Account
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Current Balance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                              View Details
                            </DropdownMenuItem>
                          </Link>
                          <Link href={`/dashboard/${workspace_id}/banking/accounts/${account.id}/edit`}>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Account
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => setAccountToDelete(account.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Account
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

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!accountToDelete} onOpenChange={(open) => !open && setAccountToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Account Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this bank account? This action cannot be undone. If the account has transaction records, it will be marked as deleted but retained in the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
