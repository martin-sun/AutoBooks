// @ts-nocheck - Ignoring all type errors for Material Tailwind components
"use client";

import React from 'react';
import {
  Card,
  CardBody,
  Typography,
  CardFooter,
  Chip,
} from "@material-tailwind/react";

// Mock data for financial summary
const financialSummaryData = {
  totalIncome: { 
    amount: 12580.45, 
    currency: 'CAD', 
    change: 8.5, 
    period: 'month' 
  },
  totalExpenses: { 
    amount: 8320.75, 
    currency: 'CAD', 
    change: -2.3, 
    period: 'month' 
  },
  netProfit: { 
    amount: 4259.70, 
    currency: 'CAD', 
    change: 15.2, 
    period: 'month' 
  },
  accountsReceivable: { 
    amount: 3450.00, 
    currency: 'CAD', 
    change: 0, 
    period: 'month' 
  }
};

export default function FinancialSummaryCards() {
  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-CA', { 
      style: 'currency', 
      currency: currency 
    }).format(amount);
  };

  // Determine color based on change value
  const getChangeColor = (change: number) => {
    if (change > 0) return "green";
    if (change < 0) return "red";
    return "blue-gray";
  };

  // Format change percentage
  const formatChange = (change: number) => {
    const prefix = change > 0 ? '+' : '';
    return `${prefix}${change}%`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {/* Income Card */}
      <Card className="shadow-sm">
        <CardBody className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-50 p-2 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-500">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm.53 5.47a.75.75 0 00-1.06 0l-3 3a.75.75 0 101.06 1.06l1.72-1.72v5.69a.75.75 0 001.5 0v-5.69l1.72 1.72a.75.75 0 101.06-1.06l-3-3z" clipRule="evenodd" />
                </svg>
              </div>
              <Typography variant="h6" color="blue-gray">
                Income
              </Typography>
            </div>
            <Chip 
              size="sm" 
              value={formatChange(financialSummaryData.totalIncome.change)} 
              color={getChangeColor(financialSummaryData.totalIncome.change)}
              variant="ghost"
              className="rounded-full"
            />
          </div>
          <Typography variant="h4" color="blue-gray" className="font-bold">
            {formatCurrency(financialSummaryData.totalIncome.amount, financialSummaryData.totalIncome.currency)}
          </Typography>
        </CardBody>
        <CardFooter className="pt-0 px-4 pb-3">
          <Typography variant="small" color="blue-gray" className="font-normal opacity-75">
            vs. previous {financialSummaryData.totalIncome.period}
          </Typography>
        </CardFooter>
      </Card>

      {/* Expenses Card */}
      <Card className="shadow-sm">
        <CardBody className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="rounded-full bg-red-50 p-2 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-500">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-.53 14.03a.75.75 0 001.06 0l3-3a.75.75 0 10-1.06-1.06l-1.72 1.72V8.25a.75.75 0 00-1.5 0v5.69l-1.72-1.72a.75.75 0 00-1.06 1.06l3 3z" clipRule="evenodd" />
                </svg>
              </div>
              <Typography variant="h6" color="blue-gray">
                Expenses
              </Typography>
            </div>
            <Chip 
              size="sm" 
              value={formatChange(financialSummaryData.totalExpenses.change)} 
              color={getChangeColor(-financialSummaryData.totalExpenses.change)}
              variant="ghost"
              className="rounded-full"
            />
          </div>
          <Typography variant="h4" color="blue-gray" className="font-bold">
            {formatCurrency(financialSummaryData.totalExpenses.amount, financialSummaryData.totalExpenses.currency)}
          </Typography>
        </CardBody>
        <CardFooter className="pt-0 px-4 pb-3">
          <Typography variant="small" color="blue-gray" className="font-normal opacity-75">
            vs. previous {financialSummaryData.totalExpenses.period}
          </Typography>
        </CardFooter>
      </Card>

      {/* Net Profit Card */}
      <Card className="shadow-sm">
        <CardBody className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="rounded-full bg-green-50 p-2 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-green-500">
                  <path fillRule="evenodd" d="M2.25 2.25a.75.75 0 000 1.5H3v10.5a3 3 0 003 3h1.21l-1.172 3.513a.75.75 0 001.424.474l.329-.987h8.418l.33.987a.75.75 0 001.422-.474l-1.17-3.513H18a3 3 0 003-3V3.75h.75a.75.75 0 000-1.5H2.25zm6.04 16.5l.5-1.5h6.42l.5 1.5H8.29zm7.46-12a.75.75 0 00-1.5 0v6a.75.75 0 001.5 0v-6zm-3 2.25a.75.75 0 00-1.5 0v3.75a.75.75 0 001.5 0V9zm-3 2.25a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5z" clipRule="evenodd" />
                </svg>
              </div>
              <Typography variant="h6" color="blue-gray">
                Net Profit
              </Typography>
            </div>
            <Chip 
              size="sm" 
              value={formatChange(financialSummaryData.netProfit.change)} 
              color={getChangeColor(financialSummaryData.netProfit.change)}
              variant="ghost"
              className="rounded-full"
            />
          </div>
          <Typography variant="h4" color="blue-gray" className="font-bold">
            {formatCurrency(financialSummaryData.netProfit.amount, financialSummaryData.netProfit.currency)}
          </Typography>
        </CardBody>
        <CardFooter className="pt-0 px-4 pb-3">
          <Typography variant="small" color="blue-gray" className="font-normal opacity-75">
            vs. previous {financialSummaryData.netProfit.period}
          </Typography>
        </CardFooter>
      </Card>

      {/* Accounts Receivable Card */}
      <Card className="shadow-sm">
        <CardBody className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="rounded-full bg-purple-50 p-2 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-purple-500">
                  <path d="M4.5 3.75a3 3 0 00-3 3v.75h21v-.75a3 3 0 00-3-3h-15z" />
                  <path fillRule="evenodd" d="M22.5 9.75h-21v7.5a3 3 0 003 3h15a3 3 0 003-3v-7.5zm-18 3.75a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" clipRule="evenodd" />
                </svg>
              </div>
              <Typography variant="h6" color="blue-gray">
                Receivables
              </Typography>
            </div>
            <Chip 
              size="sm" 
              value={formatChange(financialSummaryData.accountsReceivable.change)} 
              color={getChangeColor(financialSummaryData.accountsReceivable.change)}
              variant="ghost"
              className="rounded-full"
            />
          </div>
          <Typography variant="h4" color="blue-gray" className="font-bold">
            {formatCurrency(financialSummaryData.accountsReceivable.amount, financialSummaryData.accountsReceivable.currency)}
          </Typography>
        </CardBody>
        <CardFooter className="pt-0 px-4 pb-3">
          <Typography variant="small" color="blue-gray" className="font-normal opacity-75">
            outstanding invoices
          </Typography>
        </CardFooter>
      </Card>
    </div>
  );
}
