import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { SpeedInsights } from "@vercel/speed-insights/next"; // 👈 INI YANG BARU

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Loodfie Market",
  description: "Pusat Produk Digital Terbaik & Terpercaya",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <CartProvider>
          {children}
          {/* Komponen SpeedInsights dipasang di sini supaya memantau kecepatan website */}
          <SpeedInsights /> 
        </CartProvider>
      </body>
    </html>
  );
}