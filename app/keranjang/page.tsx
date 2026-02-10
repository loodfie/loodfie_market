'use client'

import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaTrash, FaWhatsapp, FaShoppingCart } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';
import toast, { Toaster } from 'react-hot-toast';

export default function KeranjangPage() {
  const { items, removeFromCart, clearCart } = useCart(); // Pastikan clearCart ada di context, kalau tidak nanti kita adjust
  const [total, setTotal] = useState(0);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // 1. Hitung Total Harga Otomatis
    const hitung = items.reduce((acc, item) => acc + Number(item.harga), 0);
    setTotal(hitung);

    // 2. Cek User (Biar nama/emailnya masuk ke WA)
    async function getUser() {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
    }
    getUser();
  }, [items]);

  // 🔥 FITUR UTAMA: CHECKOUT BORONGAN KE WA
  const handleCheckoutWA = () => {
    if (items.length === 0) {
        toast.error("Keranjang kosong, Bos!");
        return;
    }

    // 1. Susun Daftar Barang
    const daftarBarang = items.map((item, index) => {
        return `${index + 1}. ${item.nama_produk} (Rp ${Number(item.harga).toLocaleString('id-ID')})`;
    }).join('\n');

    // 2. Susun Pesan Lengkap
    const pesan = `Halo Admin *Loodfie Market*! 👋

Saya mau checkout borongan nih:

${daftarBarang}

💰 *TOTAL: Rp ${total.toLocaleString('id-ID')}*

👤 Email Member: ${user ? user.email : '(Belum Login)'}

Mohon info rekening untuk pembayaran ya. Terima kasih!`;

    // 3. Buka WhatsApp
    const url = `https://wa.me/6285314445959?text=${encodeURIComponent(pesan)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Toaster position="top-center" />
      
      {/* HEADER */}
      <div className="bg-white border-b sticky top-0 z-50 px-6 py-4 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-bold transition">
            <FaArrowLeft /> Kembali Belanja
        </Link>
        <h1 className="font-bold text-lg flex items-center gap-2">
            <FaShoppingCart className="text-blue-600" /> Keranjang Belanja
        </h1>
        <div className="w-8"></div> {/* Spacer biar tengah */}
      </div>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        
        {items.length === 0 ? (
            // TAMPILAN KOSONG
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                <div className="text-6xl mb-4">🛒</div>
                <h2 className="text-2xl font-bold mb-2">Keranjang Kosong</h2>
                <p className="text-gray-500 mb-8">Belum ada produk yang diamankan.</p>
                <Link href="/" className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 transition">
                    Mulai Belanja
                </Link>
            </div>
        ) : (
            // TAMPILAN ADA BARANG
            <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {items.map((item) => (
                        <div key={item.id} className="flex gap-4 p-4 border-b last:border-0 hover:bg-gray-50 transition items-center">
                            {/* Gambar Kecil */}
                            <div className="h-16 w-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border">
                                {item.gambar ? <img src={item.gambar} className="w-full h-full object-cover" /> : <span className="flex items-center justify-center h-full">📦</span>}
                            </div>
                            
                            {/* Info Produk */}
                            <div className="flex-grow">
                                <h3 className="font-bold text-sm md:text-base line-clamp-2">{item.nama_produk}</h3>
                                <p className="text-blue-600 font-bold text-sm">Rp {Number(item.harga).toLocaleString('id-ID')}</p>
                            </div>

                            {/* Tombol Hapus */}
                            <button 
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition"
                                title="Hapus dari keranjang"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    ))}
                </div>

                {/* RINGKASAN & TOMBOL BAYAR */}
                <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 sticky bottom-4">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-500 font-bold">Total Pembayaran</span>
                        <span className="text-2xl font-black text-blue-600">Rp {total.toLocaleString('id-ID')}</span>
                    </div>
                    
                    <button 
                        onClick={handleCheckoutWA}
                        className="w-full bg-green-500 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-green-500/30 hover:bg-green-600 hover:scale-[1.02] transition transform flex items-center justify-center gap-2"
                    >
                        <FaWhatsapp className="text-2xl" /> Checkout via WhatsApp
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-3">
                        *Anda akan diarahkan ke WhatsApp Admin untuk konfirmasi pembayaran.
                    </p>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}