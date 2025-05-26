'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';

export function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('Landing');
  const currentLocale = useLocale();
  const pathname = usePathname();
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 获取不带语言前缀的路径
  const pathWithoutLocale = () => {
    // 首先检查当前路径是否包含语言代码
    if (!pathname) return '';
    
    // 对于根路径的特殊处理
    if (pathname === '/en' || pathname === '/fr' || pathname === '/zh') {
      return '';
    }
    
    // 正则表达式匹配语言代码路径
    // 例如 /en/features, /fr/pricing 等
    const match = pathname.match(/^\/(?:en|fr|zh)(\/.*)?$/);
    if (match) {
      // 如果匹配成功，返回路径的其余部分，如果是 undefined 则返回空字符串
      return match[1] || '';
    }
    
    // 如果没有匹配到语言代码，返回原始路径
    return pathname;
  };
  
  // 调用函数获取路径
  const pathWithoutLocaleValue = pathWithoutLocale();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center space-x-1 text-gray-700 hover:text-primary transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{currentLocale.toUpperCase()}</span>
        <span className="text-xs">▼</span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-10">
          <Link 
            href={`/en${pathWithoutLocaleValue}`} 
            className={`block px-4 py-2 text-sm ${currentLocale === 'en' ? 'bg-gray-100 text-primary' : 'text-gray-700 hover:bg-gray-100'}`}
            onClick={() => setIsOpen(false)}
            prefetch={false}
          >
            {t('language.en')}
          </Link>
          <Link 
            href={`/fr${pathWithoutLocaleValue}`} 
            className={`block px-4 py-2 text-sm ${currentLocale === 'fr' ? 'bg-gray-100 text-primary' : 'text-gray-700 hover:bg-gray-100'}`}
            onClick={() => setIsOpen(false)}
            prefetch={false}
          >
            {t('language.fr')}
          </Link>
          <Link 
            href={`/zh${pathWithoutLocaleValue}`} 
            className={`block px-4 py-2 text-sm ${currentLocale === 'zh' ? 'bg-gray-100 text-primary' : 'text-gray-700 hover:bg-gray-100'}`}
            onClick={() => setIsOpen(false)}
            prefetch={false}
          >
            {t('language.zh')}
          </Link>
        </div>
      )}
    </div>
  );
}
