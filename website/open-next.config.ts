import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
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
