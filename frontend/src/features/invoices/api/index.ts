import { createClient } from '@supabase/supabase-js';
import { Customer, Product, InvoiceTemplate } from '../types';
import { InvoiceFormValues } from '../schemas/invoiceSchema';

// 初始化 Supabase 客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 获取工作区内的所有客户
 * @param workspaceId 工作区ID
 * @returns 客户列表
 */
export async function getCustomers(workspaceId: string): Promise<Customer[]> {
  try {
    const { data, error } = await supabase.rpc('get_customers', {
      workspace_id_param: workspaceId
    });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
}

/**
 * 获取工作区内的所有产品和服务
 * @param workspaceId 工作区ID
 * @returns 产品和服务列表
 */
export async function getProducts(workspaceId: string): Promise<Product[]> {
  try {
    const { data, error } = await supabase.rpc('get_products_services', {
      workspace_id_param: workspaceId
    });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

/**
 * 获取工作区内的所有发票模板
 * @param workspaceId 工作区ID
 * @returns 发票模板列表
 */
export async function getInvoiceTemplates(workspaceId: string): Promise<InvoiceTemplate[]> {
  try {
    const { data, error } = await supabase.rpc('get_invoice_templates', {
      workspace_id_param: workspaceId
    });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching invoice templates:', error);
    throw error;
  }
}

/**
 * 创建新发票
 * @param invoiceData 发票数据
 * @returns 创建的发票ID
 */
// Define the type for the API invoice data with string dates and workspace_id
export interface CreateInvoiceParams extends Omit<InvoiceFormValues, 'invoice_date' | 'due_date'> {
  invoice_date: string;
  due_date: string;
  workspace_id: string;
}

/**
 * 创建新发票
 * @param invoiceData 发票数据
 * @returns 创建的发票ID
 */
export async function createInvoice(invoiceData: CreateInvoiceParams): Promise<string> {
  try {
    const { data, error } = await supabase.rpc('create_invoice', invoiceData);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
}
