'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const [produk, setProduk] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      const { data } = await supabase.from('produk').select('*').order('id', { ascending: false });
      setProduk(data || []);
    };
    init();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  async function hapusProduk(id: number, nama: string) {
    if (confirm(`Hapus "${nama}"?`)) {
        await supabase.from('produk').delete().eq('id', id);
        setProduk(produk.filter(item => item.id !== id));
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar Admin */}
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">🛡️ Admin Dashboard</h1>
        <div className="flex items-center gap-3">
            {/* Tombol Lihat Website */}
            <Link href="/" target="_blank" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition">👁️ Lihat Website</Link>
            <button onClick={handleLogout} className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-600 hover:text-white transition">Logout 🚪</button>
        </div>
      </nav>

      <div className="container mx-auto p-6">
        {/* Menu Pintas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <Link href="/admin/tambah" className="bg-white p-6 rounded-xl shadow-md border hover:border-blue-500 cursor-pointer transition">
                <h2 className="text-2xl font-bold text-gray-800">Tambah Produk +</h2>
            </Link>
            <Link href="/admin/pengaturan" className="bg-white p-6 rounded-xl shadow-md border hover:border-purple-500 cursor-pointer transition">
                <h2 className="text-2xl font-bold text-gray-800">Pengaturan Toko ⚙️</h2>
            </Link>
        </div>

        {/* Tabel Produk */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="p-6 border-b bg-gray-50"><h3 className="text-lg font-bold text-gray-800">Daftar Produk ({produk.length})</h3></div>
            <table className="w-full text-left">
                <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
                    <tr><th className="p-4">Foto</th><th className="p-4">Nama</th><th className="p-4">Harga</th><th className="p-4 text-center">Aksi</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {produk.map((item) => (
                        <tr key={item.id} className="hover:bg-blue-50 transition">
                            <td className="p-4"><img src={item.gambar} className="w-12 h-12 object-cover rounded border bg-white" /></td>
                            <td className="p-4 font-bold">{item.nama}</td>
                            <td className="p-4 text-blue-600">{item.harga}</td>
                            <td className="p-4 text-center flex justify-center gap-2">
                                {/* TOMBOL EDIT & HAPUS */}
                                <Link href={`/admin/edit/${item.id}`} className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-xs font-bold border border-yellow-200 hover:bg-yellow-500 hover:text-white transition">Edit ✏️</Link>
                                <button onClick={() => hapusProduk(item.id, item.nama)} className="bg-red-100 text-red-600 px-3 py-1 rounded text-xs font-bold border border-red-200 hover:bg-red-600 hover:text-white transition">Hapus 🗑️</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}