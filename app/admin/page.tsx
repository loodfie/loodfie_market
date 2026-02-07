'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  
  // STATE TAB
  const [activeTab, setActiveTab] = useState<'produk' | 'tampilan'>('produk');

  // STATE PRODUK
  const [nama, setNama] = useState('');
  const [harga, setHarga] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [kategori, setKategori] = useState('Ebook');
  const [linkMayar, setLinkMayar] = useState('');
  const [fileGambar, setFileGambar] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [daftarProduk, setDaftarProduk] = useState<any[]>([]);

  // STATE TAMPILAN
  const [toko, setToko] = useState<any>({});
  const [fileHeader, setFileHeader] = useState<File | null>(null);
  const [savingTema, setSavingTema] = useState(false);

  // --- 1. AUTH & INIT DATA ---
  useEffect(() => {
    async function initAdmin() {
      const { data: { session } } = await supabase.auth.getSession();
      
      // ⚠️ EMAIL BOS (JANGAN DIGANTI)
      const emailBos = "pordjox75@gmail.com"; 

      if (!session || session.user.email !== emailBos) {
        alert("⛔ Akses Ditolak! Kamu bukan Bos.");
        router.push('/');
        return;
      }
      
      setIsAdmin(true);
      ambilDaftarProduk();
      ambilDataToko();
      setLoading(false);
    }
    initAdmin();
  }, []);

  async function ambilDaftarProduk() {
    try {
        const { data, error } = await supabase.from('produk').select('*').order('id', { ascending: false });
        if (error) {
            console.error("Error ambil produk:", error.message);
            return;
        }
        if (data) setDaftarProduk(data);
    } catch (err) {
        console.log("Koneksi produk bermasalah");
    }
  }

  async function ambilDataToko() {
    try {
        const { data, error } = await supabase.from('toko').select('*').single();
        // Kalau error (misal tabel belum ada), kita abaikan dulu biar gak popup
        if (data) setToko(data);
    } catch (err) {
        console.log("Tabel toko belum siap");
    }
  }

  // --- 2. LOGIKA PRODUK ---
  const handleUploadProduk = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      let urlGambar = '';
      if (fileGambar) {
        const namaFile = `prod-${Date.now()}-${fileGambar.name}`;
        await supabase.storage.from('gambar-produk').upload(namaFile, fileGambar);
        const { data } = supabase.storage.from('gambar-produk').getPublicUrl(namaFile);
        urlGambar = data.publicUrl;
      }

      // Pastikan nama kolom di Supabase adalah 'nama_produk'
      const { error } = await supabase.from('produk').insert([{
        nama_produk: nama, 
        harga: Number(harga), 
        deskripsi: deskripsi, 
        kategori: kategori, 
        link_mayar: linkMayar, 
        gambar: urlGambar || 'https://via.placeholder.com/300'
      }]);
      
      if (error) throw error;
      alert("✅ Produk Berhasil Ditambah!");
      setNama(''); setHarga(''); setFileGambar(null); ambilDaftarProduk();
    } catch (err: any) { 
        alert("Gagal Upload: " + err.message + "\nCek apakah tabel 'produk' punya kolom 'nama_produk'?"); 
    } 
    finally { setUploading(false); }
  };

  const handleHapusProduk = async (id: number) => {
    if (!confirm("Hapus produk ini?")) return;
    await supabase.from('produk').delete().eq('id', id);
    ambilDaftarProduk();
  };

  // --- 3. LOGIKA TAMPILAN ---
  const handleUpdateTampilan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTema(true);
    try {
        let urlHeader = toko.header_bg; 

        if (fileHeader) {
            const namaFile = `header-${Date.now()}-${fileHeader.name}`;
            await supabase.storage.from('gambar-produk').upload(namaFile, fileHeader);
            const { data } = supabase.storage.from('gambar-produk').getPublicUrl(namaFile);
            urlHeader = data.publicUrl;
        }

        // Kalau ID Toko belum ada (pertama kali), kita Insert. Kalau sudah ada, kita Update.
        if (!toko.id) {
            const { error } = await supabase.from('toko').insert([{
                nama_toko: toko.nama_toko,
                deskripsi: toko.deskripsi,
                font_style: toko.font_style,
                header_bg: urlHeader
            }]);
            if (error) throw error;
        } else {
            const { error } = await supabase.from('toko').update({
                nama_toko: toko.nama_toko,
                deskripsi: toko.deskripsi,
                font_style: toko.font_style,
                header_bg: urlHeader
            }).eq('id', toko.id);
            if (error) throw error;
        }

        alert("🎨 Tampilan Toko Berhasil Diupdate!");
        ambilDataToko(); 

    } catch (err: any) { 
        alert("Gagal update tema: " + err.message + "\nPastikan tabel 'toko' sudah dibuat di Supabase!"); 
    }
    finally { setSavingTema(false); }
  };

  if (loading) return <p className="text-center p-10">Memeriksa izin akses...</p>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER ADMIN & TOMBOL KEMBALI */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="flex items-center gap-4">
                {/* TOMBOL KEMBALI (BARU) */}
                <button 
                    onClick={() => router.push('/')} 
                    className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-900 transition flex items-center gap-2 shadow-lg"
                >
                    ⬅️ Kembali ke Website
                </button>
                <h1 className="text-3xl font-bold text-gray-800">⚙️ Admin Control</h1>
            </div>

            <div className="bg-white p-1 rounded-xl shadow-sm flex gap-2">
                <button onClick={() => setActiveTab('produk')} className={`px-6 py-2 rounded-lg font-bold transition ${activeTab === 'produk' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:bg-gray-100'}`}>📦 Produk</button>
                <button onClick={() => setActiveTab('tampilan')} className={`px-6 py-2 rounded-lg font-bold transition ${activeTab === 'tampilan' ? 'bg-purple-600 text-white shadow' : 'text-gray-500 hover:bg-gray-100'}`}>🎨 Tampilan</button>
            </div>
        </div>

        {/* TAB PRODUK */}
        {activeTab === 'produk' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-white p-6 rounded-3xl shadow-lg h-fit">
                    <h2 className="text-xl font-bold mb-4 border-b pb-2">Tambah Produk</h2>
                    <form onSubmit={handleUploadProduk} className="space-y-4">
                        <input type="text" placeholder="Nama Produk" required className="w-full p-2 border rounded-lg" value={nama} onChange={e => setNama(e.target.value)} />
                        <input type="number" placeholder="Harga" required className="w-full p-2 border rounded-lg" value={harga} onChange={e => setHarga(e.target.value)} />
                        <select className="w-full p-2 border rounded-lg" value={kategori} onChange={e => setKategori(e.target.value)}>
                            <option>Ebook</option><option>Template</option><option>Source Code</option><option>Video</option>
                        </select>
                        <textarea placeholder="Deskripsi" className="w-full p-2 border rounded-lg" rows={3} value={deskripsi} onChange={e => setDeskripsi(e.target.value)}></textarea>
                        <input type="text" placeholder="Link Mayar/Google" className="w-full p-2 border rounded-lg" value={linkMayar} onChange={e => setLinkMayar(e.target.value)} />
                        <div>
                            <span className="text-xs font-bold text-gray-500">Gambar Produk</span>
                            <input type="file" accept="image/*" className="w-full text-sm mt-1" onChange={e => setFileGambar(e.target.files?.[0] || null)} />
                        </div>
                        <button disabled={uploading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">
                            {uploading ? 'Upload...' : 'Simpan Produk'}
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-lg">
                    <h2 className="text-xl font-bold mb-4 border-b pb-2">List Produk ({daftarProduk.length})</h2>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                        {daftarProduk.length === 0 ? (
                             <p className="text-gray-400 text-center py-4">Belum ada data produk.</p>
                        ) : (
                            daftarProduk.map(item => (
                                <div key={item.id} className="flex items-center gap-3 p-3 border rounded-xl hover:bg-gray-50">
                                    <img src={item.gambar} className="w-12 h-12 rounded object-cover bg-gray-200" />
                                    <div className="flex-grow">
                                        <p className="font-bold text-sm">{item.nama_produk}</p>
                                        <p className="text-xs text-gray-500">Rp {item.harga?.toLocaleString()}</p>
                                    </div>
                                    <button onClick={() => handleHapusProduk(item.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">🗑️</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* TAB TAMPILAN */}
        {activeTab === 'tampilan' && (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-xl border border-purple-100">
                <h2 className="text-2xl font-bold mb-6 text-purple-700">🎨 Setting Tampilan</h2>
                
                {/* Warning kalau tabel toko belum dibuat */}
                {!toko.id && (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-6 text-sm text-yellow-800">
                        ⚠️ <b>Peringatan:</b> Tabel 'toko' belum terdeteksi. Silakan isi form ini untuk membuat data awal.
                    </div>
                )}

                <form onSubmit={handleUpdateTampilan} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nama Toko</label>
                        <input type="text" className="w-full p-3 border rounded-xl" value={toko.nama_toko || ''} onChange={e => setToko({...toko, nama_toko: e.target.value})} placeholder="Contoh: Loodfie Market" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Slogan</label>
                        <textarea className="w-full p-3 border rounded-xl" rows={2} value={toko.deskripsi || ''} onChange={e => setToko({...toko, deskripsi: e.target.value})} placeholder="Deskripsi singkat toko..."></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Gaya Font (Huruf)</label>
                        <select className="w-full p-3 border rounded-xl bg-white" value={toko.font_style || 'Inter'} onChange={e => setToko({...toko, font_style: e.target.value})}>
                            <option value="Inter">Inter (Modern Standard)</option>
                            <option value="Poppins">Poppins (Bulat & Ceria)</option>
                            <option value="Playfair Display">Playfair (Elegan & Mewah)</option>
                            <option value="Roboto Mono">Roboto Mono (Ala Coding)</option>
                            <option value="Lobster">Lobster (Tulisan Sambung Unik)</option>
                            <option value="Dancing Script">Dancing Script (Tulisan Tangan Cantik)</option>
                            <option value="Oswald">Oswald (Tegas & Kotak)</option>
                            <option value="Montserrat">Montserrat (Minimalis Geometris)</option>
                        </select>
                    </div>

                    <div className="p-4 border-2 border-dashed border-purple-200 rounded-xl bg-purple-50">
                        <label className="block text-sm font-bold text-purple-700 mb-2">Ganti Background Header</label>
                        {toko.header_bg && (
                            <img src={toko.header_bg} className="mb-3 h-32 w-full rounded-lg object-cover" />
                        )}
                        <input type="file" accept="image/*" className="w-full text-sm" onChange={e => setFileHeader(e.target.files?.[0] || null)} />
                    </div>

                    <button disabled={savingTema} className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold hover:bg-purple-700 transition shadow-lg">
                        {savingTema ? 'Menyimpan...' : 'Simpan Tampilan Baru ✨'}
                    </button>
                </form>
            </div>
        )}
      </div>
    </div>
  );
}