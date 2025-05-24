'use client';

import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';

// 国际化客户端提供者组件
export function IntlClientProvider({
  locale,
  messages,
  children
}: {
  locale: string;
  messages: any;
  children: ReactNode;
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
