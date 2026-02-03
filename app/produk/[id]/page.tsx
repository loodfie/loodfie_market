import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default async function DetailProduk({ params }: { params: Promise<{ id: string }> }) {
  
  // 1. Tangkap ID dari URL
  const { id } = await params;

  // 2. Minta data ke Supabase (Termasuk kolom link_mayar)
  const { data: produk } = await supabase
    .from('produk')
    .select('*')
    .eq('id', id)
    .single();

  // Kalau produk tidak ditemukan
  if (!produk) {
    return <div className="text-center mt-20 text-xl font-bold">Produk tidak ditemukan 😔</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Bagian Kiri: Gambar */}
        <div className="md:w-1/2">
            <img src={produk.gambar} alt={produk.nama} className="w-full h-full object-cover" />
        </div>

        {/* Bagian Kanan: Info */}
        <div className="md:w-1/2 p-8 flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{produk.nama}</h1>
            <p className="text-gray-600 mb-6 leading-relaxed">
                {produk.deskripsi}
            </p>

            <div className="text-3xl font-bold text-blue-600 mb-8">
                {produk.harga}
            </div>

            <div className="flex gap-4">
                
                {/* 👇 INI BAGIAN YANG KITA UBAH 👇 */}
                {/* Dulu pakai <button>, sekarang pakai <a> supaya bisa membuka Link Mayar */}
                <a 
                    href={produk.link_mayar} 
                    target="_blank" // Supaya buka tab baru
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition text-center flex items-center justify-center cursor-pointer"
                >
                    Beli Sekarang via Mayar 💳
                </a>
                
                <Link href="/" className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium flex items-center">
                    Kembali
                </Link>
            </div>
        </div>

      </div>
    </div>
  );
}