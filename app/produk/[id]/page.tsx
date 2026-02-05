'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation'; // TAMBAH: useParams
import Link from 'next/link';

export default function DetailProduk() {
  // PERUBAHAN UTAMA DI SINI:
  // Kita pakai useParams() untuk mengambil ID dengan aman
  const params = useParams(); 
  const idProduk = params?.id; 

  const [produk, setProduk] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function getProduk() {
      if (!idProduk) return; // Kalau ID belum siap, jangan jalan dulu

      // Ambil detail produk berdasarkan ID
      const { data, error } = await supabase
        .from('produk')
        .select('*')
        .eq('id', idProduk)
        .single();
      
      if (error) {
        console.error('Produk tidak ditemukan:', error);
      } else {
        setProduk(data);
      }
      setLoading(false);
    }

    getProduk();
  }, [idProduk]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-blue-200 rounded-full mb-4"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
            <p className="text-gray-400 text-sm mt-2">Sedang mengambil data...</p>
        </div>
    </div>
  );

  if (!produk) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-4xl mb-4">😢</h1>
        <h2 className="text-xl font-bold text-gray-800">Produk Tidak Ditemukan</h2>
        <Link href="/" className="mt-6 text-blue-600 hover:underline">Kembali ke Beranda</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Tombol Kembali */}
        <button 
            onClick={() => router.back()} 
            className="mb-8 flex items-center text-gray-500 hover:text-blue-600 transition group"
        >
            <span className="bg-white p-2 rounded-full shadow-sm mr-3 group-hover:-translate-x-1 transition">←</span>
            Kembali ke Katalog
        </button>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                
                {/* BAGIAN KIRI: GAMBAR BESAR */}
                <div className="relative bg-gray-100 h-96 lg:h-auto flex items-center justify-center p-10 group overflow-hidden">
                    <img 
                        src={produk.gambar} 
                        alt={produk.nama_produk} 
                        className="max-h-full max-w-full object-contain drop-shadow-2xl transform group-hover:scale-105 transition duration-500 ease-in-out" 
                    />
                    <div className="absolute top-6 left-6">
                        <span className="bg-white/90 backdrop-blur px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-gray-800 shadow-sm">
                            Digital Product
                        </span>
                    </div>
                </div>

                {/* BAGIAN KANAN: INFO & BELI */}
                <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                        {produk.nama_produk}
                    </h1>
                    
                    <div className="flex items-center gap-4 mb-8">
                        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-bold text-2xl">
                            Rp {Number(produk.harga).toLocaleString('id-ID')}
                        </div>
                        <div className="flex items-center text-green-600 text-sm font-semibold">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                            Tersedia Instant
                        </div>
                    </div>

                    <div className="prose prose-blue text-gray-600 mb-10 leading-relaxed">
                        <p>{produk.deskripsi || 'Produk berkualitas tinggi siap pakai.'}</p>
                    </div>

                    {/* Tombol Aksi (WhatsApp Pasti Muncul Sekarang) */}
                    <div className="flex flex-col gap-4">
                        <a 
                            href={`https://wa.me/6285314445959?text=Halo, saya mau order ${encodeURIComponent(produk.nama_produk)}`} 
                            target="_blank"
                            className="w-full bg-green-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-green-600 hover:shadow-green-500/30 transition transform hover:-translate-y-1 text-center flex items-center justify-center gap-2"
                        >
                            <span>WhatsApp (Tanya Dulu)</span>
                        </a>

                        <button 
                            onClick={() => alert('Fitur Checkout Otomatis akan segera hadir!')}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-blue-500/30 transition transform hover:-translate-y-1 flex items-center justify-center gap-2"
                        >
                            <span>🚀 Beli Sekarang (Instant)</span>
                        </button>
                    </div>

                    <p className="mt-6 text-center text-xs text-gray-400">
                        🔒 Garansi transaksi aman & File langsung terkirim
                    </p>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
}