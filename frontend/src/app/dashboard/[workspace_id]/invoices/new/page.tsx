'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/toast/use-toast';
import { CalendarIcon, Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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

// Form schema
const invoiceFormSchema = z.object({
  customer_id: z.string({
    required_error: "Please select a customer",
  }),
  template_id: z.string().optional(),
  invoice_date: z.date({
    required_error: "Invoice date is required",
  }),
  due_date: z.date({
    required_error: "Due date is required",
  }),
  currency: z.string().default('CAD'),
  exchange_rate: z.number().default(1),
  purchase_order_number: z.string().optional(),
  notes: z.string().optional(),
  internal_notes: z.string().optional(),
  invoice_lines: z.array(
    z.object({
      product_id: z.string().optional(),
      description: z.string().min(1, "Description is required"),
      quantity: z.number().min(0.01, "Quantity must be greater than 0"),
      unit_price: z.number().min(0, "Price cannot be negative"),
      tax_rate: z.number().min(0, "Tax rate cannot be negative"),
      tax_amount: z.number().min(0, "Tax amount cannot be negative"),
      line_amount: z.number().min(0, "Line amount cannot be negative"),
    })
  ).min(1, "At least one invoice line is required"),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

export default function NewInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const workspace_id = params?.workspace_id as string;
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
  const form = useForm<InvoiceFormValues>({
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
        
        // Load customers
        const { data: customersData, error: customersError } = await supabase.rpc('get_customers', {
          workspace_id_param: workspace_id
        });
        if (customersError) throw customersError;
        setCustomers(customersData || []);
        
        // Load products
        const { data: productsData, error: productsError } = await supabase.rpc('get_products_services', {
          workspace_id_param: workspace_id
        });
        if (productsError) throw productsError;
        setProducts(productsData || []);
        
        // Load invoice templates
        const { data: templatesData, error: templatesError } = await supabase.rpc('get_invoice_templates', {
          workspace_id_param: workspace_id
        });
        if (templatesError) throw templatesError;
        setTemplates(templatesData || []);
        
      } catch (error: unknown) {
        console.error('Error loading data:', (error as SupabaseError).message);
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
  }, [workspace_id]);

  // Handle product selection
  const handleProductSelect = (productId: string, index: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const currentLines = form.getValues('invoice_lines');
      const updatedLine = {
        ...currentLines[index],
        product_id: productId,
        description: product.description,
        unit_price: product.price,
        tax_rate: product.tax_rate,
        tax_amount: product.price * product.tax_rate / 100,
        line_amount: product.price + (product.price * product.tax_rate / 100)
      };
      
      const updatedLines = [...currentLines];
      updatedLines[index] = updatedLine;
      
      form.setValue('invoice_lines', updatedLines);
    }
  };

  // Calculate line amount when quantity or unit price changes
  const calculateLineAmount = (index: number) => {
    const currentLines = form.getValues('invoice_lines');
    const line = currentLines[index];
    
    const quantity = line.quantity || 0;
    const unitPrice = line.unit_price || 0;
    const taxRate = line.tax_rate || 0;
    
    const subtotal = quantity * unitPrice;
    const taxAmount = subtotal * taxRate / 100;
    const lineAmount = subtotal + taxAmount;
    
    const updatedLine = {
      ...line,
      tax_amount: taxAmount,
      line_amount: lineAmount
    };
    
    const updatedLines = [...currentLines];
    updatedLines[index] = updatedLine;
    
    form.setValue('invoice_lines', updatedLines);
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

  // Calculate invoice totals
  const calculateTotals = () => {
    const lines = form.getValues('invoice_lines');
    
    const subtotal = lines.reduce((sum, line) => {
      return sum + (line.quantity || 0) * (line.unit_price || 0);
    }, 0);
    
    const taxTotal = lines.reduce((sum, line) => {
      return sum + (line.tax_amount || 0);
    }, 0);
    
    const total = subtotal + taxTotal;
    
    return { subtotal, taxTotal, total };
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
        workspace_id: workspace_id,
      };
      
      // Call create_invoice function
      const { data, error } = await supabase.rpc('create_invoice', formattedValues);
      
      if (error) throw error;
      
      toast({
        title: 'Invoice created',
        description: 'Your invoice has been successfully created.',
      });
      
      // Redirect to invoice details page
      router.push(`/dashboard/${workspace_id}/invoices/${data}`);
      
    } catch (error: unknown) {
      console.error('Error creating invoice:', (error as SupabaseError).message);
      toast({
        title: 'Failed to create invoice',
        description: 'Unable to create invoice. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate current totals
  const { subtotal, taxTotal, total } = calculateTotals();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href={`/dashboard/${workspace_id}/invoices`} className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">New Invoice</h1>
            <p className="text-muted-foreground">
              Create a new invoice for your customer
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/dashboard/${workspace_id}/invoices`)}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={form.handleSubmit(onSubmit)}
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
                Save Invoice
              </>
            )}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Customer and Invoice Info */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Invoice Information</CardTitle>
                  <CardDescription>
                    Enter the basic invoice details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Customer Selection */}
                    <FormField
                      control={form.control}
                      name="customer_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a customer" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {customers.map((customer) => (
                                <SelectItem key={customer.id} value={customer.id}>
                                  {customer.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            <Link 
                              href={`/dashboard/${workspace_id}/customers/new`}
                              className="text-blue-600 hover:underline"
                            >
                              + Add new customer
                            </Link>
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Template Selection */}
                    <FormField
                      control={form.control}
                      name="template_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Invoice Template</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a template (optional)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {templates.map((template) => (
                                <SelectItem key={template.id} value={template.id}>
                                  {template.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Optional: Select an invoice template
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Invoice Date */}
                    <FormField
                      control={form.control}
                      name="invoice_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Invoice Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Due Date */}
                    <FormField
                      control={form.control}
                      name="due_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Due Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Currency */}
                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                              <SelectItem value="USD">USD - US Dollar</SelectItem>
                              <SelectItem value="EUR">EUR - Euro</SelectItem>
                              <SelectItem value="GBP">GBP - British Pound</SelectItem>
                              <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Purchase Order Number */}
                    <FormField
                      control={form.control}
                      name="purchase_order_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Purchase Order Number</FormLabel>
                          <FormControl>
                            <Input placeholder="PO-12345 (optional)" {...field} />
                          </FormControl>
                          <FormDescription>
                            Customer's purchase order number if applicable
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Invoice Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Tax:</span>
                    <span>${taxTotal.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between py-2 font-bold">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Invoice Lines */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Items</CardTitle>
                <CardDescription>
                  Add the products or services you're invoicing for
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-2 font-medium text-sm p-2 bg-muted rounded-md">
                    <div className="col-span-4">Description</div>
                    <div className="col-span-2">Quantity</div>
                    <div className="col-span-2">Unit Price</div>
                    <div className="col-span-1">Tax %</div>
                    <div className="col-span-2">Amount</div>
                    <div className="col-span-1"></div>
                  </div>

                  {/* Invoice Lines */}
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
                      {/* Product/Description */}
                      <div className="col-span-4 space-y-2">
                        <Select 
                          onValueChange={(value) => handleProductSelect(value, index)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a product/service" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <FormField
                          control={form.control}
                          name={`invoice_lines.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea 
                                  placeholder="Description" 
                                  className="resize-none" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Quantity */}
                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name={`invoice_lines.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  step="0.01" 
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(parseFloat(e.target.value) || 0);
                                    calculateLineAmount(index);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Unit Price */}
                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name={`invoice_lines.${index}.unit_price`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  step="0.01" 
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(parseFloat(e.target.value) || 0);
                                    calculateLineAmount(index);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Tax Rate */}
                      <div className="col-span-1">
                        <FormField
                          control={form.control}
                          name={`invoice_lines.${index}.tax_rate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  step="0.01" 
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(parseFloat(e.target.value) || 0);
                                    calculateLineAmount(index);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Line Amount */}
                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name={`invoice_lines.${index}.line_amount`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  step="0.01" 
                                  {...field}
                                  readOnly
                                  className="bg-muted"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Remove Button */}
                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Add Line Button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addInvoiceLine}
                    className="mt-2"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Line
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
                <CardDescription>
                  Add any additional information to your invoice
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Customer Notes */}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="These notes will be visible to the customer on the invoice" 
                            className="min-h-[100px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Internal Notes */}
                  <FormField
                    control={form.control}
                    name="internal_notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Internal Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="These notes are for internal reference only" 
                            className="min-h-[100px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => router.push(`/dashboard/${workspace_id}/invoices`)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
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
                      Save Invoice
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      )}
    </div>
  );
}
