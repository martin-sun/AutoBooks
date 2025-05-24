import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import { format } from 'date-fns';

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
  created_at: string;
  updated_at: string;
}

interface InvoiceDetailsProps {
  invoice: Invoice;
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
  return format(new Date(dateString), 'PPP');
}

export function InvoiceDetails({ invoice }: InvoiceDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Invoice Header */}
      <div className="flex flex-col md:flex-row justify-between">
        <div>
          <h2 className="text-3xl font-bold">Invoice #{invoice.invoice_number}</h2>
          <div className="mt-2 flex items-center">
            <InvoiceStatusBadge status={invoice.status} />
            <span className="ml-4 text-muted-foreground">
              Created: {formatDate(invoice.created_at)}
            </span>
          </div>
        </div>
        <div className="mt-4 md:mt-0 md:text-right">
          <div className="text-sm text-muted-foreground">Amount Due</div>
          <div className="text-3xl font-bold">
            {formatCurrency(invoice.balance_due, invoice.currency)}
          </div>
        </div>
      </div>

      {/* Invoice Info and Customer Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Invoice Date</div>
                <div>{formatDate(invoice.invoice_date)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Due Date</div>
                <div>{formatDate(invoice.due_date)}</div>
              </div>
              {invoice.purchase_order_number && (
                <div>
                  <div className="text-sm text-muted-foreground">PO Number</div>
                  <div>{invoice.purchase_order_number}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="font-medium">{invoice.customer_name}</div>
              {invoice.customer_email && (
                <div className="text-sm">{invoice.customer_email}</div>
              )}
              {invoice.customer_address && (
                <div className="text-sm whitespace-pre-line">
                  {invoice.customer_address}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>{formatCurrency(invoice.tax_amount, invoice.currency)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>{formatCurrency(invoice.total_amount, invoice.currency)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Paid:</span>
              <span>{formatCurrency(invoice.amount_paid, invoice.currency)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Balance Due:</span>
              <span>{formatCurrency(invoice.balance_due, invoice.currency)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {invoice.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-line">{invoice.notes}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
