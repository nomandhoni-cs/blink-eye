import createNextIntlPlugin from 'next-intl/plugin';

// Explicitly specify the path to the i18n configuration
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Optional: Change the output directory `out` -> `dist`
  // distDir: 'dist',
  images: {
    unoptimized: true, // Required for static export
  },
};

export default withNextIntl(nextConfig);
