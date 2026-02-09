import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import ClientProduk from './ClientProduk';

// 1. Ubah tipe params jadi Promise
type Props = {
  params: Promise<{ id: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // 2. Wajib AWAIT params dulu sebelum diambil ID-nya
  const { id } = await params;

  const { data: produk } = await supabase
    .from('produk')
    .select('*')
    .eq('id', id)
    .single();

  if (!produk) {
    return {
      title: 'Produk Tidak Ditemukan - Loodfie Market',
      description: 'Maaf, produk yang Anda cari tidak tersedia.',
    };
  }

  const hargaRupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(produk.harga);

  return {
    title: `${produk.nama_produk} | Loodfie Market`,
    description: `Beli ${produk.nama_produk} hanya ${hargaRupiah}. ${produk.deskripsi?.substring(0, 150)}...`,
    openGraph: {
      title: produk.nama_produk,
      description: `🔥 Promo Spesial: ${hargaRupiah}! ${produk.deskripsi?.substring(0, 100)}...`,
      images: [produk.gambar || 'https://via.placeholder.com/600'],
      type: 'website',
    },
  };
}

// 3. Komponen Page juga harus ASYNC dan AWAIT params
export default async function Page({ params }: Props) {
  const { id } = await params; // Bongkar params di sini
  
  // Kirim ID yang sudah bersih ke Client Component
  return <ClientProduk idProduk={id} />;
}