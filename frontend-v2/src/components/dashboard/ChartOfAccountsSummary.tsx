// @ts-nocheck - Ignoring all type errors for Material Tailwind components
"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Progress,
} from "@material-tailwind/react";

// Mock data for chart of accounts
const chartOfAccountsData = {
  categories: [
    {
      name: "Assets",
      count: 12,
      color: "blue",
      percentage: 30,
    },
    {
      name: "Liabilities",
      count: 8,
      color: "red",
      percentage: 20,
    },
    {
      name: "Equity",
      count: 4,
      color: "purple",
      percentage: 10,
    },
    {
      name: "Income",
      count: 10,
      color: "green",
      percentage: 25,
    },
    {
      name: "Expenses",
      count: 15,
      color: "amber",
      percentage: 15,
    },
  ],
  totalAccounts: 49,
  recentlyUpdated: 3,
};

export default function ChartOfAccountsSummary() {
  return (
    <Card className="shadow-sm">
      <CardHeader floated={false} shadow={false} className="rounded-none p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <Typography variant="h5" color="blue-gray">
              Accounts
            </Typography>
            <Typography color="gray" className="mt-1 font-normal">
              Overview of your accounting structure
            </Typography>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outlined"
              className="flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z"
                  clipRule="evenodd"
                />
              </svg>
              Add Account
            </Button>
            <Button size="sm" className="flex items-center gap-2">
              View All
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardBody className="px-4 pt-0 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <Typography variant="h6" color="blue-gray">
                  Account Categories
                </Typography>
                <Typography variant="small" color="blue-gray">
                  {chartOfAccountsData.totalAccounts} total accounts
                </Typography>
              </div>
              <div className="space-y-3">
                {chartOfAccountsData.categories.map((category) => (
                  <div key={category.name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full bg-${category.color}-500`}
                        ></div>
                        <Typography variant="small" color="blue-gray">
                          {category.name}
                        </Typography>
                      </div>
                      <Typography variant="small" color="blue-gray">
                        {category.count} accounts
                      </Typography>
                    </div>
                    <Progress
                      value={category.percentage}
                      color={category.color as any}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between">
            <div className="mb-4">
              <Typography variant="h6" color="blue-gray" className="mb-2">
                Account Structure
              </Typography>
              <div className="bg-blue-gray-50 rounded-lg p-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Typography variant="small" color="blue-gray">
                      Total Accounts
                    </Typography>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-medium"
                    >
                      {chartOfAccountsData.totalAccounts}
                    </Typography>
                  </div>
                  <div className="flex items-center justify-between">
                    <Typography variant="small" color="blue-gray">
                      Recently Updated
                    </Typography>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-medium"
                    >
                      {chartOfAccountsData.recentlyUpdated}
                    </Typography>
                  </div>
                  <div className="flex items-center justify-between">
                    <Typography variant="small" color="blue-gray">
                      Active Accounts
                    </Typography>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-medium"
                    >
                      {chartOfAccountsData.totalAccounts - 2}
                    </Typography>
                  </div>
                  <div className="flex items-center justify-between">
                    <Typography variant="small" color="blue-gray">
                      Inactive Accounts
                    </Typography>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-medium"
                    >
                      2
                    </Typography>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Typography variant="h6" color="blue-gray" className="mb-2">
                Quick Tips
              </Typography>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-blue-500 p-1 text-white mt-0.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <Typography variant="small" color="blue-gray">
                    Regularly review your Chart of Accounts to ensure it
                    accurately reflects your business structure and financial
                    reporting needs.
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
