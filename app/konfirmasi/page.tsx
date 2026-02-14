import Link from 'next/link';
import { FaArrowLeft, FaCheckCircle, FaWhatsapp } from 'react-icons/fa';

export default function KonfirmasiPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50 px-6 py-4 flex items-center shadow-sm">
        <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-bold transition">
            <FaArrowLeft /> Kembali ke Beranda
        </Link>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaCheckCircle className="text-4xl text-green-500" />
            </div>
            
            <h1 className="text-3xl font-black text-gray-900 mb-4">Konfirmasi Pembayaran</h1>
            <p className="text-gray-500 mb-8 leading-relaxed">
                Terima kasih sudah berbelanja! Sistem kami biasanya memverifikasi pembayaran secara otomatis. 
                Namun, jika status pembelianmu belum berubah dalam 10 menit, silakan konfirmasi manual di sini.
            </p>

            <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-left">
                    <h3 className="font-bold text-blue-800 text-sm mb-1">💡 Data yang dibutuhkan:</h3>
                    <ul className="text-sm text-blue-600 list-disc ml-4 space-y-1">
                        <li>Email akun kamu</li>
                        <li>Nomor Order / Invoice ID</li>
                        <li>Bukti Transfer (Screenshot)</li>
                    </ul>
                </div>

                <a 
                    href="https://wa.me/6285314445959?text=Halo%20Admin%2C%20saya%20mau%20konfirmasi%20pembayaran%20untuk%20Order%20ID%3A%20..." 
                    target="_blank"
                    className="flex items-center justify-center gap-2 w-full bg-green-500 text-white py-4 rounded-xl font-bold hover:bg-green-600 transition shadow-lg hover:shadow-green-500/30"
                >
                    <FaWhatsapp className="text-xl" /> Kirim Bukti via WhatsApp
                </a>
            </div>
        </div>
      </div>
    </div>
  );
}