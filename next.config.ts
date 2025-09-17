import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tse1.mm.bing.net',
      },
      {
        protocol: 'https',
        hostname: 'tse2.mm.bing.net',
      },
      {
        protocol: 'https',
        hostname: 'tse3.mm.bing.net',
      },
      {
        protocol: 'https',
        hostname: 'tse4.mm.bing.net',
      },
      // add other bing subdomains...
      {
        protocol: 'https',
        hostname: '*.mm.bing.net',
      },
          {
        protocol: 'https',
        hostname: 'pixabay.com', 
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com', 
      },
    ],
  },
}

export default nextConfig;
