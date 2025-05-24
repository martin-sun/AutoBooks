import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';

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

interface InvoiceLineItemsProps {
  lineItems: InvoiceLineItem[];
  currency: string;
}

// Currency formatting function
function formatCurrency(amount: number, currency: string = 'CAD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function InvoiceLineItems({ lineItems, currency }: InvoiceLineItemsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Items</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Description</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Tax Rate</TableHead>
              <TableHead className="text-right">Tax Amount</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lineItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  {item.product_name && <div className="font-bold">{item.product_name}</div>}
                  <div className="whitespace-pre-line">{item.description}</div>
                </TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.unit_price, currency)}</TableCell>
                <TableCell className="text-right">{item.tax_rate}%</TableCell>
                <TableCell className="text-right">{formatCurrency(item.tax_amount, currency)}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.line_amount, currency)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
