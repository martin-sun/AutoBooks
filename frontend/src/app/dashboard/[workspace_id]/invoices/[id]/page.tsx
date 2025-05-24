'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, Printer, Send, Download, CreditCard, FileText } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Import invoice components
import { InvoiceDetails } from '@/components/invoices/InvoiceDetails';
import { InvoiceLineItems } from '@/components/invoices/InvoiceLineItems';
import { InvoicePayments } from '@/components/invoices/InvoicePayments';
import { InvoiceActivities } from '@/components/invoices/InvoiceActivities';

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

// Invoice interface
interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  customer_name: string;
  customer_email?: string;
  customer_address?: string;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  currency: string;
  status: string;
  purchase_order_number?: string;
  notes?: string;
  internal_notes?: string;
  created_at: string;
  updated_at: string;
}

// Invoice Line Item interface
interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  product_id?: string;
  product_name?: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  tax_amount: number;
  line_amount: number;
}

// Invoice Payment interface
interface InvoicePayment {
  id: string;
  invoice_id: string;
  payment_date: string;
  amount: number;
  payment_method: string;
  reference_number?: string;
  notes?: string;
  created_at: string;
}

// Invoice Activity interface
interface InvoiceActivity {
  id: string;
  invoice_id: string;
  activity_type: string;
  description: string;
  performed_by: string;
  performed_by_name: string;
  created_at: string;
}

export default function InvoiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const workspace_id = params?.workspace_id as string;
  const invoice_id = params?.id as string;
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  const [payments, setPayments] = useState<InvoicePayment[]>([]);
  const [activities, setActivities] = useState<InvoiceActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmSendOpen, setConfirmSendOpen] = useState(false);
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    const loadInvoiceData = async () => {
      try {
        setLoading(true);
        
        // Load invoice details
        const { data: invoiceData, error: invoiceError } = await supabase.rpc('get_invoice', {
          invoice_id_param: invoice_id
        });
        
        if (invoiceError) throw invoiceError;
        if (!invoiceData || invoiceData.length === 0) {
          throw new Error('Invoice not found');
        }
        
        setInvoice(invoiceData[0]);
        
        // Load invoice line items
        const { data: lineItemsData, error: lineItemsError } = await supabase.rpc('get_invoice_lines', {
          invoice_id_param: invoice_id
        });
        
        if (lineItemsError) throw lineItemsError;
        setLineItems(lineItemsData || []);
        
        // Load invoice payments
        const { data: paymentsData, error: paymentsError } = await supabase.rpc('get_invoice_payments', {
          invoice_id_param: invoice_id
        });
        
        if (paymentsError) throw paymentsError;
        setPayments(paymentsData || []);
        
        // Load invoice activities
        const { data: activitiesData, error: activitiesError } = await supabase.rpc('get_invoice_activities', {
          invoice_id_param: invoice_id
        });
        
        if (activitiesError) throw activitiesError;
        setActivities(activitiesData || []);
        
      } catch (error: unknown) {
        console.error('Error loading invoice data:', (error as SupabaseError).message);
        toast({
          title: 'Failed to load invoice',
          description: 'Unable to load invoice information. Please try again later.',
          variant: 'destructive',
        });
        
        // Redirect back to invoices list if invoice not found
        if ((error as Error).message === 'Invoice not found') {
          router.push(`/dashboard/${workspace_id}/invoices`);
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (invoice_id) {
      loadInvoiceData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice_id, workspace_id]);

  const handleSendInvoice = async () => {
    try {
      setProcessing(true);
      
      // Call send_invoice function
      const { error } = await supabase.rpc('send_invoice', {
        invoice_id_param: invoice_id
      });
      
      if (error) throw error;
      
      // Update invoice status in local state
      if (invoice) {
        setInvoice({
          ...invoice,
          status: 'sent'
        });
        
        // Add new activity
        const newActivity = {
          id: Date.now().toString(), // Temporary ID
          invoice_id: invoice_id,
          activity_type: 'sent',
          description: 'Invoice was sent to customer',
          performed_by: 'current_user', // This will be replaced by the actual user ID on the server
          performed_by_name: 'You', // This will be replaced by the actual user name on the server
          created_at: new Date().toISOString()
        };
        
        setActivities([newActivity, ...activities]);
      }
      
      toast({
        title: 'Invoice sent',
        description: 'Invoice has been successfully sent to the customer.',
      });
      
    } catch (error: unknown) {
      console.error('Error sending invoice:', (error as SupabaseError).message);
      toast({
        title: 'Failed to send invoice',
        description: 'Unable to send invoice. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
      setConfirmSendOpen(false);
    }
  };

  const handleRecordPayment = async (paymentData: any) => {
    try {
      setProcessing(true);
      
      // Call record_invoice_payment function
      const { error } = await supabase.rpc('record_invoice_payment', {
        invoice_id_param: invoice_id,
        ...paymentData
      });
      
      if (error) throw error;
      
      // Reload invoice data to get updated status and payment information
      const { data: updatedInvoice, error: invoiceError } = await supabase.rpc('get_invoice', {
        invoice_id_param: invoice_id
      });
      
      if (invoiceError) throw invoiceError;
      if (updatedInvoice && updatedInvoice.length > 0) {
        setInvoice(updatedInvoice[0]);
      }
      
      // Reload payments
      const { data: updatedPayments, error: paymentsError } = await supabase.rpc('get_invoice_payments', {
        invoice_id_param: invoice_id
      });
      
      if (paymentsError) throw paymentsError;
      setPayments(updatedPayments || []);
      
      // Add new activity
      const newActivity = {
        id: Date.now().toString(), // Temporary ID
        invoice_id: invoice_id,
        activity_type: 'payment',
        description: `Payment of ${paymentData.amount} was recorded`,
        performed_by: 'current_user', // This will be replaced by the actual user ID on the server
        performed_by_name: 'You', // This will be replaced by the actual user name on the server
        created_at: new Date().toISOString()
      };
      
      setActivities([newActivity, ...activities]);
      
      toast({
        title: 'Payment recorded',
        description: 'Payment has been successfully recorded.',
      });
      
    } catch (error: unknown) {
      console.error('Error recording payment:', (error as SupabaseError).message);
      toast({
        title: 'Failed to record payment',
        description: 'Unable to record payment. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
      setRecordPaymentOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-10">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-medium">Invoice not found</h3>
          <p className="mt-1 text-muted-foreground">
            The invoice you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <div className="mt-6">
            <Link href={`/dashboard/${workspace_id}/invoices`}>
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Invoices
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center">
          <Link href={`/dashboard/${workspace_id}/invoices`} className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Invoice #{invoice.invoice_number}</h1>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {invoice.status === 'draft' && (
            <>
              <Button 
                variant="outline"
                onClick={() => router.push(`/dashboard/${workspace_id}/invoices/${invoice_id}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button 
                onClick={() => setConfirmSendOpen(true)}
                disabled={processing}
              >
                <Send className="mr-2 h-4 w-4" />
                Send to Customer
              </Button>
            </>
          )}
          
          {['sent', 'overdue', 'partially_paid'].includes(invoice.status.toLowerCase()) && (
            <Button 
              onClick={() => setRecordPaymentOpen(true)}
              disabled={processing}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          )}
          
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Main content */}
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-6">
          <InvoiceDetails invoice={invoice} />
          <InvoiceLineItems lineItems={lineItems} currency={invoice.currency} />
        </TabsContent>
        
        <TabsContent value="payments">
          <InvoicePayments payments={payments} currency={invoice.currency} />
        </TabsContent>
        
        <TabsContent value="activity">
          <InvoiceActivities activities={activities} />
        </TabsContent>
      </Tabs>

      {/* Send Invoice Confirmation Dialog */}
      <AlertDialog open={confirmSendOpen} onOpenChange={setConfirmSendOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              This will send the invoice to {invoice.customer_name}
              {invoice.customer_email && ` at ${invoice.customer_email}`}.
              Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSendInvoice}
              disabled={processing}
            >
              {processing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </div>
              ) : (
                'Send Invoice'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Record Payment Dialog - This would be a more complex form in a real implementation */}
      <AlertDialog open={recordPaymentOpen} onOpenChange={setRecordPaymentOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Record Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Record a payment for this invoice. In a real implementation, this would be a form with payment details.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleRecordPayment({
                payment_date: new Date().toISOString(),
                amount: invoice.balance_due,
                payment_method: 'Bank Transfer',
                reference_number: `REF-${Date.now()}`
              })}
              disabled={processing}
            >
              {processing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                'Record Payment'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
