'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [produk, setProduk] = useState<any[]>([]);
  const [filteredProduk, setFilteredProduk] = useState<any[]>([]);
  
  // Default Data
  const [toko, setToko] = useState({ 
    nama_toko: 'Loodfie Market', 
    deskripsi: 'Pusat Produk Digital Terlengkap',
    header_bg: null,
    font_style: 'Inter'
  });
  
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('Semua');

  // ⚠️ EMAIL BOS PERMANEN
  const emailBos = "pordjox75@gmail.com"; 

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

    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- DAFTAR FONT LENGKAP ---
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

  // Logika Filter
  useEffect(() => {
    let hasil = produk;
    if (selectedKategori !== 'Semua') {
      hasil = hasil.filter(item => item.kategori && item.kategori.toLowerCase() === selectedKategori.toLowerCase());
    }
    if (searchTerm) {
      hasil = hasil.filter(item => item.nama_produk.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    setFilteredProduk(hasil);
  }, [searchTerm, selectedKategori, produk]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null); router.refresh(); alert("Berhasil Keluar!"); 
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900" style={{ fontFamily: `"${toko.font_style}", sans-serif` }}>
      
      {/* Inject Font CSS */}
      <style jsx global>{`
        @import url('${fontMap[toko.font_style] || fontMap['Inter']}');
      `}</style>

      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-white font-bold text-xl shadow border border-white/20">L</div>
            <span className={`text-xl font-bold tracking-tight ${scrolled ? 'text-gray-900' : 'text-white drop-shadow-md'}`}>
              {toko.nama_toko}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {user?.email === emailBos && (
                <Link href="/admin" className="hidden md:flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-lg hover:bg-gray-700 transition">⚙️ Admin</Link>
            )}
            {user ? (
               <>
                <Link href="/dashboard" className="hidden md:flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur px-5 py-2.5 rounded-full border border-white/20 transition text-white font-bold text-sm">Dashboard</Link>
                <button onClick={handleLogout} className="bg-red-500 text-white px-5 py-2.5 rounded-full font-bold text-sm shadow hover:bg-red-600 transition">Keluar</button>
               </>
            ) : (
              <Link href="/masuk" className="bg-white text-blue-600 px-6 py-2.5 rounded-full font-bold text-sm shadow hover:scale-105 transition">Masuk</Link>
            )}
          </div>
        </div>
      </nav>

      {/* HEADER DINAMIS */}
      <header className="relative pt-40 pb-32 px-6 text-center overflow-hidden rounded-b-[3rem] shadow-2xl mb-12 bg-gray-900">
        {toko.header_bg ? (
            <>
                <div className="absolute inset-0 z-0">
                    <img src={toko.header_bg} alt="Header Background" className="w-full h-full object-cover opacity-80" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30 z-0"></div>
            </>
        ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 z-0">
                 <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl animate-pulse"></div>
            </div>
        )}

        <div className="relative z-10 max-w-4xl mx-auto text-white">
          <span className="bg-white/20 backdrop-blur px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase mb-6 inline-block border border-white/30">
            Platform Digital No. #1
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight drop-shadow-lg">
            {toko.nama_toko}
          </h1>
          <p className="text-gray-100 text-lg md:text-xl mb-10 font-light max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            {toko.deskripsi}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => document.getElementById('produk-area')?.scrollIntoView({ behavior: 'smooth' })} className="bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:scale-105 transition">
                Mulai Belanja 🛍️
            </button>
            <a href="https://wa.me/6285314445959" target="_blank" className="px-8 py-4 rounded-full font-bold text-lg border-2 border-white/40 hover:bg-white/10 transition">
                Hubungi Admin 📞
            </a>
          </div>
        </div>
      </header>

      {/* AREA PRODUK */}
      <div id="produk-area" className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                <input type="text" placeholder="Cari produk..." className="w-full pl-4 pr-4 py-3 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto scrollbar-hide">
                    {/* 👇 TOMBOL VIDEO DITAMBAHKAN DI SINI 👇 */}
                    {['Semua', 'Ebook', 'Template', 'Source Code', 'Video'].map((kat) => (
                        <button key={kat} onClick={() => setSelectedKategori(kat)} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition ${selectedKategori === kat ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                            {kat}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {filteredProduk.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                <p className="text-gray-400 text-lg">Produk tidak ditemukan...</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProduk.map((item) => (
                    <div key={item.id} className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition overflow-hidden border border-gray-100 flex flex-col h-full">
                        <div className="h-64 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                            <img src={item.gambar} alt={item.nama_produk} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                            <span className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm">{item.kategori}</span>
                        </div>
                        <div className="p-6 flex flex-col flex-grow">
                            <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition">{item.nama_produk}</h3>
                            <p className="text-gray-500 text-sm mb-4 line-clamp-2">{item.deskripsi}</p>
                            <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-100">
                                <span className="text-xl font-extrabold text-blue-600">Rp {Number(item.harga).toLocaleString('id-ID')}</span>
                                <Link href={`/produk/${item.id}`} className="bg-gray-900 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-600 transition shadow-lg">➜</Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
      
      {/* --- FOOTER LENGKAP --- */}
      <footer className="bg-gray-900 text-white pt-20 pb-10 mt-20 border-t-4 border-blue-500">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            
            {/* Kolom 1: Brand & Sosmed */}
            <div>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="bg-gradient-to-br from-blue-600 to-cyan-500 text-white w-10 h-10 rounded-lg flex items-center justify-center text-lg shadow-lg">L</span>
                {toko.nama_toko}
              </h3>
              <p className="text-gray-400 leading-relaxed mb-8 pr-4">
                Platform jual beli produk digital terpercaya. Semua produk garansi akses selamanya.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition cursor-pointer shadow-lg">IG</a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition cursor-pointer shadow-lg">FB</a>
                <a href="https://wa.me/6285314445959" target="_blank" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-green-500 hover:text-white transition cursor-pointer shadow-lg">WA</a>
              </div>
            </div>

            {/* Kolom 2: Menu */}
            <div>
              <h4 className="text-lg font-bold mb-6 text-blue-400 uppercase tracking-wider">Menu Pintas</h4>
              <ul className="space-y-4 text-gray-400">
                <li><Link href="/" className="hover:text-white transition flex items-center gap-2 hover:translate-x-1 duration-200">🏠 Beranda</Link></li>
                <li><button onClick={() => document.getElementById('produk-area')?.scrollIntoView({behavior: 'smooth'})} className="hover:text-white transition flex items-center gap-2 hover:translate-x-1 duration-200 text-left">🛍️ Katalog Produk</button></li>
                <li><Link href="/dashboard" className="hover:text-white transition flex items-center gap-2 hover:translate-x-1 duration-200">👤 Member Area</Link></li>
                <li><a href="https://wa.me/6285314445959" target="_blank" className="hover:text-green-400 transition flex items-center gap-2 hover:translate-x-1 duration-200">📞 Hubungi Kami</a></li>
              </ul>
            </div>

            {/* Kolom 3: Pembayaran & Keamanan */}
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