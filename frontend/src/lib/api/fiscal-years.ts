import { supabase } from '../supabase-client';

// Define fiscal year type
export interface FiscalYear {
  id?: string;
  workspace_id: string;
  start_date: string;
  end_date: string;
  name: string;
  status: 'active' | 'closed' | 'filed';
  is_current: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * 获取工作空间的所有财政年度
 */
export async function fetchFiscalYears(workspaceId: string): Promise<FiscalYear[]> {
  const { data, error } = await supabase
    .from('fiscal_years')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('start_date', { ascending: false });
  
  if (error) {
    console.error('Error fetching fiscal years:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * 获取工作空间的当前财政年度
 */
export async function fetchCurrentFiscalYear(workspaceId: string): Promise<FiscalYear | null> {
  const { data, error } = await supabase
    .from('fiscal_years')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('is_current', true)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') { // 没有匹配记录
      return null;
    }
    console.error('Error fetching current fiscal year:', error);
    throw error;
  }
  
  return data;
}

/**
 * 获取特定财政年度
 */
export async function fetchFiscalYear(fiscalYearId: string): Promise<FiscalYear> {
  const { data, error } = await supabase
    .from('fiscal_years')
    .select('*')
    .eq('id', fiscalYearId)
    .single();
  
  if (error) {
    console.error('Error fetching fiscal year:', error);
    throw error;
  }
  
  return data;
}

/**
 * 创建新的财政年度
 */
export async function createFiscalYear(fiscalYearData: FiscalYear): Promise<FiscalYear> {
  const { data, error } = await supabase
    .from('fiscal_years')
    .insert(fiscalYearData)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating fiscal year:', error);
    throw error;
  }
  
  return data;
}

/**
 * 更新财政年度
 */
export async function updateFiscalYear(
  fiscalYearId: string, 
  fiscalYearData: Partial<FiscalYear>
): Promise<FiscalYear> {
  const { data, error } = await supabase
    .from('fiscal_years')
    .update(fiscalYearData)
    .eq('id', fiscalYearId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating fiscal year:', error);
    throw error;
  }
  
  return data;
}

/**
 * 设置当前财政年度
 */
export async function setCurrentFiscalYear(
  workspaceId: string,
  fiscalYearId: string
): Promise<void> {
  // 先将所有财政年度设置为非当前
  const { error: resetError } = await supabase
    .from('fiscal_years')
    .update({ is_current: false })
    .eq('workspace_id', workspaceId);
    
  if (resetError) {
    console.error('Error resetting current fiscal years:', resetError);
    throw resetError;
  }
  
  // 然后设置指定的财政年度为当前
  const { error } = await supabase
    .from('fiscal_years')
    .update({ is_current: true })
    .eq('id', fiscalYearId)
    .eq('workspace_id', workspaceId);
  
  if (error) {
    console.error('Error setting current fiscal year:', error);
    throw error;
  }
}

/**
 * 删除财政年度
 */
export async function deleteFiscalYear(fiscalYearId: string): Promise<void> {
  const { error } = await supabase
    .from('fiscal_years')
    .delete()
    .eq('id', fiscalYearId);
  
  if (error) {
    console.error('Error deleting fiscal year:', error);
    throw error;
  }
}

/**
 * 自动创建初始财政年度
 */
export async function setupInitialFiscalYear(
  workspaceId: string,
  fiscalYearEnd: string = '12-31'
): Promise<FiscalYear> {
  // 检查是否已有财政年度
  const existingYears = await fetchFiscalYears(workspaceId);
  if (existingYears.length > 0) {
    // 已有财政年度，返回当前财政年度或最新的一个
    const currentYear = existingYears.find(y => y.is_current) || existingYears[0];
    return currentYear;
  }
  
  const today = new Date();
  const [endMonth, endDay] = fiscalYearEnd.split('-').map(Number);
  
  // 计算当前财政年度的起止日期
  let startDate: Date, endDate: Date;
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();
  
  if (currentMonth > endMonth || (currentMonth === endMonth && currentDay > endDay)) {
    // 如果当前日期已过财年结束日，则创建本年度财年
    startDate = new Date(today.getFullYear(), endMonth - 1, endDay + 1);
    startDate.setFullYear(startDate.getFullYear() - 1);
    endDate = new Date(today.getFullYear(), endMonth - 1, endDay);
  } else {
    // 否则创建上一年度财年
    startDate = new Date(today.getFullYear() - 1, endMonth - 1, endDay + 1);
    startDate.setFullYear(startDate.getFullYear() - 1);
    endDate = new Date(today.getFullYear() - 1, endMonth - 1, endDay);
  }
  
  const fiscalYearData: FiscalYear = {
    workspace_id: workspaceId,
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0],
    name: `FY ${startDate.getFullYear()}-${endDate.getFullYear()}`,
    status: 'active',
    is_current: true
  };
  
  return createFiscalYear(fiscalYearData);
}

/**
 * 更新工作空间的财政年度设置
 */
export async function updateWorkspaceFiscalYearSettings(
  workspaceId: string,
  defaultFiscalYearEnd: string,
  fiscalYearStartMonth: number
): Promise<void> {
  const { error } = await supabase
    .from('workspaces')
    .update({
      default_fiscal_year_end: defaultFiscalYearEnd,
      fiscal_year_start_month: fiscalYearStartMonth
    })
    .eq('id', workspaceId);
  
  if (error) {
    console.error('Error updating workspace fiscal year settings:', error);
    throw error;
  }
}

/**
 * 获取工作空间的财政年度设置
 */
export async function fetchWorkspaceFiscalYearSettings(workspaceId: string): Promise<{
  default_fiscal_year_end: string;
  fiscal_year_start_month: number;
}> {
  const { data, error } = await supabase
    .from('workspaces')
    .select('default_fiscal_year_end, fiscal_year_start_month')
    .eq('id', workspaceId)
    .single();
  
  if (error) {
    console.error('Error fetching workspace fiscal year settings:', error);
    throw error;
  }
  
  return {
    default_fiscal_year_end: data.default_fiscal_year_end || '12-31',
    fiscal_year_start_month: data.fiscal_year_start_month || 1
  };
}
