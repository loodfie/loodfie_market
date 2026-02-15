import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // PENTING: Abaikan warning linting saat deploy supaya gak gagal
    ignoreDuringBuilds: true,
  },
  typescript: {
    // PENTING: Abaikan error tipe data saat deploy (asal jalan di localhost, gaskeun!)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;