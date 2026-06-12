import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,

  // Proxy WebSocket connections to game server in development
  async rewrites() {
    return [
      {
        source: "/ws",
        destination: "http://localhost:3001",
      },
    ];
  },

  // Allow images from external sources (future: game assets)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
