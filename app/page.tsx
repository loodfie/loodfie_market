'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast'; // Pakai notifikasi cantik

export default function HalamanDepan() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [toko, setToko] = useState({
    nama_toko: 'Loodfie Market',
    tagline: 'Pusat Produk Digital',
    warna_header: '#2563eb',
    logo: ''
  });
  const [produk, setProduk] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      const { data: dataToko } = await supabase.from('pengaturan').select('*').limit(1).single();
      if (dataToko) {
        setToko({
            nama_toko: dataToko.nama_toko || 'Loodfie Market',
            tagline: dataToko.tagline || '',
            warna_header: dataToko.warna_header || '#2563eb',
            logo: dataToko.logo || ''
        });
      }

      const { data: dataProduk } = await supabase.from('produk').select('*').order('id', { ascending: false });
      setProduk(dataProduk || []);
      setLoading(false);
    }
    init();
  }, []);

  // Fungsi Transaksi Cerdas
  async function handleBeli(item: any) {
    if (!user) {
        toast.error("🔒 Eits, Login dulu ya!");
        router.push('/masuk');
        return;
    }

    // 1. Catat Pesanan ke Database
    const loadingToast = toast.loading('Memproses pesanan...');
    
    const { error } = await supabase.from('pesanan').insert({
        user_id: user.id,
        email: user.email,
        nama_produk: item.nama,
        harga: item.harga,
        status: 'Menunggu Pembayaran' // Status awal
    });

    toast.dismiss(loadingToast);

    if (error) {
        toast.error("Gagal mencatat pesanan, tapi link tetap dibuka.");
        console.error(error);
    } else {
        toast.success("✅ Pesanan dicatat! Silakan bayar.");
    }

    // 2. Buka Link Pembayaran
    window.open(item.link_mayar, '_blank');
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* NAVBAR */}
      <nav className="bg-white px-6 py-3 shadow-sm flex justify-end items-center text-sm sticky top-0 z-50">
        {user ? (
            <Link 
                href="/dashboard" 
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition group"
            >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs group-hover:bg-blue-600 group-hover:text-white transition">👤</div>
                <span>Halo, <b>{user.email.split('@')[0]}</b></span>
            </Link>
        ) : (
            <Link href="/masuk" className="text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded-full transition border border-blue-100">
                Login / Daftar 👤
            </Link>
        )}
      </nav>

      {/* HEADER BARU: GRADASI SULTAN */}
      <header className="bg-gradient-to-br from-blue-900 via-blue-600 to-cyan-500 text-white shadow-2xl py-24 text-center relative overflow-hidden">
        
        {/* Hiasan Latar (Cahaya Blur) */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-x-20 -translate-y-20"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-yellow-400 opacity-20 rounded-full blur-3xl translate-x-20 translate-y-20"></div>

        <div className="container mx-auto px-6 relative z-10">
            {/* Logo dengan efek melayang */}
            {toko.logo && (
              <div className="mb-8 relative inline-block">
                <div className="absolute inset-0 bg-white opacity-20 blur-xl rounded-full"></div>
                <img src={toko.logo} alt="Logo" className="h-32 mx-auto relative bg-white p-3 rounded-full shadow-lg object-contain hover:scale-110 transition duration-500"/>
              </div>
            )}
            
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight drop-shadow-lg">
              {toko.nama_toko}
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 font-light max-w-2xl mx-auto leading-relaxed mb-10">
              {toko.tagline ? toko.tagline : 'Temukan Produk Digital Terbaik Di Sini'}
            </p>

            <button 
                onClick={() => document.getElementById('produk-area')?.scrollIntoView({behavior: 'smooth'})} 
                className="bg-white text-blue-700 px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:bg-yellow-400 hover:text-blue-900 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
                Mulai Belanja 🛍️
            </button>
        </div>
      </header>

      {/* DAFTAR PRODUK */}
      <main className="container mx-auto px-6 py-12">
        {loading ? <div className="text-center py-20 text-gray-400">Sedang memuat produk...</div> : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {produk.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition hover:-translate-y-1 duration-300 border border-gray-100 group flex flex-col h-full">
                        <div className="h-56 bg-gray-100 overflow-hidden relative">
                            <img src={item.gambar} alt={item.nama} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                        </div>
                        <div className="p-6 flex flex-col flex-grow">
                            <h3 className="text-xl font-bold text-gray-800 mb-2 leading-tight">{item.nama}</h3>
                            <p className="text-gray-500 text-sm mb-4 line-clamp-3 flex-grow">{item.deskripsi}</p>
                            <div className="pt-4 border-t border-gray-50 flex justify-between items-center mt-auto">
                                <span className="text-lg font-bold text-blue-600">Rp {Number(item.harga).toLocaleString('id-ID')}</span>
                                <button 
                                    onClick={() => handleBeli(item)} // Kirim seluruh data item
                                    style={{ backgroundColor: toko.warna_header }} 
                                    className="px-5 py-2.5 rounded-lg text-white font-bold text-sm hover:opacity-90 hover:shadow-lg transition transform active:scale-95"
                                >
                                    Beli Sekarang 🛒
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </main>

      <footer className="bg-gray-900 text-white text-center py-8 mt-12 border-t border-gray-800">
        <p className="text-sm opacity-60 font-medium">&copy; {new Date().getFullYear()} {toko.nama_toko}. All rights reserved.</p>
      </footer>
    </div>
  );
}