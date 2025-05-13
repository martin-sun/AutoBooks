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
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/Table';
import { useToast } from '@/components/ui/toast/use-toast';
import { Trash2, ArrowLeft, Edit, FileCheck, Upload, DollarSign } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
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
import { format } from 'date-fns';

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

// Transaction interface definition
interface Transaction {
  id: string;
  account_id: string;
  txn_date: string;
  description: string;
  amount: number;
  type: string;
  status: string;
  category: string | null;
  reference: string | null;
  notes: string | null;
  created_at: string;
}

// Currency formatting function
function formatCurrency(amount: number, currency: string = 'CAD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

// Date formatting function
function formatDate(dateString: string): string {
  return format(new Date(dateString), 'yyyy-MM-dd');
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
    if (accountId) {
      const loadAccountDetails = async () => {
        try {
          setIsLoading(true);
          const { data, error } = await supabase.rpc('get_bank_account_details', {
            account_id_param: accountId
          });
          if (error) throw error;
          setAccount(data || null);
        } catch (error: unknown) {
          console.error('Error loading account details:', (error as SupabaseError).message);
          toast({
            title: 'Failed to load account details',
            description: 'Unable to load account details. Please try again later.',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      };

      const loadTransactions = async () => {
        try {
          setIsLoading(true); 
          const { data, error } = await supabase.rpc('get_bank_account_transactions', {
            account_id_param: accountId
          });
          if (error) throw error;
          setTransactions(data || []);
        } catch (error: unknown) {
          console.error('Error loading transactions:', (error as SupabaseError).message);
          toast({
            title: 'Failed to load transactions',
            description: 'Unable to load account transactions. Please try again later.',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      loadAccountDetails();
      loadTransactions();
    }
    // supabase is an external constant and doesn't need to be in the dependency array
  }, [accountId, toast]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const { error } = await supabase.rpc('delete_bank_account', {
        account_id_param: accountId
      });
      
      if (error) throw error;
      
      toast({
        title: 'Account deleted',
        description: 'Bank account has been successfully deleted.',
      });
      
      router.push(`/dashboard/${workspaceId}/banking/accounts`);
    } catch (error: unknown) {
      console.error('Error deleting account:', (error as SupabaseError).message);
      toast({
        title: 'Failed to delete account',
        description: 'Unable to delete bank account. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setIsDialogOpen(false);
    }
  };

  if (isLoading || !account) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Loading account details...</p>
            </>
          ) : (
            <>
              <p className="text-lg font-medium">Account not found</p>
              <p className="text-muted-foreground">The requested account could not be found.</p>
            </>
          )}
          <Link href={`/dashboard/${workspaceId}/banking/accounts`}>
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Accounts
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/${workspaceId}/banking/accounts`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Accounts
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/${workspaceId}/banking/accounts/${accountId}/edit`)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
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
            Import
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDialogOpen(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Account Name</h3>
              <p className="text-lg">{account.name}</p>
            </div>
            {account.description && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p>{account.description}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Account Type</h3>
              <p>{account.account_type}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Current Balance</h3>
              <p className={`text-xl font-semibold ${account.current_balance < 0 ? 'text-destructive' : 'text-green-600'}`}>
                {formatCurrency(account.current_balance, account.currency)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Opening Balance</h3>
              <p>{formatCurrency(account.opening_balance, account.currency)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Currency</h3>
              <p>{account.currency}</p>
            </div>
            {account.last_reconciled_date && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Last Reconciled Date</h3>
                <p>{formatDate(account.last_reconciled_date)}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Created Date</h3>
              <p>{formatDate(account.created_at)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Showing the 20 most recent transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">This account has no transactions yet</p>
                <div className="mt-4 space-x-2">
                  <Link href={`/dashboard/${workspaceId}/banking/accounts/${accountId}/import`}>
                    <Button variant="outline" size="sm">
                      <Upload className="mr-2 h-4 w-4" />
                      Import Transactions
                    </Button>
                  </Link>
                  <Link href={`/dashboard/${workspaceId}/transactions/new?account_id=${accountId}`}>
                    <Button size="sm">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Add Transaction
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.txn_date)}</TableCell>
                      <TableCell>
                        <Link 
                          href={`/dashboard/${workspaceId}/transactions/${transaction.id}`}
                          className="hover:underline"
                        >
                          {transaction.description || 'No description'}
                        </Link>
                      </TableCell>
                      <TableCell>{transaction.type}</TableCell>
                      <TableCell className="text-right">
                        <span className={transaction.amount < 0 ? 'text-destructive' : 'text-green-600'}>
                          {formatCurrency(transaction.amount, account.currency)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.status === 'cleared' 
                            ? 'bg-green-100 text-green-800' 
                            : transaction.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {transaction.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete confirmation dialog */}
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
