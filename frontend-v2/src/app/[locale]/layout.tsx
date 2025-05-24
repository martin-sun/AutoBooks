import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { locales } from '@/i18n/request';
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap', // Ensure fonts are loaded with font-display: swap
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap', // Ensure fonts are loaded with font-display: swap
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
  
  // 确保日期和时间格式一致
  const now = new Date();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
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
