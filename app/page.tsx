'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { FaWhatsapp, FaShoppingCart, FaStar, FaCheckCircle, FaInstagram, FaFacebookF, FaTiktok } from 'react-icons/fa';
import { useCart } from '@/context/CartContext';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [toko, setToko] = useState<any>({
    nama_toko: 'Loodfie Market',
    deskripsi: 'Pusat Produk Digital Terlengkap',
    font_style: 'Inter',
    header_bg: null,
    footer_bg: null,
    logo: null
  });
  const [testimoni, setTestimoni] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Ambil data keranjang untuk Badge Merah
  const { items } = useCart();

  useEffect(() => {
    async function getData() {
      // 1. Ambil Data Toko
      const { data: dataToko } = await supabase.from('toko').select('*').single();
      if (dataToko) setToko(dataToko);

      // 2. Ambil Produk
      const { data: dataProduk } = await supabase.from('produk').select('*').order('id', { ascending: false });
      if (dataProduk) setProducts(dataProduk);

      // 3. Ambil Testimoni
      const { data: dataTesti } = await supabase.from('testimoni').select('*').eq('tampil', true);
      if (dataTesti) setTestimoni(dataTesti);

      setLoading(false);
    }
    getData();
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="font-bold text-gray-400 animate-pulse">Memuat Toko...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900" style={{ fontFamily: `"${toko.font_style}", sans-serif` }}>
      {/* Load Font Dinamis */}
      <style jsx global>{` @import url('${fontMap[toko.font_style] || fontMap['Inter']}'); `}</style>

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 py-3 transition-all duration-300">
        <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
            {/* LOGO AREA - LOGIKA CERDAS */}
            <Link href="/" className="flex items-center gap-2 group">
                {toko.logo ? (
                    <img src={toko.logo} alt={toko.nama_toko} className="h-10 w-auto object-contain hover:scale-105 transition duration-300" />
                ) : (
                    <div className="flex items-center gap-2">
                        <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg shadow-blue-500/30 shadow-lg">L</span>
                        <span className="font-extrabold text-xl tracking-tight text-gray-900 group-hover:text-blue-600 transition">{toko.nama_toko}</span>
                    </div>
                )}
            </Link>

            {/* MENU KANAN */}
            <div className="flex items-center gap-4 md:gap-6">
                <Link href="/keranjang" className="relative p-2 group">
                    <FaShoppingCart className="text-xl text-gray-600 group-hover:text-blue-600 transition" />
                    {items.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-bounce shadow-sm">
                            {items.length}
                        </span>
                    )}
                </Link>
                
                <Link href="/dashboard" className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-blue-50 text-sm font-bold text-gray-700 hover:text-blue-600 transition border border-transparent hover:border-blue-100">
                    <span>👤 Member Area</span>
                </Link>
                {/* Mobile Member Icon */}
                <Link href="/dashboard" className="md:hidden text-2xl">👤</Link>
            </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        {toko.header_bg && (
            <div className="absolute inset-0 z-0">
                <img src={toko.header_bg} className="w-full h-full object-cover opacity-20" alt="Background" />
                <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-transparent to-gray-50"></div>
            </div>
        )}
        
        <div className="container mx-auto px-6 text-center relative z-10 max-w-4xl mx-auto">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider mb-6 animate-fade-in-up">✨ Trusted Digital Store</span>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight text-gray-900 drop-shadow-sm">
                {toko.nama_toko}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
                {toko.deskripsi || "Temukan aset digital terbaik untuk kebutuhan bisnismu. Cepat, Aman, dan Berkualitas."}
            </p>
            
            <div className="flex flex-col md:flex-row justify-center gap-4">
                <a href="#produk" className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg shadow-xl shadow-blue-500/30 hover:bg-blue-700 hover:scale-105 transition transform">
                    🚀 Lihat Produk
                </a>
                <a href="https://wa.me/6285314445959" target="_blank" className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-full font-bold text-lg hover:bg-gray-50 hover:text-gray-900 transition flex items-center justify-center gap-2">
                    <FaWhatsapp className="text-green-500 text-xl" /> Hubungi Admin
                </a>
            </div>

            {/* STATISTIK TOKO */}
            <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto mt-16 border-t border-gray-200 pt-8">
                <div><h4 className="text-2xl md:text-3xl font-black text-gray-900">{toko.total_member || '100+'}</h4><p className="text-xs md:text-sm text-gray-500 font-bold uppercase">Member Aktif</p></div>
                <div><h4 className="text-2xl md:text-3xl font-black text-blue-600">{toko.total_terjual || '500+'}</h4><p className="text-xs md:text-sm text-gray-500 font-bold uppercase">Produk Terjual</p></div>
                <div><h4 className="text-2xl md:text-3xl font-black text-gray-900">{toko.kepuasan || '4.9'}</h4><p className="text-xs md:text-sm text-gray-500 font-bold uppercase">Rating Kepuasan</p></div>
            </div>
        </div>
      </header>

      {/* --- RUNNING TEXT --- */}
      {toko.running_text && (
        <div className="bg-yellow-400 text-yellow-900 py-3 overflow-hidden shadow-inner relative z-20">
            <div className="whitespace-nowrap animate-marquee font-bold text-sm uppercase tracking-wide flex gap-10">
                <span>📢 {toko.running_text}</span>
                <span>📢 {toko.running_text}</span>
                <span>📢 {toko.running_text}</span>
                <span>📢 {toko.running_text}</span>
            </div>
        </div>
      )}

      {/* --- PRODUK SECTION --- */}
      <section id="produk" className="py-20 bg-white relative">
        <div className="container mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-black mb-4">Produk Unggulan 🔥</h2>
                <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                {products.map((item) => (
                    <Link href={`/produk/${item.id}`} key={item.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition duration-300 flex flex-col h-full overflow-hidden relative">
                         {item.harga_coret && item.harga_coret > item.harga && (
                            <div className="absolute top-3 right-3 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md animate-pulse">
                                Hemat {Math.round(((item.harga_coret - item.harga) / item.harga_coret) * 100)}%
                            </div>
                         )}
                         
                         <div className="h-48 md:h-56 bg-gray-100 relative overflow-hidden flex items-center justify-center p-4">
                            {item.gambar ? (
                                <img src={item.gambar} alt={item.nama_produk} className="w-full h-full object-contain group-hover:scale-110 transition duration-500" />
                            ) : (
                                <span className="text-4xl">📦</span>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition duration-300"></div>
                        </div>

                        <div className="p-5 flex flex-col flex-grow">
                            <div className="mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{item.kategori}</span>
                            </div>
                            <h3 className="font-bold text-gray-800 text-sm md:text-lg mb-2 line-clamp-2 leading-snug group-hover:text-blue-600 transition">{item.nama_produk}</h3>
                            
                            <div className="mt-auto pt-4 border-t border-gray-50 flex flex-col gap-1">
                                {item.harga_coret && (
                                    <span className="text-xs text-gray-400 line-through">Rp {Number(item.harga_coret).toLocaleString('id-ID')}</span>
                                )}
                                <div className="flex justify-between items-center">
                                    <span className="text-lg md:text-xl font-black text-blue-600">Rp {Number(item.harga).toLocaleString('id-ID')}</span>
                                    <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition shadow-sm">➜</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
            
            {products.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                    <p className="text-gray-400 font-bold">Belum ada produk yang diupload.</p>
                </div>
            )}
        </div>
      </section>

      {/* --- KELEBIHAN --- */}
      <section className="py-20 bg-gray-900 text-white">
          <div className="container mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  <div className="p-8 bg-gray-800 rounded-3xl border border-gray-700 hover:border-blue-500 transition duration-300">
                      <div className="text-4xl mb-4">⚡</div>
                      <h3 className="text-xl font-bold mb-2">Akses Instan</h3>
                      <p className="text-gray-400 text-sm">Setelah pembayaran berhasil, file langsung bisa didownload saat itu juga.</p>
                  </div>
                  <div className="p-8 bg-gray-800 rounded-3xl border border-gray-700 hover:border-blue-500 transition duration-300">
                      <div className="text-4xl mb-4">🔒</div>
                      <h3 className="text-xl font-bold mb-2">Transaksi Aman</h3>
                      <p className="text-gray-400 text-sm">Menggunakan payment gateway terpercaya. Data privasi Anda terjamin 100%.</p>
                  </div>
                  <div className="p-8 bg-gray-800 rounded-3xl border border-gray-700 hover:border-blue-500 transition duration-300">
                      <div className="text-4xl mb-4">🔄</div>
                      <h3 className="text-xl font-bold mb-2">Lifetime Update</h3>
                      <p className="text-gray-400 text-sm">Beli sekali, dapatkan update materi/file selamanya tanpa biaya tambahan.</p>
                  </div>
              </div>
          </div>
      </section>

      {/* --- TESTIMONI --- */}
      {testimoni.length > 0 && (
          <section className="py-20 bg-blue-50">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-black mb-4 text-gray-900">Kata Mereka 💬</h2>
                    <p className="text-gray-600">Apa kata customer yang sudah berbelanja di sini?</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimoni.map((item) => (
                        <div key={item.id} className="bg-white p-8 rounded-3xl shadow-md border border-gray-100 relative">
                            <div className="text-4xl absolute -top-4 -left-4 bg-white rounded-full p-2 shadow-sm border">{item.avatar}</div>
                            <div className="flex gap-1 text-yellow-400 mb-4 text-sm"><FaStar /><FaStar /><FaStar /><FaStar /><FaStar /></div>
                            <p className="text-gray-600 italic mb-6 leading-relaxed">"{item.text}"</p>
                            <div>
                                <h4 className="font-bold text-gray-900">{item.nama}</h4>
                                <p className="text-xs font-bold text-blue-500 uppercase tracking-wide">{item.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </section>
      )}

      {/* --- FOOTER --- */}
      <footer className="bg-white pt-20 pb-10 border-t border-gray-200">
        <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 mb-6">
                        {toko.logo ? <img src={toko.logo} className="h-8 w-auto" /> : <span className="font-black text-2xl text-gray-900">{toko.nama_toko}</span>}
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-sm">
                        Kami menyediakan produk digital berkualitas tinggi untuk membantu mempercepat pekerjaan dan bisnis Anda.
                    </p>
                    <div className="flex gap-4">
                        <a href="https://instagram.com" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-pink-600 hover:text-white transition"><FaInstagram /></a>
                        <a href="https://facebook.com" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-600 hover:text-white transition"><FaFacebookF /></a>
                        <a href="https://tiktok.com" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-black hover:text-white transition"><FaTiktok /></a>
                    </div>
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 mb-6">Menu Pintas</h4>
                    <ul className="space-y-3 text-sm text-gray-500">
                        <li><Link href="/" className="hover:text-blue-600 transition">Beranda</Link></li>
                        <li><Link href="/keranjang" className="hover:text-blue-600 transition">Keranjang Belanja</Link></li>
                        <li><Link href="/dashboard" className="hover:text-blue-600 transition">Member Area</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 mb-6">Pembayaran</h4>
                    <div className="flex flex-wrap gap-2">
                        {['BCA', 'Mandiri', 'BNI', 'BRI', 'QRIS', 'Gopay', 'Dana'].map(bank => (
                            <span key={bank} className="px-3 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600 border border-gray-200">{bank}</span>
                        ))}
                    </div>
                </div>
            </div>
            <div className="border-t border-gray-100 pt-8 text-center">
                <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} {toko.nama_toko}. All rights reserved.</p>
            </div>
        </div>
      </footer>

      {/* --- FLOATING BUTTONS --- */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-40">
        <Link href="/keranjang" className="bg-white text-gray-800 p-4 rounded-full shadow-lg border border-gray-200 hover:scale-110 transition relative group">
            <FaShoppingCart className="text-xl" />
            {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-md">
                    {items.length}
                </span>
            )}
            <span className="absolute right-full mr-4 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap top-1/2 -translate-y-1/2">Lihat Keranjang</span>
        </Link>
        
        <a href="https://wa.me/6285314445959" target="_blank" className="bg-green-500 text-white p-4 rounded-full shadow-lg shadow-green-500/30 hover:bg-green-600 hover:scale-110 transition relative group">
            <FaWhatsapp className="text-2xl" />
            <span className="absolute right-full mr-4 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap top-1/2 -translate-y-1/2">Chat Admin</span>
        </a>
      </div>
    </div>
  );
}