'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { FaDownload, FaSignOutAlt, FaUserCircle, FaShoppingBag, FaHome } from 'react-icons/fa';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [transaksi, setTransaksi] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function getData() {
      // 1. Cek Login
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/masuk');
        return;
      }
      setUser(session.user);

      // 2. Ambil Riwayat Belanja User Ini
      // Kita gabungkan (join) dengan tabel produk untuk ambil nama & file
      const { data, error } = await supabase
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
        .eq('user_email', session.user.email) // Hanya ambil punya user ini
        .eq('status', 'LUNAS') // Hanya yang sudah LUNAS
        .order('created_at', { ascending: false });

      if (error) console.error(error);
      if (data) setTransaksi(data);
      
      setLoading(false);
    }
    getData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Toaster />
      
      {/* NAVBAR DASHBOARD */}
      <nav className="bg-white border-b sticky top-0 z-50 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
             <Link href="/" className="text-gray-500 hover:text-blue-600 text-xl"><FaHome /></Link>
             <span className="font-bold text-lg border-l pl-3 ml-1">Member Area</span>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-gray-900">{user?.email}</p>
                <p className="text-xs text-green-600">● Member Aktif</p>
            </div>
            <button onClick={handleLogout} className="bg-red-50 text-red-500 p-2 rounded-full hover:bg-red-100" title="Logout">
                <FaSignOutAlt />
            </button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                <FaShoppingBag className="text-blue-600" /> Produk Saya
            </h1>
            <p className="text-gray-500 text-sm mt-1">Daftar produk yang sudah kamu beli. Klik download untuk mengunduh.</p>
        </div>

        {transaksi.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                <p className="text-gray-400 mb-4">Kamu belum membeli produk apapun.</p>
                <Link href="/" className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold shadow hover:bg-blue-700">
                    Belanja Dulu Yuk!
                </Link>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {transaksi.map((item: any) => (
                    <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition flex gap-4 items-start">
                        {/* Gambar Produk */}
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                            {item.produk?.gambar ? (
                                <img src={item.produk.gambar} className="w-full h-full object-cover" />
                            ) : (
                                <span className="flex items-center justify-center h-full text-2xl">📦</span>
                            )}
                        </div>

                        {/* Info & Tombol Download */}
                        <div className="flex-grow">
                            <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{item.produk?.nama_produk}</h3>
                            <p className="text-xs text-gray-400 mb-4">Dibeli: {new Date(item.created_at).toLocaleDateString()}</p>
                            
                            {item.produk?.file_url ? (
                                <a 
                                    href={item.produk.file_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 shadow-blue-500/30 shadow-lg transition"
                                >
                                    <FaDownload /> Download File
                                </a>
                            ) : (
                                <button disabled className="bg-gray-200 text-gray-400 px-4 py-2 rounded-lg text-sm font-bold cursor-not-allowed">
                                    File Belum Tersedia
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </main>
    </div>
  );
}