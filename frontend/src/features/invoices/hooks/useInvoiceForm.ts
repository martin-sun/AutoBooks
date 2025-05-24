import { useState, useEffect } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/toast/use-toast';
import { useRouter } from 'next/navigation';
import { invoiceFormSchema, InvoiceFormValues } from '../schemas/invoiceSchema';
import { Customer, Product, InvoiceTemplate } from '../types';
import { createInvoice, getCustomers, getProducts, getInvoiceTemplates } from '../api';

interface UseInvoiceFormProps {
  workspaceId: string;
}

export function useInvoiceForm({ workspaceId }: UseInvoiceFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Default values for the form
  const defaultValues: Partial<InvoiceFormValues> = {
    invoice_date: new Date(),
    due_date: new Date(new Date().setDate(new Date().getDate() + 30)), // Default due date is 30 days from now
    currency: 'CAD',
    exchange_rate: 1,
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
  };

  // Initialize form
  const form: UseFormReturn<InvoiceFormValues> = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues,
  });

  // Setup field array for invoice lines
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "invoice_lines",
  });

  // Load customers, products, and templates
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load all data in parallel
        const [customersData, productsData, templatesData] = await Promise.all([
          getCustomers(workspaceId),
          getProducts(workspaceId),
          getInvoiceTemplates(workspaceId)
        ]);
        
        setCustomers(customersData || []);
        setProducts(productsData || []);
        setTemplates(templatesData || []);
      } catch (error: unknown) {
        console.error('Error loading data:', error);
        toast({
          title: 'Failed to load data',
          description: 'Unable to load necessary data. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  // Handle product selection
  const handleProductSelect = (productId: string, index: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      form.setValue(`invoice_lines.${index}.product_id`, productId);
      form.setValue(`invoice_lines.${index}.description`, product.description);
      form.setValue(`invoice_lines.${index}.unit_price`, product.price);
      form.setValue(`invoice_lines.${index}.tax_rate`, product.tax_rate);
      calculateLineAmount(index);
    }
  };

  // Calculate line amount when quantity or unit price changes
  const calculateLineAmount = (index: number) => {
    const quantity = form.getValues(`invoice_lines.${index}.quantity`) || 0;
    const unitPrice = form.getValues(`invoice_lines.${index}.unit_price`) || 0;
    const taxRate = form.getValues(`invoice_lines.${index}.tax_rate`) || 0;
    
    const subtotal = quantity * unitPrice;
    const taxAmount = subtotal * taxRate / 100;
    const lineAmount = subtotal + taxAmount;
    
    form.setValue(`invoice_lines.${index}.tax_amount`, taxAmount);
    form.setValue(`invoice_lines.${index}.line_amount`, lineAmount);
  };

  // Add new invoice line
  const addInvoiceLine = () => {
    append({
      description: '',
      quantity: 1,
      unit_price: 0,
      tax_rate: 0,
      tax_amount: 0,
      line_amount: 0,
    });
  };

  // Handle form submission
  const onSubmit = async (values: InvoiceFormValues) => {
    try {
      setSubmitting(true);
      
      // Format dates for API
      const formattedValues = {
        ...values,
        invoice_date: format(values.invoice_date, 'yyyy-MM-dd'),
        due_date: format(values.due_date, 'yyyy-MM-dd'),
        workspace_id: workspaceId,
      };
      
      // Call create_invoice function
      const invoiceId = await createInvoice(formattedValues);
      
      toast({
        title: 'Invoice created',
        description: 'Your invoice has been successfully created.',
      });
      
      // Redirect to invoice details page
      router.push(`/dashboard/${workspaceId}/invoices/${invoiceId}`);
      
    } catch (error: unknown) {
      console.error('Error creating invoice:', error);
      toast({
        title: 'Failed to create invoice',
        description: 'Unable to create invoice. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    form,
    fields,
    loading,
    submitting,
    customers,
    products,
    templates,
    handleProductSelect,
    calculateLineAmount,
    addInvoiceLine,
    removeInvoiceLine: remove,
    onSubmit,
    onCancel: () => router.push(`/dashboard/${workspaceId}/invoices`)
  };
}
