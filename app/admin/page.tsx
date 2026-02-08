'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'produk' | 'tampilan'>('produk');

  // STATE PRODUK
  const [idProduk, setIdProduk] = useState<number | null>(null);
  const [nama, setNama] = useState('');
  const [harga, setHarga] = useState('');
  const [hargaCoret, setHargaCoret] = useState(''); 
  const [deskripsi, setDeskripsi] = useState('');
  const [kategori, setKategori] = useState('Ebook');
  const [linkMayar, setLinkMayar] = useState('');
  const [fileGambar, setFileGambar] = useState<File | null>(null);
  const [gambarLama, setGambarLama] = useState(''); 
  
  const [uploading, setUploading] = useState(false);
  const [daftarProduk, setDaftarProduk] = useState<any[]>([]);

  // STATE TAMPILAN
  const [toko, setToko] = useState<any>({});
  const [fileHeader, setFileHeader] = useState<File | null>(null);
  const [fileFooter, setFileFooter] = useState<File | null>(null);
  const [savingTema, setSavingTema] = useState(false);

  useEffect(() => {
    async function initAdmin() {
      const { data: { session } } = await supabase.auth.getSession();
      
      // ⚠️ DARURAT: KITA HARDCODE LAGI
      const emailBos = "pordjox75@gmail.com"; 

      if (!session || session.user.email !== emailBos) {
        toast.error("⛔ Akses Ditolak! Kamu bukan Bos.");
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
    const { data } = await supabase.from('produk').select('*').order('id', { ascending: false });
    if (data) setDaftarProduk(data);
  }

  async function ambilDataToko() {
    const { data } = await supabase.from('toko').select('*').single();
    if (data) setToko(data);
  }

  const handleEditClick = (produk: any) => {
    setIdProduk(produk.id);
    setNama(produk.nama_produk);
    setHarga(produk.harga);
    setHargaCoret(produk.harga_coret || '');
    setDeskripsi(produk.deskripsi || '');
    setKategori(produk.kategori);
    setLinkMayar(produk.link_mayar || '');
    setGambarLama(produk.gambar);
    setFileGambar(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast("✏️ Mode Edit Aktif", { icon: '📝' });
  };

  const handleBatalEdit = () => {
    setIdProduk(null); setNama(''); setHarga(''); setHargaCoret(''); setDeskripsi(''); setKategori('Ebook'); setLinkMayar(''); setFileGambar(null); setGambarLama('');
    toast("Mode edit dibatalkan", { icon: '❌' });
  };

  const handleSimpanProduk = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    const toastId = toast.loading('Sedang memproses...');

    try {
      let urlGambar = gambarLama; 
      if (fileGambar) {
        const namaFile = `prod-${Date.now()}-${fileGambar.name}`;
        const { error: errUpload } = await supabase.storage.from('gambar-produk').upload(namaFile, fileGambar);
        if (errUpload) throw errUpload;
        const { data } = supabase.storage.from('gambar-produk').getPublicUrl(namaFile);
        urlGambar = data.publicUrl;
      }

      const payload = {
        nama_produk: nama, 
        harga: Number(harga), 
        harga_coret: hargaCoret ? Number(hargaCoret) : null,
        deskripsi: deskripsi, 
        kategori: kategori, 
        link_mayar: linkMayar, 
        gambar: urlGambar || 'https://via.placeholder.com/300'
      };

      if (idProduk) {
        const { error } = await supabase.from('produk').update(payload).eq('id', idProduk);
        if (error) throw error;
        toast.success("Produk Berhasil Diupdate! ✅", { id: toastId });
      } else {
        const { error } = await supabase.from('produk').insert([payload]);
        if (error) throw error;
        toast.success("Produk Baru Berhasil Ditambah! 🚀", { id: toastId });
      }
      handleBatalEdit();
      ambilDaftarProduk(); 
    } catch (err: any) { 
        toast.error("Gagal Simpan: " + err.message, { id: toastId });
    } finally { setUploading(false); }
  };

  const handleHapusProduk = async (id: number) => {
    if (!confirm("Yakin mau menghapus produk ini selamanya?")) return;
    const toastId = toast.loading("Menghapus...");
    await supabase.from('produk').delete().eq('id', id);
    toast.success("Produk dihapus! 🗑️", { id: toastId });
    ambilDaftarProduk();
    if (idProduk === id) handleBatalEdit();
  };

  const handleUpdateTampilan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTema(true);
    const toastId = toast.loading("Menyimpan Tampilan...");
    try {
        let urlHeader = toko.header_bg; 
        let urlFooter = toko.footer_bg; 
        if (fileHeader) {
            const namaFile = `header-${Date.now()}-${fileHeader.name}`;
            await supabase.storage.from('gambar-produk').upload(namaFile, fileHeader);
            const { data } = supabase.storage.from('gambar-produk').getPublicUrl(namaFile);
            urlHeader = data.publicUrl;
        }
        if (fileFooter) {
            const namaFile = `footer-${Date.now()}-${fileFooter.name}`;
            await supabase.storage.from('gambar-produk').upload(namaFile, fileFooter);
            const { data } = supabase.storage.from('gambar-produk').getPublicUrl(namaFile);
            urlFooter = data.publicUrl;
        }
        
        const payload = { 
            nama_toko: toko.nama_toko, 
            deskripsi: toko.deskripsi, 
            font_style: toko.font_style, 
            header_bg: urlHeader, 
            footer_bg: urlFooter,
            running_text: toko.running_text
        };

        if (!toko.id) { await supabase.from('toko').insert([payload]); } else { await supabase.from('toko').update(payload).eq('id', toko.id); }
        toast.success("Tampilan Toko Cantik! ✨", { id: toastId });
        ambilDataToko(); 
    } catch (err: any) { toast.error("Gagal update tema: " + err.message, { id: toastId }); }
    finally { setSavingTema(false); }
  };

  if (loading) return <p className="text-center p-10">Memeriksa izin akses...</p>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <Toaster position="bottom-right" />
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="flex items-center gap-4">
                <button onClick={() => router.push('/')} className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-900 transition flex items-center gap-2 shadow-lg">⬅️ Kembali ke Website</button>
                <h1 className="text-3xl font-bold text-gray-800">⚙️ Admin Control</h1>
            </div>
            <div className="bg-white p-1 rounded-xl shadow-sm flex gap-2">
                <button onClick={() => setActiveTab('produk')} className={`px-6 py-2 rounded-lg font-bold transition ${activeTab === 'produk' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:bg-gray-100'}`}>📦 Produk</button>
                <button onClick={() => setActiveTab('tampilan')} className={`px-6 py-2 rounded-lg font-bold transition ${activeTab === 'tampilan' ? 'bg-purple-600 text-white shadow' : 'text-gray-500 hover:bg-gray-100'}`}>🎨 Tampilan</button>
            </div>
        </div>

        {activeTab === 'produk' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-white p-6 rounded-3xl shadow-lg h-fit sticky top-4">
                    <div className="flex justify-between items-center mb-4 border-b pb-2"><h2 className="text-xl font-bold text-gray-800">{idProduk ? '✏️ Edit Produk' : '➕ Tambah Produk'}</h2>{idProduk && (<button onClick={handleBatalEdit} className="text-xs text-red-500 font-bold hover:underline">Batal Edit</button>)}</div>
                    <form onSubmit={handleSimpanProduk} className="space-y-4">
                        <input type="text" placeholder="Nama Produk" required className="w-full p-2 border rounded-lg" value={nama} onChange={e => setNama(e.target.value)} />
                        
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs text-gray-500 ml-1">Harga Jual</label>
                                <input type="number" placeholder="Rp 100.000" required className="w-full p-2 border rounded-lg font-bold text-blue-600" value={harga} onChange={e => setHarga(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs text-red-500 ml-1">Harga Coret</label>
                                <input type="number" placeholder="Rp 500.000" className="w-full p-2 border rounded-lg text-red-500 line-through" value={hargaCoret} onChange={e => setHargaCoret(e.target.value)} />
                            </div>
                        </div>

                        <select className="w-full p-2 border rounded-lg bg-white" value={kategori} onChange={e => setKategori(e.target.value)}><option>Ebook</option><option>Template</option><option>Source Code</option><option>Video</option></select>
                        <textarea placeholder="Deskripsi" className="w-full p-2 border rounded-lg" rows={3} value={deskripsi} onChange={e => setDeskripsi(e.target.value)}></textarea>
                        <input type="text" placeholder="Link Mayar/Google (Opsional)" className="w-full p-2 border rounded-lg" value={linkMayar} onChange={e => setLinkMayar(e.target.value)} />
                        <div className="bg-gray-50 p-3 rounded-lg border border-dashed border-gray-300"><span className="text-xs font-bold text-gray-500 block mb-1">Gambar Produk</span>{idProduk && gambarLama && !fileGambar && (<div className="mb-2"><p className="text-[10px] text-gray-400">Gambar Saat Ini:</p><img src={gambarLama} className="h-16 w-16 object-cover rounded shadow-sm" /></div>)}<input type="file" accept="image/*" className="w-full text-sm" onChange={e => setFileGambar(e.target.files?.[0] || null)} /></div>
                        <button disabled={uploading} className={`w-full py-3 rounded-xl font-bold text-white transition shadow-lg ${idProduk ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}>{uploading ? 'Memproses...' : (idProduk ? 'Update Produk 💾' : 'Simpan Produk 🚀')}</button>
                    </form>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-lg">
                    <h2 className="text-xl font-bold mb-4 border-b pb-2">Daftar Produk ({daftarProduk.length})</h2>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                        {daftarProduk.map(item => (
                            <div key={item.id} className={`flex items-center gap-3 p-3 border rounded-xl transition ${idProduk === item.id ? 'bg-orange-50 border-orange-300 ring-1 ring-orange-200' : 'hover:bg-gray-50'}`}>
                                <img src={item.gambar} className="w-12 h-12 rounded object-cover bg-gray-200" /><div className="flex-grow"><p className="font-bold text-sm text-gray-800">{item.nama_produk}</p><div className="flex items-center gap-2 text-xs"><span className="font-bold text-blue-600">Rp {item.harga?.toLocaleString()}</span>{item.harga_coret && <span className="text-red-400 line-through text-[10px]">Rp {item.harga_coret.toLocaleString()}</span>}<span>• {item.kategori}</span></div></div>
                                <div className="flex gap-2"><button onClick={() => handleEditClick(item)} className="bg-orange-100 text-orange-600 p-2 rounded-lg hover:bg-orange-500 hover:text-white transition" title="Edit Produk">✏️</button><button onClick={() => handleHapusProduk(item.id)} className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-600 hover:text-white transition" title="Hapus Produk">🗑️</button></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'tampilan' && (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-xl border border-purple-100">
                <h2 className="text-2xl font-bold mb-6 text-purple-700">🎨 Setting Tampilan</h2>
                <form onSubmit={handleUpdateTampilan} className="space-y-6">
                    <div><label className="block text-sm font-bold text-gray-700 mb-1">Nama Toko</label><input type="text" className="w-full p-3 border rounded-xl" value={toko.nama_toko || ''} onChange={e => setToko({...toko, nama_toko: e.target.value})} /></div>
                    <div><label className="block text-sm font-bold text-gray-700 mb-1">Slogan</label><textarea className="w-full p-3 border rounded-xl" rows={2} value={toko.deskripsi || ''} onChange={e => setToko({...toko, deskripsi: e.target.value})}></textarea></div>
                    
                    {/* 🔥 FITUR EDIT TEXT */}
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                        <label className="block text-sm font-bold text-yellow-800 mb-1">📢 Teks Berjalan (Running Text)</label>
                        <input 
                            type="text" 
                            className="w-full p-3 border rounded-xl text-gray-700" 
                            placeholder="Contoh: 🔥 PROMO GILA-GILAAN HARI INI!" 
                            value={toko.running_text || ''} 
                            onChange={e => setToko({...toko, running_text: e.target.value})} 
                        />
                    </div>

                    <div><label className="block text-sm font-bold text-gray-700 mb-1">Gaya Font</label><select className="w-full p-3 border rounded-xl bg-white" value={toko.font_style || 'Inter'} onChange={e => setToko({...toko, font_style: e.target.value})}><option value="Inter">Inter</option><option value="Poppins">Poppins</option><option value="Playfair Display">Playfair</option><option value="Roboto Mono">Roboto Mono</option><option value="Lobster">Lobster</option><option value="Dancing Script">Dancing Script</option><option value="Oswald">Oswald</option><option value="Montserrat">Montserrat</option></select></div>
                    <div className="p-4 border-2 border-dashed border-purple-200 rounded-xl bg-purple-50"><label className="block text-sm font-bold text-purple-700 mb-2">Ganti Background Header</label>{toko.header_bg && <img src={toko.header_bg} className="mb-3 h-32 w-full rounded-lg object-cover" />}<input type="file" accept="image/*" className="w-full text-sm" onChange={e => setFileHeader(e.target.files?.[0] || null)} /></div>
                    <div className="p-4 border-2 border-dashed border-pink-200 rounded-xl bg-pink-50"><label className="block text-sm font-bold text-pink-700 mb-2">Ganti Background Footer</label>{toko.footer_bg && <img src={toko.footer_bg} className="mb-3 h-32 w-full rounded-lg object-cover" />}<input type="file" accept="image/*" className="w-full text-sm" onChange={e => setFileFooter(e.target.files?.[0] || null)} /></div>
                    <button disabled={savingTema} className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold hover:bg-purple-700 transition shadow-lg">{savingTema ? 'Menyimpan...' : 'Simpan Semua Tampilan ✨'}</button>
                </form>
            </div>
        )}
      </div>
    </div>
  );
}