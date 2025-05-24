'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

export function HomePageContent() {
  // 使用客户端组件处理翻译，避免服务器组件中的params.locale错误
  const t = useTranslations('Index');

  return (
    <div className="max-w-5xl w-full text-center">
      <h1 className="text-4xl font-bold mb-4">
        {t('title')}
      </h1>
      <p className="text-xl mb-8 text-gray-600">
        {t('description')}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link 
          href="/auth/signin" 
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center"
        >
          {t('auth.signIn')}
        </Link>
        <Link 
          href="/auth/signup" 
          className="px-6 py-3 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors text-center"
        >
          {t('auth.signUp')}
        </Link>
      </div>
    </div>
  );
}
