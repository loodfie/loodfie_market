'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [transaksi, setTransaksi] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function initDashboard() {
      // 1. Cek Login
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/masuk'); // Kalau belum login, tendang ke halaman masuk
        return;
      }
      setUser(session.user);

      // 2. Ambil Data Transaksi Berdasarkan Email Login
      // Kita join dengan tabel produk untuk ambil nama & gambar & FILE
      const { data, error } = await supabase
        .from('transaksi')
        .select(`
          id,
          status,
          created_at,
          produk:produk_id (
            id,
            nama_produk,
            gambar,
            file_url,
            kategori
          )
        `)
        .eq('user_email', session.user.email) // 🔥 KUNCI: Hanya ambil punya dia sendiri
        .eq('status', 'LUNAS'); // 🔥 Hanya yang sudah LUNAS

      if (error) {
        console.error("Error dashboard:", error);
      } else {
        setTransaksi(data || []);
      }
      setLoading(false);
    }

    initDashboard();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleDownload = (link: string) => {
    if (!link) {
      toast.error("Link file belum tersedia. Hubungi Admin.");
      return;
    }
    // Buka link di tab baru
    window.open(link, '_blank');
    toast.success("Membuka file... 🚀");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="animate-pulse font-bold text-gray-500">Memuat Member Area...</p></div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Toaster position="bottom-right" />
      
      {/* NAVBAR SIMPLE */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <Link href="/" className="font-bold text-xl tracking-tight text-gray-900">Loodfie Market <span className="text-blue-600 text-xs px-2 py-0.5 bg-blue-50 rounded-full border border-blue-100">Member</span></Link>
        <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 hidden md:block">{user?.email}</span>
            <button onClick={handleLogout} className="text-sm font-bold text-red-600 hover:text-red-800 transition">Keluar</button>
        </div>
      </nav>

      {/* KONTEN UTAMA */}
      <main className="container mx-auto px-6 py-10 max-w-5xl">
        
        {/* HEADER USER */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl mb-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
                <h1 className="text-3xl font-extrabold mb-2">Halo, Sultan! 👋</h1>
                <p className="text-blue-100 text-sm">Ini adalah koleksi aset digital yang sudah kamu miliki.</p>
            </div>
            <div className="bg-white/10 backdrop-blur border border-white/20 p-4 rounded-2xl text-center min-w-[150px]">
                <span className="block text-3xl font-bold">{transaksi.length}</span>
                <span className="text-xs text-blue-100 uppercase tracking-wider font-bold">Produk Dimiliki</span>
            </div>
        </div>

        {/* DAFTAR PRODUK */}
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">📂 Aset Saya</h2>
        
        {transaksi.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                <span className="text-6xl mb-4 block">🛒</span>
                <h3 className="text-lg font-bold text-gray-700 mb-2">Belum ada produk</h3>
                <p className="text-gray-400 text-sm mb-6">Kamu belum membeli produk apapun.</p>
                <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold shadow hover:bg-blue-700 transition">Jelajahi Toko</Link>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {transaksi.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition group">
                        <div className="h-40 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                            {/* Gambar Produk */}
                            <img src={item.produk?.gambar || 'https://via.placeholder.com/300'} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                            <div className="absolute top-3 right-3 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow">LUNAS ✅</div>
                        </div>
                        <div className="p-5">
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide mb-1 block">{item.produk?.kategori || 'Digital Product'}</span>
                            <h3 className="font-bold text-gray-900 mb-4 line-clamp-1">{item.produk?.nama_produk || 'Produk Tidak Ditemukan'}</h3>
                            
                            {/* TOMBOL DOWNLOAD RAHASIA */}
                            <button 
                                onClick={() => handleDownload(item.produk?.file_url)}
                                className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-600 transition shadow-lg group-hover:translate-y-0 translate-y-0"
                            >
                                ⬇️ Download File
                            </button>
                            <p className="text-[10px] text-gray-400 text-center mt-3">Akses selamanya • Garansi Update</p>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </main>
    </div>
  );
}