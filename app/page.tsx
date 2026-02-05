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

     {/* AREA PRODUK YANG DIPERCANTIK */}
      <div id="produk-area" className="container mx-auto px-6 py-20 bg-gray-50">
        
        {/* Judul Seksi dengan Garis Bawah Cantik */}
        <div className="text-center mb-16">
          <span className="text-blue-600 font-bold tracking-wider uppercase text-sm">Katalog Pilihan</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2 mb-4">Produk Unggulan Kami 🔥</h2>
          <div className="w-20 h-1.5 bg-gradient-to-r from-blue-500 to-cyan-400 mx-auto rounded-full"></div>
        </div>

        {/* Grid Produk Baru */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {produk.map((item) => (
            <div key={item.id} className="group bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100">
               
               {/* Bagian Gambar (Zoom Effect) */}
               <div className="h-64 overflow-hidden relative bg-gray-100">
                  {/* Label Kategori Pojok */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-white/90 backdrop-blur text-blue-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm border border-blue-100">
                      Digital Product
                    </span>
                  </div>

                  <img 
                    src={item.gambar} 
                    alt={item.nama_produk} 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700 ease-in-out" 
                  />
                  
                  {/* Overlay Gelap saat Hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition duration-300"></div>
               </div>

               {/* Bagian Informasi Produk */}
               <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-3 leading-tight group-hover:text-blue-600 transition">
                    {item.nama_produk}
                  </h3>
                  
                  {/* Deskripsi Singkat (Dibatasi 2 baris) */}
                  <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">
                    {item.deskripsi || 'Deskripsi produk belum tersedia. Segera miliki produk berkualitas ini sekarang juga.'}
                  </p>
                  
                  {/* Harga & Tombol */}
                  <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                     <div className="flex flex-col">
                        <span className="text-xs text-gray-400 font-semibold uppercase">Harga Spesial</span>
                        <span className="text-2xl font-extrabold text-blue-600">
                          Rp {Number(item.harga).toLocaleString('id-ID')}
                        </span>
                     </div>
                     
                     <Link href={`/produk/${item.id}`} className="bg-gray-900 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 hover:scale-110 hover:rotate-12 transition-all duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                     </Link>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="bg-gray-900 text-white text-center py-8 mt-12 border-t border-gray-800">
        <p className="text-sm opacity-60 font-medium">&copy; {new Date().getFullYear()} {toko.nama_toko}. All rights reserved.</p>
      </footer>
    </div>
  );
}