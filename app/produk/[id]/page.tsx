'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function DetailProduk() {
  const params = useParams(); 
  const idProduk = params?.id; 

  const [produk, setProduk] = useState<any>(null);
  const [ulasan, setUlasan] = useState<any[]>([]); // Data ulasan
  const [loading, setLoading] = useState(true);
  const [prosesBeli, setProsesBeli] = useState(false);
  
  // State Form Ulasan
  const [komentarBaru, setKomentarBaru] = useState('');
  const [bintangBaru, setBintangBaru] = useState(5);
  const [user, setUser] = useState<any>(null);

  const router = useRouter();

  useEffect(() => {
    async function initData() {
      if (!idProduk) return;

      // 1. Cek User Login
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      // 2. Ambil Data Produk
      const { data: dataProduk, error } = await supabase
        .from('produk')
        .select('*')
        .eq('id', idProduk)
        .single();
      
      if (dataProduk) setProduk(dataProduk);

      // 3. Ambil Data Ulasan
      const { data: dataUlasan } = await supabase
        .from('ulasan')
        .select('*')
        .eq('produk_id', idProduk)
        .order('created_at', { ascending: false });

      if (dataUlasan) setUlasan(dataUlasan);

      setLoading(false);
    }

    initData();
  }, [idProduk]);

  // --- KIRIM ULASAN ---
  const handleKirimUlasan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        alert("Silakan login dulu untuk memberi ulasan.");
        router.push('/masuk');
        return;
    }
    if (!komentarBaru) return;

    const ulasanBaru = {
        produk_id: idProduk,
        nama_user: user.email.split('@')[0], // Pakai nama depan email
        bintang: bintangBaru,
        komentar: komentarBaru,
        created_at: new Date().toISOString()
    };

    const { error } = await supabase.from('ulasan').insert([ulasanBaru]);

    if (error) {
        alert("Gagal kirim ulasan: " + error.message);
    } else {
        alert("Terima kasih atas ulasannya! ⭐");
        setKomentarBaru('');
        // Refresh data ulasan manual biar langsung muncul
        setUlasan([ulasanBaru, ...ulasan]);
    }
  };

  const handleBeli = async () => {
    setProsesBeli(true);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        alert("Silakan Login atau Daftar dulu untuk membeli produk ini.");
        router.push('/masuk');
        return;
    }

    if (!produk.link_mayar) {
        alert("Maaf, link pembayaran belum disetting admin.");
        setProsesBeli(false);
        return;
    }

    const pesananBaru = {
        user_id: session.user.id,
        nama_produk: produk.nama || produk.nama_produk,
        harga: produk.harga,
        status: 'Menunggu Pembayaran',
        tanggal: new Date().toISOString()
    };

    const { error } = await supabase.from('pesanan').insert([pesananBaru]);

    if (error) {
        alert("Gagal membuat pesanan: " + error.message);
        setProsesBeli(false);
    } else {
        window.location.href = produk.link_mayar;
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-blue-200 rounded-full mb-4"></div>
            <p className="text-gray-400 text-sm">Sedang mengambil data...</p>
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

  const namaProduk = produk.nama || produk.nama_produk || 'Produk Tanpa Nama';
  
  // Hitung Rata-rata Bintang
  const rataBintang = ulasan.length > 0 
    ? (ulasan.reduce((acc, curr) => acc + curr.bintang, 0) / ulasan.length).toFixed(1) 
    : '0.0';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        <button onClick={() => router.back()} className="mb-8 flex items-center text-gray-500 hover:text-blue-600 transition group">
            <span className="bg-white p-2 rounded-full shadow-sm mr-3 group-hover:-translate-x-1 transition">←</span>
            Kembali ke Katalog
        </button>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="relative bg-gray-100 h-96 lg:h-auto flex items-center justify-center p-10 group overflow-hidden">
                    <img src={produk.gambar} alt={namaProduk} className="max-h-full max-w-full object-contain drop-shadow-2xl transform group-hover:scale-105 transition duration-500 ease-in-out" />
                </div>

                <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-yellow-400 text-xl">⭐</span>
                        <span className="font-bold text-gray-900">{rataBintang}</span>
                        <span className="text-gray-400 text-sm">({ulasan.length} Ulasan)</span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                        {namaProduk}
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
                        <p>{produk.deskripsi || 'Produk berkualitas siap pakai.'}</p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <a href={`https://wa.me/6285314445959?text=Halo%2C%20saya%20tertarik%20beli%20${encodeURIComponent(namaProduk)}`} target="_blank" className="w-full bg-green-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-green-600 transition transform hover:-translate-y-1 text-center flex items-center justify-center gap-2">
                            <span>WhatsApp (Tanya Dulu)</span>
                        </a>
                        <button onClick={handleBeli} disabled={prosesBeli} className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-blue-500/30 transition transform hover:-translate-y-1 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed">
                            {prosesBeli ? 'Mengalihkan ke Pembayaran... 💸' : '🚀 Beli Sekarang (Instant)'}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* --- KOLOM ULASAN (BARU) --- */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 md:p-12">
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                Ulasan Pembeli <span className="text-gray-400 text-lg font-normal">({ulasan.length})</span>
            </h3>

            {/* Form Input Ulasan */}
            {user ? (
                <form onSubmit={handleKirimUlasan} className="mb-12 bg-gray-50 p-6 rounded-2xl border border-gray-200">
                    <h4 className="font-bold mb-4 text-gray-700">Tulis Ulasan Kamu</h4>
                    <div className="flex items-center gap-4 mb-4">
                        <label className="text-sm text-gray-500">Rating:</label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} type="button" onClick={() => setBintangBaru(star)} className={`text-2xl transition ${star <= bintangBaru ? 'text-yellow-400 scale-110' : 'text-gray-300'}`}>★</button>
                            ))}
                        </div>
                    </div>
                    <textarea 
                        required
                        className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none mb-4 bg-white"
                        placeholder="Bagaimana pendapatmu tentang produk ini?"
                        rows={3}
                        value={komentarBaru}
                        onChange={(e) => setKomentarBaru(e.target.value)}
                    ></textarea>
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg">
                        Kirim Ulasan 🚀
                    </button>
                </form>
            ) : (
                <div className="mb-12 p-6 bg-blue-50 rounded-2xl text-center border border-blue-100">
                    <p className="text-blue-800 mb-2">Mau kasih ulasan?</p>
                    <Link href="/masuk" className="text-blue-600 font-bold hover:underline">Login dulu yuk!</Link>
                </div>
            )}

            {/* Daftar Ulasan */}
            <div className="space-y-6">
                {ulasan.length === 0 ? (
                    <p className="text-center text-gray-400 italic py-8">Belum ada ulasan. Jadilah yang pertama mereview! 😎</p>
                ) : (
                    ulasan.map((rev, index) => (
                        <div key={index} className="flex gap-4 p-4 hover:bg-gray-50 rounded-xl transition border-b border-gray-50 last:border-0">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                {rev.nama_user?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-gray-900">{rev.nama_user}</span>
                                    <span className="text-yellow-400 text-sm">{'★'.repeat(rev.bintang)}</span>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed">{rev.komentar}</p>
                                <span className="text-xs text-gray-400 mt-2 block">
                                    {new Date(rev.created_at).toLocaleDateString('id-ID')}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

      </div>
    </div>
  );
}