'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PengaturanPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  // State untuk menampung data form
  const [formData, setFormData] = useState({
    nama_toko: '',
    tagline: '',
    warna_header: '#2563eb', // Default biru
    logo: ''
  });

  // 1. Ambil Data Saat Halaman Dibuka
  useEffect(() => {
    const ambilData = async () => {
      // Cek Login dulu
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      // Ambil data pengaturan dari tabel
      const { data, error } = await supabase
        .from('pengaturan')
        .select('*')
        .single(); // Ambil 1 baris saja

      if (data) {
        setFormData({
            nama_toko: data.nama_toko || '',
            tagline: data.tagline || '',
            warna_header: data.warna_header || '#2563eb',
            logo: data.logo || ''
        });
      }
      setLoading(false);
    };

    ambilData();
  }, [router]);

  // 2. Fungsi Simpan Perubahan
  async function handleSimpan(e: any) {
    e.preventDefault();
    setSaving(true);

    try {
        let logoUrl = formData.logo;
        const fileInput = e.target.file_logo.files[0];

        // A. Jika ada upload logo baru
        if (fileInput) {
            const namaFile = `logo-${Date.now()}-${fileInput.name}`;
            
            // Upload ke storage 'logo-toko'
            const { error: uploadError } = await supabase.storage
                .from('logo-toko')
                .upload(namaFile, fileInput);

            if (uploadError) throw uploadError;

            // Dapatkan URL publik
            const { data: urlData } = supabase.storage
                .from('logo-toko')
                .getPublicUrl(namaFile);
            
            logoUrl = urlData.publicUrl;
        }

        // B. Update Data ke Database
        // Kita pakai .gt('id', 0) artinya: "Update baris manapun yang ID-nya > 0"
        // Ini menjamin data pasti kena update, berapapun ID-nya.
        const { error: dbError } = await supabase
            .from('pengaturan')
            .update({
                nama_toko: formData.nama_toko,
                tagline: formData.tagline,
                warna_header: formData.warna_header,
                logo: logoUrl
            })
            .gt('id', 0); // <--- KUNCI PERBAIKANNYA DISINI

        if (dbError) throw dbError;

        // Jika update gagal karena ID beda, kita coba update semua baris (fallback)
        if (dbError) {
             await supabase.from('pengaturan').update({
                nama_toko: formData.nama_toko,
                tagline: formData.tagline,
                warna_header: formData.warna_header,
                logo: logoUrl
             }).gt('id', 0);
        }

        alert("✅ Pengaturan Berhasil Disimpan!");
        router.refresh(); // Refresh agar data terbaru muncul

    } catch (error: any) {
        alert("Gagal menyimpan: " + error.message);
    } finally {
        setSaving(false);
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold">Memuat Pengaturan...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg border border-gray-200">
        
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          ⚙️ Pengaturan Toko
        </h1>
        
        <form onSubmit={handleSimpan} className="space-y-4">
          
          {/* NAMA TOKO */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Nama Toko</label>
            <input 
                type="text" 
                value={formData.nama_toko}
                onChange={(e) => setFormData({...formData, nama_toko: e.target.value})}
                className="w-full p-2 border rounded-lg"
                placeholder="Contoh: Loodfie Market"
                required
            />
          </div>

          {/* TAGLINE / SLOGAN */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Tagline / Slogan</label>
            <input 
                type="text" 
                value={formData.tagline}
                onChange={(e) => setFormData({...formData, tagline: e.target.value})}
                className="w-full p-2 border rounded-lg"
                placeholder="Pusat Produk Digital..."
            />
          </div>

          {/* WARNA HEADER */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Warna Header Utama</label>
            <div className="flex gap-4 items-center">
                <input 
                    type="color" 
                    value={formData.warna_header}
                    onChange={(e) => setFormData({...formData, warna_header: e.target.value})}
                    className="h-10 w-20 p-1 rounded cursor-pointer border"
                />
                <span className="text-sm text-gray-500">Klik kotak warna untuk mengganti</span>
            </div>
          </div>

          {/* UPLOAD LOGO */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Logo Toko</label>
            
            {/* Preview Logo Lama */}
            {formData.logo && (
                <div className="mb-2">
                    <img src={formData.logo} alt="Logo Saat Ini" className="h-16 object-contain border p-1 rounded" />
                    <p className="text-xs text-gray-500 mt-1">Logo saat ini</p>
                </div>
            )}

            <input 
                name="file_logo" 
                type="file" 
                accept="image/*" 
                className="w-full p-2 border rounded-lg bg-gray-50"
            />
          </div>

          {/* TOMBOL SIMPAN */}
          <button type="submit" disabled={saving}
            className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-black transition disabled:opacity-50 mt-6 shadow-md">
            {saving ? "Menyimpan..." : "Simpan Perubahan 💾"}
          </button>

        </form>

        <Link href="/admin" className="block text-center text-gray-500 mt-6 text-sm hover:text-gray-900 font-medium hover:underline">
            ← Batal & Kembali ke Dashboard
        </Link>

      </div>
    </div>
  );
}