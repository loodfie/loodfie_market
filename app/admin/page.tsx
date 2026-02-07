'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  // State Form Produk
  const [nama, setNama] = useState('');
  const [harga, setHarga] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [kategori, setKategori] = useState('Ebook');
  const [linkMayar, setLinkMayar] = useState('');
  const [fileGambar, setFileGambar] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // State Daftar Produk (Untuk Hapus)
  const [daftarProduk, setDaftarProduk] = useState<any[]>([]);

  // --- 1. CEK AUTH & AMBIL DATA PRODUK ---
  useEffect(() => {
    async function initAdmin() {
      const { data: { session } } = await supabase.auth.getSession();
      
      // --- GANTI EMAIL INI DENGAN EMAIL LOGIN KAMU! 👇 ---
      const emailBos = "pordjox75@gmail.com"; 

      if (!session || session.user.email !== emailBos) {
        alert("⛔ Akses Ditolak! Kamu bukan Admin.");
        router.push('/');
        return;
      }
      
      setIsAdmin(true);
      ambilDaftarProduk(); // Ambil data produk saat masuk
      setLoading(false);
    }

    initAdmin();
  }, []);

  // Fungsi Ambil Produk
  async function ambilDaftarProduk() {
    const { data } = await supabase.from('produk').select('*').order('id', { ascending: false });
    if (data) setDaftarProduk(data);
  }

  // --- 2. FUNGSI UPLOAD PRODUK (TAMBAH) ---
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let urlGambar = '';

      if (fileGambar) {
        const namaFileUnik = `${Date.now()}-${fileGambar.name}`;
        // Upload ke Storage
        const { error: errUpload } = await supabase.storage
          .from('gambar-produk') 
          .upload(namaFileUnik, fileGambar);

        if (errUpload) throw errUpload;
        
        // Ambil Public URL
        const { data: publicUrl } = supabase.storage
          .from('gambar-produk')
          .getPublicUrl(namaFileUnik);
          
        urlGambar = publicUrl.publicUrl;
      }

      // Masukkan ke Database
      const { error: errorDb } = await supabase
        .from('produk')
        .insert([{
            nama_produk: nama,
            harga: Number(harga),
            deskripsi: deskripsi,
            kategori: kategori,
            link_mayar: linkMayar,
            gambar: urlGambar || 'https://via.placeholder.com/300'
        }]);

      if (errorDb) throw errorDb;

      alert("✅ Produk Berhasil Ditambah!");
      // Reset Form
      setNama(''); setHarga(''); setDeskripsi(''); setLinkMayar(''); setFileGambar(null);
      // Refresh Daftar Produk di Bawah
      ambilDaftarProduk();

    } catch (error: any) {
      alert("❌ Gagal Upload: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  // --- 3. FUNGSI HAPUS PRODUK (DELETE) ---
  const handleHapus = async (id: number, namaProduk: string) => {
    const yakin = confirm(`Yakin mau menghapus produk "${namaProduk}"? Data tidak bisa dikembalikan.`);
    if (!yakin) return;

    try {
        const { error } = await supabase.from('produk').delete().eq('id', id);
        if (error) throw error;

        alert("🗑️ Produk berhasil dihapus!");
        ambilDaftarProduk(); // Refresh daftar biar hilang dari layar

    } catch (error: any) {
        alert("Gagal hapus: " + error.message);
    }
  };

  if (loading) return <p className="text-center p-10">Memeriksa izin akses...</p>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- KOLOM KIRI: FORM TAMBAH PRODUK --- */}
        <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-3xl shadow-xl sticky top-24">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">➕ Tambah Produk</h2>
                <form onSubmit={handleUpload} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Nama Produk</label>
                        <input type="text" required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" value={nama} onChange={(e) => setNama(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Harga (Rp)</label>
                        <input type="number" required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" value={harga} onChange={(e) => setHarga(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Kategori</label>
                        <select className="w-full p-2 border rounded-lg bg-white" value={kategori} onChange={(e) => setKategori(e.target.value)}>
                            <option value="Ebook">Ebook</option>
                            <option value="Template">Template</option>
                            <option value="Source Code">Source Code</option>
                            <option value="Video">Video Course</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Deskripsi</label>
                        <textarea rows={3} className="w-full p-2 border rounded-lg" value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)}></textarea>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Link Mayar/Google</label>
                        <input type="text" className="w-full p-2 border rounded-lg" value={linkMayar} onChange={(e) => setLinkMayar(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Foto</label>
                        <input type="file" accept="image/*" className="w-full text-sm" onChange={(e) => setFileGambar(e.target.files ? e.target.files[0] : null)} />
                    </div>
                    <button type="submit" disabled={uploading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-lg">
                        {uploading ? 'Sedang Upload... ⏳' : 'Upload Sekarang 🚀'}
                    </button>
                </form>
            </div>
        </div>

        {/* --- KOLOM KANAN: DAFTAR PRODUK (MANAGEMENT) --- */}
        <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-3xl shadow-xl">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4 flex justify-between items-center">
                    📦 Kelola Produk
                    <span className="text-sm font-normal bg-gray-100 px-3 py-1 rounded-full text-gray-500">{daftarProduk.length} Item</span>
                </h2>

                <div className="space-y-4">
                    {daftarProduk.length === 0 ? (
                        <p className="text-center text-gray-400 py-10">Belum ada produk. Upload dulu dong bos! 😎</p>
                    ) : (
                        daftarProduk.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 p-4 border rounded-2xl hover:bg-gray-50 transition bg-white">
                                {/* Gambar Kecil */}
                                <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                    {item.gambar && <img src={item.gambar} alt={item.nama_produk} className="w-full h-full object-cover" />}
                                </div>
                                
                                {/* Info Produk */}
                                <div className="flex-grow">
                                    <h3 className="font-bold text-gray-800">{item.nama_produk}</h3>
                                    <p className="text-sm text-gray-500">Rp {Number(item.harga).toLocaleString('id-ID')} • {item.kategori}</p>
                                </div>

                                {/* Tombol Aksi */}
                                <div className="flex gap-2">
                                    {/* Tombol Hapus */}
                                    <button 
                                        onClick={() => handleHapus(item.id, item.nama_produk)}
                                        className="bg-red-100 text-red-600 p-3 rounded-xl hover:bg-red-600 hover:text-white transition shadow-sm"
                                        title="Hapus Produk"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}