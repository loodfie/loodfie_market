'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaShoppingCart, FaCheckCircle, FaStar, FaWhatsapp, FaCreditCard } from 'react-icons/fa';
import { useCart } from '@/context/CartContext';
import toast, { Toaster } from 'react-hot-toast';

// Supaya TypeScript tidak rewel soal 'snap' Midtrans
declare global {
  interface Window {
    snap: any;
  }
}

export default function DetailProdukPage() {
  const { id } = useParams();
  const [produk, setProduk] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [user, setUser] = useState<any>(null);
  const [paying, setPaying] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function getData() {
      // 1. Ambil Data Produk
      const { data } = await supabase.from('produk').select('*').eq('id', id).single();
      if (data) setProduk(data);
      
      // 2. Cek User
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      // 3. Pasang Script Midtrans
      const scriptId = 'midtrans-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = process.env.NEXT_PUBLIC_MIDTRANS_API_URL || 'https://app.midtrans.com/snap/snap.js'; 
        script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
        document.body.appendChild(script);
      }
      
      setLoading(false);
    }
    getData();
  }, [id]);

  const handleAddToCart = () => {
    if (produk) {
      addToCart(produk);
      toast.success("Masuk keranjang! 🛒");
    }
  };

  // 🔥 BELI LANGSUNG (OTOMATIS MIDTRANS)
  const handleBuyNow = async () => {
    if (!user) {
        toast.error("Login dulu Bos!");
        router.push('/masuk');
        return;
    }
    setPaying(true);

    try {
        const orderId = `TRX-DIRECT-${Date.now()}`;
        const response = await fetch('/api/midtrans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: orderId,
                total: produk.harga,
                items: [{
                    id: produk.id,
                    price: Number(produk.harga),
                    quantity: 1,
                    name: produk.nama_produk.substring(0, 45)
                }],
                customer: { name: user.email.split('@')[0], email: user.email }
            }),
        });

        const data = await response.json();
        if (!data.token) throw new Error("Gagal dapat token");

        window.snap.pay(data.token, {
            onSuccess: async function(result: any) {
                toast.success("Lunas! 🎉");
                await supabase.from('transaksi').insert({
                    user_email: user.email,
                    produk_id: produk.id,
                    harga: produk.harga,
                    status: 'LUNAS',
                    order_id: orderId,
                    metode_bayar: result.payment_type
                });
                router.push('/dashboard');
            },
            onPending: function() { toast("Menunggu pembayaran...", { icon: '⏳' }); },
            onError: function() { toast.error("Gagal bayar"); setPaying(false); },
            onClose: function() { setPaying(false); }
        });

    } catch (err) {
        console.error(err);
        toast.error("Gagal memproses.");
        setPaying(false);
    }
  };

  // 🔥 BELI MANUAL (WHATSAPP)
  const handleManualBuy = () => {
    if (!user) {
        toast.error("Login dulu supaya Admin tahu emailmu!");
        router.push('/masuk');
        return;
    }

    const text = `Halo Admin Loodfie Market! 👋%0A%0ASaya mau beli langsung:%0A📦 *${produk.nama_produk}*%0A💰 Harga: *Rp ${Number(produk.harga).toLocaleString('id-ID')}*%0A📧 Email Akun: *${user.email}*%0A%0AMohon info rekening untuk transfer manual. Terima kasih!`;
    
    window.open(`https://wa.me/6285314445959?text=${text}`, '_blank');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (!produk) return <div className="text-center py-20">Produk tidak ditemukan.</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Toaster position="top-center" />
      
      {/* HEADER */}
      <div className="bg-white border-b sticky top-0 z-50 px-4 py-3 md:px-6 md:py-4 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-bold transition">
            <FaArrowLeft /> Kembali
        </Link>
        <span className="font-bold text-gray-900">Loodfie Market</span>
        <Link href="/keranjang" className="text-gray-600 hover:text-blue-600 text-xl"><FaShoppingCart /></Link>
      </div>

      <main className="container mx-auto px-4 py-8 md:py-12 flex items-center justify-center min-h-[80vh]">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-5xl w-full grid grid-cols-1 md:grid-cols-2">
            
            {/* Kiri: Gambar */}
            <div className="bg-gray-100 p-8 flex items-center justify-center relative">
                <span className="absolute top-6 left-6 bg-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                    {produk.kategori || 'Digital'}
                </span>
                {produk.gambar ? (
                    <img src={produk.gambar} className="w-full h-auto max-h-80 object-contain drop-shadow-2xl hover:scale-105 transition duration-500" alt={produk.nama_produk} />
                ) : (
                    <span className="text-6xl">📦</span>
                )}
            </div>

            {/* Kanan: Info & Tombol */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="mb-6">
                    <p className="text-red-500 font-bold text-xs mb-2 flex items-center gap-1 animate-pulse">
                        ● {Math.floor(Math.random() * 10) + 5} orang sedang melihat produk ini!
                    </p>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2 leading-tight">{produk.nama_produk}</h1>
                    
                    <div className="flex items-center gap-3 mt-4">
                        {produk.harga_coret > produk.harga && (
                            <>
                                <span className="text-gray-400 line-through text-lg">Rp {Number(produk.harga_coret).toLocaleString('id-ID')}</span>
                                <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-bold">Hemat {Math.round(((produk.harga_coret - produk.harga) / produk.harga_coret) * 100)}%</span>
                            </>
                        )}
                    </div>
                    <div className="text-4xl font-black text-blue-600 mt-1">
                        Rp {Number(produk.harga).toLocaleString('id-ID')}
                    </div>
                </div>

                <div className="border-l-4 border-gray-200 pl-4 mb-8">
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm md:text-base">
                        {produk.deskripsi || "Produk berkualitas tinggi siap pakai."}
                    </p>
                </div>

                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={handleAddToCart}
                            className="bg-orange-50 text-orange-600 border border-orange-200 py-3.5 rounded-xl font-bold hover:bg-orange-100 transition flex items-center justify-center gap-2"
                        >
                            <FaShoppingCart /> +Keranjang
                        </button>
                        
                        <button 
                            onClick={handleBuyNow}
                            disabled={paying}
                            className={`py-3.5 rounded-xl font-bold text-white shadow-lg transition flex items-center justify-center gap-2 ${paying ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {paying ? '...' : <><FaCreditCard /> Beli Sekarang</>}
                        </button>
                    </div>

                    {/* 🔥 TOMBOL MANUAL (BARU) 🔥 */}
                    <button 
                        onClick={handleManualBuy}
                        className="w-full py-3.5 rounded-xl font-bold text-green-600 border-2 border-green-500 hover:bg-green-50 transition flex items-center justify-center gap-2"
                    >
                        <FaWhatsapp className="text-xl" /> Bayar Manual / Transfer Bank
                    </button>
                </div>

                <p className="text-[10px] text-gray-400 mt-4 text-center">*Pembayaran Otomatis via Midtrans (QRIS/VA) atau Manual Transfer</p>
            </div>
        </div>
      </main>

      {/* Floating WA */}
      <a href="https://wa.me/6285314445959" target="_blank" className="fixed bottom-6 right-6 bg-green-500 text-white p-3 rounded-full shadow-2xl hover:bg-green-600 transition z-50">
        <FaWhatsapp className="text-2xl" />
      </a>
    </div>
  );
}