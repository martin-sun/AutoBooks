import React from 'react';
import { Plus } from 'lucide-react';

export default function ChartOfAccountsHeader() {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Chart of Accounts</h1>
        <p className="text-gray-600 mt-1">
          Manage your financial accounts and categories
        </p>
      </div>
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
        onClick={() => alert('Add new account functionality will be implemented')}
      >
        <Plus className="h-5 w-5 mr-2" />
        Add a New Account
      </button>
    </div>
  );
}
