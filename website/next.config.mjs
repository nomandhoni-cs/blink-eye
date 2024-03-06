/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    loader: "default",
    domains: ["avatars.githubusercontent.com", "raw.githubusercontent.com"],
  },
};

export default nextConfig;
