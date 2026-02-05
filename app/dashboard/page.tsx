'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null);
  const [pesanan, setPesanan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function init() {
      // 1. Cek User Login
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) { 
        router.push('/masuk'); 
        return; 
      }
      
      setUser(session.user);

      // 2. Ambil Riwayat Pesanan
      const { data } = await supabase
        .from('pesanan')
        .select('*')
        .eq('user_id', session.user.id)
        .order('id', { ascending: false });
      
      setPesanan(data || []);
      setLoading(false);
    }
    init();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  // --- FUNGSI BARU: HAPUS PESANAN ---
  async function hapusPesanan(id: number) {
    // 1. Tanya dulu (Konfirmasi)
    const yakin = confirm("Yakin ingin menghapus riwayat ini? Data yang dihapus tidak bisa kembali.");
    if (!yakin) return;

    // 2. Hapus dari Database
    const { error } = await supabase
        .from('pesanan')
        .delete()
        .eq('id', id);

    if (error) {
        alert("Gagal menghapus! Coba lagi.");
        console.error(error);
    } else {
        // 3. Update Tampilan (Hapus dari layar tanpa refresh)
        setPesanan(pesanan.filter((item) => item.id !== id));
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Memuat Data...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER DASHBOARD */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl shadow-lg">👤</div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Halo, {user?.email?.split('@')[0]}! 👋</h1>
                    <p className="text-gray-500 text-sm">{user?.email}</p>
                </div>
            </div>
            <button onClick={handleLogout} className="bg-white text-red-500 border border-red-200 px-6 py-2 rounded-lg font-bold hover:bg-red-50 transition shadow-sm">
                Keluar 🚪
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* KOLOM KIRI: RIWAYAT PESANAN */}
            <div className="lg:col-span-2">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    📦 Riwayat Pesanan
                    <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">{pesanan.length}</span>
                </h2>

                <div className="space-y-4">
                    {pesanan.length === 0 ? (
                        <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-300 text-center">
                            <p className="text-gray-400">Belum ada pesanan. Yuk belanja!</p>
                        </div>
                    ) : (
                        pesanan.map((item) => (
                            <div key={item.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col md:flex-row justify-between items-center gap-4 group">
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">{item.nama_produk}</h3>
                                    <p className="text-sm text-gray-500">
                                        {new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                                <div className="text-right flex items-center gap-4">
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="font-bold text-blue-600">Rp {Number(item.harga).toLocaleString('id-ID')}</span>
                                        <span className={`text-xs px-3 py-1 rounded-full font-bold ${item.status === 'Lunas' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {item.status}
                                        </span>
                                    </div>

                                    {/* TOMBOL HAPUS (TONG SAMPAH) */}
                                    <button 
                                        onClick={() => hapusPesanan(item.id)}
                                        className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition shadow-sm border border-red-100"
                                        title="Hapus Riwayat"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* KOLOM KANAN: TOMBOL BELANJA LAGI */}
            <div>
                <Link href="/" className="block bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-2xl shadow-xl text-white hover:scale-[1.02] transition relative overflow-hidden group">
                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold mb-1">Belanja Lagi? 🛒</h3>
                        <p className="text-blue-200 text-sm">Cek produk terbaru kami sekarang.</p>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-4 translate-y-4">
                        <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>
                    </div>
                </Link>
            </div>

        </div>

      </div>
    </div>
  );
}