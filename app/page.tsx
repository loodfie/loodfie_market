'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [produk, setProduk] = useState<any[]>([]);
  const [filteredProduk, setFilteredProduk] = useState<any[]>([]);
  const [toko, setToko] = useState({ nama_toko: 'Loodfie Market', deskripsi: 'Pusat Produk Digital Terlengkap' });
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  
  // --- GANTI EMAIL INI DENGAN EMAIL LOGIN KAMU! 👇 ---
  const emailBos = "pordjox75@gmail.com"; 

  // State Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('Semua');

  const router = useRouter();

  useEffect(() => {
    async function initData() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      const { data: dataProduk } = await supabase.from('produk').select('*').order('id', { ascending: false });
      if (dataProduk) {
        setProduk(dataProduk);
        setFilteredProduk(dataProduk);
      }

      const { data: dataToko } = await supabase.from('toko').select('*').single();
      if (dataToko) setToko(dataToko);
    }

    initData();

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Logika Filter
  useEffect(() => {
    let hasil = produk;
    if (selectedKategori !== 'Semua') {
      hasil = hasil.filter(item => item.kategori && item.kategori.toLowerCase() === selectedKategori.toLowerCase());
    }
    if (searchTerm) {
      hasil = hasil.filter(item => 
        item.nama_produk.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.deskripsi && item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    setFilteredProduk(hasil);
  }, [searchTerm, selectedKategori, produk]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
    alert("Berhasil Keluar!"); 
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      
      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">L</div>
            <span className={`text-xl font-bold tracking-tight ${scrolled ? 'text-gray-900' : 'text-white'}`}>
              {toko.nama_toko}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* TOMBOL RAHASIA ADMIN (Hanya Muncul untuk Bos) */}
                {user.email === emailBos && (
                    <Link href="/admin" className="hidden md:flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-lg hover:bg-gray-700 transition transform hover:scale-105 border border-gray-700">
                        ⚙️ Admin Panel
                    </Link>
                )}

                <Link href="/dashboard" className="hidden md:flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur px-5 py-2.5 rounded-full border border-white/20 transition group shadow-lg">
                    <span className={`text-sm font-bold ${scrolled ? 'text-gray-800' : 'text-white'}`}>Dashboard</span>
                </Link>
                
                <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-lg transition transform hover:scale-105">
                    Keluar 🚪
                </button>
              </>
            ) : (
              <div className="flex gap-3">
                 <Link href="/masuk" className={`px-5 py-2.5 rounded-full font-bold text-sm transition ${scrolled ? 'text-gray-600 hover:text-blue-600' : 'text-white/90 hover:text-white'}`}>Masuk</Link>
                 <Link href="/daftar" className="bg-white text-blue-600 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-blue-50 transition shadow-xl hover:scale-105 hover:shadow-blue-500/20">Daftar</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* HEADER */}
      <header className="bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 text-white pt-40 pb-32 px-6 text-center relative overflow-hidden rounded-b-[3rem] shadow-2xl mb-12">
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
            {toko.deskripsi || 'Temukan ribuan aset digital, template, dan e-book berkualitas tinggi.'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => document.getElementById('produk-area')?.scrollIntoView({ behavior: 'smooth' })} className="bg-white text-blue-700 px-8 py-4 rounded-full font-bold text-lg shadow-2xl hover:scale-105 hover:shadow-white/50 transition-all duration-300 flex items-center justify-center gap-2">
                Mulai Belanja 🛍️
            </button>
            <a href="https://wa.me/6285314445959" target="_blank" className="px-8 py-4 rounded-full font-bold text-lg border-2 border-white/30 hover:bg-white/10 transition flex items-center justify-center gap-2">
                Hubungi Admin 📞
            </a>
          </div>
        </div>
      </header>

      {/* AREA PRODUK */}
      <div id="produk-area" className="container mx-auto px-6 py-12">
        
        {/* Search & Filter */}
        <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative w-full md:w-1/2">
                    <span className="absolute left-4 top-3.5 text-gray-400">🔍</span>
                    <input 
                        type="text" 
                        placeholder="Cari produk apa hari ini?" 
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 transition outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-1/2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {['Semua', 'Ebook', 'Template', 'Source Code'].map((kat) => (
                        <button key={kat} onClick={() => setSelectedKategori(kat)} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition ${selectedKategori === kat ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                            {kat}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Daftar Produk */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
             {searchTerm ? `Hasil Pencarian: "${searchTerm}"` : 'Katalog Produk 🔥'}
          </h2>
        </div>

        {filteredProduk.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                <span className="text-6xl mb-4 block">🤔</span>
                <p className="text-gray-400 text-lg">{searchTerm ? `Tidak ada produk "${searchTerm}"` : 'Belum ada produk...'}</p>
                <button onClick={() => {setSearchTerm(''); setSelectedKategori('Semua')}} className="mt-4 text-blue-600 font-bold hover:underline">Reset Pencarian</button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProduk.map((item) => (
                <div key={item.id} className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full">
                
                <div className="h-64 overflow-hidden relative bg-gray-100 flex items-center justify-center p-6">
                    <div className="absolute top-4 left-4 z-10">
                        <span className="bg-white/90 backdrop-blur text-blue-800 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm border border-blue-100 uppercase tracking-wide">
                        {item.kategori || 'Digital'}
                        </span>
                    </div>
                    {item.gambar ? (
                         <img src={item.gambar} alt={item.nama_produk} className="w-full h-full object-contain transform group-hover:scale-110 transition duration-700 ease-in-out" />
                    ) : (
                        <span className="text-6xl">📦</span>
                    )}
                </div>

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

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-20 pb-10 mt-20 border-t-4 border-blue-500">
        <div className="container mx-auto px-6">
           {/* (Isi Footer sama seperti sebelumnya) */}
           <div className="text-center text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} <span className="text-white font-bold">{toko.nama_toko}</span>. All rights reserved.
           </div>
        </div>
      </footer>
    </div>
  );
}
