import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Abaikan error tipe data saat build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Abaikan error linting saat build (Backup plan)
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;