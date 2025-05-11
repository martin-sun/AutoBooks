import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';

interface Account {
  id: string;
  name: string;
  balance: number;
}

interface AccountGroup {
  id: string;
  name: string;
  accounts: Account[];
}

interface AccountGroupListProps {
  accountGroups: AccountGroup[];
}

export default function AccountGroupList({ accountGroups }: AccountGroupListProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    accountGroups.reduce((acc, group) => ({ ...acc, [group.id]: true }), {})
  );

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {accountGroups.map((group) => (
        <div key={group.id} className="bg-white rounded-lg shadow">
          <div 
            className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
            onClick={() => toggleGroup(group.id)}
          >
            <div className="flex items-center">
              {expandedGroups[group.id] ? (
                <ChevronDown className="h-5 w-5 text-gray-500 mr-2" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-500 mr-2" />
              )}
              <h3 className="font-medium text-gray-800">{group.name}</h3>
            </div>
          </div>
          
          {expandedGroups[group.id] && (
            <div className="border-t border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {group.accounts.map((account) => (
                    <tr key={account.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {account.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-800">
                        {formatCurrency(account.balance)}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={2} className="px-6 py-3">
                      <button 
                        className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                        onClick={() => alert(`Add account to ${group.name} group`)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add a new account
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
