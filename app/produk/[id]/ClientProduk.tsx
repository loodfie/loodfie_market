'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FloatingWA from '../../components/FloatingWA';
import { FaInstagram, FaFacebookF, FaTiktok, FaShoppingCart, FaCreditCard } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast'; 
import { useCart } from '@/context/CartContext';

// Biar TypeScript gak rewel
declare global {
  interface Window {
    snap: any;
  }
}

export default function ClientProduk({ idProduk }: { idProduk: string }) {
  const router = useRouter();
  const [produk, setProduk] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [prosesBayar, setProsesBayar] = useState(false); // Loading saat klik bayar
  const [viewers, setViewers] = useState(0);
  const [user, setUser] = useState<any>(null);
  const { addToCart, items } = useCart();

  const [toko, setToko] = useState({ 
    nama_toko: 'Loodfie Market', 
    footer_bg: null,
    font_style: 'Inter',
    pesan_login: '🔒 Eits, Member Only! Silakan Login atau Daftar dulu ya.' 
  });

  const socialLinks = {
    instagram: "https://www.instagram.com/loodfie/", 
    facebook: "https://www.facebook.com/loodfie",
    tiktok: "https://www.tiktok.com/@loodfie"
  };

  useEffect(() => {
    setViewers(Math.floor(Math.random() * (25 - 5 + 1)) + 5);

    async function getData() {
      // 1. Cek User Session
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      // 2. Ambil Data Toko
      const { data: dataToko } = await supabase.from('toko').select('*').single();
      if (dataToko) setToko(dataToko);

      // 3. Ambil Data Produk
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

      // 4. Ambil Produk Serupa
      const { data: dataRelated } = await supabase
        .from('produk')
        .select('*')
        .eq('kategori', dataProduk.kategori)
        .neq('id', idProduk) 
        .limit(4); 
      
      if (dataRelated) setRelated(dataRelated);
      setLoading(false);

      // 5. Load Script Midtrans (PRODUCTION / LIVE)
      const scriptId = 'midtrans-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = process.env.NEXT_PUBLIC_MIDTRANS_API_URL || 'https://app.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
        document.body.appendChild(script);
      }
    }
    
    getData();
  }, [idProduk]);

  // FUNGSI PENJAGA GERBANG
  const cekWajibLogin = () => {
    if (!user) {
      toast.error(toko.pesan_login || "🔒 Silakan login terlebih dahulu.", {
        icon: '🔐',
        duration: 4000
      });
      router.push('/masuk');
      return false;
    }
    return true; 
  };

  const handleAddToCart = () => {
    if (!cekWajibLogin()) return;
    if (!produk) return;
    addToCart({
        id: produk.id,
        nama_produk: produk.nama_produk,
        harga: produk.harga,
        gambar: produk.gambar
    });
  };

  // 🔥 FUNGSI BELI LANGSUNG (MIDTRANS)
  const handleBeliLangsung = async () => {
      if (!cekWajibLogin()) return;
      if (!produk) return;

      // Cek apakah produk ini punya link manual (Mayar/Lainnya)
      // Kalau ada link manual, tetap pakai link itu. Kalau kosong, pakai MIDTRANS.
      if (produk.link_mayar && produk.link_mayar.startsWith('http')) {
        window.open(produk.link_mayar, '_blank');
        return;
      }

      setProsesBayar(true);
      const orderId = `TRX-${Date.now()}`; // ID Transaksi Unik

      try {
        // 1. Minta Token ke API Midtrans
        const response = await fetch('/api/midtrans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: orderId,
                total: Number(produk.harga), // Harga cuma 1 barang
                items: [{
                    id: produk.id,
                    price: Number(produk.harga),
                    quantity: 1,
                    name: produk.nama_produk.substring(0, 45)
                }],
                customer: {
                    name: user.email.split('@')[0],
                    email: user.email
                }
            }),
        });

        const data = await response.json();
        if (!data.token) throw new Error("Gagal dapat token pembayaran");

        // 2. Munculkan Popup Midtrans
        window.snap.pay(data.token, {
            onSuccess: async function(result: any) {
                toast.success("Pembayaran Berhasil! 🎉");

                // Simpan ke Database Transaksi
                await supabase.from('transaksi').insert({
                    user_email: user.email,
                    produk_id: produk.id,
                    harga: produk.harga,
                    status: 'LUNAS',
                    order_id: orderId,
                    metode_bayar: result.payment_type
                });

                router.push('/dashboard'); // Pindah ke Member Area
            },
            onPending: function(result: any) {
                toast("Menunggu pembayaran...", { icon: '⏳' });
            },
            onError: function(result: any) {
                toast.error("Pembayaran Gagal/Dibatalkan");
                setProsesBayar(false);
            },
            onClose: function() {
                setProsesBayar(false);
            }
        });

      } catch (err) {
        console.error(err);
        toast.error("Gagal memproses pembayaran.");
        setProsesBayar(false);
      }
  };

  const fontMap: any = {
    'Inter': 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700;900&display=swap',
    'Poppins': 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;700;900&display=swap',
    // ... font lain
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
      <Toaster position="top-center" />
      <FloatingWA />
      <style jsx global>{` @import url('${fontMap[toko.font_style] || fontMap['Inter']}'); `}</style>

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-sm py-4">
        <div className="container mx-auto px-6 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition font-bold text-sm">⬅️ Kembali</Link>
            <span className="font-bold text-lg tracking-tight">{toko.nama_toko}</span>
            <Link href="/keranjang" className="relative p-2 group">
                <FaShoppingCart className="text-xl text-gray-700 group-hover:text-blue-600 transition" />
                {items.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-bounce">
                        {items.length}
                    </span>
                )}
            </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 pt-28 pb-12">
        <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2">
                {/* BAGIAN GAMBAR */}
                <div className="bg-gray-100 h-[400px] md:h-[500px] flex items-center justify-center relative p-8 group">
                    {produk.gambar ? (<img src={produk.gambar} alt={produk.nama_produk} className="w-full h-full object-contain drop-shadow-2xl group-hover:scale-105 transition duration-500" />) : (<span className="text-6xl">📦</span>)}
                    <span className="absolute top-6 left-6 bg-white/90 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm border border-gray-200">{produk.kategori}</span>
                </div>

                {/* BAGIAN TEXT */}
                <div className="p-8 md:p-12 flex flex-col justify-center">
                    <div className="mb-4 flex items-center gap-2 animate-pulse"><span className="h-2 w-2 bg-red-500 rounded-full"></span><span className="text-xs font-bold text-red-500">{viewers} orang sedang melihat produk ini!</span></div>
                    <h1 className="text-3xl md:text-4xl font-extrabold mb-4 text-gray-900 leading-tight">{produk.nama_produk}</h1>
                    
                    <div className="mb-8">
                        {produk.harga_coret && produk.harga_coret > produk.harga && (
                            <div className="flex items-center gap-3 mb-1">
                                <span className="text-gray-400 line-through text-lg">Rp {Number(produk.harga_coret).toLocaleString('id-ID')}</span>
                                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">Hemat {Math.round(((produk.harga_coret - produk.harga) / produk.harga_coret) * 100)}%</span>
                            </div>
                        )}
                        <div className="text-3xl font-extrabold text-blue-600">Rp {Number(produk.harga).toLocaleString('id-ID')}</div>
                    </div>

                    <div className="prose prose-sm text-gray-500 mb-10 leading-relaxed whitespace-pre-line border-l-4 border-gray-200 pl-4">
                        {produk.deskripsi || "Tidak ada deskripsi untuk produk ini."}
                    </div>
                    
                    {/* 🔥 DUA TOMBOL UTAMA */}
                    <div className="mt-auto grid grid-cols-2 gap-3">
                        <button 
                            onClick={handleAddToCart} 
                            disabled={prosesBayar}
                            className="w-full bg-orange-50 text-orange-600 border border-orange-200 py-4 rounded-xl font-bold text-sm md:text-lg shadow-sm hover:bg-orange-100 transition flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 active:scale-95"
                        >
                            <FaShoppingCart /> <span>+Keranjang</span>
                        </button>

                        <button 
                            onClick={handleBeliLangsung}
                            disabled={prosesBayar} 
                            className={`w-full text-white py-4 rounded-xl font-bold text-sm md:text-lg shadow-xl transition transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 ${prosesBayar ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30'}`}
                        >
                             {prosesBayar ? 'Memproses...' : <><FaCreditCard /> Beli Sekarang</>}
                        </button>
                    </div>
                    <p className="text-[10px] text-gray-400 text-center mt-3">*Pembayaran Otomatis via Midtrans (QRIS/VA)</p>

                </div>
            </div>
        </div>
        
        {/* RELATED PRODUCTS */}
        {related.length > 0 && (
            <div className="mt-20 max-w-5xl mx-auto">
                <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">✨ Produk Serupa</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {related.map((item) => (
                        <Link href={`/produk/${item.id}`} key={item.id} className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden border border-gray-100 flex flex-col h-full relative">
                             <div className="h-32 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                                <img src={item.gambar} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
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
        {toko.footer_bg && (<><div className="absolute inset-0 z-0"><img src={toko.footer_bg} alt="Footer Background" className="w-full h-full object-cover opacity-60" /></div><div className="absolute inset-0 bg-black/80 z-0"></div></>)}
        <div className="relative container mx-auto px-6 z-10 text-center">
             <h3 className="text-lg font-bold mb-3 flex items-center justify-center gap-2">{toko.nama_toko}</h3>
             <p className="text-gray-500 text-xs">&copy; {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}