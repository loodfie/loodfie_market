import Link from 'next/link';
import { FaArrowLeft, FaQuestionCircle } from 'react-icons/fa';

export default function FaqPage() {
  const faqs = [
    {
      tanya: "Apakah produk ini dikirim fisik?",
      jawab: "Tidak. Semua produk adalah digital (soft file). Kamu bisa langsung download setelah pembayaran berhasil."
    },
    {
      tanya: "Bagaimana cara downloadnya?",
      jawab: "Setelah bayar, cek menu Dashboard member. Link download akan muncul otomatis di sana."
    },
    {
      tanya: "Apakah ada garansi uang kembali?",
      jawab: "Karena ini produk digital yang bisa dicopy, kami tidak melayani refund kecuali file rusak/corrupt dan tidak bisa kami perbaiki."
    },
    {
      tanya: "Apakah source code boleh dijual lagi?",
      jawab: "Tergantung lisensi masing-masing produk. Cek deskripsi produk ya, Bos!"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* Header Simple */}
      <div className="bg-white border-b sticky top-0 z-50 px-6 py-4 flex items-center shadow-sm">
        <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-bold transition">
            <FaArrowLeft /> Kembali ke Beranda
        </Link>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-10">
            <FaQuestionCircle className="text-5xl text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-black text-gray-900">Pertanyaan Umum (FAQ)</h1>
            <p className="text-gray-500 mt-2">Yang sering ditanyakan oleh member baru.</p>
        </div>

        <div className="space-y-4">
            {faqs.map((item, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">🤔 {item.tanya}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.jawab}</p>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}