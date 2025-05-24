import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Supported languages
export const locales = ['en', 'zh', 'fr'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale = 'en' as const;

// Type guard to check if a string is a valid locale
export function isValidLocale(locale: string): locale is Locale {
  return (locales as readonly string[]).includes(locale);
}

export default getRequestConfig(async ({ locale }) => {
  // Validate the requested locale
  if (!locale || !isValidLocale(locale)) {
    notFound();
  }

  try {
    // Import the messages for the current locale
    const messages = (await import(`./i18n/locales/${locale}.json`)).default;
    
    // Create a new array to avoid readonly issues
    const localesArray = [...locales];
    
    return { 
      messages,
      locale,
      defaultLocale,
      locales: localesArray
    };
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);
    notFound();
  }
});
