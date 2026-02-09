import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// 🔥 IMPORT INI PENTING
import { CartProvider } from "@/context/CartContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Loodfie Market - Pusat Produk Digital Terlengkap",
  description: "Temukan Ebook, Template, dan Source Code berkualitas premium.",
  openGraph: {
    title: "Loodfie Market | Jual Produk Digital Premium",
    description: "Pusat belanja Ebook, Template & Source Code termurah.",
    images: ['https://placehold.co/600x400/2563eb/FFF?text=Loodfie+Market'], 
    type: 'website',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {/* 🔥 BUNGKUS SEMUANYA DI SINI */}
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}