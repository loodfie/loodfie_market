import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // KITA HAPUS BAGIAN ESLINT DARI SINI
  // Karena sudah kita atasi lewat file .eslintignore tadi
};

export default nextConfig;