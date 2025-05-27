// @ts-nocheck - Ignoring all type errors for Material Tailwind components
"use client";

import React from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
} from "@material-tailwind/react";

// Mock data for recent transactions
const recentTransactionsData = [
  {
    id: 1,
    date: "2025-05-26T14:30:00",
    description: "Office Supplies - Staples",
    category: "Office Expenses",
    amount: -125.45,
    currency: "CAD",
    account: "Business Checking",
    status: "reconciled",
    type: "expense"
  },
  {
    id: 2,
    date: "2025-05-25T10:15:00",
    description: "Client Payment - ABC Corp",
    category: "Sales Revenue",
    amount: 1500.00,
    currency: "CAD",
    account: "Business Checking",
    status: "reconciled",
    type: "income"
  },
  {
    id: 3,
    date: "2025-05-24T16:45:00",
    description: "Software Subscription - Adobe",
    category: "Software",
    amount: -79.99,
    currency: "CAD",
    account: "Business Credit Card",
    status: "pending",
    type: "expense"
  },
  {
    id: 4,
    date: "2025-05-23T09:30:00",
    description: "Client Payment - XYZ Ltd",
    category: "Sales Revenue",
    amount: 2250.00,
    currency: "CAD",
    account: "Business Checking",
    status: "reconciled",
    type: "income"
  },
  {
    id: 5,
    date: "2025-05-22T12:20:00",
    description: "Internet Bill - Rogers",
    category: "Utilities",
    amount: -89.99,
    currency: "CAD",
    account: "Business Checking",
    status: "pending",
    type: "expense"
  }
];

export default function RecentTransactions() {
  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-CA', { 
      style: 'currency', 
      currency: currency 
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-CA', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // Get category icon
  const getCategoryIcon = (category: string, type: string) => {
    // Default icons based on transaction type
    if (type === 'income') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm.53 5.47a.75.75 0 00-1.06 0l-3 3a.75.75 0 101.06 1.06l1.72-1.72v5.69a.75.75 0 001.5 0v-5.69l1.72 1.72a.75.75 0 101.06-1.06l-3-3z" clipRule="evenodd" />
        </svg>
      );
    }
    
    // Category-specific icons for expenses
    switch(category) {
      case 'Office Expenses':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M7.875 1.5C6.839 1.5 6 2.34 6 3.375v2.99c-.426.053-.851.11-1.274.174-1.454.218-2.476 1.483-2.476 2.917v6.294a3 3 0 003 3h.27l-.155 1.705A1.875 1.875 0 007.232 22.5h9.536a1.875 1.875 0 001.867-2.045l-.155-1.705h.27a3 3 0 003-3V9.456c0-1.434-1.022-2.7-2.476-2.917A48.716 48.716 0 0018 6.366V3.375c0-1.036-.84-1.875-1.875-1.875h-8.25zM16.5 6.205v-2.83A.375.375 0 0016.125 3h-8.25a.375.375 0 00-.375.375v2.83a49.353 49.353 0 019 0zm-.217 8.265c.178.018.317.16.333.337l.526 5.784a.375.375 0 01-.374.409H7.232a.375.375 0 01-.374-.409l.526-5.784a.373.373 0 01.333-.337 41.741 41.741 0 018.566 0zm.967-3.97a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H18a.75.75 0 01-.75-.75V10.5zM15 9.75a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75V10.5a.75.75 0 00-.75-.75H15z" clipRule="evenodd" />
          </svg>
        );
      case 'Software':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M2.25 5.25a3 3 0 013-3h13.5a3 3 0 013 3V15a3 3 0 01-3 3h-3v.257c0 .597.237 1.17.659 1.591l.621.622a.75.75 0 01-.53 1.28h-9a.75.75 0 01-.53-1.28l.621-.622a2.25 2.25 0 00.659-1.59V18h-3a3 3 0 01-3-3V5.25zm1.5 0v9.75c0 .83.67 1.5 1.5 1.5h13.5c.83 0 1.5-.67 1.5-1.5V5.25c0-.83-.67-1.5-1.5-1.5H5.25c-.83 0-1.5.67-1.5 1.5z" clipRule="evenodd" />
          </svg>
        );
      case 'Utilities':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-.53 14.03a.75.75 0 001.06 0l3-3a.75.75 0 10-1.06-1.06l-1.72 1.72V8.25a.75.75 0 00-1.5 0v5.69l-1.72-1.72a.75.75 0 00-1.06 1.06l3 3z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  // Get status chip color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'reconciled':
        return 'green';
      case 'pending':
        return 'amber';
      default:
        return 'blue-gray';
    }
  };

  // Get background color based on transaction type
  const getIconBgColor = (type: string, category: string) => {
    if (type === 'income') {
      return 'bg-green-50 text-green-500';
    }
    
    switch(category) {
      case 'Office Expenses':
        return 'bg-blue-50 text-blue-500';
      case 'Software':
        return 'bg-purple-50 text-purple-500';
      case 'Utilities':
        return 'bg-amber-50 text-amber-500';
      default:
        return 'bg-red-50 text-red-500';
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader floated={false} shadow={false} className="rounded-none p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <Typography variant="h5" color="blue-gray">
              Recent Transactions
            </Typography>
            <Typography color="gray" className="mt-1 font-normal">
              Your latest financial activities
            </Typography>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outlined" className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z" clipRule="evenodd" />
              </svg>
              New Transaction
            </Button>
            <Button size="sm" className="flex items-center gap-2">
              View All
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clipRule="evenodd" />
              </svg>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardBody className="px-4 pt-0 pb-2">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max table-auto text-left">
            <thead>
              <tr>
                <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal leading-none opacity-70"
                  >
                    Date
                  </Typography>
                </th>
                <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal leading-none opacity-70"
                  >
                    Description
                  </Typography>
                </th>
                <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal leading-none opacity-70"
                  >
                    Category
                  </Typography>
                </th>
                <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal leading-none opacity-70"
                  >
                    Account
                  </Typography>
                </th>
                <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal leading-none opacity-70"
                  >
                    Status
                  </Typography>
                </th>
                <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal leading-none opacity-70 text-right"
                  >
                    Amount
                  </Typography>
                </th>
                <th className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal leading-none opacity-70 text-center"
                  >
                    Actions
                  </Typography>
                </th>
              </tr>
            </thead>
            <tbody>
              {recentTransactionsData.map(({ id, date, description, category, amount, currency, account, status, type }, index) => {
                const isLast = index === recentTransactionsData.length - 1;
                const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

                return (
                  <tr key={id}>
                    <td className={classes}>
                      <Typography variant="small" color="blue-gray" className="font-normal">
                        {formatDate(date)}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <div className="flex items-center gap-3">
                        <div className={`rounded-full p-2 ${getIconBgColor(type, category)}`}>
                          {getCategoryIcon(category, type)}
                        </div>
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {description}
                        </Typography>
                      </div>
                    </td>
                    <td className={classes}>
                      <Typography variant="small" color="blue-gray" className="font-normal">
                        {category}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <Typography variant="small" color="blue-gray" className="font-normal">
                        {account}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <div className="w-max">
                        <Chip
                          size="sm"
                          variant="ghost"
                          value={status}
                          color={getStatusColor(status)}
                        />
                      </div>
                    </td>
                    <td className={classes}>
                      <Typography 
                        variant="small" 
                        color={amount < 0 ? "red" : "green"} 
                        className="font-medium text-right"
                      >
                        {formatCurrency(amount, currency)}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <div className="flex justify-center gap-2">
                        <Tooltip content="Edit Transaction">
                          <IconButton variant="text" size="sm">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                              <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z" />
                              <path d="M5.25 5.25a3 3 0 00-3 3v10.5a3 3 0 003 3h10.5a3 3 0 003-3V13.5a.75.75 0 00-1.5 0v5.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V8.25a1.5 1.5 0 011.5-1.5h5.25a.75.75 0 000-1.5H5.25z" />
                            </svg>
                          </IconButton>
                        </Tooltip>
                        <Tooltip content="View Details">
                          <IconButton variant="text" size="sm">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                              <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                              <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                            </svg>
                          </IconButton>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
}
