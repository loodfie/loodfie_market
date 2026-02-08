'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/masuk'); 
        return;
      }
      setUser(session.user);
      setLoading(false);
    }
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Berhasil Keluar!");
    router.push('/');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400">Memuat data member...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Toaster />
      
      {/* NAVBAR */}
      <nav className="bg-white shadow-sm py-4 px-6 fixed w-full top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
            <Link href="/" className="font-bold text-xl tracking-tight flex items-center gap-2">
                <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">L</span> 
                Loodfie Market
            </Link>
            <button onClick={handleLogout} className="text-red-500 font-bold text-sm hover:bg-red-50 px-4 py-2 rounded-lg transition">Keluar</button>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
            
            {/* KARTU PROFIL (PERBAIKAN LAYOUT) */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 border border-gray-100">
                {/* Background Header */}
                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 h-32"></div>
                
                <div className="px-8 pb-8">
                    {/* 🔥 PERBAIKAN DI SINI: Ikon tidak lagi 'absolute', tapi 'relative' dengan margin negatif */}
                    <div className="flex flex-col md:flex-row items-start md:items-end gap-4 -mt-10 mb-4">
                        
                        {/* Ikon Profil */}
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl shadow-md border-4 border-white z-10">
                            😎
                        </div>

                        {/* Nama & Email (Sekarang otomatis turun/geser, tidak nabrak) */}
                        <div className="flex-grow pt-2 md:pt-0 md:pb-2">
                            <h1 className="text-2xl font-bold text-gray-900">{user.email.split('@')[0]}</h1>
                            <p className="text-gray-500 text-sm">{user.email}</p>
                            <span className="inline-block mt-1 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Active Member</span>
                        </div>

                        {/* Tombol Belanja */}
                        <div className="mt-4 md:mt-0 md:pb-2">
                            <Link href="/" className="bg-gray-900 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-gray-700 transition shadow-lg flex items-center gap-2">
                                Belanja Lagi 🛍️
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* AREA DOWNLOAD */}
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">📂 File Saya <span className="text-xs font-normal text-gray-500 bg-white px-2 py-1 rounded border">Riwayat Pembelian</span></h2>
            
            <div className="grid gap-4">
                {/* Item Dummy 1 */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-2xl">📘</div>
                        <div>
                            <h3 className="font-bold text-sm">Ebook Jago Next.js Dalam Semalam</h3>
                            <p className="text-xs text-gray-400">Dibeli pada 08 Feb 2026</p>
                        </div>
                    </div>
                    <button className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-200 transition">Download</button>
                </div>

                {/* Item Dummy 2 */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center text-2xl">⚡</div>
                        <div>
                            <h3 className="font-bold text-sm">Template Website Sultan V2</h3>
                            <p className="text-xs text-gray-400">Dibeli pada 01 Feb 2026</p>
                        </div>
                    </div>
                    <button className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-200 transition">Download</button>
                </div>

                <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-400 text-sm">Belum ada pesanan baru...</p>
                    <Link href="/" className="text-blue-600 font-bold text-sm hover:underline mt-2 inline-block">Cari Produk Disini</Link>
                </div>
            </div>

        </div>
      </main>
    </div>
  );
}