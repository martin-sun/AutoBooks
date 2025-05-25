import type { Config } from "tailwindcss";
import withMT from "@material-tailwind/react/utils/withMT";

export default withMT({
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // 覆写 Material Tailwind 默认颜色，这样可以直接使用 color="blue" 等属性
        blue: {
          50: "#e3f2fd",
          100: "#bbdefb",
          200: "#90caf9",
          300: "#64b5f6",
          400: "#42a5f5",
          500: "#2196f3", // Primary color
          600: "#1e88e5",
          700: "#1976d2",
          800: "#1565c0",
          900: "#0d47a1",
          950: "#0a2f6d",
        },
        pink: {
          50: "#fce4ec",
          100: "#f8bbd0",
          200: "#f48fb1",
          300: "#f06292",
          400: "#ec407a",
          500: "#e91e63", // Secondary color
          600: "#d81b60",
          700: "#c2185b",
          800: "#ad1457",
          900: "#880e4f",
          950: "#560a30",
        },
        green: {
          50: "#e8f5e9",
          100: "#c8e6c9",
          200: "#a5d6a7",
          300: "#81c784",
          400: "#66bb6a",
          500: "#4caf50", // Success color
          600: "#43a047",
          700: "#388e3c",
          800: "#2e7d32",
          900: "#1b5e20",
          950: "#103e15",
        },
        amber: {
          50: "#fff8e1",
          100: "#ffecb3",
          200: "#ffe082",
          300: "#ffd54f",
          400: "#ffca28",
          500: "#ffc107", // Warning color
          600: "#ffb300",
          700: "#ffa000",
          800: "#ff8f00",
          900: "#ff6f00",
          950: "#cc5a00",
        },
        red: {
          50: "#ffebee",
          100: "#ffcdd2",
          200: "#ef9a9a",
          300: "#e57373",
          400: "#ef5350",
          500: "#f44336", // Error color
          600: "#e53935",
          700: "#d32f2f",
          800: "#c62828",
          900: "#b71c1c",
          950: "#7f1416",
        },
        // 保留语义化命名，方便在 Tailwind 类中使用
        primary: {
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
          950: "#0a2f6d",
        },
        secondary: {
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
          950: "#560a30",
        },
      },
      fontFamily: {
        sans: ["Roboto", "sans-serif"],
      },
      // 直接覆写 Tailwind 默认阴影，与 Material Design 海拔系统对齐
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0,0,0,0.05)",
        DEFAULT: "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06)",
        md: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
        lg: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
        xl: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
        "2xl": "0 25px 50px -12px rgba(0,0,0,0.25)",
        "3xl": "0 35px 60px -15px rgba(0,0,0,0.3)",
        none: "none",
      },
    },
  },
  plugins: [],
} satisfies Config);
