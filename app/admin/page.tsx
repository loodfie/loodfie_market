'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  
  // TAB ADMIN
  const [activeTab, setActiveTab] = useState<'produk' | 'tampilan' | 'testimoni'>('produk');

  // STATE PRODUK
  const [idProduk, setIdProduk] = useState<number | null>(null);
  const [nama, setNama] = useState('');
  const [harga, setHarga] = useState('');
  const [hargaCoret, setHargaCoret] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [kategori, setKategori] = useState('Ebook');
  const [linkMayar, setLinkMayar] = useState('');
  
  // 🔥 STATE FILE PRODUK
  const [fileProduk, setFileProduk] = useState<File | null>(null);
  const [linkFileManual, setLinkFileManual] = useState('');
  const [urlFileDatabase, setUrlFileDatabase] = useState('');

  const [fileGambar, setFileGambar] = useState<File | null>(null);
  const [gambarLama, setGambarLama] = useState(''); 
  const [uploading, setUploading] = useState(false);
  const [daftarProduk, setDaftarProduk] = useState<any[]>([]);

  // STATE TAMPILAN
  const [toko, setToko] = useState<any>({});
  const [fileHeader, setFileHeader] = useState<File | null>(null);
  const [fileFooter, setFileFooter] = useState<File | null>(null);
  const [filePopup, setFilePopup] = useState<File | null>(null);
  const [savingTema, setSavingTema] = useState(false);

  // STATE TESTIMONI
  const [daftarTesti, setDaftarTesti] = useState<any[]>([]);
  const [idTesti, setIdTesti] = useState<number | null>(null);
  const [namaTesti, setNamaTesti] = useState('');
  const [roleTesti, setRoleTesti] = useState('');
  const [textTesti, setTextTesti] = useState('');
  const [avatarTesti, setAvatarTesti] = useState('😎');

  useEffect(() => {
    async function initAdmin() {
      const { data: { session } } = await supabase.auth.getSession();
      const emailBos = "pordjox75@gmail.com"; 
      if (!session || session.user.email !== emailBos) {
        toast.error("⛔ Akses Ditolak!");
        router.push('/');
        return;
      }
      setIsAdmin(true);
      ambilDaftarProduk();
      ambilDataToko();
      ambilDaftarTesti();
      setLoading(false);
    }
    initAdmin();
  }, []);

  async function ambilDaftarProduk() { const { data } = await supabase.from('produk').select('*').order('id', { ascending: false }); if (data) setDaftarProduk(data); }
  async function ambilDataToko() { const { data } = await supabase.from('toko').select('*').single(); if (data) setToko(data); }
  async function ambilDaftarTesti() { const { data } = await supabase.from('testimoni').select('*').order('id', { ascending: false }); if (data) setDaftarTesti(data); }

  // --- LOGIKA PRODUK ---
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
      // 🔥 Set Link File
      setUrlFileDatabase(produk.file_url || '');
      setLinkFileManual(produk.file_url || ''); 
      setFileProduk(null);

      window.scrollTo({ top: 0, behavior: 'smooth' }); 
      toast("✏️ Mode Edit Aktif", { icon: '📝' }); 
  };

  const handleBatalEdit = () => { 
      setIdProduk(null); setNama(''); setHarga(''); setHargaCoret(''); setDeskripsi(''); setKategori('Ebook'); setLinkMayar(''); setFileGambar(null); setGambarLama(''); 
      setFileProduk(null); setLinkFileManual(''); setUrlFileDatabase('');
      toast("Mode edit dibatalkan", { icon: '❌' }); 
  };

  const handleSimpanProduk = async (e: React.FormEvent) => {
    e.preventDefault(); setUploading(true); const toastId = toast.loading('Sedang memproses...');
    try {
      // 1. Upload Gambar
      let urlGambar = gambarLama; 
      if (fileGambar) {
        const namaFile = `img-${Date.now()}-${fileGambar.name}`;
        const { error } = await supabase.storage.from('gambar-produk').upload(namaFile, fileGambar);
        if (error) throw error;
        urlGambar = supabase.storage.from('gambar-produk').getPublicUrl(namaFile).data.publicUrl;
      }

      // 2. Upload FILE PRODUK (PDF/Zip) 🔥
      let finalFileUrl = linkFileManual;
      if (fileProduk) {
          const namaFileProduk = `file-${Date.now()}-${fileProduk.name}`;
          const { error: errFile } = await supabase.storage.from('file-produk').upload(namaFileProduk, fileProduk);
          if (errFile) throw errFile;
          finalFileUrl = supabase.storage.from('file-produk').getPublicUrl(namaFileProduk).data.publicUrl;
      }

      const payload = { 
          nama_produk: nama, 
          harga: Number(harga), 
          harga_coret: hargaCoret ? Number(hargaCoret) : null, 
          deskripsi: deskripsi, 
          kategori: kategori, 
          link_mayar: linkMayar, 
          gambar: urlGambar || 'https://via.placeholder.com/300',
          file_url: finalFileUrl 
      };

      if (idProduk) { await supabase.from('produk').update(payload).eq('id', idProduk); toast.success("Produk Update!", { id: toastId }); } 
      else { await supabase.from('produk').insert([payload]); toast.success("Produk Baru!", { id: toastId }); }
      
      handleBatalEdit(); ambilDaftarProduk(); 
    } catch (err: any) { toast.error("Gagal: " + err.message, { id: toastId }); } finally { setUploading(false); }
  };
  
  const handleHapusProduk = async (id: number) => { if (!confirm("Yakin hapus?")) return; await supabase.from('produk').delete().eq('id', id); toast.success("Terhapus!"); ambilDaftarProduk(); if (idProduk === id) handleBatalEdit(); };

  // --- LOGIKA TAMPILAN ---
  const handleHapusPopup = async () => { if (!confirm("Hapus Pop-up?")) return; const toastId = toast.loading("Menghapus..."); try { await supabase.from('toko').update({ popup_image: null }).eq('id', toko.id); setToko({ ...toko, popup_image: null }); setFilePopup(null); toast.success("Dihapus!", { id: toastId }); } catch (err: any) { toast.error(err.message, { id: toastId }); } };
  const handleUpdateTampilan = async (e: React.FormEvent) => {
    e.preventDefault(); setSavingTema(true); const toastId = toast.loading("Menyimpan...");
    try {
        let urlHeader = toko.header_bg; let urlFooter = toko.footer_bg; let urlPopup = toko.popup_image;
        if (fileHeader) { const n = `header-${Date.now()}-${fileHeader.name}`; await supabase.storage.from('gambar-produk').upload(n, fileHeader); urlHeader = supabase.storage.from('gambar-produk').getPublicUrl(n).data.publicUrl; }
        if (fileFooter) { const n = `footer-${Date.now()}-${fileFooter.name}`; await supabase.storage.from('gambar-produk').upload(n, fileFooter); urlFooter = supabase.storage.from('gambar-produk').getPublicUrl(n).data.publicUrl; }
        if (filePopup) { const n = `popup-${Date.now()}-${filePopup.name}`; await supabase.storage.from('gambar-produk').upload(n, filePopup); urlPopup = supabase.storage.from('gambar-produk').getPublicUrl(n).data.publicUrl; }
        const payload = { nama_toko: toko.nama_toko, deskripsi: toko.deskripsi, font_style: toko.font_style, header_bg: urlHeader, footer_bg: urlFooter, running_text: toko.running_text, popup_image: urlPopup, total_member: toko.total_member, total_terjual: toko.total_terjual, kepuasan: toko.kepuasan };
        if (!toko.id) { await supabase.from('toko').insert([payload]); } else { await supabase.from('toko').update(payload).eq('id', toko.id); }
        toast.success("Tampilan Update! ✨", { id: toastId }); ambilDataToko(); 
    } catch (err: any) { toast.error("Gagal: " + err.message, { id: toastId }); } finally { setSavingTema(false); }
  };

  // --- LOGIKA TESTIMONI ---
  const handleSimpanTesti = async (e: React.FormEvent) => {
    e.preventDefault(); const toastId = toast.loading("Menyimpan...");
    try {
        const payload = { nama: namaTesti, role: roleTesti, text: textTesti, avatar: avatarTesti, tampil: true };
        if (idTesti) { await supabase.from('testimoni').update(payload).eq('id', idTesti); toast.success("Testimoni Update!", { id: toastId }); }
        else { await supabase.from('testimoni').insert([payload]); toast.success("Testimoni Ditambah!", { id: toastId }); }
        setNamaTesti(''); setRoleTesti(''); setTextTesti(''); setIdTesti(null); ambilDaftarTesti();
    } catch (err: any) { toast.error("Gagal: " + err.message, { id: toastId }); }
  };
  const toggleStatusTesti = async (id: number, statusSaatIni: boolean) => { await supabase.from('testimoni').update({ tampil: !statusSaatIni }).eq('id', id); toast.success(statusSaatIni ? "Hidden 🚫" : "Tampil ✅"); ambilDaftarTesti(); };
  const handleEditTesti = (t: any) => { setIdTesti(t.id); setNamaTesti(t.nama); setRoleTesti(t.role); setTextTesti(t.text); setAvatarTesti(t.avatar); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleHapusTesti = async (id: number) => { if(!confirm("Hapus?")) return; await supabase.from('testimoni').delete().eq('id', id); toast.success("Dihapus!"); ambilDaftarTesti(); };
  const handleBatalTesti = () => { setIdTesti(null); setNamaTesti(''); setRoleTesti(''); setTextTesti(''); };

  if (loading) return <div className="flex h-screen items-center justify-center"><p className="text-xl font-bold text-gray-500 animate-pulse">Memuat Admin...</p></div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <Toaster position="bottom-right" />
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="flex items-center gap-4"><Link href="/" className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-900 transition shadow-lg flex items-center gap-2">⬅️ Kembali ke Home</Link><h1 className="text-3xl font-bold text-gray-800">⚙️ Admin Control</h1></div>
            <div className="bg-white p-1 rounded-xl shadow-sm flex gap-2">
                <button onClick={() => setActiveTab('produk')} className={`px-4 md:px-6 py-2 rounded-lg font-bold transition text-xs md:text-sm ${activeTab === 'produk' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>📦 Produk</button>
                <button onClick={() => setActiveTab('tampilan')} className={`px-4 md:px-6 py-2 rounded-lg font-bold transition text-xs md:text-sm ${activeTab === 'tampilan' ? 'bg-purple-600 text-white' : 'text-gray-500'}`}>🎨 Tampilan</button>
                <button onClick={() => setActiveTab('testimoni')} className={`px-4 md:px-6 py-2 rounded-lg font-bold transition text-xs md:text-sm ${activeTab === 'testimoni' ? 'bg-green-600 text-white' : 'text-gray-500'}`}>💬 Testimoni</button>
            </div>
        </div>

        {activeTab === 'produk' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-white p-6 rounded-3xl shadow-lg h-fit sticky top-4">
                    <h2 className="text-xl font-bold mb-4">{idProduk ? '✏️ Edit Produk' : '➕ Tambah Produk'}</h2>
                    <form onSubmit={handleSimpanProduk} className="space-y-4">
                        <input type="text" placeholder="Nama Produk" required className="w-full p-2 border rounded-lg" value={nama} onChange={e => setNama(e.target.value)} />
                        <div className="grid grid-cols-2 gap-2"><input type="number" placeholder="Harga Jual" required className="w-full p-2 border rounded-lg font-bold text-blue-600" value={harga} onChange={e => setHarga(e.target.value)} /><input type="number" placeholder="Harga Coret" className="w-full p-2 border rounded-lg text-red-500 line-through" value={hargaCoret} onChange={e => setHargaCoret(e.target.value)} /></div>
                        <select className="w-full p-2 border rounded-lg bg-white" value={kategori} onChange={e => setKategori(e.target.value)}><option>Ebook</option><option>Template</option><option>Video</option></select>
                        <textarea placeholder="Deskripsi" className="w-full p-2 border rounded-lg" rows={3} value={deskripsi} onChange={e => setDeskripsi(e.target.value)}></textarea>
                        <input type="text" placeholder="Link Mayar/Google" className="w-full p-2 border rounded-lg" value={linkMayar} onChange={e => setLinkMayar(e.target.value)} />
                        
                        {/* 🔥 INPUT FILE PRODUK */}
                        <div className="bg-blue-50 p-3 border border-blue-200 rounded-lg">
                            <label className="text-xs font-bold text-blue-800 mb-1 block">📁 File Produk (PDF/Zip)</label>
                            <input type="file" accept=".pdf,.zip,.rar,.mp4" onChange={e => setFileProduk(e.target.files?.[0] || null)} className="w-full text-sm mb-2" />
                            <p className="text-[10px] text-gray-500 mb-2 text-center">- ATAU Link Manual -</p>
                            <input type="text" placeholder="Paste Link GDrive / YouTube" className="w-full p-2 border rounded text-sm bg-white" value={linkFileManual} onChange={e => setLinkFileManual(e.target.value)} />
                            {urlFileDatabase && !fileProduk && (<p className="text-[10px] text-green-600 mt-1 truncate">✅ File tersimpan: {urlFileDatabase}</p>)}
                        </div>

                        <div className="bg-gray-50 p-2 border rounded-lg"><span className="text-xs block mb-1">Gambar Cover</span><input type="file" onChange={e => setFileGambar(e.target.files?.[0] || null)} /></div>
                        {idProduk && (<button type="button" onClick={handleBatalEdit} className="w-full py-2 bg-gray-200 rounded-lg text-sm mb-2">Batal</button>)}
                        <button disabled={uploading} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold">{uploading ? '...' : 'Simpan'}</button>
                    </form>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-lg"><div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">{daftarProduk.map(item => (<div key={item.id} className="flex gap-3 p-3 border rounded-xl"><img src={item.gambar} className="w-12 h-12 rounded bg-gray-200" /><div className="flex-grow"><p className="font-bold text-sm">{item.nama_produk}</p><span className="text-blue-600 text-xs font-bold">Rp {item.harga}</span></div><button onClick={() => handleEditClick(item)}>✏️</button><button onClick={() => handleHapusProduk(item.id)}>🗑️</button></div>))}</div></div>
            </div>
        )}

        {activeTab === 'tampilan' && (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-xl border border-purple-100">
                <h2 className="text-2xl font-bold mb-6 text-purple-700">🎨 Setting Tampilan</h2>
                <form onSubmit={handleUpdateTampilan} className="space-y-6">
                    <div><label className="block text-sm font-bold text-gray-700 mb-1">Nama Toko</label><input type="text" className="w-full p-3 border rounded-xl" value={toko.nama_toko || ''} onChange={e => setToko({...toko, nama_toko: e.target.value})} /></div>
                    <div><label className="block text-sm font-bold text-gray-700 mb-1">Slogan</label><textarea className="w-full p-3 border rounded-xl" rows={2} value={toko.deskripsi || ''} onChange={e => setToko({...toko, deskripsi: e.target.value})}></textarea></div>
                    <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-200"><label className="block text-sm font-bold text-yellow-800 mb-1">📢 Teks Berjalan</label><input type="text" className="w-full p-2 border rounded-lg" value={toko.running_text || ''} onChange={e => setToko({...toko, running_text: e.target.value})} /></div>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200"><label className="block text-sm font-bold text-blue-800 mb-3">📊 Data Statistik Toko</label><div className="grid grid-cols-3 gap-3"><div><label className="text-xs text-gray-500">Total Member</label><input type="text" className="w-full p-2 border rounded-lg font-bold" value={toko.total_member || ''} onChange={e => setToko({...toko, total_member: e.target.value})} /></div><div><label className="text-xs text-gray-500">Produk Terjual</label><input type="text" className="w-full p-2 border rounded-lg font-bold" value={toko.total_terjual || ''} onChange={e => setToko({...toko, total_terjual: e.target.value})} /></div><div><label className="text-xs text-gray-500">Kepuasan</label><input type="text" className="w-full p-2 border rounded-lg font-bold" value={toko.kepuasan || ''} onChange={e => setToko({...toko, kepuasan: e.target.value})} /></div></div></div>
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl"><label className="block text-sm font-bold text-red-700 mb-2">🔥 Pop-up Iklan</label>{toko.popup_image ? (<div className="mb-3"><img src={toko.popup_image} className="h-32 w-auto rounded-lg object-contain bg-white border mb-2" /><button type="button" onClick={handleHapusPopup} className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600 transition shadow flex items-center gap-1">🗑️ Hapus Pop-up & Matikan Iklan</button></div>) : (<p className="text-xs text-gray-400 mb-2 italic">Tidak ada iklan aktif.</p>)}<input type="file" onChange={e => setFilePopup(e.target.files?.[0] || null)} className="w-full text-sm" /></div>
                    <div className="p-3 bg-gray-50 rounded-xl"><label className="block text-sm font-bold text-gray-700 mb-1">Header Background</label><input type="file" onChange={e => setFileHeader(e.target.files?.[0] || null)} className="text-sm" /></div>
                    <div className="p-3 bg-gray-50 rounded-xl"><label className="block text-sm font-bold text-gray-700 mb-1">Footer Background</label><input type="file" onChange={e => setFileFooter(e.target.files?.[0] || null)} className="text-sm" /></div>
                    <button disabled={savingTema} className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold hover:bg-purple-700 transition shadow-lg">{savingTema ? 'Menyimpan...' : 'Simpan Semua Tampilan ✨'}</button>
                </form>
            </div>
        )}

        {activeTab === 'testimoni' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-white p-6 rounded-3xl shadow-lg h-fit sticky top-4 border border-green-100">
                    <div className="flex justify-between items-center mb-4 border-b pb-2"><h2 className="text-xl font-bold text-gray-800">{idTesti ? '✏️ Edit' : '💬 Tambah'}</h2>{idTesti && (<button onClick={handleBatalTesti} className="text-xs text-red-500 font-bold hover:underline">Batal</button>)}</div>
                    <form onSubmit={handleSimpanTesti} className="space-y-4">
                        <div><label className="text-xs text-gray-500 ml-1">Nama</label><input type="text" required className="w-full p-2 border rounded-lg" value={namaTesti} onChange={e => setNamaTesti(e.target.value)} /></div>
                        <div><label className="text-xs text-gray-500 ml-1">Role</label><input type="text" required className="w-full p-2 border rounded-lg" value={roleTesti} onChange={e => setRoleTesti(e.target.value)} /></div>
                        <div><label className="text-xs text-gray-500 ml-1">Isi</label><textarea required className="w-full p-2 border rounded-lg h-24" value={textTesti} onChange={e => setTextTesti(e.target.value)}></textarea></div>
                        <div><label className="text-xs text-gray-500 ml-1">Emoji</label><select className="w-full p-2 border rounded-lg bg-white text-xl" value={avatarTesti} onChange={e => setAvatarTesti(e.target.value)}><option>😎</option><option>👨‍💻</option><option>👩‍💻</option><option>🧕</option><option>🤴</option><option>👸</option><option>📹</option><option>📸</option><option>🛒</option><option>🔥</option></select></div>
                        <button className="w-full py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition shadow-lg">Simpan</button>
                    </form>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-lg border border-green-100">
                    <h2 className="text-xl font-bold mb-4 border-b pb-2">Moderasi ({daftarTesti.length})</h2>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                        {daftarTesti.map(t => (
                            <div key={t.id} className={`p-4 rounded-xl border flex gap-4 items-start ${t.tampil ? 'bg-white border-green-200' : 'bg-red-50 border-red-200'}`}>
                                <div className="text-3xl bg-white w-12 h-12 flex items-center justify-center rounded-full shadow-sm">{t.avatar}</div>
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start">
                                        <div><h3 className="font-bold text-gray-800">{t.nama}</h3><p className="text-xs text-gray-500 font-bold uppercase">{t.role}</p></div>
                                        <div className="flex gap-2">
                                            <button onClick={() => toggleStatusTesti(t.id, t.tampil)} className={`text-xs px-3 py-1 rounded font-bold text-white ${t.tampil ? 'bg-green-500' : 'bg-gray-400'}`}>{t.tampil ? '✅' : '🚫'}</button>
                                            <button onClick={() => handleEditTesti(t)} className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">✏️</button>
                                            <button onClick={() => handleHapusTesti(t.id)} className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">🗑️</button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2 italic">"{t.text}"</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}