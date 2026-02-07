'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [produk, setProduk] = useState<any[]>([]);
  const [toko, setToko] = useState({ nama_toko: 'Loodfie Market', deskripsi: 'Pusat Produk Digital Terlengkap' });
  const [user, setUser] = useState<any>(null); // Untuk cek login
  const [scrolled, setScrolled] = useState(false); // Untuk efek navbar
  const router = useRouter();

  useEffect(() => {
    // 1. Cek Login & Data
    async function initData() {
      // Cek User
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      // Ambil Produk dari Supabase
      const { data: dataProduk } = await supabase.from('produk').select('*').order('id', { ascending: false });
      if (dataProduk) setProduk(dataProduk);

      // Ambil Info Toko (Opsional)
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

  // --- FUNGSI LOGOUT (BARU) ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null); // Kosongkan data user
    router.refresh(); // Refresh halaman
    alert("Berhasil Keluar!"); 
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      
      {/* --- 1. NAVBAR MELAYANG (GLASSMORPHISM) --- */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">L</div>
            <span className={`text-xl font-bold tracking-tight ${scrolled ? 'text-gray-900' : 'text-white'}`}>
              {toko.nama_toko}
            </span>
          </div>

          {/* Menu Kanan (Logika Login/Logout) */}
          <div className="flex items-center gap-3">
            {user ? (
              // KONDISI SUDAH LOGIN: Muncul Dashboard & Keluar
              <>
                <Link href="/dashboard" className="hidden md:flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur px-5 py-2.5 rounded-full border border-white/20 transition group shadow-lg">
                    <span className={`text-sm font-bold ${scrolled ? 'text-gray-800' : 'text-white'}`}>
                    Dashboard
                    </span>
                </Link>
                
                {/* Tombol Logout Merah */}
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-lg transition transform hover:scale-105"
                >
                    Keluar 🚪
                </button>
              </>
            ) : (
              // KONDISI BELUM LOGIN: Muncul Masuk & Daftar
              <div className="flex gap-3">
                 <Link href="/masuk" className={`px-5 py-2.5 rounded-full font-bold text-sm transition ${scrolled ? 'text-gray-600 hover:text-blue-600' : 'text-white/90 hover:text-white'}`}>
                    Masuk
                 </Link>
                 <Link href="/daftar" className="bg-white text-blue-600 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-blue-50 transition shadow-xl hover:scale-105 hover:shadow-blue-500/20">
                    Daftar
                 </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* --- 2. HEADER SULTAN (GRADASI MEWAH) --- */}
      <header className="bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 text-white pt-40 pb-32 px-6 text-center relative overflow-hidden rounded-b-[3rem] shadow-2xl mb-12">
        {/* Hiasan Background */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-cyan-300 opacity-20 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="bg-white/20 backdrop-blur px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase mb-6 inline-block border border-white/30">
            Platform Digital No. #1
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight drop-shadow-sm">
            {toko.nama_toko}
          </h1>
          <p className="text-blue-100 text-lg md:text-xl mb-10 font-light max-w-2xl mx-auto leading-relaxed">
            {toko.deskripsi || 'Temukan ribuan aset digital, template, dan e-book berkualitas tinggi untuk kebutuhan bisnis Anda.'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
                onClick={() => document.getElementById('produk-area')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-blue-700 px-8 py-4 rounded-full font-bold text-lg shadow-2xl hover:scale-105 hover:shadow-white/50 transition-all duration-300 flex items-center justify-center gap-2"
            >
                Mulai Belanja 🛍️
            </button>
            <a href="https://wa.me/6285314445959" target="_blank" className="px-8 py-4 rounded-full font-bold text-lg border-2 border-white/30 hover:bg-white/10 transition flex items-center justify-center gap-2">
                Hubungi Admin 📞
            </a>
          </div>
        </div>
      </header>

      {/* --- 3. AREA PRODUK (KARTU ELEGAN) --- */}
      <div id="produk-area" className="container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Produk Unggulan 🔥</h2>
          <p className="text-gray-500">Pilih produk terbaik untuk meningkatkan produktivitasmu.</p>
        </div>

        {produk.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                <p className="text-gray-400 text-lg">Belum ada produk yang ditampilkan...</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {produk.map((item) => (
                <div key={item.id} className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full">
                
                {/* Gambar Produk */}
                <div className="h-64 overflow-hidden relative bg-gray-100 flex items-center justify-center p-6">
                    <div className="absolute top-4 left-4 z-10">
                        <span className="bg-white/90 backdrop-blur text-blue-800 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm border border-blue-100 uppercase tracking-wide">
                        Digital Product
                        </span>
                    </div>
                    {item.gambar ? (
                         <img src={item.gambar} alt={item.nama_produk} className="w-full h-full object-contain transform group-hover:scale-110 transition duration-700 ease-in-out" />
                    ) : (
                        <span className="text-6xl">📦</span>
                    )}
                </div>

                {/* Info Produk */}
                <div className="p-8 flex flex-col flex-grow">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3 leading-tight group-hover:text-blue-600 transition line-clamp-2">
                        {item.nama_produk}
                    </h3>
                    <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed flex-grow">
                        {item.deskripsi || 'Deskripsi produk belum tersedia.'}
                    </p>
                    
                    <div className="flex justify-between items-center pt-6 border-t border-gray-100 mt-auto">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-400 font-semibold uppercase">Harga</span>
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
        )}
      </div>

      {/* --- 4. FOOTER PREMIUM (LINK AKTIF) --- */}
      <footer className="bg-gray-900 text-white pt-20 pb-10 mt-20 border-t-4 border-blue-500">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            
            {/* Kolom 1: Brand */}
            <div>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="bg-gradient-to-br from-blue-600 to-cyan-500 text-white w-10 h-10 rounded-lg flex items-center justify-center text-lg shadow-lg">L</span>
                {toko.nama_toko}
              </h3>
              <p className="text-gray-400 leading-relaxed mb-8 pr-4">
                Platform jual beli produk digital terpercaya. Transaksi aman, file langsung terkirim otomatis ke dashboard member.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition cursor-pointer shadow-lg">IG</a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition cursor-pointer shadow-lg">FB</a>
                <a href="https://wa.me/6285314445959" target="_blank" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-green-500 hover:text-white transition cursor-pointer shadow-lg">WA</a>
              </div>
            </div>

            {/* Kolom 2: Menu Pintas */}
            <div>
              <h4 className="text-lg font-bold mb-6 text-blue-400 uppercase tracking-wider">Menu Pintas</h4>
              <ul className="space-y-4 text-gray-400">
                <li><Link href="/" className="hover:text-white transition flex items-center gap-2 hover:translate-x-1 duration-200">🏠 Beranda</Link></li>
                <li><button onClick={() => document.getElementById('produk-area')?.scrollIntoView({behavior: 'smooth'})} className="hover:text-white transition flex items-center gap-2 hover:translate-x-1 duration-200">🛍️ Katalog Produk</button></li>
                <li><Link href="/dashboard" className="hover:text-white transition flex items-center gap-2 hover:translate-x-1 duration-200">👤 Member Area</Link></li>
                <li><a href="https://wa.me/6285314445959" target="_blank" className="hover:text-green-400 transition flex items-center gap-2 hover:translate-x-1 duration-200">📞 Hubungi Kami</a></li>
              </ul>
            </div>

            {/* Kolom 3: Pembayaran */}
            <div>
              <h4 className="text-lg font-bold mb-6 text-blue-400 uppercase tracking-wider">Metode Pembayaran</h4>
              <div className="flex flex-wrap gap-2 mb-6">
                {['BCA', 'Mandiri', 'BRI', 'DANA', 'OVO', 'Gopay', 'QRIS'].map((bank) => (
                    <span key={bank} className="bg-white text-blue-900 px-3 py-1.5 rounded-md font-bold text-xs shadow-sm cursor-default hover:bg-blue-50 transition">
                        {bank}
                    </span>
                ))}
              </div>
              
              <div className="p-5 bg-gray-800/50 rounded-xl border border-gray-700 flex items-center gap-4">
                <span className="text-3xl">🔒</span>
                <div>
                  <p className="text-sm font-bold text-gray-200">Jaminan Keamanan 100%</p>
                  <p className="text-xs text-gray-500 mt-1">Transaksi terenkripsi & data privasi terjaga.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} <span className="text-white font-bold">{toko.nama_toko}</span>. All rights reserved.
            </p>
            <p className="text-gray-600 text-xs mt-2 opacity-50">Designed with ❤️ by Loodfie Tech</p>
          </div>
        </div>
      </footer>
    </div>
  );
}