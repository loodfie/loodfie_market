'use client'

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';

export default function KeranjangPage() {
  const { items, removeFromCart, totalHarga } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    if (items.length === 0) return;

    // Format Pesan WA
    let pesan = `Halo Admin Loodfie, saya mau Checkout barang ini dong:%0A%0A`;
    items.forEach((item, index) => {
      pesan += `${index + 1}. ${item.nama_produk} - Rp ${item.harga.toLocaleString('id-ID')}%0A`;
    });
    pesan += `%0A*Total: Rp ${totalHarga.toLocaleString('id-ID')}*`;
    pesan += `%0A%0AMohon info rekening pembayarannya ya!`;

    window.open(`https://wa.me/6285314445959?text=${pesan}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-24">
      <Toaster position="bottom-center" />
      <nav className="bg-white border-b p-4 sticky top-0 z-50 flex items-center gap-4 shadow-sm">
        <Link href="/" className="font-bold text-xl px-3 py-1 bg-gray-100 rounded-lg">⬅️</Link>
        <h1 className="font-bold text-xl flex-grow text-center">Keranjang Belanja 🛒</h1>
        <div className="w-10"></div>
      </nav>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🛒</p>
            <h2 className="text-xl font-bold text-gray-700">Keranjang Kosong</h2>
            <Link href="/" className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-full font-bold shadow hover:bg-blue-700 transition">Mulai Belanja</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm flex gap-4 items-center border border-gray-100">
                <img src={item.gambar} className="w-16 h-16 object-cover rounded-lg bg-gray-200 border" />
                <div className="flex-grow">
                  <h3 className="font-bold text-gray-800 text-sm line-clamp-2">{item.nama_produk}</h3>
                  <p className="text-blue-600 font-extrabold text-sm">Rp {item.harga.toLocaleString('id-ID')}</p>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-red-500 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition">🗑️</button>
              </div>
            ))}
          </div>
        )}
      </main>

      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-[0_-5px_10px_rgba(0,0,0,0.1)] z-50">
          <div className="container mx-auto max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-500 font-bold text-sm">Total Pembayaran</span>
              <span className="text-xl font-extrabold text-blue-600">Rp {totalHarga.toLocaleString('id-ID')}</span>
            </div>
            <button onClick={handleCheckout} className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-green-700 shadow-lg flex items-center justify-center gap-2">
               Checkout via WhatsApp 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
}