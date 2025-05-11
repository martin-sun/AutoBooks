import React from 'react';
import ChartOfAccountsHeader from '@/components/accounting/ChartOfAccountsHeader';
import AccountTypesTabs from '@/components/accounting/AccountTypesTabs';
import AccountGroupList from '@/components/accounting/AccountGroupList';

// Mock data for account types and groups
const accountTypes = [
  { id: 'assets', name: 'Assets' },
  { id: 'liabilities', name: 'Liabilities & Credit Cards' },
  { id: 'income', name: 'Income' },
  { id: 'expenses', name: 'Expenses' },
  { id: 'equity', name: 'Equity' },
];

// Mock data for account groups by type
const accountGroupsByType = {
  assets: [
    {
      id: 'cash-bank',
      name: 'Cash and Bank',
      accounts: [
        { id: '1001', name: 'Checking Account', balance: 5000.00 },
        { id: '1002', name: 'Savings Account', balance: 15000.00 },
      ]
    },
    {
      id: 'accounts-receivable',
      name: 'Accounts Receivable',
      accounts: [
        { id: '1101', name: 'Accounts Receivable', balance: 2500.00 },
      ]
    },
    {
      id: 'inventory',
      name: 'Inventory',
      accounts: [
        { id: '1201', name: 'Inventory Asset', balance: 7500.00 },
      ]
    },
  ],
  liabilities: [
    {
      id: 'accounts-payable',
      name: 'Accounts Payable',
      accounts: [
        { id: '2001', name: 'Accounts Payable', balance: 1800.00 },
      ]
    },
    {
      id: 'credit-cards',
      name: 'Credit Cards',
      accounts: [
        { id: '2101', name: 'Business Credit Card', balance: 750.00 },
      ]
    },
  ],
  income: [
    {
      id: 'sales-revenue',
      name: 'Sales Revenue',
      accounts: [
        { id: '4001', name: 'Sales', balance: 25000.00 },
        { id: '4002', name: 'Service Revenue', balance: 10000.00 },
      ]
    },
    {
      id: 'other-income',
      name: 'Other Income',
      accounts: [
        { id: '4901', name: 'Interest Income', balance: 250.00 },
      ]
    },
  ],
  expenses: [
    {
      id: 'operating-expenses',
      name: 'Operating Expenses',
      accounts: [
        { id: '5001', name: 'Rent Expense', balance: 2000.00 },
        { id: '5002', name: 'Utilities', balance: 450.00 },
        { id: '5003', name: 'Office Supplies', balance: 350.00 },
      ]
    },
    {
      id: 'payroll-expenses',
      name: 'Payroll Expenses',
      accounts: [
        { id: '5101', name: 'Salaries and Wages', balance: 8500.00 },
        { id: '5102', name: 'Employee Benefits', balance: 1200.00 },
      ]
    },
  ],
  equity: [
    {
      id: 'owner-equity',
      name: 'Owner Equity',
      accounts: [
        { id: '3001', name: 'Owner Investment', balance: 20000.00 },
        { id: '3002', name: 'Retained Earnings', balance: 15000.00 },
      ]
    },
  ],
};

export default function ChartOfAccountsPage() {
  const [activeTab, setActiveTab] = React.useState('assets');
  
  return (
    <div className="space-y-6">
      <ChartOfAccountsHeader />
      
      <AccountTypesTabs 
        accountTypes={accountTypes} 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <AccountGroupList 
        accountGroups={accountGroupsByType[activeTab as keyof typeof accountGroupsByType] || []} 
      />
    </div>
  );
}
