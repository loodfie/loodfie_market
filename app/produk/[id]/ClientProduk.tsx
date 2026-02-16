'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaShoppingCart, FaCreditCard, FaWhatsapp } from 'react-icons/fa';
import { useCart } from '@/context/CartContext';
import toast, { Toaster } from 'react-hot-toast';

declare global {
  interface Window {
    snap: any;
  }
}

export default function ClientProduk({ idProduk }: { idProduk: string }) {
  const [produk, setProduk] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [user, setUser] = useState<any>(null);
  const [paying, setPaying] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function getData() {
      const { data } = await supabase.from('produk').select('*').eq('id', idProduk).single();
      if (data) setProduk(data);
      
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      setLoading(false);
    }
    getData();
  }, [idProduk]);

  const handleAddToCart = () => {
    if (produk) {
      addToCart(produk);
      toast.success("Masuk keranjang! 🛒");
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
        toast.error("Login dulu Bos!");
        router.push('/masuk');
        return;
    }
    setPaying(true);

    try {
        const orderId = `TRX-${Date.now()}`;
        
        const response = await fetch('/api/midtrans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: orderId,
                total: produk.harga,
                items: [{
                    id: produk.id,
                    price: Math.round(Number(produk.harga)),
                    quantity: 1,
                    name: produk.nama_produk.substring(0, 45)
                }],
                customer: { name: user.email.split('@')[0], email: user.email }
            }),
        });

        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error || "Gagal menghubungi pembayaran");
        if (!data.token) throw new Error("Token tidak diterima");

        if (window.snap) {
            window.snap.pay(data.token, {
                onSuccess: async function(result: any) {
                    toast.success("Lunas! 🎉");
                    await supabase.from('transaksi').insert({
                        user_email: user.email,
                        produk_id: produk.id,
                        harga: produk.harga,
                        status: 'LUNAS',
                        order_id: orderId,
                        metode_bayar: result.payment_type || 'midtrans'
                    });
                    router.push('/dashboard');
                },
                onPending: function() { toast("Menunggu pembayaran...", { icon: '⏳' }); },
                onError: function() { toast.error("Pembayaran gagal"); setPaying(false); },
                onClose: function() { setPaying(false); }
            });
        } else {
            toast.error("Script Midtrans gagal. Refresh halaman.");
            setPaying(false);
        }

    } catch (err: any) {
        console.error("Error Buy Now:", err);
        toast.error(err.message || "Gagal memproses transaksi.");
        setPaying(false);
    }
  };

  const handleManualBuy = () => {
    if (!user) {
        toast.error("Login dulu bos!");
        router.push('/masuk');
        return;
    }
    const text = `Halo Admin! Saya mau beli: ${produk.nama_produk}`;
    window.open(`https://wa.me/6285314445959?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!produk) return <div className="p-10 text-center">Produk tidak ditemukan.</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Toaster position="top-center" />
      <div className="bg-white border-b sticky top-0 z-50 px-4 py-3 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center gap-2 font-bold"><FaArrowLeft /> Kembali</Link>
        <span className="font-bold">Loodfie Market</span>
        <Link href="/keranjang" className="text-xl"><FaShoppingCart /></Link>
      </div>

      <main className="container mx-auto px-4 py-8 flex justify-center">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-5xl w-full grid grid-cols-1 md:grid-cols-2">
            <div className="bg-gray-100 p-8 flex items-center justify-center">
                {produk.gambar ? (
                    <img src={produk.gambar} className="max-h-80 object-contain" alt={produk.nama_produk} />
                ) : <span className="text-6xl">📦</span>}
            </div>
            <div className="p-8 flex flex-col justify-center">
                <h1 className="text-3xl font-black mb-2">{produk.nama_produk}</h1>
                <div className="text-4xl font-black text-blue-600 mt-1">
                    Rp {Number(produk.harga).toLocaleString('id-ID')}
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-6">
                    <button onClick={handleAddToCart} className="bg-orange-50 text-orange-600 border border-orange-200 py-3 rounded-xl font-bold flex justify-center items-center gap-2">
                        <FaShoppingCart /> +Keranjang
                    </button>
                    <button onClick={handleBuyNow} disabled={paying} className="bg-blue-600 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-blue-700">
                        {paying ? '...' : <><FaCreditCard /> Beli Sekarang</>}
                    </button>
                </div>
                
                <button onClick={handleManualBuy} className="w-full mt-3 py-3 rounded-xl font-bold text-green-600 border-2 border-green-500 hover:bg-green-50 flex justify-center items-center gap-2">
                    <FaWhatsapp /> Bayar Manual
                </button>
            </div>
        </div>
      </main>
    </div>
  );
}