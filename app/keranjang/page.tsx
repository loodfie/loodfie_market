'use client'

import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaTrash, FaCreditCard, FaShoppingCart, FaWhatsapp } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Supaya TypeScript tidak rewel soal 'snap' Midtrans
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

    // 2. Cek Login & Pasang Script Midtrans
    async function init() {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
            toast.error("🔒 Login dulu Bos kalau mau lihat keranjang!");
            router.push('/masuk'); 
            return;
        }
        setUser(session.user);

        const scriptId = 'midtrans-script';
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = process.env.NEXT_PUBLIC_MIDTRANS_API_URL || 'https://app.midtrans.com/snap/snap.js'; 
            script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
            document.body.appendChild(script);
        }
    }
    init();
  }, [items, router]);

  const handleRemoveItem = (id: any) => {
    removeFromCart(id);
    toast.success("Produk dihapus");
  };

  const handleClearCart = () => {
    if (confirm("Yakin mau hapus semua isi keranjang?")) {
        clearCart();
        toast.success("Keranjang kosong!");
    }
  };

  // 🔥 LOGIKA BAYAR OTOMATIS (MIDTRANS)
  const handlePayment = async () => {
    if (!user) { router.push('/masuk'); return; }
    setLoading(true);
    const orderId = `TRX-${Date.now()}`;
    const itemDetails = items.map(item => ({
        id: item.id,
        price: Number(item.harga),
        quantity: 1,
        name: item.nama_produk.substring(0, 45)
    }));

    try {
        const response = await fetch('/api/midtrans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: orderId,
                total: total,
                items: itemDetails,
                customer: { name: user.email.split('@')[0], email: user.email }
            }),
        });

        const data = await response.json();
        if (!data.token) throw new Error("Gagal mendapatkan token");

        window.snap.pay(data.token, {
            onSuccess: async function(result: any) {
                toast.success("Pembayaran Berhasil! 🎉");
                for (const item of items) {
                    await supabase.from('transaksi').insert({
                        user_email: user.email,
                        produk_id: item.id,
                        harga: item.harga,
                        status: 'LUNAS',
                        order_id: orderId,
                        metode_bayar: result.payment_type
                    });
                }
                clearCart(); 
                router.push('/dashboard'); 
            },
            onPending: function() { toast("Menunggu pembayaran...", { icon: '⏳' }); },
            onError: function() { toast.error("Pembayaran Gagal"); setLoading(false); },
            onClose: function() { setLoading(false); }
        });
    } catch (err) {
        console.error(err);
        toast.error("Gagal memproses. Cek koneksi.");
        setLoading(false);
    }
  };

  // 🔥 LOGIKA BAYAR MANUAL (WHATSAPP)
  const handleWhatsAppPayment = () => {
    if (!user) { router.push('/masuk'); return; }
    
    const namaProduk = items.map(i => i.nama_produk).join(', ');
    const text = `Halo Admin Loodfie Market! 👋%0A%0ASaya ingin membeli:%0A📦 *${namaProduk}*%0A💰 Total: *Rp ${total.toLocaleString('id-ID')}*%0A📧 Email Akun: *${user.email}*%0A%0AMohon info rekening untuk transfer manual. Terima kasih!`;
    
    window.open(`https://wa.me/6285314445959?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Toaster position="top-center" />
      
      {/* HEADER */}
      <div className="bg-white border-b sticky top-0 z-50 px-4 py-3 md:px-6 md:py-4 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-bold transition text-sm md:text-base">
            <FaArrowLeft /> <span className="hidden md:inline">Kembali Belanja</span>
        </Link>
        <h1 className="font-bold text-base md:text-lg flex items-center gap-2">
            <FaShoppingCart className="text-blue-600" /> Keranjang Belanja
        </h1>
        {items.length > 0 && (
            <button onClick={handleClearCart} className="text-red-500 text-xs font-bold hover:bg-red-50 px-2 py-1 rounded transition">
                Hapus Semua
            </button>
        )}
      </div>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {items.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                <div className="text-6xl mb-4">🛒</div>
                <h2 className="text-2xl font-bold mb-2">Keranjang Kosong</h2>
                <p className="text-gray-400 mb-6 text-sm">Belum ada barang nih, Bos.</p>
                <Link href="/" className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 transition inline-block">
                    Mulai Belanja
                </Link>
            </div>
        ) : (
            <div className="space-y-6">
                {/* LIST ITEM */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {items.map((item, index) => (
                        <div key={`${item.id}-${index}`} className="flex gap-4 p-4 border-b last:border-0 hover:bg-gray-50 transition items-center">
                            <div className="h-16 w-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border">
                                {item.gambar ? <img src={item.gambar} className="w-full h-full object-cover" /> : <span className="flex items-center justify-center h-full text-xl">📦</span>}
                            </div>
                            <div className="flex-grow min-w-0">
                                <h3 className="font-bold text-sm md:text-base line-clamp-2 leading-tight mb-1">{item.nama_produk}</h3>
                                <p className="text-blue-600 font-black text-sm">Rp {Number(item.harga).toLocaleString('id-ID')}</p>
                            </div>
                            <button onClick={() => handleRemoveItem(item.id)} className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition">
                                <FaTrash />
                            </button>
                        </div>
                    ))}
                </div>

                {/* AREA PEMBAYARAN */}
                <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 sticky bottom-4 z-40">
                    <div className="flex justify-between items-center mb-4 border-b border-dashed pb-4">
                        <span className="text-gray-500 font-bold text-sm">Total Pembayaran</span>
                        <span className="text-2xl font-black text-blue-600">Rp {total.toLocaleString('id-ID')}</span>
                    </div>
                    
                    <div className="space-y-3">
                        {/* 1. TOMBOL MIDTRANS (OTOMATIS) */}
                        <button 
                            onClick={handlePayment}
                            disabled={loading}
                            className={`w-full py-3.5 rounded-xl font-bold text-sm md:text-base shadow-lg transition transform flex items-center justify-center gap-2 ${
                                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.02]'
                            }`}
                        >
                            {loading ? 'Memproses...' : <><FaCreditCard /> Bayar Otomatis (QRIS/VA)</>}
                        </button>

                        {/* 2. TOMBOL WHATSAPP (MANUAL) */}
                        <button 
                            onClick={handleWhatsAppPayment}
                            className="w-full py-3.5 rounded-xl font-bold text-sm md:text-base border-2 border-green-500 text-green-600 hover:bg-green-50 transition transform flex items-center justify-center gap-2"
                        >
                            <FaWhatsapp className="text-xl" /> Bayar Manual / Transfer Bank
                        </button>
                    </div>

                    <p className="text-center text-[10px] text-gray-400 mt-3">
                        Pilih "Bayar Manual" jika ingin transfer langsung ke Admin.
                    </p>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}