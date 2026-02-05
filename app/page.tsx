'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function Home() {
  const [produk, setProduk] = useState<any[]>([]);
  const [toko, setToko] = useState({ nama_toko: 'Loodfie Market', deskripsi: 'Pusat Produk Digital Terlengkap' });
  const [user, setUser] = useState<any>(null); // Untuk cek login
  const [scrolled, setScrolled] = useState(false); // Untuk efek navbar

  useEffect(() => {
    // 1. Cek Login & Data
    async function initData() {
      // Cek User
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      // Ambil Produk
      const { data: dataProduk } = await supabase.from('produk').select('*').order('id', { ascending: false });
      if (dataProduk) setProduk(dataProduk);

      // Ambil Info Toko (Opsional, kalau ada tabel toko)
      const { data: dataToko } = await supabase.from('toko').select('*').single();
      if (dataToko) setToko(dataToko);
    }

    initData();

    // 2. Efek Scroll untuk Navbar
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      
      {/* --- NAVBAR MELAYANG (GLASSMORPHISM) --- */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">L</div>
            <span className={`text-xl font-bold tracking-tight ${scrolled ? 'text-gray-900' : 'text-white'}`}>
              {toko.nama_toko}
            </span>
          </div>

          {/* Menu Kanan */}
          <div className="flex items-center gap-4">
            {user ? (
              // Kalau Sudah Login -> Muncul Foto/Inisial & Dashboard
              <Link href="/dashboard" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur px-4 py-2 rounded-full border border-white/20 transition group">
                <span className={`text-sm font-medium ${scrolled ? 'text-gray-800' : 'text-white'}`}>
                  Dashboard
                </span>
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-[10px] text-white">
                   👤
                </div>
              </Link>
            ) : (
              // Kalau Belum Login -> Muncul Tombol Masuk
              <Link href="/masuk" className="bg-white text-blue-600 px-5 py-2 rounded-full font-bold text-sm hover:bg-blue-50 transition shadow-lg hover:scale-105">
                Masuk / Daftar
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* --- HEADER SULTAN (GRADASI) --- */}
      <header className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 text-white py-32 md:py-48 px-6 text-center relative overflow-hidden">
        {/* Hiasan Background (Bulatan Samar) */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300 opacity-20 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
            {toko.nama_toko}
          </h1>
          <p className="text-blue-100 text-lg md:text-xl mb-10 font-light">
            {toko.deskripsi || 'Platform terbaik untuk kebutuhan digital Anda.'}
          </p>
          <button 
            onClick={() => document.getElementById('produk-area')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold text-lg shadow-2xl hover:scale-105 hover:shadow-blue-500/50 transition-all duration-300 flex items-center gap-2 mx-auto"
          >
            Mulai Belanja 🛍️
          </button>
        </div>
      </header>

      {/* --- AREA PRODUK (SULTAN) --- */}
      <div id="produk-area" className="container mx-auto px-6 py-20 bg-gray-50">
        <div className="text-center mb-16">
          <span className="text-blue-600 font-bold tracking-wider uppercase text-sm">Katalog Pilihan</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2 mb-4">Produk Unggulan Kami 🔥</h2>
          <div className="w-20 h-1.5 bg-gradient-to-r from-blue-500 to-cyan-400 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {produk.map((item) => (
            <div key={item.id} className="group bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100">
               <div className="h-64 overflow-hidden relative bg-gray-100">
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-white/90 backdrop-blur text-blue-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm border border-blue-100">
                      Digital Product
                    </span>
                  </div>
                  <img src={item.gambar} alt={item.nama_produk} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700 ease-in-out" />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition duration-300"></div>
               </div>

               <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-3 leading-tight group-hover:text-blue-600 transition">{item.nama_produk}</h3>
                  <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">
                    {item.deskripsi || 'Deskripsi produk belum tersedia.'}
                  </p>
                  <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                     <div className="flex flex-col">
                        <span className="text-xs text-gray-400 font-semibold uppercase">Harga Spesial</span>
                        <span className="text-2xl font-extrabold text-blue-600">Rp {Number(item.harga).toLocaleString('id-ID')}</span>
                     </div>
                     <Link href={`/produk/${item.id}`} className="bg-gray-900 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 hover:scale-110 hover:rotate-12 transition-all duration-300">
                        ➜
                     </Link>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- FOOTER PREMIUM V2 --- */}
      <footer className="bg-gray-900 text-white pt-16 pb-8 mt-20 border-t-4 border-blue-500">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="bg-blue-600 text-white w-8 h-8 rounded flex items-center justify-center text-sm">L</span>
                {toko.nama_toko}
              </h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                Platform jual beli produk digital terpercaya. Transaksi aman, file langsung terkirim otomatis.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 transition">IG</a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition">FB</a>
                {/* JANGAN LUPA UPDATE NOMOR WA DISINI LAGI YA */}
                <a href="https://wa.me/6285314445959" target="_blank" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-green-500 transition">WA</a>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6 text-blue-400 uppercase tracking-wider">Menu Pintas</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/" className="hover:text-blue-400 transition">🏠 Beranda</Link></li>
                <li><button onClick={() => document.getElementById('produk-area')?.scrollIntoView({behavior: 'smooth'})} className="hover:text-blue-400 transition">🛍️ Katalog Produk</button></li>
                <li><Link href="/dashboard" className="hover:text-blue-400 transition">👤 Member Area</Link></li>
                <li><a href="https://wa.me/6285314445959" target="_blank" className="hover:text-green-400 transition">📞 Hubungi Kami</a></li>
              </ul>
            </div>
            <div>
               <h4 className="text-lg font-bold mb-6 text-blue-400 uppercase tracking-wider">Pembayaran</h4>
               <p className="text-gray-400 mb-4 text-sm">Metode pembayaran yang kami terima:</p>
               <div className="flex flex-wrap gap-2">
                  {['BCA', 'Mandiri', 'DANA', 'OVO', 'QRIS'].map(bank => (
                    <span key={bank} className="bg-white text-blue-900 px-3 py-1 rounded font-bold text-xs shadow cursor-default">{bank}</span>
                  ))}
               </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} {toko.nama_toko}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}