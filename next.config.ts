import type { NextConfig } from "next";
import {
  UMAMI_ORIGIN,
  UMAMI_PROXY_PATH,
  UMAMI_SCRIPT_FILE,
} from "./shared/analytics";

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
      // Serve the Umami tracker and its event endpoint from our own
      // domain so ad blockers don't drop them (see shared/analytics.ts)
      {
        source: `${UMAMI_PROXY_PATH}/${UMAMI_SCRIPT_FILE}`,
        destination: `${UMAMI_ORIGIN}/script.js`,
      },
      {
        source: `${UMAMI_PROXY_PATH}/api/send`,
        destination: `${UMAMI_ORIGIN}/api/send`,
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
