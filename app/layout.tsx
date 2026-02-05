import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// METADATA (SEO)
export const metadata: Metadata = {
  title: "Loodfie Market | Pusat Produk Digital Premium",
  description: "Platform terbaik untuk beli template website, ebook, dan aset digital. Transaksi aman, pengiriman instan, dan harga bersahabat.",
  authors: [{ name: "Loodfie Tech" }],
  keywords: ["produk digital", "template website", "ebook", "jual beli online"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>{children}</body>
    </html>
  );
}