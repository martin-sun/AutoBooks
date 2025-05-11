import React from 'react';

interface AccountType {
  id: string;
  name: string;
}

interface AccountTypesTabsProps {
  accountTypes: AccountType[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function AccountTypesTabs({ 
  accountTypes, 
  activeTab, 
  onTabChange 
}: AccountTypesTabsProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {accountTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => onTabChange(type.id)}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === type.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              transition-colors
            `}
          >
            {type.name}
          </button>
        ))}
      </nav>
    </div>
  );
}
