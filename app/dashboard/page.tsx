'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [listProduk, setListProduk] = useState<any[]>([]); // Ganti nama state biar jelas
  const router = useRouter();

  useEffect(() => {
    async function initDashboard() {
      // 1. Cek Login
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/masuk');
        return;
      }
      setUser(session.user);

      // --- JURUS ANTI GAGAL (2 LANGKAH) ---
      
      // Langkah A: Ambil Daftar ID Produk yang sudah dibeli & LUNAS
      const { data: dataTransaksi, error: errTrx } = await supabase
        .from('transaksi')
        .select('produk_id')
        .eq('user_email', session.user.email)
        .eq('status', 'LUNAS');

      if (errTrx) {
        console.error("Gagal ambil transaksi:", errTrx);
        setLoading(false);
        return;
      }

      // Kalau tidak ada transaksi, stop
      if (!dataTransaksi || dataTransaksi.length === 0) {
        setListProduk([]);
        setLoading(false);
        return;
      }

      // Ambil semua ID-nya, kumpulkan jadi array [15, 16, 20]
      const daftarId = dataTransaksi.map(item => item.produk_id);

      // Langkah B: Ambil Detail Produk berdasarkan ID tadi
      const { data: dataProduk, error: errProd } = await supabase
        .from('produk')
        .select('*')
        .in('id', daftarId); // 🔥 Ambil yang ID-nya ada di daftar belanja

      if (errProd) {
        console.error("Gagal ambil produk:", errProd);
      } else {
        setListProduk(dataProduk || []);
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
    window.open(link, '_blank');
    toast.success("Membuka file... 🚀");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="animate-pulse font-bold text-gray-500">Memuat Member Area...</p></div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Toaster position="bottom-right" />
      
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <Link href="/" className="font-bold text-xl tracking-tight text-gray-900">Loodfie Market <span className="text-blue-600 text-xs px-2 py-0.5 bg-blue-50 rounded-full border border-blue-100">Member</span></Link>
        <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 hidden md:block">{user?.email}</span>
            <button onClick={handleLogout} className="text-sm font-bold text-red-600 hover:text-red-800 transition">Keluar</button>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-10 max-w-5xl">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl mb-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
                <h1 className="text-3xl font-extrabold mb-2">Halo, Sultan! 👋</h1>
                <p className="text-blue-100 text-sm">Ini adalah koleksi aset digital yang sudah kamu miliki.</p>
            </div>
            <div className="bg-white/10 backdrop-blur border border-white/20 p-4 rounded-2xl text-center min-w-[150px]">
                <span className="block text-3xl font-bold">{listProduk.length}</span>
                <span className="text-xs text-blue-100 uppercase tracking-wider font-bold">Produk Dimiliki</span>
            </div>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">📂 Aset Saya</h2>
        
        {listProduk.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                <span className="text-6xl mb-4 block">🛒</span>
                <h3 className="text-lg font-bold text-gray-700 mb-2">Belum ada produk</h3>
                <p className="text-gray-400 text-sm mb-6">Pastikan kamu login dengan email yang benar.</p>
                <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold shadow hover:bg-blue-700 transition">Jelajahi Toko</Link>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listProduk.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition group flex flex-col h-full">
                        <div className="h-40 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                            <img src={item.gambar || 'https://via.placeholder.com/300'} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                            <div className="absolute top-3 right-3 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow">LUNAS ✅</div>
                        </div>
                        <div className="p-5 flex flex-col flex-grow">
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide mb-1 block">{item.kategori || 'Digital Product'}</span>
                            <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{item.nama_produk}</h3>
                            <div className="mt-auto pt-4">
                                <button 
                                    onClick={() => handleDownload(item.file_url)}
                                    className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-600 transition shadow-lg"
                                >
                                    ⬇️ Download File
                                </button>
                                <p className="text-[10px] text-gray-400 text-center mt-3">Akses selamanya • Garansi Update</p>
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