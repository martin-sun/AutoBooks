"use client";

import React from 'react';
import { MaterialTailwindProvider } from './MaterialTailwindProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <MaterialTailwindProvider>
      {children}
    </MaterialTailwindProvider>
  );
}
