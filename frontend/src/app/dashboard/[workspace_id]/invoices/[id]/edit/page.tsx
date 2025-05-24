'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { useToast } from '@/components/ui/toast/use-toast';
import { CalendarIcon, Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/Calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover';
import { cn } from '@/lib/utils';

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

// Customer interface
interface Customer {
  id: string;
  name: string;
  email: string;
}

// Product/Service interface
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  tax_rate: number;
}

// Invoice Template interface
interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
}

// Invoice Line Item interface
interface InvoiceLineItem {
  id?: string;
  invoice_id?: string;
  product_id?: string;
  product_name?: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  tax_amount: number;
  line_amount: number;
}

// Form schema
const invoiceFormSchema = z.object({
  customer_id: z.string({
    required_error: "请选择客户",
  }),
  template_id: z.string().optional(),
  invoice_date: z.date({
    required_error: "发票日期是必填项",
  }),
  due_date: z.date({
    required_error: "到期日期是必填项",
  }),
  currency: z.string().default('CAD'),
  exchange_rate: z.number().default(1),
  purchase_order_number: z.string().optional(),
  notes: z.string().optional(),
  internal_notes: z.string().optional(),
  invoice_lines: z.array(
    z.object({
      id: z.string().optional(),
      product_id: z.string().optional(),
      description: z.string().min(1, "描述是必填项"),
      quantity: z.number().min(0.01, "数量必须大于0"),
      unit_price: z.number().min(0, "价格不能为负数"),
      tax_rate: z.number().min(0, "税率不能为负数"),
      tax_amount: z.number().min(0, "税额不能为负数"),
      line_amount: z.number().min(0, "行金额不能为负数"),
    })
  ).min(1, "至少需要一个发票行项目"),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const workspaceId = params.workspace_id as string;
  const invoiceId = params.id as string;
  
  // State for data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<SupabaseError | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [invoice, setInvoice] = useState<any>(null);
  const [invoiceLines, setInvoiceLines] = useState<InvoiceLineItem[]>([]);

  // Form
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      customer_id: '',
      template_id: '',
      invoice_date: new Date(),
      due_date: new Date(),
      currency: 'CAD',
      exchange_rate: 1,
      purchase_order_number: '',
      notes: '',
      internal_notes: '',
      invoice_lines: [
        {
          description: '',
          quantity: 1,
          unit_price: 0,
          tax_rate: 0,
          tax_amount: 0,
          line_amount: 0,
        },
      ],
    },
  });

  // Get the invoice lines field array
  const { fields, append, remove } = useFieldArray({
    name: 'invoice_lines',
    control: form.control,
  });

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase.rpc('get_customers', {
        workspace_id_param: workspaceId,
      });

      if (error) {
        throw error;
      }

      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError(error as SupabaseError);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.rpc('get_products', {
        workspace_id_param: workspaceId,
      });

      if (error) {
        throw error;
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error as SupabaseError);
    }
  };

  // Fetch templates
  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase.rpc('get_invoice_templates', {
        workspace_id_param: workspaceId,
      });

      if (error) {
        throw error;
      }

      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  // Fetch invoice and invoice lines
  const fetchInvoice = async () => {
    try {
      setLoading(true);
      
      // Fetch invoice
      const { data: invoiceData, error: invoiceError } = await supabase.rpc('get_invoice_by_id', {
        invoice_id_param: invoiceId,
        workspace_id_param: workspaceId,
      });

      if (invoiceError) {
        throw invoiceError;
      }

      if (!invoiceData || invoiceData.length === 0) {
        throw new Error('Invoice not found');
      }

      setInvoice(invoiceData[0]);

      // Fetch invoice lines
      const { data: linesData, error: linesError } = await supabase.rpc('get_invoice_lines', {
        invoice_id_param: invoiceId,
      });

      if (linesError) {
        throw linesError;
      }

      setInvoiceLines(linesData || []);
      
      // Set form values
      const invoiceItem = invoiceData[0];
      form.reset({
        customer_id: invoiceItem.customer_id,
        template_id: invoiceItem.template_id || '',
        invoice_date: new Date(invoiceItem.invoice_date),
        due_date: new Date(invoiceItem.due_date),
        currency: invoiceItem.currency,
        exchange_rate: invoiceItem.exchange_rate,
        purchase_order_number: invoiceItem.purchase_order_number || '',
        notes: invoiceItem.notes || '',
        internal_notes: invoiceItem.internal_notes || '',
        invoice_lines: linesData.map((line: any) => ({
          id: line.id,
          product_id: line.product_id || '',
          description: line.description,
          quantity: line.quantity,
          unit_price: line.unit_price,
          tax_rate: line.tax_rate,
          tax_amount: line.tax_amount,
          line_amount: line.line_amount,
        })),
      });
    } catch (error) {
      console.error('Error fetching invoice:', error);
      setError(error as SupabaseError);
      toast({
        title: 'Error',
        description: `Failed to load invoice: ${(error as SupabaseError).message}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchCustomers(), fetchProducts(), fetchTemplates(), fetchInvoice()]);
      } catch (error) {
        console.error('Error loading data:', error);
        setError(error as SupabaseError);
        // Load invoice details
        const { data: invoiceData, error: invoiceError } = await supabase.rpc('get_invoice', {
          invoice_id_param: invoice_id
        });
        
        if (invoiceError) throw invoiceError;
        if (!invoiceData || invoiceData.length === 0) {
          throw new Error('Invoice not found');
        }
        
        const invoice = invoiceData[0];
        
        // Check if invoice is editable (only draft invoices can be edited)
        if (invoice.status.toLowerCase() !== 'draft') {
          toast({
            title: 'Cannot edit invoice',
            description: 'Only draft invoices can be edited.',
            variant: 'destructive',
          });
          router.push(`/dashboard/${workspace_id}/invoices/${invoice_id}`);
          return;
        }
        
        // Load invoice line items
        const { data: lineItemsData, error: lineItemsError } = await supabase.rpc('get_invoice_lines', {
          invoice_id_param: invoice_id
        });
        
        if (lineItemsError) throw lineItemsError;
        
        // In a real implementation, we would populate the form with this data
        console.log('Invoice data loaded:', invoice, lineItemsData);
        
        // Note: For brevity, we're not implementing the full form here
        // In a real implementation, this would populate a form similar to the new invoice page
        
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

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      // In a real implementation, this would update the invoice with form data
      toast({
        title: 'Invoice updated',
        description: 'Your invoice has been successfully updated.',
      });
      
      // Redirect to invoice details page
      router.push(`/dashboard/${workspace_id}/invoices/${invoice_id}`);
      
    } catch (error: unknown) {
      console.error('Error updating invoice:', (error as SupabaseError).message);
      toast({
        title: 'Failed to update invoice',
        description: 'Unable to update invoice. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
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

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href={`/dashboard/${workspace_id}/invoices/${invoice_id}`} className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Invoice</h1>
            <p className="text-muted-foreground">
              Update invoice details
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/dashboard/${workspace_id}/invoices/${invoice_id}`)}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Invoice Form</CardTitle>
          <CardDescription>
            This is a placeholder for the edit invoice form. In a real implementation, this would be a form similar to the new invoice page, pre-populated with the existing invoice data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-muted-foreground">
            Form fields would go here, similar to the new invoice page.
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/dashboard/${workspace_id}/invoices/${invoice_id}`)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
