'use client'

import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaTrash, FaCreditCard, FaShoppingCart } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Supaya TypeScript tidak rewel soal 'snap'
declare global {
  interface Window {
    snap: any;
  }
}

export default function KeranjangPage() {
  const { items, removeFromCart, clearCart } = useCart();
  const [total, setTotal] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 1. Hitung Total Harga
    const hitung = items.reduce((acc, item) => acc + Number(item.harga), 0);
    setTotal(hitung);

    // 2. Cek Login & Pasang Script Midtrans (PRODUCTION MODE)
    async function init() {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);

        // Cek apakah script sudah ada biar gak dobel
        const scriptId = 'midtrans-script';
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            // 🔥 URL INI UNTUK PRODUCTION (LIVE)
            script.src = 'https://app.midtrans.com/snap/snap.js'; 
            script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
            document.body.appendChild(script);
        }
    }
    init();
  }, [items]);

  // 🔥 FUNGSI BAYAR (TOMBOL DITEKAN)
  const handlePayment = async () => {
    if (!user) {
        toast.error("Eits, Login dulu Bos!");
        router.push('/masuk');
        return;
    }

    setLoading(true);
    // Buat ID Order Unik (Contoh: TRX-123456789)
    const orderId = `TRX-${Date.now()}`;

    // Siapkan Data Barang (Midtrans butuh id, price, quantity, name)
    const itemDetails = items.map(item => ({
        id: item.id,
        price: Number(item.harga),
        quantity: 1,
        name: item.nama_produk.substring(0, 45) // Midtrans batasi nama max 50 huruf
    }));

    try {
        // 1. Minta Token ke API Backend kita
        const response = await fetch('/api/midtrans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: orderId,
                total: total,
                items: itemDetails,
                customer: {
                    name: user.email.split('@')[0], // Pakai nama dari email
                    email: user.email
                }
            }),
        });

        const data = await response.json();

        if (!data.token) throw new Error("Gagal mendapatkan token pembayaran");

        // 2. Munculkan Popup Midtrans (Snap)
        window.snap.pay(data.token, {
            onSuccess: async function(result: any) {
                toast.success("Pembayaran Berhasil! 🎉");
                
                // SIMPAN TRANSAKSI KE DATABASE (Supaya user bisa akses produknya)
                for (const item of items) {
                    await supabase.from('transaksi').insert({
                        user_email: user.email,
                        produk_id: item.id,
                        harga: item.harga,
                        status: 'LUNAS', // Langsung LUNAS
                        order_id: orderId,
                        metode_bayar: result.payment_type
                    });
                }
                
                clearCart(); // Kosongkan keranjang
                router.push('/dashboard'); // Lempar ke Member Area
            },
            onPending: function(result: any) {
                toast("Menunggu pembayaran...", { icon: '⏳' });
                // Bisa redirect ke halaman riwayat kalau mau
            },
            onError: function(result: any) {
                toast.error("Pembayaran Gagal/Dibatalkan");
                setLoading(false);
            },
            onClose: function() {
                toast("Jendela pembayaran ditutup");
                setLoading(false);
            }
        });

    } catch (err) {
        console.error(err);
        toast.error("Terjadi kesalahan sistem. Coba lagi nanti.");
        setLoading(false);
    }
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
        <div className="w-8"></div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {items.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                <div className="text-6xl mb-4">🛒</div>
                <h2 className="text-2xl font-bold mb-2">Keranjang Kosong</h2>
                <Link href="/" className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 transition">
                    Mulai Belanja
                </Link>
            </div>
        ) : (
            <div className="space-y-6">
                {/* LIST ITEM */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {items.map((item) => (
                        <div key={item.id} className="flex gap-4 p-4 border-b last:border-0 hover:bg-gray-50 transition items-center">
                            <div className="h-16 w-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border">
                                {item.gambar ? <img src={item.gambar} className="w-full h-full object-cover" /> : <span className="flex items-center justify-center h-full">📦</span>}
                            </div>
                            <div className="flex-grow">
                                <h3 className="font-bold text-sm md:text-base line-clamp-2">{item.nama_produk}</h3>
                                <p className="text-blue-600 font-bold text-sm">Rp {Number(item.harga).toLocaleString('id-ID')}</p>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 p-2"><FaTrash /></button>
                        </div>
                    ))}
                </div>

                {/* AREA TOTAL & TOMBOL BAYAR */}
                <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 sticky bottom-4">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-500 font-bold">Total Pembayaran</span>
                        <span className="text-2xl font-black text-blue-600">Rp {total.toLocaleString('id-ID')}</span>
                    </div>
                    
                    <button 
                        onClick={handlePayment}
                        disabled={loading}
                        className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition transform flex items-center justify-center gap-2 ${
                            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.02] shadow-blue-500/30'
                        }`}
                    >
                        {loading ? 'Memproses...' : <><FaCreditCard /> Bayar Sekarang</>}
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-3">🔒 Pembayaran Aman & Otomatis (Midtrans)</p>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}