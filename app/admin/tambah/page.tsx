'use client'

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TambahProdukPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function simpanProduk(e: any) {
    e.preventDefault();
    setLoading(true);

    const form = e.target;
    const fileGambar = form.file_gambar.files[0];

    // Validasi Gambar
    if (!fileGambar) {
        alert("Mohon pilih gambar produk dulu!");
        setLoading(false);
        return;
    }

    try {
        // 1. Upload Gambar
        const namaFile = `produk-${Date.now()}`;
        const { error: uploadError } = await supabase.storage
            .from('gambar-produk')
            .upload(namaFile, fileGambar);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('gambar-produk')
            .getPublicUrl(namaFile);

        // 2. Simpan Data Produk
        const { error: dbError } = await supabase.from('produk').insert([{
            nama: form.nama.value,
            harga: form.harga.value,
            deskripsi: form.deskripsi.value,
            link_mayar: form.link_mayar.value,
            gambar: publicUrl,
        }]);

        if (dbError) throw dbError;

        alert("✅ Produk Berhasil Disimpan!");
        router.push('/admin'); // Kembali ke Dashboard

    } catch (error: any) {
        alert("Gagal: " + error.message);
    } finally {
        setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
        
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Upload Produk Baru 📦
        </h1>
        
        <form onSubmit={simpanProduk} className="space-y-4">
          
          <div>
            <label className="block text-sm font-bold text-gray-700">Nama Produk</label>
            <input name="nama" type="text" required placeholder="Contoh: Ebook Coding"
                   className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-black bg-white focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700">Harga</label>
            <input name="harga" type="text" required placeholder="Rp 50.000"
                   className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-black bg-white focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700">Deskripsi</label>
            <textarea name="deskripsi" required placeholder="Jelaskan produkmu..."
                      className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-black bg-white focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700">Link Pembayaran (Mayar)</label>
            <input name="link_mayar" type="url" placeholder="https://mayar.id/pl/..." required 
                   className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-black bg-blue-50 focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700">Foto Produk</label>
            <input name="file_gambar" type="file" accept="image/*" required 
                   className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-black bg-white" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50">
            {loading ? "Sedang Upload..." : "Simpan Produk"}
          </button>

        </form>

        <Link href="/admin" className="block text-center text-gray-500 mt-6 text-sm hover:text-gray-900 font-medium">
            ← Batal & Kembali ke Dashboard
        </Link>

      </div>
    </div>
  );
}