import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin(
  // Path to the i18n configuration
  './src/i18n/config.ts',
  // Additional configuration for the plugin
  {
    // Enable debug logging in development
    debug: process.env.NODE_ENV === 'development',
  }
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React's Strict Mode
  reactStrictMode: true,
  
  // Enable webpack 5 (default in Next.js 12+)
  webpack: (config, { isServer }) => {
    // Add any custom webpack configuration here
    return config;
  },
  
  // TypeScript configuration
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  
  // ESLint configuration
  eslint: {
    // Warning: This allows production builds to complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  
  // i18n configuration is handled by next-intl
  // No need to specify it here as it's configured in src/i18n/request.ts
};

export default withNextIntl(nextConfig);
