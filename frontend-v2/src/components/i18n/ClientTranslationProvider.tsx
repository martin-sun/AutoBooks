'use client';

import { ReactNode } from 'react';
import { NextIntlClientProvider, useMessages } from 'next-intl';

// 这个组件将从服务器组件获取的翻译消息传递给客户端组件
export function ClientTranslationProvider({
  children,
  locale
}: {
  children: ReactNode;
  locale: string;
}) {
  // 使用 useMessages 钩子获取当前语言的翻译消息
  const messages = useMessages();
  
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
