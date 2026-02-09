import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// 🔥 UPDATE SEO GLOBAL DI SINI
export const metadata: Metadata = {
  title: "Loodfie Market - Pusat Produk Digital Terlengkap",
  description: "Temukan Ebook, Template, dan Source Code berkualitas premium dengan harga terbaik. Garansi akses selamanya!",
  // Konfigurasi Open Graph (Untuk Tampilan di WhatsApp/FB/Twitter)
  openGraph: {
    title: "Loodfie Market | Jual Produk Digital Premium",
    description: "Pusat belanja Ebook, Template & Source Code termurah dan terpercaya.",
    // Ganti URL ini dengan link gambar logo toko Bos yang sudah diupload ke Supabase
    // Contoh: 'https://ixk...supabase.co/storage/v1/object/public/gambar-produk/logo-toko.png'
    // Untuk sementara pakai placeholder dulu kalau belum punya logo
    images: ['https://placehold.co/600x400/2563eb/FFF?text=Loodfie+Market'], 
    type: 'website',
    locale: 'id_ID',
    siteName: 'Loodfie Market',
  },
  // Konfigurasi Twitter Card (Biar cakep juga di Twitter/X)
  twitter: {
    card: 'summary_large_image',
    title: "Loodfie Market - Pusat Produk Digital",
    description: "Belanja produk digital aman & terpercaya.",
    images: ['https://placehold.co/600x400/2563eb/FFF?text=Loodfie+Market'], 
  }
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