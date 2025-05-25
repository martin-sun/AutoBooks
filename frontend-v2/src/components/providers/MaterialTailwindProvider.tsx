'use client';

import React from 'react';
import { ThemeProvider } from '@material-tailwind/react';

// Material Tailwind 自定义主题配置
const materialTheme = {
  colors: {
    blue: {
      DEFAULT: "#2196f3",
      50: "#e3f2fd",
      100: "#bbdefb",
      200: "#90caf9",
      300: "#64b5f6",
      400: "#42a5f5",
      500: "#2196f3",
      600: "#1e88e5",
      700: "#1976d2",
      800: "#1565c0",
      900: "#0d47a1",
    },
    pink: {
      DEFAULT: "#e91e63",
      50: "#fce4ec",
      100: "#f8bbd0",
      200: "#f48fb1",
      300: "#f06292",
      400: "#ec407a",
      500: "#e91e63",
      600: "#d81b60",
      700: "#c2185b",
      800: "#ad1457",
      900: "#880e4f",
    },
    // 添加语义化映射
    primary: { DEFAULT: "#2196f3" },
    secondary: { DEFAULT: "#e91e63" },
    success: { DEFAULT: "#4caf50" },
    warning: { DEFAULT: "#ffc107" },
    error: { DEFAULT: "#f44336" },
  },
};

export function MaterialTailwindProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider value={materialTheme}>
      {children}
    </ThemeProvider>
  );
}
