'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FloatingWA from '../../components/FloatingWA';
import { FaInstagram, FaFacebookF, FaTiktok, FaShoppingCart } from 'react-icons/fa';
// 🔥 IMPORT CONTEXT
import { useCart } from '@/context/CartContext';

export default function ClientProduk({ idProduk }: { idProduk: string }) {
  const router = useRouter();
  const [produk, setProduk] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewers, setViewers] = useState(0);
  
  // 🔥 AMBIL FUNGSI KERANJANG
  const { addToCart, items } = useCart();

  const [toko, setToko] = useState({ 
    nama_toko: 'Loodfie Market', 
    footer_bg: null,
    font_style: 'Inter'
  });

  const socialLinks = {
    instagram: "https://www.instagram.com/loodfie/", 
    facebook: "https://www.facebook.com/loodfie",
    tiktok: "https://www.tiktok.com/@loodfie"
  };

  useEffect(() => {
    setViewers(Math.floor(Math.random() * (25 - 5 + 1)) + 5);
    async function getData() {
      const { data: dataToko } = await supabase.from('toko').select('*').single();
      if (dataToko) setToko(dataToko);

      const { data: dataProduk, error } = await supabase
        .from('produk')
        .select('*')
        .eq('id', idProduk)
        .single();

      if (error || !dataProduk) {
        setLoading(false);
        return; 
      }
      setProduk(dataProduk);

      const { data: dataRelated } = await supabase
        .from('produk')
        .select('*')
        .eq('kategori', dataProduk.kategori)
        .neq('id', idProduk) 
        .limit(5); 
      
      if (dataRelated) setRelated(dataRelated);
      setLoading(false);
    }
    getData();
  }, [idProduk]);

  // 🔥 FUNGSI MASUK KERANJANG
  const handleAddToCart = () => {
    if (!produk) return;
    addToCart({
        id: produk.id,
        nama_produk: produk.nama_produk,
        harga: produk.harga,
        gambar: produk.gambar
    });
  };

  const handleBeliLangsung = () => {
      handleAddToCart();
      router.push('/keranjang');
  };

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
      <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 transition">Kembali ke Beranda</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans" style={{ fontFamily: `"${toko.font_style}", sans-serif` }}>
      <FloatingWA />
      <style jsx global>{` @import url('${fontMap[toko.font_style] || fontMap['Inter']}'); `}</style>

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-sm py-4">
        <div className="container mx-auto px-6 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition font-bold text-sm">⬅️ Kembali</Link>
            <span className="font-bold text-lg tracking-tight">{toko.nama_toko}</span>
            
            {/* 🔥 IKON KERANJANG DI NAVBAR */}
            <Link href="/keranjang" className="relative p-2">
                <FaShoppingCart className="text-xl text-gray-700" />
                {items.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {items.length}
                    </span>
                )}
            </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 pt-28 pb-12">
        <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="bg-gray-100 h-[400px] md:h-[500px] flex items-center justify-center relative p-8">
                    {produk.gambar ? (<img src={produk.gambar} alt={produk.nama_produk} className="w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition duration-500" />) : (<span className="text-6xl">📦</span>)}
                    <span className="absolute top-6 left-6 bg-white/90 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm border border-gray-200">{produk.kategori}</span>
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                    <div className="mb-4 flex items-center gap-2 animate-pulse"><span className="h-2 w-2 bg-red-500 rounded-full"></span><span className="text-xs font-bold text-red-500">{viewers} orang sedang melihat produk ini!</span></div>
                    <h1 className="text-3xl md:text-4xl font-extrabold mb-4 text-gray-900 leading-tight">{produk.nama_produk}</h1>
                    <div className="mb-8">
                        {produk.harga_coret && produk.harga_coret > produk.harga && (<div className="flex items-center gap-3 mb-1"><span className="text-gray-400 line-through text-lg">Rp {Number(produk.harga_coret).toLocaleString('id-ID')}</span><span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">Hemat {Math.round(((produk.harga_coret - produk.harga) / produk.harga_coret) * 100)}%</span></div>)}
                        <div className="text-3xl font-extrabold text-blue-600">Rp {Number(produk.harga).toLocaleString('id-ID')}</div>
                    </div>
                    <div className="prose prose-sm text-gray-500 mb-10 leading-relaxed whitespace-pre-line">{produk.deskripsi || "Tidak ada deskripsi untuk produk ini."}</div>
                    
                    {/* 🔥 DUA TOMBOL SAKTI */}
                    <div className="mt-auto grid grid-cols-2 gap-3">
                        <button onClick={handleAddToCart} className="w-full bg-orange-100 text-orange-600 py-4 rounded-xl font-bold text-sm md:text-lg shadow-sm hover:bg-orange-200 transition flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2">
                            <FaShoppingCart /> <span>+Keranjang</span>
                        </button>
                        <button onClick={handleBeliLangsung} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-sm md:text-lg shadow-xl hover:bg-blue-700 hover:shadow-blue-500/30 transition transform hover:scale-[1.02] flex items-center justify-center gap-2">
                             ⚡ Beli Sekarang
                        </button>
                    </div>

                </div>
            </div>
        </div>
        {related.length > 0 && (
            <div className="mt-20 max-w-5xl mx-auto">
                <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">✨ Produk Serupa <span className="text-sm font-normal text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">Rekomendasi</span></h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {related.map((item) => (
                        <Link href={`/produk/${item.id}`} key={item.id} className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden border border-gray-100 flex flex-col h-full relative">
                             {item.harga_coret && item.harga_coret > item.harga && (<div className="absolute top-2 right-2 z-10 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow">-{Math.round(((item.harga_coret - item.harga) / item.harga_coret) * 100)}%</div>)}
                             <div className="h-32 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                                <img src={item.gambar} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                                <span className="absolute top-2 left-2 bg-white/90 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide shadow-sm">{item.kategori}</span>
                            </div>
                            <div className="p-4 flex flex-col flex-grow"><h4 className="text-sm font-bold mb-1 group-hover:text-blue-600 line-clamp-2">{item.nama_produk}</h4><p className="text-blue-600 font-extrabold text-sm mt-auto">Rp {Number(item.harga).toLocaleString('id-ID')}</p></div>
                        </Link>
                    ))}
                </div>
            </div>
        )}
      </main>

      {/* FOOTER (Sama seperti sebelumnya) */}
      <footer className="relative bg-gray-900 text-white pt-10 pb-6 mt-20 border-t-4 border-blue-500 overflow-hidden">
        {/* ... (Footer code Bos biarkan saja yang lama, atau copas dari file ClientProduk sebelumnya kalau mau update) ... */}
        {/* Supaya tidak kepanjangan di chat, bagian footer saya skip tulis ulang karena sama persis */}
        <div className="relative container mx-auto px-6 z-10"><div className="border-t border-gray-800 pt-4 text-center relative z-10"><p className="text-gray-500 text-xs">&copy; {new Date().getFullYear()} <span className="text-white font-bold">{toko.nama_toko}</span>. All rights reserved.</p></div></div>
      </footer>
    </div>
  );
}