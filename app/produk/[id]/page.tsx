'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DetailProduk() {
  const params = useParams();
  const router = useRouter();
  const [produk, setProduk] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Data Toko (Untuk Font & Style Footer)
  const [toko, setToko] = useState({ 
    nama_toko: 'Loodfie Market', 
    footer_bg: null,
    font_style: 'Inter'
  });

  // Ambil Data Produk & Toko
  useEffect(() => {
    async function getData() {
      // 1. Ambil Settingan Toko
      const { data: dataToko } = await supabase.from('toko').select('*').single();
      if (dataToko) setToko(dataToko);

      // 2. Ambil Detail Produk Utama
      const { data: dataProduk, error } = await supabase
        .from('produk')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error || !dataProduk) {
        setLoading(false);
        return; // Produk tidak ditemukan
      }

      setProduk(dataProduk);

      // 3. Ambil Produk Serupa (Kategori Sama, tapi bukan produk ini)
      const { data: dataRelated } = await supabase
        .from('produk')
        .select('*')
        .eq('kategori', dataProduk.kategori)
        .neq('id', params.id) // Jangan tampilkan produk yang sedang dibuka
        .limit(5); // Ambil maksimal 5 rekomendasi
      
      if (dataRelated) setRelated(dataRelated);
      
      setLoading(false);
    }

    getData();
  }, [params.id]);

  // Handle Tombol Beli
  const handleBeli = () => {
    if (!produk) return;
    // Kalau ada link mayar, buka link mayar. Kalau kosong, ke WA.
    if (produk.link_mayar) {
      window.open(produk.link_mayar, '_blank');
    } else {
      const text = `Halo Admin, saya mau beli produk: ${produk.nama_produk}`;
      window.open(`https://wa.me/6285314445959?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  // --- DAFTAR FONT (Biar sinkron sama Home) ---
  const fontMap: any = {
    'Inter': 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700;900&display=swap',
    'Poppins': 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;700;900&display=swap',
    'Playfair Display': 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap',
    'Roboto Mono': 'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap',
    'Lobster': 'https://fonts.googleapis.com/css2?family=Lobster&display=swap',
    'Dancing Script': 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap',
    'Oswald': 'https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&display=swap',
    'Montserrat': 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap',
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="animate-pulse text-gray-400 font-bold">Memuat Produk...</p></div>;

  if (!produk) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
      <h1 className="text-4xl mb-4">😢</h1>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Produk Tidak Ditemukan</h2>
      <p className="text-gray-500 mb-6">Mungkin produk ini sudah dihapus atau link salah.</p>
      <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 transition">Kembali ke Beranda</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans" style={{ fontFamily: `"${toko.font_style}", sans-serif` }}>
      
      {/* Inject Font CSS */}
      <style jsx global>{` @import url('${fontMap[toko.font_style] || fontMap['Inter']}'); `}</style>

      {/* NAVBAR SIMPLE (Tombol Kembali) */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-sm py-4">
        <div className="container mx-auto px-6 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition font-bold text-sm">
                ⬅️ Kembali
            </Link>
            <span className="font-bold text-lg tracking-tight">{toko.nama_toko}</span>
            <div className="w-10"></div> {/* Spacer biar tengah */}
        </div>
      </nav>

      <main className="container mx-auto px-4 pt-28 pb-12">
        
        {/* --- DETAIL PRODUK --- */}
        <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2">
                
                {/* Kolom Kiri: Gambar Besar */}
                <div className="bg-gray-100 h-[400px] md:h-[500px] flex items-center justify-center relative p-8">
                    {produk.gambar ? (
                        <img src={produk.gambar} alt={produk.nama_produk} className="w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition duration-500" />
                    ) : (
                        <span className="text-6xl">📦</span>
                    )}
                    <span className="absolute top-6 left-6 bg-white/90 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm border border-gray-200">
                        {produk.kategori}
                    </span>
                </div>

                {/* Kolom Kanan: Info & Beli */}
                <div className="p-8 md:p-12 flex flex-col justify-center">
                    <h1 className="text-3xl md:text-4xl font-extrabold mb-4 text-gray-900 leading-tight">
                        {produk.nama_produk}
                    </h1>
                    
                    <div className="text-3xl font-extrabold text-blue-600 mb-8">
                        Rp {Number(produk.harga).toLocaleString('id-ID')}
                    </div>

                    <div className="prose prose-sm text-gray-500 mb-10 leading-relaxed whitespace-pre-line">
                        {produk.deskripsi || "Tidak ada deskripsi untuk produk ini."}
                    </div>

                    <div className="mt-auto space-y-4">
                        <button 
                            onClick={handleBeli}
                            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:bg-blue-700 hover:shadow-blue-500/30 transition transform hover:scale-[1.02] flex items-center justify-center gap-2"
                        >
                            🛒 Beli Sekarang
                        </button>
                        <p className="text-center text-xs text-gray-400">
                            *Produk digital dikirim otomatis setelah pembayaran.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* --- PRODUK SERUPA (REKOMENDASI) --- */}
        {related.length > 0 && (
            <div className="mt-20 max-w-5xl mx-auto">
                <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                    ✨ Produk Serupa
                    <span className="text-sm font-normal text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">Rekomendasi</span>
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {related.map((item) => (
                        <Link href={`/produk/${item.id}`} key={item.id} className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden border border-gray-100 flex flex-col h-full">
                             <div className="h-32 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                                <img src={item.gambar} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                                <span className="absolute top-2 left-2 bg-white/90 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide shadow-sm">{item.kategori}</span>
                            </div>
                            <div className="p-4 flex flex-col flex-grow">
                                <h4 className="text-sm font-bold mb-1 group-hover:text-blue-600 line-clamp-2">{item.nama_produk}</h4>
                                <p className="text-blue-600 font-extrabold text-sm mt-auto">Rp {Number(item.harga).toLocaleString('id-ID')}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        )}

      </main>

      {/* --- FOOTER (SAMA SEPERTI HOME) --- */}
      <footer className="relative bg-gray-900 text-white pt-10 pb-6 mt-20 border-t-4 border-blue-500 overflow-hidden">
        {toko.footer_bg && (
            <>
                <div className="absolute inset-0 z-0">
                    <img src={toko.footer_bg} alt="Footer Background" className="w-full h-full object-cover opacity-60" />
                </div>
                <div className="absolute inset-0 bg-black/80 z-0"></div>
            </>
        )}
        <div className="relative container mx-auto px-6 z-10 text-center">
            <p className="text-gray-400 text-sm mb-4">Terima kasih sudah mampir di {toko.nama_toko}</p>
            <p className="text-gray-600 text-xs opacity-50">&copy; {new Date().getFullYear()} {toko.nama_toko}. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}