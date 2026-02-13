'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { FaShoppingCart, FaWhatsapp, FaSearch, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useCart } from '@/context/CartContext';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [produk, setProduk] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [keyword, setKeyword] = useState('');
  const { items } = useCart(); // Ambil data keranjang
  const router = useRouter();

  // Load Data saat website dibuka
  useEffect(() => {
    async function getData() {
      // 1. Cek Apakah User Sudah Login?
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      // 2. Ambil Daftar Produk dari Database
      const { data, error } = await supabase
        .from('produk')
        .select('*')
        .order('id', { ascending: false });

      if (data) setProduk(data);
      setLoading(false);
    }

    getData();
  }, []);

  // Fitur Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast.success("Berhasil Logout 👋");
    window.location.reload(); // Refresh halaman biar keranjang terkunci lagi
  };

  // Logika Tombol Keranjang (SATPAM)
  const handleCartClick = (e: any) => {
    if (!user) {
      e.preventDefault(); // Cegah masuk ke halaman keranjang
      toast.error("🔒 Eits, Login dulu kalau mau lihat keranjang!", {
        icon: '🔐',
        style: { borderRadius: '10px', background: '#333', color: '#fff' },
      });
      router.push('/masuk');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Toaster position="top-center" />

      {/* --- NAVBAR --- */}
      <nav className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg font-black text-xl">L</div>
            <span className="font-bold text-xl tracking-tight text-gray-900 hidden md:block">Loodfie Market</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden md:flex relative">
             <input 
               type="text" 
               placeholder="Cari produk apa Bos?..." 
               className="w-full bg-gray-100 border-none rounded-full py-3 px-5 pl-12 focus:ring-2 focus:ring-blue-500 transition outline-none"
               onChange={(e) => setKeyword(e.target.value)}
             />
             <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
          </div>

          {/* Menu Kanan (Keranjang & User) */}
          <div className="flex items-center gap-3 md:gap-5">
            
            {/* 🛒 TOMBOL KERANJANG (SUDAH DIJAGA SATPAM) */}
            <Link 
                href={user ? "/keranjang" : "#"} 
                onClick={handleCartClick}
                className="relative p-3 rounded-full hover:bg-gray-100 transition group"
            >
                <FaShoppingCart className={`text-xl ${user ? 'text-gray-700 group-hover:text-blue-600' : 'text-gray-300'}`} />
                
                {/* Badge Angka (HANYA MUNCUL KALAU SUDAH LOGIN & ADA ISI) */}
                {user && items.length > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold border-2 border-white animate-bounce">
                        {items.length}
                    </span>
                )}
            </Link>

            {/* Tombol Login / User Profile */}
            {user ? (
                <div className="flex items-center gap-3">
                    <Link href="/dashboard" className="hidden md:flex flex-col items-end">
                        <span className="text-xs text-gray-500">Halo, Sultan</span>
                        <span className="font-bold text-sm text-gray-900 truncate max-w-[100px]">{user.email.split('@')[0]}</span>
                    </Link>
                    <button onClick={handleLogout} className="bg-red-50 text-red-500 p-3 rounded-full hover:bg-red-100 transition" title="Logout">
                        <FaSignOutAlt />
                    </button>
                </div>
            ) : (
                <div className="flex gap-2">
                    <Link href="/masuk" className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-blue-600 transition">Masuk</Link>
                    <Link href="/daftar" className="px-5 py-2.5 text-sm font-bold bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30 transition">Daftar</Link>
                </div>
            )}
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION (BANNER) --- */}
      {!keyword && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12 md:py-20 mb-10">
            <div className="container mx-auto px-4 text-center">
                <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">Belanja Digital Gak Pake Ribet.</h1>
                <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto mb-8">Temukan e-book, source code, dan aset digital terbaik untuk upgrade skill kamu sekarang juga.</p>
            </div>
        </div>
      )}

      {/* --- DAFTAR PRODUK --- */}
      <main className="container mx-auto px-4 pb-20">
        
        {/* Judul Section */}
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                🔥 {keyword ? `Hasil pencarian: "${keyword}"` : 'Produk Terbaru'}
            </h2>
        </div>

        {/* Grid Produk */}
        {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[1,2,3].map(i => <div key={i} className="h-80 bg-gray-200 rounded-2xl animate-pulse"></div>)}
             </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {produk.filter(p => p.nama_produk.toLowerCase().includes(keyword.toLowerCase())).map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition duration-300 group overflow-hidden flex flex-col h-full">
                        
                        {/* Gambar Produk */}
                        <div className="h-48 md:h-56 bg-gray-100 relative overflow-hidden">
                            {item.gambar ? (
                                <img src={item.gambar} alt={item.nama_produk} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-4xl">📦</div>
                            )}
                            {/* Label Hemat */}
                            {item.harga_coret > item.harga && (
                                <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md">
                                    Hemat {Math.round(((item.harga_coret - item.harga) / item.harga_coret) * 100)}%
                                </span>
                            )}
                        </div>

                        {/* Info Produk */}
                        <div className="p-5 flex flex-col flex-grow">
                            <div className="mb-2">
                                <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">{item.kategori || 'Digital'}</span>
                            </div>
                            <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-800 group-hover:text-blue-600 transition">{item.nama_produk}</h3>
                            
                            <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                                <div>
                                    {item.harga_coret > item.harga && <p className="text-xs text-gray-400 line-through">Rp {Number(item.harga_coret).toLocaleString('id-ID')}</p>}
                                    <p className="text-xl font-black text-blue-600">Rp {Number(item.harga).toLocaleString('id-ID')}</p>
                                </div>
                                <Link href={`/produk/${item.id}`} className="bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-600 p-3 rounded-full transition shadow-sm">
                                    ➜
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {!loading && produk.length === 0 && (
            <div className="text-center py-20">
                <p className="text-gray-400">Belum ada produk nih, Bos.</p>
            </div>
        )}
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t py-10 mt-20">
         <div className="container mx-auto px-4 text-center">
            <h3 className="font-bold text-lg mb-2">Loodfie Market</h3>
            <p className="text-gray-400 text-sm">Platform produk digital terpercaya.</p>
            <p className="text-gray-300 text-xs mt-8">&copy; {new Date().getFullYear()} All rights reserved.</p>
         </div>
      </footer>

      {/* Tombol WA Mengambang */}
      <a 
        href="https://wa.me/6285314445959" 
        target="_blank" 
        className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 hover:scale-110 transition z-50 flex items-center justify-center"
      >
        <FaWhatsapp className="text-2xl" />
      </a>
    </div>
  );
}