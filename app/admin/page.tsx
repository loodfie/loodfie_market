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
  
  const [activeTab, setActiveTab] = useState<'produk' | 'transaksi' | 'tampilan' | 'testimoni'>('produk');

  // STATE PRODUK
  const [idProduk, setIdProduk] = useState<number | null>(null);
  const [nama, setNama] = useState('');
  const [harga, setHarga] = useState('');
  const [hargaCoret, setHargaCoret] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [kategori, setKategori] = useState('Ebook');
  const [linkMayar, setLinkMayar] = useState('');
  const [fileProduk, setFileProduk] = useState<File | null>(null);
  const [linkFileManual, setLinkFileManual] = useState('');
  const [urlFileDatabase, setUrlFileDatabase] = useState('');
  const [fileGambar, setFileGambar] = useState<File | null>(null);
  const [gambarLama, setGambarLama] = useState(''); 
  const [uploading, setUploading] = useState(false);
  const [daftarProduk, setDaftarProduk] = useState<any[]>([]);

  // STATE TRANSAKSI
  const [emailPembeli, setEmailPembeli] = useState('');
  const [produkDipilih, setProdukDipilih] = useState<string>('');
  const [riwayatTransaksi, setRiwayatTransaksi] = useState<any[]>([]);
  const [loadingTrx, setLoadingTrx] = useState(false);

  // STATE TAMPILAN (DENGAN LOGO)
  const [toko, setToko] = useState<any>({});
  const [fileHeader, setFileHeader] = useState<File | null>(null);
  const [fileFooter, setFileFooter] = useState<File | null>(null);
  const [filePopup, setFilePopup] = useState<File | null>(null);
  const [fileLogo, setFileLogo] = useState<File | null>(null); // 🔥 Logo Baru
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
      ambilRiwayatTransaksi();
      ambilDataToko();
      ambilDaftarTesti();
      setLoading(false);
    }
    initAdmin();
  }, []);

  async function ambilDaftarProduk() { const { data } = await supabase.from('produk').select('*').order('id', { ascending: false }); if (data) setDaftarProduk(data); }
  async function ambilDataToko() { const { data } = await supabase.from('toko').select('*').single(); if (data) setToko(data); }
  async function ambilDaftarTesti() { const { data } = await supabase.from('testimoni').select('*').order('id', { ascending: false }); if (data) setDaftarTesti(data); }
  async function ambilRiwayatTransaksi() { const { data } = await supabase.from('transaksi').select(`id, created_at, user_email, status, produk:produk_id ( nama_produk )`).order('id', { ascending: false }).limit(50); if (data) setRiwayatTransaksi(data); }

  // LOGIKA PRODUK & TRANSAKSI (Sama seperti sebelumnya - Disingkat)
  const handleSimpanProduk = async (e: React.FormEvent) => {
    e.preventDefault(); setUploading(true); const toastId = toast.loading('Sedang memproses...');
    try {
      let urlGambar = gambarLama; 
      if (fileGambar) { const n = `img-${Date.now()}-${fileGambar.name}`; await supabase.storage.from('gambar-produk').upload(n, fileGambar); urlGambar = supabase.storage.from('gambar-produk').getPublicUrl(n).data.publicUrl; }
      let finalFileUrl = linkFileManual;
      if (fileProduk) { const n = `file-${Date.now()}-${fileProduk.name}`; await supabase.storage.from('file-produk').upload(n, fileProduk); finalFileUrl = supabase.storage.from('file-produk').getPublicUrl(n).data.publicUrl; }
      const payload = { nama_produk: nama, harga: Number(harga), harga_coret: hargaCoret ? Number(hargaCoret) : null, deskripsi: deskripsi, kategori: kategori, link_mayar: linkMayar, gambar: urlGambar || 'https://via.placeholder.com/300', file_url: finalFileUrl };
      if (idProduk) { await supabase.from('produk').update(payload).eq('id', idProduk); } else { await supabase.from('produk').insert([payload]); }
      toast.success("Produk Disimpan!", { id: toastId }); handleBatalEdit(); ambilDaftarProduk(); 
    } catch (err: any) { toast.error("Gagal: " + err.message, { id: toastId }); } finally { setUploading(false); }
  };
  const handleBeriAkses = async (e: React.FormEvent) => { e.preventDefault(); setLoadingTrx(true); const toastId = toast.loading("Memproses..."); try { await supabase.from('transaksi').insert([{ user_email: emailPembeli, produk_id: Number(produkDipilih), status: 'LUNAS' }]); toast.success("Akses Diberikan!", { id: toastId }); setEmailPembeli(''); setProdukDipilih(''); ambilRiwayatTransaksi(); } catch (err: any) { toast.error(err.message, { id: toastId }); } finally { setLoadingTrx(false); } };
  const handleCabutAkses = async (id: number) => { if (confirm("Cabut akses?")) { await supabase.from('transaksi').delete().eq('id', id); toast.success("Dicabut"); ambilRiwayatTransaksi(); }};
  const handleEditClick = (p: any) => { setIdProduk(p.id); setNama(p.nama_produk); setHarga(p.harga); setHargaCoret(p.harga_coret); setDeskripsi(p.deskripsi); setKategori(p.kategori); setLinkMayar(p.link_mayar); setGambarLama(p.gambar); setUrlFileDatabase(p.file_url); setLinkFileManual(p.file_url); window.scrollTo({top:0, behavior:'smooth'}); };
  const handleBatalEdit = () => { setIdProduk(null); setNama(''); setHarga(''); setDeskripsi(''); setFileGambar(null); setFileProduk(null); setLinkFileManual(''); };
  const handleHapusProduk = async (id: number) => { if(confirm("Hapus?")) { await supabase.from('produk').delete().eq('id', id); ambilDaftarProduk(); }};

  // 🔥 UPDATE TAMPILAN (TERMASUK LOGO)
  const handleUpdateTampilan = async (e: React.FormEvent) => {
    e.preventDefault(); setSavingTema(true); const toastId = toast.loading("Menyimpan...");
    try {
        let urlHeader = toko.header_bg; let urlFooter = toko.footer_bg; let urlPopup = toko.popup_image; let urlLogo = toko.logo;
        
        // Upload Gambar-gambar
        if (fileHeader) { const n = `header-${Date.now()}-${fileHeader.name}`; await supabase.storage.from('gambar-produk').upload(n, fileHeader); urlHeader = supabase.storage.from('gambar-produk').getPublicUrl(n).data.publicUrl; }
        if (fileFooter) { const n = `footer-${Date.now()}-${fileFooter.name}`; await supabase.storage.from('gambar-produk').upload(n, fileFooter); urlFooter = supabase.storage.from('gambar-produk').getPublicUrl(n).data.publicUrl; }
        if (filePopup) { const n = `popup-${Date.now()}-${filePopup.name}`; await supabase.storage.from('gambar-produk').upload(n, filePopup); urlPopup = supabase.storage.from('gambar-produk').getPublicUrl(n).data.publicUrl; }
        
        // 🔥 Upload Logo
        if (fileLogo) { const n = `logo-${Date.now()}-${fileLogo.name}`; await supabase.storage.from('gambar-produk').upload(n, fileLogo); urlLogo = supabase.storage.from('gambar-produk').getPublicUrl(n).data.publicUrl; }

        const payload = { 
            nama_toko: toko.nama_toko, deskripsi: toko.deskripsi, font_style: toko.font_style, 
            header_bg: urlHeader, footer_bg: urlFooter, running_text: toko.running_text, 
            popup_image: urlPopup, logo: urlLogo, // Simpan URL Logo
            total_member: toko.total_member, total_terjual: toko.total_terjual, kepuasan: toko.kepuasan 
        };
        
        if (!toko.id) { await supabase.from('toko').insert([payload]); } else { await supabase.from('toko').update(payload).eq('id', toko.id); }
        toast.success("Tampilan Update! ✨", { id: toastId }); ambilDataToko(); 
    } catch (err: any) { toast.error("Gagal: " + err.message, { id: toastId }); } finally { setSavingTema(false); }
  };
  const handleHapusPopup = async () => { await supabase.from('toko').update({ popup_image: null }).eq('id', toko.id); setToko({...toko, popup_image: null}); toast.success("Popup dihapus"); };

  // TESTIMONI (Disingkat)
  const handleSimpanTesti = async (e: any) => { e.preventDefault(); const p = { nama: namaTesti, role: roleTesti, text: textTesti, avatar: avatarTesti, tampil: true }; if(idTesti) await supabase.from('testimoni').update(p).eq('id', idTesti); else await supabase.from('testimoni').insert([p]); setNamaTesti(''); setIdTesti(null); ambilDaftarTesti(); toast.success("Testimoni OK"); };
  const toggleStatusTesti = async (id: number, s: boolean) => { await supabase.from('testimoni').update({tampil: !s}).eq('id', id); ambilDaftarTesti(); };
  const handleHapusTesti = async (id: number) => { await supabase.from('testimoni').delete().eq('id', id); ambilDaftarTesti(); };
  const handleEditTesti = (t: any) => { setIdTesti(t.id); setNamaTesti(t.nama); setRoleTesti(t.role); setTextTesti(t.text); setAvatarTesti(t.avatar); };

  if (loading) return <div className="flex h-screen items-center justify-center"><p className="animate-pulse font-bold">Memuat...</p></div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 font-sans">
      <Toaster position="bottom-right" />
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold text-gray-800">⚙️ Admin Panel</h1>
            <div className="bg-white p-1 rounded-xl shadow-sm flex gap-2 flex-wrap justify-center">
                <button onClick={() => setActiveTab('produk')} className={`px-4 py-2 rounded-lg font-bold ${activeTab === 'produk' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>📦 Produk</button>
                <button onClick={() => setActiveTab('transaksi')} className={`px-4 py-2 rounded-lg font-bold ${activeTab === 'transaksi' ? 'bg-orange-600 text-white' : 'text-gray-500'}`}>💰 Kasir</button>
                <button onClick={() => setActiveTab('tampilan')} className={`px-4 py-2 rounded-lg font-bold ${activeTab === 'tampilan' ? 'bg-purple-600 text-white' : 'text-gray-500'}`}>🎨 Tampilan</button>
                <button onClick={() => setActiveTab('testimoni')} className={`px-4 py-2 rounded-lg font-bold ${activeTab === 'testimoni' ? 'bg-green-600 text-white' : 'text-gray-500'}`}>💬 Testimoni</button>
            </div>
        </div>

        {/* TAB PRODUK */}
        {activeTab === 'produk' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-3xl shadow-lg h-fit">
                    <h2 className="font-bold mb-4">{idProduk ? '✏️ Edit' : '➕ Baru'}</h2>
                    <form onSubmit={handleSimpanProduk} className="space-y-3">
                        <input className="w-full p-2 border rounded" placeholder="Nama Produk" value={nama} onChange={e=>setNama(e.target.value)} required />
                        <div className="grid grid-cols-2 gap-2"><input type="number" className="w-full p-2 border rounded" placeholder="Harga" value={harga} onChange={e=>setHarga(e.target.value)} required /><input type="number" className="w-full p-2 border rounded" placeholder="Coret" value={hargaCoret} onChange={e=>setHargaCoret(e.target.value)} /></div>
                        <textarea className="w-full p-2 border rounded" placeholder="Deskripsi" value={deskripsi} onChange={e=>setDeskripsi(e.target.value)} />
                        <select className="w-full p-2 border rounded" value={kategori} onChange={e=>setKategori(e.target.value)}><option>Ebook</option><option>Template</option><option>Video</option></select>
                        <input className="w-full p-2 border rounded" placeholder="Link Mayar (Opsional)" value={linkMayar} onChange={e=>setLinkMayar(e.target.value)} />
                        <div className="bg-blue-50 p-2 rounded border border-blue-200"><label className="text-xs font-bold block mb-1">File Produk</label><input type="file" onChange={e=>setFileProduk(e.target.files?.[0] || null)} className="text-sm mb-1" /><input className="w-full p-1 border rounded text-xs" placeholder="Atau Link Manual" value={linkFileManual} onChange={e=>setLinkFileManual(e.target.value)} /></div>
                        <div className="bg-gray-50 p-2 rounded border"><label className="text-xs font-bold block mb-1">Gambar</label><input type="file" onChange={e=>setFileGambar(e.target.files?.[0] || null)} className="text-sm" /></div>
                        <button disabled={uploading} className="w-full bg-blue-600 text-white py-2 rounded font-bold">{uploading ? '...' : 'Simpan'}</button>
                        {idProduk && <button type="button" onClick={handleBatalEdit} className="w-full bg-gray-200 py-2 rounded text-xs mt-2">Batal</button>}
                    </form>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-lg"><div className="space-y-2">{daftarProduk.map(p => (<div key={p.id} className="flex justify-between items-center border p-2 rounded"><span className="font-bold text-sm">{p.nama_produk}</span><div className="flex gap-2"><button onClick={()=>handleEditClick(p)} className="text-blue-500">✏️</button><button onClick={()=>handleHapusProduk(p.id)} className="text-red-500">🗑️</button></div></div>))}</div></div>
            </div>
        )}

        {/* TAB KASIR */}
        {activeTab === 'transaksi' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-3xl shadow-lg h-fit border border-orange-200">
                    <h2 className="font-bold mb-4 text-orange-600">💰 Kasir Manual</h2>
                    <form onSubmit={handleBeriAkses} className="space-y-3">
                        <input type="email" required placeholder="Email Pembeli" className="w-full p-2 border rounded" value={emailPembeli} onChange={e=>setEmailPembeli(e.target.value)} />
                        <select required className="w-full p-2 border rounded" value={produkDipilih} onChange={e=>setProdukDipilih(e.target.value)}><option value="">Pilih Produk</option>{daftarProduk.map(p=><option key={p.id} value={p.id}>{p.nama_produk}</option>)}</select>
                        <button disabled={loadingTrx} className="w-full bg-orange-600 text-white py-2 rounded font-bold">{loadingTrx ? '...' : 'Beri Akses'}</button>
                    </form>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-lg"><table className="w-full text-sm text-left"><thead><tr className="bg-gray-100"><th>Email</th><th>Produk</th><th>Aksi</th></tr></thead><tbody>{riwayatTransaksi.map(t=>(<tr key={t.id} className="border-b"><td>{t.user_email}</td><td>{t.produk?.nama_produk}</td><td><button onClick={()=>handleCabutAkses(t.id)} className="text-red-500 text-xs font-bold">Cabut</button></td></tr>))}</tbody></table></div>
            </div>
        )}

        {/* TAB TAMPILAN */}
        {activeTab === 'tampilan' && (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-xl border border-purple-100">
                <h2 className="text-2xl font-bold mb-6 text-purple-700">🎨 Branding Toko</h2>
                <form onSubmit={handleUpdateTampilan} className="space-y-6">
                    {/* 🔥 UPLOAD LOGO DISINI */}
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                        <label className="block text-sm font-bold text-purple-800 mb-2">💎 Logo Toko</label>
                        {toko.logo && <img src={toko.logo} className="h-16 w-auto mb-3 bg-white p-1 rounded border shadow-sm" />}
                        <input type="file" accept="image/*" onChange={e => setFileLogo(e.target.files?.[0] || null)} className="w-full text-sm" />
                        <p className="text-[10px] text-gray-500 mt-1">*Format PNG/JPG transparan lebih bagus.</p>
                    </div>

                    <div><label className="font-bold text-sm">Nama Toko</label><input className="w-full p-2 border rounded" value={toko.nama_toko||''} onChange={e=>setToko({...toko, nama_toko: e.target.value})} /></div>
                    <div><label className="font-bold text-sm">Slogan</label><textarea className="w-full p-2 border rounded" value={toko.deskripsi||''} onChange={e=>setToko({...toko, deskripsi: e.target.value})} /></div>
                    <div><label className="font-bold text-sm">Teks Berjalan</label><input className="w-full p-2 border rounded bg-yellow-50" value={toko.running_text||''} onChange={e=>setToko({...toko, running_text: e.target.value})} /></div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 rounded border"><label className="font-bold text-xs block mb-1">Header BG</label><input type="file" onChange={e=>setFileHeader(e.target.files?.[0]||null)} className="text-xs" /></div>
                        <div className="p-3 bg-gray-50 rounded border"><label className="font-bold text-xs block mb-1">Footer BG</label><input type="file" onChange={e=>setFileFooter(e.target.files?.[0]||null)} className="text-xs" /></div>
                    </div>

                    <div className="p-3 bg-red-50 rounded border border-red-100"><label className="font-bold text-xs text-red-600 block mb-1">Pop-up Iklan</label>{toko.popup_image && <button type="button" onClick={handleHapusPopup} className="text-xs bg-red-500 text-white px-2 py-1 rounded mb-2">Hapus Popup</button>}<input type="file" onChange={e=>setFilePopup(e.target.files?.[0]||null)} className="text-xs" /></div>
                    <button disabled={savingTema} className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold">{savingTema?'Menyimpan...':'Simpan Perubahan ✨'}</button>
                </form>
            </div>
        )}

        {/* TAB TESTIMONI */}
        {activeTab === 'testimoni' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-3xl shadow-lg h-fit border border-green-200">
                    <h2 className="font-bold mb-4 text-green-700">{idTesti?'Edit':'Tambah'} Testimoni</h2>
                    <form onSubmit={handleSimpanTesti} className="space-y-3">
                        <input className="w-full p-2 border rounded" placeholder="Nama" value={namaTesti} onChange={e=>setNamaTesti(e.target.value)} required />
                        <input className="w-full p-2 border rounded" placeholder="Pekerjaan" value={roleTesti} onChange={e=>setRoleTesti(e.target.value)} required />
                        <textarea className="w-full p-2 border rounded" placeholder="Isi Testimoni" value={textTesti} onChange={e=>setTextTesti(e.target.value)} required />
                        <select className="w-full p-2 border rounded text-xl" value={avatarTesti} onChange={e=>setAvatarTesti(e.target.value)}><option>😎</option><option>👩‍💻</option><option>🔥</option></select>
                        <button className="w-full bg-green-600 text-white py-2 rounded font-bold">Simpan</button>
                    </form>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-lg"><div className="space-y-2">{daftarTesti.map(t=>(<div key={t.id} className="flex justify-between border p-2 rounded items-center"><div><span className="font-bold">{t.nama}</span> <span className="text-xs text-gray-500">({t.role})</span></div><div className="flex gap-2"><button onClick={()=>toggleStatusTesti(t.id, t.tampil)} className="text-xs border px-1 rounded">{t.tampil?'✅':'🚫'}</button><button onClick={()=>handleEditTesti(t)} className="text-orange-500">✏️</button><button onClick={()=>handleHapusTesti(t.id)} className="text-red-500">🗑️</button></div></div>))}</div></div>
            </div>
        )}

      </div>
    </div>
  );
}