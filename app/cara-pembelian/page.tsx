import Link from 'next/link';
import { FaArrowLeft, FaShoppingBag, FaWhatsapp } from 'react-icons/fa';

export default function CaraPembelianPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50 px-6 py-4 flex items-center shadow-sm">
        <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-bold transition">
            <FaArrowLeft /> Kembali ke Beranda
        </Link>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-12">
            <FaShoppingBag className="text-5xl text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-black text-gray-900">Cara Pembelian</h1>
            <p className="text-gray-500 mt-2">Panduan mudah belanja produk digital di Loodfie Market.</p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-50 w-32 h-32 rounded-bl-full -mr-10 -mt-10 z-0"></div>
            
            <ol className="relative z-10 space-y-8 border-l-2 border-blue-100 ml-3 pl-8">
                <li className="relative">
                    <span className="absolute -left-[41px] bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold ring-4 ring-white">1</span>
                    <h3 className="font-bold text-lg text-gray-900">Pilih Produk</h3>
                    <p className="text-gray-600 text-sm mt-1">Cari produk digital yang kamu butuhkan, lalu klik tombol keranjang.</p>
                </li>
                <li className="relative">
                    <span className="absolute -left-[41px] bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold ring-4 ring-white">2</span>
                    <h3 className="font-bold text-lg text-gray-900">Checkout & Bayar</h3>
                    <p className="text-gray-600 text-sm mt-1">Buka keranjang, klik tombol Bayar. Pilih metode pembayaran (QRIS, Transfer Bank, E-Wallet) via Midtrans.</p>
                </li>
                <li className="relative">
                    <span className="absolute -left-[41px] bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold ring-4 ring-white">3</span>
                    <h3 className="font-bold text-lg text-gray-900">Konfirmasi Otomatis</h3>
                    <p className="text-gray-600 text-sm mt-1">Sistem akan mendeteksi pembayaranmu secara otomatis dalam hitungan detik.</p>
                </li>
                <li className="relative">
                    <span className="absolute -left-[41px] bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold ring-4 ring-white">4</span>
                    <h3 className="font-bold text-lg text-gray-900">Download File</h3>
                    <p className="text-gray-600 text-sm mt-1">Masuk ke menu Dashboard Member. Link download produkmu sudah tersedia di sana!</p>
                </li>
            </ol>

            <div className="mt-8 pt-8 border-t border-gray-100 text-center">
                <p className="text-gray-500 text-sm mb-4">Masih bingung? Chat admin aja langsung.</p>
                <a 
                    href="https://wa.me/6285314445959" 
                    target="_blank"
                    className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-full font-bold hover:bg-green-600 transition shadow-lg hover:shadow-green-500/30"
                >
                    <FaWhatsapp className="text-xl" /> Chat WhatsApp
                </a>
            </div>
        </div>
      </div>
    </div>
  );
}