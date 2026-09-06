import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';
import { fileURLToPath } from 'url';

// Explicitly specify the path to the i18n configuration
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Fix Turbopack workspace root inference (see https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#root-directory)
  // Without this, Next.js infers root as /Users/nomandhoni due to stray lockfile, causing
  // `Can't resolve 'tailwindcss-motion'` errors since it looks in the wrong node_modules.
  turbopack: {
    root: __dirname,
  },
  // Optional: Change the output directory `out` -> `dist`
  // distDir: 'dist',
  images: {
    unoptimized: true, // Required for static export
  },
};

export default withNextIntl(nextConfig);
