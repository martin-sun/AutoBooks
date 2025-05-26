import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto } from "next/font/google";
import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { locales } from '@/i18n/request';
import "../globals.css";
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';

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

config.autoAddCss = false;

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
  
  // 直接加载当前语言的消息文件
  let messages;
  try {
    messages = (await import(`@/i18n/locales/${locale}.json`)).default;
  } catch (error) {
    console.error(`Could not load messages for locale: ${locale}`, error);
    // 如果找不到当前语言的翻译，回退到英文
    messages = (await import('@/i18n/locales/en.json')).default;
  }
  
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
