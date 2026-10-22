import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,

  // The type check runs out of memory on the small production server
  // (Better Auth's types are heavy), so builds skip it. Run
  // `yarn typecheck` locally before pushing instead.
  typescript: {
    ignoreBuildErrors: true,
  },

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

  // WSL: filesystem events don't propagate, so use polling for HMR
  webpack: (config, { dev }) => {
    // shared/ is also compiled by the game server (NodeNext), so its
    // imports name files "./x.js"; resolve those to the .ts sources
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      ".js": [".ts", ".tsx", ".js"],
    };

    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default nextConfig;
