import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto } from "next/font/google";
import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { locales } from '@/i18n/request';
import "../globals.css";

// Define fonts with consistent class names
const geistSans = Geist({
  subsets: ["latin"],
  display: 'swap',
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: 'swap',
  variable: "--font-geist-mono",
});

// 添加 Roboto 字体 (Material Design 标准字体)
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: 'swap',
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "AutoBooks - Professional Bookkeeping Solution",
  description: "Efficient bookkeeping solution for professional bookkeepers",
};

// Generate static params for all supported locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

// 使用简化的方法处理布局
export default async function LocaleLayout(props: Props) {
  // 在 Next.js 15 中，params 需要被 await
  const params = await props.params;
  const locale = params.locale;
  
  // 加载消息
  const messages = await getMessages();
  
  // Ensure consistent date and time format between server and client
  // Use a fixed timestamp for server rendering to avoid hydration mismatch
  const now = new Date();
  // Get timezone from Intl API
  const timeZone = 'UTC'; // Using fixed timezone to avoid hydration issues
  
  
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${roboto.variable} font-sans antialiased`} suppressHydrationWarning>
        <NextIntlClientProvider
          locale={locale}
          messages={messages}
          now={now}
          timeZone={timeZone}
        >
          {props.children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
