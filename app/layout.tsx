import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// 👇 INI BAGIAN PENTINGNYA (METADATA)
export const metadata: Metadata = {
  title: "Loodfie Market | Pusat Produk Digital Terlengkap",
  description: "Platform No. 1 beli Ebook, Template, Source Code, dan Video Course berkualitas. Harga terjangkau, garansi akses selamanya!",
  icons: {
    icon: '/favicon.ico', 
  },
  // Settingan biar keren pas dishare di Sosmed (OpenGraph)
  openGraph: {
    title: "Loodfie Market | Pusat Produk Digital",
    description: "Temukan ribuan aset digital premium untuk kebutuhanmu. Cek sekarang!",
    url: 'https://loodfie-market-oy4u.vercel.app', // Link Website Kamu
    siteName: 'Loodfie Market',
    locale: 'id_ID',
    type: 'website',
  },
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