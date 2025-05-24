// Define the locales that your application supports
export const locales = ['en', 'zh', 'fr'] as const;

export type Locale = (typeof locales)[number];

// Type guard to check if a string is a valid locale
export function isValidLocale(locale: string): locale is Locale {
  return (locales as readonly string[]).includes(locale);
}

// Default locale for the application
export const defaultLocale = 'en' as const;

// Default configuration for next-intl
const config = {
  // A list of all locales that are supported
  locales,
  
  // If this locale is matched, pathnames work without a prefix (e.g. `/about`)
  defaultLocale,
  
  // If you want to use a domain-based locale strategy, uncomment this:
  // domains: [
  //   {domain: 'example.com', defaultLocale: 'en'},
  //   {domain: 'example.fr', defaultLocale: 'fr'},
  //   {domain: 'example.cn', defaultLocale: 'zh'}
  // ]
} as const;

export default config;
