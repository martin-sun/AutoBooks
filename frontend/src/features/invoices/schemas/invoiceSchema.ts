import { z } from 'zod';

// 发票表单验证模式
export const invoiceFormSchema = z.object({
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
      id: z.string().optional(),
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

// 导出表单值类型
export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;
