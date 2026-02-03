'use client'

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditProdukPage({ params }: { params: Promise<{ id: string }> }) {
  // Teknik Unwrapping params untuk Next.js terbaru
  const [idProduk, setIdProduk] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    nama: '',
    harga: '',
    deskripsi: '',
    link_mayar: '',
    gambar: '' // Ini URL gambar lama
  });

  // 1. Ambil Data Produk Berdasarkan ID
  useEffect(() => {
    const init = async () => {
      // Unwrap params dulu
      const resolvedParams = await params;
      setIdProduk(resolvedParams.id);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      // Ambil data produk spesifik
      const { data, error } = await supabase
        .from('produk')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();

      if (error || !data) {
        alert("Produk tidak ditemukan!");
        router.push('/admin');
      } else {
        setFormData({
            nama: data.nama,
            harga: data.harga,
            deskripsi: data.deskripsi,
            link_mayar: data.link_mayar,
            gambar: data.gambar
        });
      }
      setLoading(false);
    };
    init();
  }, [params, router]);

  // 2. Fungsi Update Produk
  async function handleUpdate(e: any) {
    e.preventDefault();
    setSaving(true);

    try {
        const form = e.target;
        const fileGambar = form.file_gambar_baru.files[0];
        let urlGambarFinal = formData.gambar; // Default pakai gambar lama

        // A. Jika User Upload Gambar Baru
        if (fileGambar) {
            const namaFile = `produk-${Date.now()}-${fileGambar.name}`;
            const { error: uploadError } = await supabase.storage
                .from('gambar-produk')
                .upload(namaFile, fileGambar);

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from('gambar-produk')
                .getPublicUrl(namaFile);
            
            urlGambarFinal = urlData.publicUrl;
        }

        // B. Update Data ke Database
        const { error } = await supabase
            .from('produk')
            .update({
                nama: formData.nama,
                harga: formData.harga,
                deskripsi: formData.deskripsi,
                link_mayar: formData.link_mayar,
                gambar: urlGambarFinal
            })
            .eq('id', idProduk); // Kunci update berdasarkan ID

        if (error) throw error;

        alert("✅ Produk Berhasil Diupdate!");
        router.push('/admin'); // Balik ke dashboard

    } catch (error: any) {
        alert("Gagal update: " + error.message);
    } finally {
        setSaving(false);
    }
  }

  if (loading) return <div className="min-h-screen flex justify-center items-center font-bold">Mengambil Data Produk...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
        
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Edit Produk ✏️
        </h1>
        
        <form onSubmit={handleUpdate} className="space-y-4">
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Nama Produk</label>
            <input 
                type="text" 
                value={formData.nama}
                onChange={(e) => setFormData({...formData, nama: e.target.value})}
                required 
                className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Harga</label>
            <input 
                type="text" 
                value={formData.harga}
                onChange={(e) => setFormData({...formData, harga: e.target.value})}
                required 
                className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Deskripsi</label>
            <textarea 
                value={formData.deskripsi}
                onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                required 
                rows={3} 
                className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Link Pembayaran</label>
            <input 
                type="url" 
                value={formData.link_mayar}
                onChange={(e) => setFormData({...formData, link_mayar: e.target.value})}
                required 
                className="w-full p-2 border rounded-lg"
            />
          </div>

          {/* Bagian Gambar */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Foto Produk</label>
            
            {/* Preview Gambar Lama */}
            <div className="mb-2">
                <img src={formData.gambar} alt="Preview Lama" className="w-20 h-20 object-cover rounded border" />
                <span className="text-xs text-gray-500 block mt-1">Gambar saat ini (Biarkan kosong jika tidak ingin ganti)</span>
            </div>

            <input 
                name="file_gambar_baru" 
                type="file" 
                accept="image/*" 
                className="w-full p-2 border rounded-lg bg-gray-50"
            />
          </div>

          <button type="submit" disabled={saving}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 mt-4 shadow-md">
            {saving ? "Menyimpan..." : "Simpan Perubahan ✅"}
          </button>

        </form>

        <Link href="/admin" className="block text-center text-gray-500 mt-6 text-sm hover:text-gray-900 font-medium hover:underline">
            ← Batal
        </Link>

      </div>
    </div>
  );
}