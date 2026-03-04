import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-577a5bbe060a49b7af03e7d6731c196b.r2.dev',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
