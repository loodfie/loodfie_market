'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [listProduk, setListProduk] = useState<any[]>([]);
  
  // 🔥 STATE DETEKTIF (Untuk menampilkan error di layar)
  const [debugLog, setDebugLog] = useState<string>('Memulai investigasi...');
  
  const router = useRouter();

  useEffect(() => {
    async function initDashboard() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/masuk');
        return;
      }
      setUser(session.user);
      
      let logs = `1. User Login: ${session.user.email}\n`;

      // LANGKAH 1: Cek Transaksi
      const { data: dataTransaksi, error: errTrx } = await supabase
        .from('transaksi')
        .select('*') // Ambil semua kolom biar kelihatan
        .eq('user_email', session.user.email); // Hapus dulu filter LUNAS biar ketahuan ada data apa ngga

      if (errTrx) {
        logs += `❌ Error Ambil Transaksi: ${errTrx.message}\nDetail: ${JSON.stringify(errTrx)}\n`;
        setDebugLog(logs);
        setLoading(false);
        return;
      }

      logs += `2. Data Transaksi Ditemukan: ${dataTransaksi?.length} baris\n`;
      logs += `   Isi Transaksi: ${JSON.stringify(dataTransaksi)}\n`;

      if (!dataTransaksi || dataTransaksi.length === 0) {
        logs += `⚠️ HASIL: Tidak ada transaksi untuk email ini. Cek apakah email di database persis sama?\n`;
        setDebugLog(logs);
        setListProduk([]);
        setLoading(false);
        return;
      }

      // Ambil ID Produk
      const daftarId = dataTransaksi.map(item => item.produk_id);
      logs += `3. ID Produk yang dicari: [${daftarId.join(', ')}]\n`;

      // LANGKAH 2: Ambil Produk
      const { data: dataProduk, error: errProd } = await supabase
        .from('produk')
        .select('*')
        .in('id', daftarId);

      if (errProd) {
        logs += `❌ Error Ambil Produk: ${errProd.message}\n`;
      } else {
        logs += `4. Produk Ditemukan: ${dataProduk?.length} item\n`;
        setListProduk(dataProduk || []);
      }

      setDebugLog(logs); // Tampilkan semua catatan detektif ke layar
      setLoading(false);
    }

    initDashboard();
  }, [router]);

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/'); };
  const handleDownload = (link: string) => { if (link) window.open(link, '_blank'); };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="animate-pulse font-bold">Sedang Menginvestigasi...</p></div>;

  return (
    <div className="min-h-screen bg-gray-100 font-sans p-6">
      <nav className="flex justify-between items-center mb-8">
        <h1 className="font-bold text-xl">🕵️‍♂️ Mode Debug Dashboard</h1>
        <button onClick={handleLogout} className="text-red-600 font-bold">Keluar</button>
      </nav>

      {/* KOTAK HITAM (LOG LOGIKA) */}
      <div className="bg-black text-green-400 p-6 rounded-xl font-mono text-xs md:text-sm mb-8 overflow-auto shadow-2xl border-2 border-green-600">
        <h3 className="text-white font-bold border-b border-gray-700 pb-2 mb-2">💻 SYSTEM LOGS:</h3>
        <pre className="whitespace-pre-wrap">{debugLog}</pre>
      </div>

      {/* HASIL PRODUK */}
      <h2 className="font-bold mb-4">Hasil Produk:</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {listProduk.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded shadow">
                <p className="font-bold">{item.nama_produk}</p>
                <p className="text-xs text-gray-500">ID: {item.id}</p>
                <button onClick={() => handleDownload(item.file_url)} className="bg-blue-600 text-white px-3 py-1 rounded text-xs mt-2">Download</button>
            </div>
        ))}
      </div>
    </div>
  );
}