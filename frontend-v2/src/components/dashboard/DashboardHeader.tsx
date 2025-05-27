// @ts-nocheck - Ignoring all type errors for Material Tailwind components
"use client";

import React from 'react';
import { Typography } from '@material-tailwind/react';

interface DashboardHeaderProps {
  title: string;
  fiscalYear: string | number;
}

export default function DashboardHeader({ title, fiscalYear }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <Typography variant="h3" color="blue-gray">
        {title}
      </Typography>
      <div className="text-sm text-blue-gray-500">
        <span className="font-medium">Fiscal Year:</span> {fiscalYear}
      </div>
    </div>
  );
}
