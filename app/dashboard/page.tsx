'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { FaDownload, FaSignOutAlt, FaUserCircle, FaShoppingBag, FaHome } from 'react-icons/fa';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function getUserData() {
      // 1. Cek User Session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/masuk'); // Kalau belum login, tendang ke halaman masuk
        return;
      }

      setUser(session.user);

      // 2. Ambil Daftar Transaksi yang LUNAS milik User ini
      // Kita joinkan dengan tabel produk untuk dapat detail gambar & file
      const { data: transaksi, error } = await supabase
        .from('transaksi')
        .select(`
          id,
          created_at,
          status,
          produk:produk_id (
            nama_produk,
            gambar,
            file_url,
            deskripsi
          )
        `)
        .eq('user_email', session.user.email)
        .eq('status', 'LUNAS') // Hanya yang sudah lunas
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error ambil data:", error);
      } else {
        setPurchases(transaksi || []);
      }
      
      setLoading(false);
    }

    getUserData();
  }, [router]);

  const handleLogout = async () => {
    const toastId = toast.loading("Keluar...");
    await supabase.auth.signOut();
    toast.success("Berhasil Keluar", { id: toastId });
    router.push('/'); // Balik ke Home
  };

  const handleDownload = (url: string) => {
    if (!url) {
      toast.error("File belum tersedia, hubungi Admin.");
      return;
    }
    window.open(url, '_blank');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Toaster position="top-right" />

      {/* NAVBAR DASHBOARD */}
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
            <Link href="/" className="text-gray-500 hover:text-blue-600 transition flex items-center gap-1 font-bold text-sm">
                <FaHome /> Ke Toko
            </Link>
        </div>
        <div className="font-bold text-gray-800">Member Area</div>
        <button 
            onClick={handleLogout} 
            className="text-red-500 hover:text-red-700 font-bold text-sm flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg transition"
        >
            <FaSignOutAlt /> Keluar
        </button>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        
        {/* PROFILE CARD */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-8 text-white shadow-xl mb-10 flex flex-col md:flex-row items-center gap-6">
            <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                <FaUserCircle className="text-6xl text-white" />
            </div>
            <div className="text-center md:text-left">
                <h1 className="text-2xl font-bold mb-1">Halo, {user?.email?.split('@')[0]}! 👋</h1>
                <p className="text-blue-100 text-sm">{user?.email}</p>
                <div className="mt-4 inline-flex items-center gap-2 bg-white/10 px-4 py-1 rounded-full text-xs font-bold border border-white/20">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Member Aktif
                </div>
            </div>
        </div>

        {/* LIST PRODUK SAYA */}
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FaShoppingBag className="text-blue-600" /> Produk Saya ({purchases.length})
        </h2>

        {purchases.length === 0 ? (
            // TAMPILAN JIKA BELUM BELI APAPUN
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300 shadow-sm">
                <div className="text-6xl mb-4">😢</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Belum ada produk</h3>
                <p className="text-gray-500 mb-6">Kamu belum memiliki produk apapun. Yuk belanja dulu!</p>
                <Link href="/" className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 transition">
                    Lihat Katalog
                </Link>
            </div>
        ) : (
            // TAMPILAN GRID PRODUK YANG DIBELI
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {purchases.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition overflow-hidden flex flex-col">
                        <div className="h-40 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                            {item.produk?.gambar ? (
                                <img src={item.produk.gambar} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl">📦</span>
                            )}
                            <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow">
                                LUNAS
                            </div>
                        </div>
                        
                        <div className="p-5 flex flex-col flex-grow">
                            <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">{item.produk?.nama_produk}</h3>
                            <p className="text-xs text-gray-400 mb-4">Dibeli pada: {new Date(item.created_at).toLocaleDateString()}</p>
                            
                            <div className="mt-auto">
                                <button 
                                    onClick={() => handleDownload(item.produk?.file_url)}
                                    className="w-full bg-blue-50 text-blue-600 border border-blue-100 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition group"
                                >
                                    <FaDownload className="group-hover:animate-bounce" /> Download File
                                </button>
                                {item.produk?.deskripsi && (
                                    <p className="text-[10px] text-gray-400 mt-2 text-center italic truncate">
                                        "{item.produk.deskripsi.substring(0, 30)}..."
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

      </main>
    </div>
  );
}