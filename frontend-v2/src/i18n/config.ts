import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import {locales, Locale} from './request';

// Re-export for convenience
export {locales};
export type {Locale};

// Type for the messages
type Messages = Record<string, any>;

// This function will be called by next-intl to load the messages
// for the current locale
export default getRequestConfig(async ({locale}) => {
  // Ensure the locale is valid, default to 'en' if not
  const validLocale = (locales.includes(locale as Locale) ? locale : 'en') as string;
  
  // This should never happen because we default to 'en' above
  if (!locales.includes(validLocale as Locale)) {
    notFound();
  }

  // Import the messages for the current locale
  const messages: Messages = (await import(`./locales/${validLocale}.json`)).default;

  // Return the configuration with the valid locale and messages
  return {
    locale: validLocale,
    messages,
  } as const; // Use const assertion to ensure type safety
});

// This type represents the shape of the messages object
export type IntlMessages = Messages;
