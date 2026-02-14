'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { FaShoppingCart, FaWhatsapp, FaSearch, FaUser, FaSignOutAlt, FaStar, FaUsers, FaDownload, FaCheckCircle, FaCog } from 'react-icons/fa'; 
import { useCart } from '@/context/CartContext';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [produk, setProduk] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [stats, setStats] = useState({ members: 120, downloads: 450, products: 0 });
  
  // State Toko (Tetap mempertahankan fitur dynamic background & running text)
  const [toko, setToko] = useState<any>({
    nama_toko: 'Loodfie Market',
    header_bg: null,
    footer_bg: null,
    deskripsi: 'Pusat Produk Digital Terbaik & Terpercaya',
    running_text: 'Selamat Datang di Loodfie Market! Dapatkan diskon spesial untuk produk digital pilihan.'
  });
  
  const { items } = useCart(); 
  const router = useRouter();

  // Data Dummy Testimoni
  const testimoni = [
    { nama: "Budi Santoso", role: "Programmer", text: "Source code-nya rapi banget, langsung jalan tanpa error!", rating: 5 },
    { nama: "Siti Aminah", role: "Content Creator", text: "E-book videonya sangat membantu saya bikin konten viral.", rating: 5 },
    { nama: "Rahmat Hidayat", role: "Mahasiswa", text: "Harganya murah tapi kualitas materinya daging semua.", rating: 4 },
  ];

  useEffect(() => {
    async function getData() {
      // 1. Cek User Session
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      setUser(currentUser);

      // 2. Cek Admin
      if (currentUser && currentUser.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }

      // 3. Ambil Data Produk
      const { data: dataProduk } = await supabase
        .from('produk')
        .select('*')
        .order('id', { ascending: false });

      if (dataProduk) {
        setProduk(dataProduk);
        setStats(prev => ({ ...prev, products: dataProduk.length }));
      }

      // 4. Ambil Info Toko
      const { data: dataToko } = await supabase.from('toko').select('*').single();
      if (dataToko) setToko(dataToko);

      // 5. Simulasi Statistik
      setStats(prev => ({ 
        ...prev, 
        members: 150 + Math.floor(Math.random() * 50),
        downloads: 500 + Math.floor(Math.random() * 100) 
      }));

      setLoading(false);
    }

    getData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    toast.success("Berhasil Logout 👋");
    window.location.reload(); 
  };

  const handleCartClick = (e: any) => {
    if (!user) {
      e.preventDefault(); 
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

      {/* --- NAVBAR (Diperkecil menjadi h-14) --- */}
      <nav className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100/50 backdrop-blur-md bg-white/90">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg font-black text-lg shadow-blue-500/20 shadow-lg">L</div>
            <span className="font-bold text-lg tracking-tight text-gray-900 hidden md:block">{toko.nama_toko}</span>
          </Link>

          <div className="flex-1 max-w-sm hidden md:flex relative">
             <input 
               type="text" 
               placeholder="Cari aset digital..." 
               className="w-full bg-gray-100 border-none rounded-full py-2 px-4 pl-10 focus:ring-2 focus:ring-blue-500 transition outline-none text-sm"
               onChange={(e) => setKeyword(e.target.value)}
             />
             <FaSearch className="absolute left-3.5 top-2.5 text-gray-400 text-sm" />
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            
            {/* Tombol Admin */}
            {isAdmin && (
                <Link href="/admin" className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-black transition flex items-center gap-2 shadow-lg">
                    <FaCog /> Admin
                </Link>
            )}

            {/* Keranjang */}
            <Link 
                href={user ? "/keranjang" : "#"} 
                onClick={handleCartClick}
                className="relative p-2 rounded-full hover:bg-gray-100 transition group"
            >
                <FaShoppingCart className={`text-lg ${user ? 'text-gray-700 group-hover:text-blue-600' : 'text-gray-300'}`} />
                {user && items.length > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold border-2 border-white animate-bounce">
                        {items.length}
                    </span>
                )}
            </Link>

            {user ? (
                <div className="flex items-center gap-3">
                    <Link href="/dashboard" className="hidden md:flex flex-col items-end">
                        <span className="text-[10px] text-gray-500">Halo, Sultan</span>
                        <span className="font-bold text-xs text-gray-900 truncate max-w-[80px]">{user.email.split('@')[0]}</span>
                    </Link>
                    <button onClick={handleLogout} className="bg-red-50 text-red-500 p-2 rounded-full hover:bg-red-100 transition" title="Logout">
                        <FaSignOutAlt className="text-sm"/>
                    </button>
                </div>
            ) : (
                <div className="flex gap-2">
                    <Link href="/masuk" className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-blue-600 transition">Masuk</Link>
                    <Link href="/daftar" className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30 transition">Daftar</Link>
                </div>
            )}
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION (Padding dikurangi) --- */}
      {!keyword && (
        <div className="relative bg-gray-900 text-white pt-10 pb-6 md:py-16 overflow-hidden mb-8">
            {/* Background Header Dinamis */}
            {toko.header_bg ? (
                <div className="absolute inset-0 z-0">
                    <img src={toko.header_bg} className="w-full h-full object-cover opacity-50" alt="Banner" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
                </div>
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900 opacity-90 z-0"></div>
            )}
            
            <div className="container mx-auto px-4 text-center relative z-10">
                <span className="inline-block py-1 px-3 rounded-full bg-blue-500/30 border border-blue-400/30 text-blue-200 text-[10px] font-bold mb-3 backdrop-blur-sm">🚀 Platform Digital No. #1</span>
                <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
                    Upgrade Skill dengan <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Produk Digital Premium</span>
                </h1>
                <p className="text-gray-300 text-sm md:text-base max-w-xl mx-auto mb-8 leading-relaxed">
                    {toko.deskripsi || "Temukan ribuan aset digital, source code, dan e-book berkualitas untuk menunjang karir dan bisnismu."}
                </p>
                
                {/* Stats */}
                <div className="flex flex-wrap justify-center gap-6 md:gap-12 border-t border-white/10 pt-6 mt-6">
                    <div className="text-center">
                        <div className="text-xl md:text-2xl font-black text-white">{stats.members}+</div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Member</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl md:text-2xl font-black text-white">{stats.products}+</div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Produk</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl md:text-2xl font-black text-white">{stats.downloads}+</div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Terjual</div>
                    </div>
                </div>

                {/* 🔥 RUNNING TEXT (Tetap Ada) 🔥 */}
                <div className="mt-8 w-full overflow-hidden bg-black/30 backdrop-blur-sm border-y border-white/10 py-1.5">
                    {/* @ts-ignore */} 
                    <marquee scrollamount="6" className="text-white text-xs font-medium tracking-wide">
                         📢 {toko.running_text || "Selamat Datang di Loodfie Market! Pusat Produk Digital Terlengkap & Terpercaya. | 🚀 Diskon Spesial untuk Member Baru! | 📲 Butuh Bantuan? Chat WhatsApp Admin 085314445959"}
                    {/* @ts-ignore */}
                    </marquee>
                </div>
            </div>
        </div>
      )}

      {/* --- DAFTAR PRODUK --- */}
      <main className="container mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                🔥 {keyword ? `Mencari: "${keyword}"` : 'Produk Terbaru'}
            </h2>
        </div>

        {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-200 rounded-2xl animate-pulse"></div>)}
             </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {produk.filter(p => p.nama_produk.toLowerCase().includes(keyword.toLowerCase())).map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-300 group overflow-hidden flex flex-col h-full">
                        {/* GAMBAR TETAP h-32 */}
                        <div className="h-32 bg-gray-100 relative overflow-hidden">
                            {item.gambar ? (
                                <img src={item.gambar} alt={item.nama_produk} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-3xl">📦</div>
                            )}
                            {item.harga_coret > item.harga && (
                                <span className="absolute top-3 right-3 bg-red-500 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-md">
                                    Hemat {Math.round(((item.harga_coret - item.harga) / item.harga_coret) * 100)}%
                                </span>
                            )}
                        </div>

                        <div className="p-4 flex flex-col flex-grow">
                            <div className="mb-2">
                                <span className="bg-blue-50 text-blue-600 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">{item.kategori || 'Digital'}</span>
                            </div>
                            <h3 className="font-bold text-sm md:text-base mb-2 line-clamp-2 text-gray-800 group-hover:text-blue-600 transition">{item.nama_produk}</h3>
                            
                            <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                                <div>
                                    {item.harga_coret > item.harga && <p className="text-[10px] text-gray-400 line-through">Rp {Number(item.harga_coret).toLocaleString('id-ID')}</p>}
                                    <p className="text-lg font-black text-blue-600">Rp {Number(item.harga).toLocaleString('id-ID')}</p>
                                </div>
                                <Link href={`/produk/${item.id}`} className="bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-600 p-2 rounded-full transition shadow-sm text-sm">
                                    ➜
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {!loading && produk.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-400 text-sm">Belum ada produk nih, Bos.</p>
            </div>
        )}

        {/* --- TESTIMONI SECTION --- */}
        {!keyword && (
            <div className="mt-16">
                <div className="text-center mb-8">
                    <h2 className="text-xl md:text-2xl font-black text-gray-900">Kata Mereka 💬</h2>
                    <p className="text-gray-500 text-sm mt-1">Apa kata customer yang sudah berbelanja di sini?</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {testimoni.map((t, index) => (
                        <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
                            <div className="flex text-yellow-400 mb-3 gap-1 text-xs">
                                {[...Array(t.rating)].map((_, i) => <FaStar key={i} />)}
                            </div>
                            <p className="text-gray-600 italic mb-4 text-sm">"{t.text}"</p>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500 text-xs">{t.nama[0]}</div>
                                <div>
                                    <h4 className="font-bold text-xs text-gray-900">{t.nama}</h4>
                                    <p className="text-[10px] text-gray-400">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </main>

      {/* --- FOOTER (Padding diperkecil) --- */}
      <footer 
        className="border-t border-gray-200 pt-6 pb-4 mt-8 bg-white"
        style={{ 
            backgroundImage: toko.footer_bg ? `url(${toko.footer_bg})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: toko.footer_bg ? 'transparent' : 'white'
        }}
      >
        <div className={toko.footer_bg ? "bg-white/90 p-4 rounded-xl backdrop-blur-sm" : ""}>
             <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="bg-blue-600 text-white p-1.5 rounded-lg font-black text-base">L</div>
                            <span className="font-bold text-lg tracking-tight text-gray-900">{toko.nama_toko}</span>
                        </div>
                        <p className="text-gray-500 text-xs leading-relaxed max-w-sm">
                            Platform marketplace digital terpercaya. Jual beli source code, e-book, dan aset kreatif dengan aman dan instan.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-2 text-sm">Menu</h4>
                        <ul className="space-y-1 text-xs text-gray-500">
                            <li><Link href="/" className="hover:text-blue-600">Beranda</Link></li>
                            <li><Link href="/keranjang" className="hover:text-blue-600">Keranjang</Link></li>
                            <li><Link href="/masuk" className="hover:text-blue-600">Login Member</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-2 text-sm">Bantuan</h4>
                        <ul className="space-y-1 text-xs text-gray-500">
                            <li><Link href="/cara-pembelian" className="hover:text-blue-600">Cara Pembelian</Link></li>
                            <li><Link href="/konfirmasi" className="hover:text-blue-600">Konfirmasi Pembayaran</Link></li>
                            <li><Link href="/faq" className="hover:text-blue-600">FAQ</Link></li>
                            
                            {/* Link WA Langsung */}
                            <li>
                                <a 
                                    href="https://wa.me/6285314445959" 
                                    target="_blank" 
                                    className="hover:text-blue-600 font-bold flex items-center gap-1"
                                >
                                    Hubungi Kami (WhatsApp)
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-100 pt-4 text-center">
                    <p className="text-gray-400 text-[10px]">&copy; {new Date().getFullYear()} {toko.nama_toko}. All rights reserved.</p>
                </div>
             </div>
        </div>
      </footer>

      {/* Floating WA */}
      <a 
        href="https://wa.me/6285314445959" 
        target="_blank" 
        className="fixed bottom-6 right-6 bg-green-500 text-white p-3 rounded-full shadow-2xl hover:bg-green-600 hover:scale-110 transition z-50 flex items-center justify-center group"
      >
        <FaWhatsapp className="text-2xl group-hover:animate-pulse" />
      </a>
    </div>
  );
}