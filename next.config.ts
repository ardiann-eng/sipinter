import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  serverExternalPackages: [
    "@libsql/client",
    "@prisma/adapter-libsql",
    "libsql",
  ],
  experimental: {
    serverActions: { bodySizeLimit: "8mb" },
  },
};

export default nextConfig;
