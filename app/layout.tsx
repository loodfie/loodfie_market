import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

const inter = Inter({ subsets: ['latin'] })

// 👇 INI RAHASIANYA: Fungsi untuk membuat "KTP" Website secara Otomatis
export async function generateMetadata() {
  // 1. Ambil data Toko dari Supabase
  const { data: toko } = await supabase
    .from('pengaturan')
    .select('nama_toko, tagline, logo')
    .single();

  // 2. Siapkan data default (jika database kosong/error)
  const siteTitle = toko?.nama_toko || 'Loodfie Market';
  const siteDesc = toko?.tagline || 'Pusat Produk Digital Terbaik';
  const siteImage = toko?.logo || ''; 

  // 3. Kembalikan data Metadata untuk Google & Sosmed
  return {
    title: siteTitle,
    description: siteDesc,
    
    // Pengaturan untuk Facebook / WhatsApp (OpenGraph)
    openGraph: {
      title: siteTitle,
      description: siteDesc,
      images: siteImage ? [siteImage] : [], // Gunakan logo toko sebagai cover
      type: 'website',
    },

    // Pengaturan untuk Twitter / X
    twitter: {
      card: 'summary_large_image',
      title: siteTitle,
      description: siteDesc,
      images: siteImage ? [siteImage] : [],
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {/* Notifikasi Cantik (Toast) */}
        <Toaster 
          position="top-center" 
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
              fontWeight: 'bold',
            },
          }}
        />
        {children}
      </body>
    </html>
  )
}