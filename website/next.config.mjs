import createNextIntlPlugin from 'next-intl/plugin';

// Explicitly specify the path to the i18n configuration
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    loader: "default",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: "/f/**",
      },
      {
        protocol: "https",
        hostname: "p2myfh92qq.ufs.sh",
        pathname: "/f/**",
      },
      {
        protocol: "https",
        hostname: "api.producthunt.com",
        pathname: "/widgets/embed-image/v1/**",
      },
      {
        protocol: "https",
        hostname: "contrib.rocks",
        pathname: "/image",

      },
    ],
  },
};

export default withNextIntl(nextConfig);
