import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "grifmaster.ru",
      },
    ],
  },
};

export default nextConfig;
