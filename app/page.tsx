'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
// 👇 IMPORT KOMPONEN BARU
import FloatingWA from './components/FloatingWA';

export default function Home() {
  const [produk, setProduk] = useState<any[]>([]);
  const [filteredProduk, setFilteredProduk] = useState<any[]>([]);
  
  const [toko, setToko] = useState({ 
    nama_toko: 'Loodfie Market', 
    deskripsi: 'Pusat Produk Digital Terlengkap',
    header_bg: null,
    footer_bg: null,
    font_style: 'Inter'
  });
  
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('Semua');
  const emailBos = process.env.NEXT_PUBLIC_ADMIN_EMAIL; 

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
    const toastId = toast.loading("Keluar...");
    await supabase.auth.signOut();
    setUser(null); 
    router.refresh(); 
    toast.success("Berhasil Keluar! 👋", { id: toastId });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900" style={{ fontFamily: `"${toko.font_style}", sans-serif` }}>
      <Toaster position="bottom-left" />
      
      {/* 👇 PASANG TOMBOL WA DISINI */}
      <FloatingWA />

      <style jsx global>{` @import url('${fontMap[toko.font_style] || fontMap['Inter']}'); `}</style>

      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-2.5' : 'bg-transparent py-4'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-8 h-8 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center text-white font-bold text-base shadow border border-white/20">L</div>
            <span className={`text-lg font-bold tracking-tight ${scrolled ? 'text-gray-900' : 'text-white drop-shadow-md'}`}>{toko.nama_toko}</span>
          </div>
          <div className="flex items-center gap-3">
            {user?.email === emailBos && (
                <Link href="/admin" className="hidden md:flex items-center gap-2 bg-gray-900 text-white px-3 py-1.5 rounded-full font-bold text-[11px] shadow-lg hover:bg-gray-700 transition">⚙️ Admin</Link>
            )}
            {user ? (
               <>
                <Link href="/dashboard" className="hidden md:flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur px-3 py-1.5 rounded-full border border-white/20 transition text-white font-bold text-[11px]">Dashboard</Link>
                <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1.5 rounded-full font-bold text-[11px] shadow hover:bg-red-600 transition">Keluar</button>
               </>
            ) : (
              <Link href="/masuk" className="bg-white text-blue-600 px-4 py-1.5 rounded-full font-bold text-[11px] shadow hover:scale-105 transition">Masuk</Link>
            )}
          </div>
        </div>
      </nav>

      <header className="relative pt-28 pb-16 px-6 text-center overflow-hidden rounded-b-[2rem] shadow-lg mb-8 bg-gray-900">
        {toko.header_bg ? (
            <>
                <div className="absolute inset-0 z-0"><img src={toko.header_bg} alt="Header Background" className="w-full h-full object-cover opacity-80" /></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30 z-0"></div>
            </>
        ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 z-0"><div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl animate-pulse"></div></div>
        )}
        <div className="relative z-10 max-w-3xl mx-auto text-white">
          <span className="bg-white/20 backdrop-blur px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase mb-3 inline-block border border-white/30">Platform Digital No. #1</span>
          <h1 className="text-2xl md:text-4xl font-extrabold mb-3 tracking-tight leading-tight drop-shadow-lg">{toko.nama_toko}</h1>
          <p className="text-gray-100 text-sm md:text-base mb-6 font-light max-w-xl mx-auto leading-relaxed drop-shadow-md">{toko.deskripsi}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => document.getElementById('produk-area')?.scrollIntoView({ behavior: 'smooth' })} className="bg-white text-gray-900 px-5 py-2.5 rounded-full font-bold text-sm shadow-xl hover:scale-105 transition">Mulai Belanja 🛍️</button>
            <a href="https://wa.me/6285314445959" target="_blank" className="px-5 py-2.5 rounded-full font-bold text-sm border-2 border-white/40 hover:bg-white/10 transition">Hubungi Admin 📞</a>
          </div>
        </div>
      </header>

      <div id="produk-area" className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white p-3 rounded-xl shadow-md border border-gray-100 flex flex-col md:flex-row gap-3 items-center">
                <input type="text" placeholder="Cari produk..." className="w-full pl-4 pr-4 py-2 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto scrollbar-hide">
                    {['Semua', 'Ebook', 'Template', 'Source Code', 'Video'].map((kat) => (
                        <button key={kat} onClick={() => setSelectedKategori(kat)} className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${selectedKategori === kat ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{kat}</button>
                    ))}
                </div>
            </div>
        </div>
        {filteredProduk.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300"><p className="text-gray-400 text-sm">Produk tidak ditemukan...</p></div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
                {filteredProduk.map((item) => (
                    <div key={item.id} className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden border border-gray-100 flex flex-col h-full">
                        <div className="h-36 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                            <img src={item.gambar} alt={item.nama_produk} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                            <span className="absolute top-2 left-2 bg-white/90 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide shadow-sm">{item.kategori}</span>
                        </div>
                        <div className="p-3 flex flex-col flex-grow">
                            <h3 className="text-sm font-bold mb-1 group-hover:text-blue-600 transition leading-snug line-clamp-2">{item.nama_produk}</h3>
                            <p className="text-gray-500 text-[11px] mb-2 line-clamp-2">{item.deskripsi}</p>
                            <div className="mt-auto flex justify-between items-center pt-2 border-t border-gray-100">
                                <span className="text-sm font-extrabold text-blue-600">Rp {Number(item.harga).toLocaleString('id-ID')}</span>
                                <Link href={`/produk/${item.id}`} className="bg-gray-900 text-white w-7 h-7 rounded-full flex items-center justify-center hover:bg-blue-600 transition shadow-md text-[10px]">➜</Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
      
      <footer className="relative bg-gray-900 text-white pt-10 pb-6 mt-10 border-t-4 border-blue-500 overflow-hidden">
        {toko.footer_bg && (<><div className="absolute inset-0 z-0"><img src={toko.footer_bg} className="w-full h-full object-cover opacity-60" /></div><div className="absolute inset-0 bg-black/80 z-0"></div></>)}
        <div className="relative container mx-auto px-6 z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><span className="bg-gradient-to-br from-blue-600 to-cyan-500 text-white w-7 h-7 rounded-lg flex items-center justify-center text-xs shadow-lg">L</span>{toko.nama_toko}</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4 pr-4">Platform jual beli produk digital terpercaya. Garansi akses selamanya.</p>
              <div className="flex gap-2.5">
                <a href="#" className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition cursor-pointer shadow border border-gray-700 text-[10px]">IG</a>
                <a href="#" className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition cursor-pointer shadow border border-gray-700 text-[10px]">FB</a>
                <a href="https://wa.me/6285314445959" target="_blank" className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center hover:bg-green-500 hover:text-white transition cursor-pointer shadow border border-gray-700 text-[10px]">WA</a>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold mb-3 text-blue-400 uppercase tracking-wider">Menu Pintas</h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li><Link href="/" className="hover:text-white transition flex items-center gap-2">🏠 Beranda</Link></li>
                <li><button onClick={() => document.getElementById('produk-area')?.scrollIntoView({behavior: 'smooth'})} className="hover:text-white transition flex items-center gap-2 text-left">🛍️ Katalog Produk</button></li>
                <li><Link href="/dashboard" className="hover:text-white transition flex items-center gap-2">👤 Member Area</Link></li>
                <li><a href="https://wa.me/6285314445959" target="_blank" className="hover:text-green-400 transition flex items-center gap-2">📞 Hubungi Kami</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold mb-3 text-blue-400 uppercase tracking-wider">Metode Pembayaran</h4>
              <div className="flex flex-wrap gap-1 mb-3">
                {['BCA', 'Mandiri', 'BRI', 'DANA', 'OVO', 'Gopay', 'QRIS'].map((bank) => (<span key={bank} className="bg-white text-blue-900 px-2 py-0.5 rounded font-bold text-[9px] shadow-sm cursor-default">{bank}</span>))}
              </div>
              <div className="p-3 bg-gray-800/80 backdrop-blur rounded-xl border border-gray-700 flex items-center gap-3"><span className="text-xl">🔒</span><div><p className="text-xs font-bold text-gray-200">Jaminan Keamanan 100%</p><p className="text-[9px] text-gray-400 mt-0.5">Transaksi terenkripsi & data privasi terjaga.</p></div></div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-4 text-center relative z-10"><p className="text-gray-500 text-xs">&copy; {new Date().getFullYear()} <span className="text-white font-bold">{toko.nama_toko}</span>. All rights reserved.</p></div>
        </div>
      </footer>
    </div>
  );
}