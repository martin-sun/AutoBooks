// 定义发票相关的类型

// Supabase错误接口
export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

// 客户接口
export interface Customer {
  id: string;
  name: string;
  email: string;
}

// 产品/服务接口
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  tax_rate: number;
}

// 发票模板接口
export interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
}

// 发票行项目接口
export interface InvoiceLineItem {
  id?: string;
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  tax_amount: number;
  line_amount: number;
}

// 发票接口
export interface Invoice {
  id: string;
  workspace_id: string;
  customer_id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  status: string;
  currency: string;
  exchange_rate: number;
  template_id?: string;
  purchase_order_number?: string;
  notes?: string;
  internal_notes?: string;
  created_at: string;
  updated_at: string;
}
