import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

// 🔥 PENGATURAN SEO & TAMPILAN WA 🔥
export const metadata: Metadata = {
  title: 'Loodfie Market | Pusat Produk Digital Terlengkap',
  description: 'Temukan aset digital premium, ebook, template, dan video course terbaik. Transaksi aman & cepat.',
  
  // Tampilan saat link disebar di WA/FB (OpenGraph)
  openGraph: {
    title: 'Loodfie Market - Belanja Produk Digital Sat-Set! 🚀',
    description: 'Butuh Ebook atau Template? Cek di sini! Garansi akses selamanya.',
    images: [
      {
        url: 'https://via.placeholder.com/1200x630.png?text=Loodfie+Market', // Ganti link ini dengan gambar toko Bos nanti
        width: 1200,
        height: 630,
        alt: 'Loodfie Market Cover',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {/* Kita bungkus website dengan Providers yang sudah BENAR */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}