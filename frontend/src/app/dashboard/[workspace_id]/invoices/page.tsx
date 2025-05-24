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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast/use-toast';
import { PlusCircle, MoreVertical, Edit, Trash2, Eye, FileText, Send, Download } from 'lucide-react';
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

// Invoice interface definition
interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  customer_name: string;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  currency: string;
  status: string;
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

// Date formatting function
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'bg-gray-200 text-gray-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Badge className={`${getStatusColor(status)} font-medium`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

export default function InvoicesPage() {
  const params = useParams();
  const workspace_id = params?.workspace_id as string;
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.rpc('get_invoices', {
          workspace_id_param: workspace_id
        });
        if (error) throw error;
        setInvoices(data || []);
      } catch (error: unknown) {
        console.error('Error loading invoices:', (error as SupabaseError).message);
        toast({
          title: 'Failed to load invoices',
          description: 'Unable to load invoice information. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace_id]);

  const handleDeleteInvoice = async () => {
    if (!invoiceToDelete) return;
    
    try {
      // Use RPC call to delete invoice
      const { error } = await supabase.rpc('delete_invoice', {
        invoice_id_param: invoiceToDelete
      });
      
      if (error) throw error;
      
      setInvoices(invoices.filter(invoice => invoice.id !== invoiceToDelete));
      toast({
        title: 'Invoice deleted',
        description: 'Invoice has been successfully deleted.',
      });
    } catch (error: any) {
      console.error('Error deleting invoice:', error.message);
      toast({
        title: 'Failed to delete invoice',
        description: 'Unable to delete invoice. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setInvoiceToDelete(null);
    }
  };

  const handleSendInvoice = async (invoiceId: string) => {
    try {
      // Use RPC call to send invoice
      const { error } = await supabase.rpc('send_invoice', {
        invoice_id_param: invoiceId
      });
      
      if (error) throw error;
      
      // Update the invoice status in the local state
      setInvoices(invoices.map(invoice => 
        invoice.id === invoiceId 
          ? { ...invoice, status: 'sent' } 
          : invoice
      ));
      
      toast({
        title: 'Invoice sent',
        description: 'Invoice has been successfully sent to the customer.',
      });
    } catch (error: any) {
      console.error('Error sending invoice:', error.message);
      toast({
        title: 'Failed to send invoice',
        description: 'Unable to send invoice. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  // Calculate total outstanding amount
  const totalOutstanding = invoices
    .filter(invoice => ['sent', 'overdue'].includes(invoice.status.toLowerCase()))
    .reduce((sum, invoice) => sum + invoice.total_amount, 0);

  // Count invoices by status
  const invoiceStats = {
    draft: invoices.filter(invoice => invoice.status.toLowerCase() === 'draft').length,
    sent: invoices.filter(invoice => invoice.status.toLowerCase() === 'sent').length,
    overdue: invoices.filter(invoice => invoice.status.toLowerCase() === 'overdue').length,
    paid: invoices.filter(invoice => invoice.status.toLowerCase() === 'paid').length,
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Manage your customer invoices
          </p>
        </div>
        <Link href={`/dashboard/${workspace_id}/invoices/new`}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Outstanding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalOutstanding)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Draft
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoiceStats.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unpaid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoiceStats.sent + invoiceStats.overdue}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoiceStats.paid}</div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
          <CardDescription>
            View and manage all your invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-10">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-medium">No invoices yet</h3>
              <p className="mt-1 text-muted-foreground">
                Get started by creating a new invoice.
              </p>
              <div className="mt-6">
                <Link href={`/dashboard/${workspace_id}/invoices/new`}>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Invoice
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      <Link 
                        href={`/dashboard/${workspace_id}/invoices/${invoice.id}`}
                        className="hover:underline"
                      >
                        {invoice.invoice_number}
                      </Link>
                    </TableCell>
                    <TableCell>{invoice.customer_name}</TableCell>
                    <TableCell>{formatDate(invoice.invoice_date)}</TableCell>
                    <TableCell>{formatDate(invoice.due_date)}</TableCell>
                    <TableCell>
                      {formatCurrency(invoice.total_amount, invoice.currency)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={invoice.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link href={`/dashboard/${workspace_id}/invoices/${invoice.id}`}>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                          </Link>
                          {invoice.status.toLowerCase() === 'draft' && (
                            <>
                              <Link href={`/dashboard/${workspace_id}/invoices/${invoice.id}/edit`}>
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Invoice
                                </DropdownMenuItem>
                              </Link>
                              <DropdownMenuItem onClick={() => handleSendInvoice(invoice.id)}>
                                <Send className="mr-2 h-4 w-4" />
                                Send to Customer
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </DropdownMenuItem>
                          {invoice.status.toLowerCase() === 'draft' && (
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => setInvoiceToDelete(invoice.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Invoice
                            </DropdownMenuItem>
                          )}
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
      <AlertDialog open={!!invoiceToDelete} onOpenChange={(open) => !open && setInvoiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Invoice Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this invoice? This action cannot be undone. Only draft invoices can be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteInvoice} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
