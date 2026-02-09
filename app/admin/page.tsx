'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { FaArrowLeft, FaTrash, FaStore, FaMoneyBillWave, FaPalette, FaCommentDots, FaUpload } from 'react-icons/fa';

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

  // STATE TAMPILAN
  const [toko, setToko] = useState<any>({});
  const [fileHeader, setFileHeader] = useState<File | null>(null);
  const [fileFooter, setFileFooter] = useState<File | null>(null);
  const [filePopup, setFilePopup] = useState<File | null>(null);
  const [fileLogo, setFileLogo] = useState<File | null>(null);
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

  // --- LOGIKA PRODUK ---
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
  const handleEditClick = (p: any) => { setIdProduk(p.id); setNama(p.nama_produk); setHarga(p.harga); setHargaCoret(p.harga_coret); setDeskripsi(p.deskripsi); setKategori(p.kategori); setLinkMayar(p.link_mayar); setGambarLama(p.gambar); setUrlFileDatabase(p.file_url); setLinkFileManual(p.file_url); window.scrollTo({top:0, behavior:'smooth'}); };
  const handleBatalEdit = () => { setIdProduk(null); setNama(''); setHarga(''); setDeskripsi(''); setFileGambar(null); setFileProduk(null); setLinkFileManual(''); };
  const handleHapusProduk = async (id: number) => { if(confirm("Hapus?")) { await supabase.from('produk').delete().eq('id', id); ambilDaftarProduk(); }};

  // --- LOGIKA TRANSAKSI ---
  const handleBeriAkses = async (e: React.FormEvent) => { e.preventDefault(); setLoadingTrx(true); const toastId = toast.loading("Memproses..."); try { await supabase.from('transaksi').insert([{ user_email: emailPembeli, produk_id: Number(produkDipilih), status: 'LUNAS' }]); toast.success("Akses Diberikan!", { id: toastId }); setEmailPembeli(''); setProdukDipilih(''); ambilRiwayatTransaksi(); } catch (err: any) { toast.error(err.message, { id: toastId }); } finally { setLoadingTrx(false); } };
  const handleCabutAkses = async (id: number) => { if (confirm("Cabut akses?")) { await supabase.from('transaksi').delete().eq('id', id); toast.success("Dicabut"); ambilRiwayatTransaksi(); }};

  // --- 🔥 LOGIKA TAMPILAN (NEW FEATURES) ---
  const handleUpdateTampilan = async (e: React.FormEvent) => {
    e.preventDefault(); setSavingTema(true); const toastId = toast.loading("Menyimpan...");
    try {
        let urlHeader = toko.header_bg; let urlFooter = toko.footer_bg; let urlPopup = toko.popup_image; let urlLogo = toko.logo;
        if (fileHeader) { const n = `header-${Date.now()}-${fileHeader.name}`; await supabase.storage.from('gambar-produk').upload(n, fileHeader); urlHeader = supabase.storage.from('gambar-produk').getPublicUrl(n).data.publicUrl; }
        if (fileFooter) { const n = `footer-${Date.now()}-${fileFooter.name}`; await supabase.storage.from('gambar-produk').upload(n, fileFooter); urlFooter = supabase.storage.from('gambar-produk').getPublicUrl(n).data.publicUrl; }
        if (filePopup) { const n = `popup-${Date.now()}-${filePopup.name}`; await supabase.storage.from('gambar-produk').upload(n, filePopup); urlPopup = supabase.storage.from('gambar-produk').getPublicUrl(n).data.publicUrl; }
        if (fileLogo) { const n = `logo-${Date.now()}-${fileLogo.name}`; await supabase.storage.from('gambar-produk').upload(n, fileLogo); urlLogo = supabase.storage.from('gambar-produk').getPublicUrl(n).data.publicUrl; }
        const payload = { nama_toko: toko.nama_toko, deskripsi: toko.deskripsi, font_style: toko.font_style, header_bg: urlHeader, footer_bg: urlFooter, running_text: toko.running_text, popup_image: urlPopup, logo: urlLogo, total_member: toko.total_member, total_terjual: toko.total_terjual, kepuasan: toko.kepuasan };
        if (!toko.id) { await supabase.from('toko').insert([payload]); } else { await supabase.from('toko').update(payload).eq('id', toko.id); }
        toast.success("Tampilan Update! ✨", { id: toastId }); ambilDataToko(); 
    } catch (err: any) { toast.error("Gagal: " + err.message, { id: toastId }); } finally { setSavingTema(false); }
  };
  
  // 🔥 FITUR HAPUS LOGO
  const handleHapusLogo = async () => { 
      if (!confirm("Yakin hapus Logo?")) return;
      const toastId = toast.loading("Menghapus Logo...");
      try {
          await supabase.from('toko').update({ logo: null }).eq('id', toko.id); 
          setToko({...toko, logo: null}); 
          setFileLogo(null);
          toast.success("Logo Dihapus! Kembali ke Teks.", { id: toastId }); 
      } catch (err: any) { toast.error(err.message, { id: toastId }); }
  };

  // 🔥 FITUR HAPUS POPUP
  const handleHapusPopup = async () => { 
      if (!confirm("Hapus Pop-up Iklan?")) return; 
      const toastId = toast.loading("Menghapus Pop-up..."); 
      try { 
          await supabase.from('toko').update({ popup_image: null }).eq('id', toko.id); 
          setToko({...toko, popup_image: null}); 
          setFilePopup(null); 
          toast.success("Pop-up Dihapus!", { id: toastId }); 
      } catch (err: any) { toast.error(err.message, { id: toastId }); } 
  };

  // --- LOGIKA TESTIMONI ---
  const handleSimpanTesti = async (e: any) => { e.preventDefault(); const p = { nama: namaTesti, role: roleTesti, text: textTesti, avatar: avatarTesti, tampil: true }; if(idTesti) await supabase.from('testimoni').update(p).eq('id', idTesti); else await supabase.from('testimoni').insert([p]); setNamaTesti(''); setIdTesti(null); ambilDaftarTesti(); toast.success("Testimoni OK"); };
  const toggleStatusTesti = async (id: number, s: boolean) => { await supabase.from('testimoni').update({tampil: !s}).eq('id', id); ambilDaftarTesti(); };
  const handleHapusTesti = async (id: number) => { await supabase.from('testimoni').delete().eq('id', id); ambilDaftarTesti(); };
  const handleEditTesti = (t: any) => { setIdTesti(t.id); setNamaTesti(t.nama); setRoleTesti(t.role); setTextTesti(t.text); setAvatarTesti(t.avatar); };

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50"><p className="animate-pulse font-bold text-gray-400">Memuat Admin...</p></div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 font-sans text-gray-800">
      <Toaster position="bottom-right" />
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER ADMIN */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 w-full md:w-auto">
                {/* 🔥 FITUR BACK KE MENU UTAMA */}
                <Link href="/" className="bg-gray-800 text-white px-5 py-3 rounded-xl font-bold hover:bg-black transition shadow-lg flex items-center gap-2 text-sm">
                    <FaArrowLeft /> Kembali ke Toko
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-gray-800">Admin Panel</h1>
                    <p className="text-xs text-gray-500">Kelola toko digitalmu di sini</p>
                </div>
            </div>
            
            {/* NAVIGASI TAB */}
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                <button onClick={() => setActiveTab('produk')} className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 whitespace-nowrap transition ${activeTab === 'produk' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><FaStore /> Produk</button>
                <button onClick={() => setActiveTab('transaksi')} className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 whitespace-nowrap transition ${activeTab === 'transaksi' ? 'bg-orange-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><FaMoneyBillWave /> Kasir</button>
                <button onClick={() => setActiveTab('tampilan')} className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 whitespace-nowrap transition ${activeTab === 'tampilan' ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><FaPalette /> Tampilan</button>
                <button onClick={() => setActiveTab('testimoni')} className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 whitespace-nowrap transition ${activeTab === 'testimoni' ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><FaCommentDots /> Testimoni</button>
            </div>
        </div>

        {/* --- TAB 1: PRODUK --- */}
        {activeTab === 'produk' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-white p-6 rounded-3xl shadow-lg h-fit sticky top-4 border border-blue-100">
                    <h2 className="font-bold mb-4 text-xl flex items-center gap-2 text-blue-700">{idProduk ? '✏️ Edit Produk' : '➕ Tambah Produk'}</h2>
                    <form onSubmit={handleSimpanProduk} className="space-y-4">
                        <div><label className="text-xs font-bold text-gray-500">Nama Produk</label><input className="w-full p-3 border rounded-xl bg-gray-50" value={nama} onChange={e=>setNama(e.target.value)} required /></div>
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className="text-xs font-bold text-gray-500">Harga Jual</label><input type="number" className="w-full p-3 border rounded-xl font-bold text-blue-600" value={harga} onChange={e=>setHarga(e.target.value)} required /></div>
                            <div><label className="text-xs font-bold text-gray-500">Harga Coret</label><input type="number" className="w-full p-3 border rounded-xl text-red-400 line-through" value={hargaCoret} onChange={e=>setHargaCoret(e.target.value)} /></div>
                        </div>
                        <div><label className="text-xs font-bold text-gray-500">Kategori</label><select className="w-full p-3 border rounded-xl bg-white" value={kategori} onChange={e=>setKategori(e.target.value)}><option>Ebook</option><option>Template</option><option>Video</option></select></div>
                        <div><label className="text-xs font-bold text-gray-500">Deskripsi</label><textarea className="w-full p-3 border rounded-xl h-24" value={deskripsi} onChange={e=>setDeskripsi(e.target.value)} /></div>
                        <div><label className="text-xs font-bold text-gray-500">Link Mayar (Otomatis)</label><input className="w-full p-3 border rounded-xl" placeholder="https://mayar.id/..." value={linkMayar} onChange={e=>setLinkMayar(e.target.value)} /></div>
                        
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                            <label className="text-xs font-bold text-blue-800 block mb-2">📁 File Produk (PDF/Zip)</label>
                            <input type="file" onChange={e=>setFileProduk(e.target.files?.[0] || null)} className="w-full text-sm mb-2" />
                            <p className="text-[10px] text-center text-gray-400 my-1">- ATAU LINK MANUAL -</p>
                            <input className="w-full p-2 border rounded text-xs bg-white" placeholder="Link GDrive/YouTube" value={linkFileManual} onChange={e=>setLinkFileManual(e.target.value)} />
                            {urlFileDatabase && <p className="text-[10px] text-green-600 mt-2 truncate">✅ File Ada: {urlFileDatabase}</p>}
                        </div>

                        <div className="bg-gray-50 p-3 rounded-xl border"><label className="text-xs font-bold block mb-2">🖼️ Gambar Cover</label><input type="file" onChange={e=>setFileGambar(e.target.files?.[0] || null)} className="text-sm w-full" /></div>
                        
                        <div className="flex gap-2 pt-2">
                            {idProduk && <button type="button" onClick={handleBatalEdit} className="w-1/3 bg-gray-200 py-3 rounded-xl font-bold text-gray-600">Batal</button>}
                            <button disabled={uploading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg">{uploading ? 'Upload...' : 'Simpan Produk'}</button>
                        </div>
                    </form>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
                    <h2 className="font-bold mb-4 text-xl">Daftar Produk ({daftarProduk.length})</h2>
                    <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2">
                        {daftarProduk.map(p => (
                            <div key={p.id} className="flex gap-4 p-4 border rounded-2xl items-center hover:bg-gray-50 transition">
                                <img src={p.gambar} className="w-16 h-16 rounded-lg object-cover bg-gray-200" />
                                <div className="flex-grow">
                                    <h3 className="font-bold text-gray-800">{p.nama_produk}</h3>
                                    <p className="text-blue-600 font-bold text-sm">Rp {p.harga}</p>
                                    <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded text-gray-600 uppercase">{p.kategori}</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button onClick={()=>handleEditClick(p)} className="bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-200">Edit</button>
                                    <button onClick={()=>handleHapusProduk(p.id)} className="bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-200">Hapus</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* --- TAB 2: KASIR --- */}
        {activeTab === 'transaksi' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-3xl shadow-lg h-fit border border-orange-200 sticky top-4">
                    <h2 className="font-bold mb-4 text-xl text-orange-600 flex items-center gap-2"><FaMoneyBillWave /> Kasir Manual</h2>
                    <p className="text-xs text-gray-500 mb-4">Gunakan ini untuk memberi akses ke pembeli yang transfer manual (WA).</p>
                    <form onSubmit={handleBeriAkses} className="space-y-4">
                        <div><label className="text-xs font-bold text-gray-500">Email Pembeli</label><input type="email" required placeholder="contoh@email.com" className="w-full p-3 border rounded-xl bg-orange-50 font-bold text-gray-800" value={emailPembeli} onChange={e=>setEmailPembeli(e.target.value)} /></div>
                        <div><label className="text-xs font-bold text-gray-500">Pilih Produk</label><select required className="w-full p-3 border rounded-xl bg-white" value={produkDipilih} onChange={e=>setProdukDipilih(e.target.value)}><option value="">-- Pilih Produk --</option>{daftarProduk.map(p=><option key={p.id} value={p.id}>{p.nama_produk}</option>)}</select></div>
                        <button disabled={loadingTrx} className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 shadow-lg">{loadingTrx ? '...' : '✅ Beri Akses'}</button>
                    </form>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
                    <h2 className="font-bold mb-4 text-xl">Riwayat Transaksi</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 text-gray-600 uppercase text-xs"><tr><th className="px-4 py-3">Tanggal</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Produk</th><th className="px-4 py-3">Aksi</th></tr></thead>
                            <tbody>
                                {riwayatTransaksi.map(t=>(
                                    <tr key={t.id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3">{new Date(t.created_at).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 font-bold">{t.user_email}</td>
                                        <td className="px-4 py-3 text-gray-600">{t.produk?.nama_produk}</td>
                                        <td className="px-4 py-3"><button onClick={()=>handleCabutAkses(t.id)} className="text-red-500 text-xs font-bold bg-red-50 px-2 py-1 rounded hover:bg-red-100">Cabut</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {/* --- TAB 3: TAMPILAN (FITUR HAPUS ADA DISINI) --- */}
        {activeTab === 'tampilan' && (
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-xl border border-purple-100">
                <h2 className="text-2xl font-bold mb-6 text-purple-700 flex items-center gap-2"><FaPalette /> Branding & Tampilan</h2>
                <form onSubmit={handleUpdateTampilan} className="space-y-8">
                    
                    {/* 🔥 1. SEKSI LOGO (DENGAN TOMBOL HAPUS) */}
                    <div className="p-6 bg-purple-50 border border-purple-200 rounded-2xl">
                        <div className="flex justify-between items-start mb-4">
                            <label className="text-sm font-bold text-purple-800">💎 Logo Toko</label>
                            {/* Tombol Hapus Logo */}
                            {toko.logo && (
                                <button type="button" onClick={handleHapusLogo} className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-lg font-bold hover:bg-red-200 flex items-center gap-1 transition">
                                    <FaTrash /> Hapus Logo
                                </button>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-4 mb-4">
                            {toko.logo ? (
                                <img src={toko.logo} className="h-20 w-auto bg-white p-2 rounded-lg border shadow-sm object-contain" />
                            ) : (
                                <div className="h-20 w-20 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs text-center p-2">Belum ada logo</div>
                            )}
                            <div className="flex-grow">
                                <input type="file" accept="image/*" onChange={e => setFileLogo(e.target.files?.[0] || null)} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200" />
                                <p className="text-[10px] text-gray-500 mt-2">Format: PNG Transparan (Disarankan)</p>
                            </div>
                        </div>
                    </div>

                    {/* 2. DATA TEXT */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="font-bold text-sm block mb-1">Nama Toko</label><input className="w-full p-3 border rounded-xl" value={toko.nama_toko||''} onChange={e=>setToko({...toko, nama_toko: e.target.value})} /></div>
                        <div><label className="font-bold text-sm block mb-1">Running Text (Kuning)</label><input className="w-full p-3 border rounded-xl" value={toko.running_text||''} onChange={e=>setToko({...toko, running_text: e.target.value})} /></div>
                    </div>
                    <div><label className="font-bold text-sm block mb-1">Slogan / Deskripsi</label><textarea className="w-full p-3 border rounded-xl" rows={2} value={toko.deskripsi||''} onChange={e=>setToko({...toko, deskripsi: e.target.value})} /></div>

                    {/* 3. GAMBAR BACKGROUND */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-xl border"><label className="font-bold text-xs block mb-2">Header Background</label><input type="file" onChange={e=>setFileHeader(e.target.files?.[0]||null)} className="text-xs w-full" /></div>
                        <div className="p-4 bg-gray-50 rounded-xl border"><label className="font-bold text-xs block mb-2">Footer Background</label><input type="file" onChange={e=>setFileFooter(e.target.files?.[0]||null)} className="text-xs w-full" /></div>
                    </div>

                    {/* 🔥 4. POPUP IKLAN (DENGAN TOMBOL HAPUS) */}
                    <div className="p-6 bg-red-50 border border-red-100 rounded-2xl">
                         <div className="flex justify-between items-start mb-4">
                            <label className="text-sm font-bold text-red-700">🔥 Pop-up Iklan</label>
                            {/* Tombol Hapus Popup */}
                            {toko.popup_image && (
                                <button type="button" onClick={handleHapusPopup} className="text-xs bg-red-600 text-white px-3 py-1 rounded-lg font-bold hover:bg-red-700 flex items-center gap-1 transition shadow">
                                    <FaTrash /> Hapus Popup
                                </button>
                            )}
                        </div>
                        {toko.popup_image ? (
                            <img src={toko.popup_image} className="h-32 w-auto object-contain bg-white rounded-lg border mb-4" />
                        ) : (
                            <p className="text-xs text-gray-400 italic mb-4">Tidak ada iklan aktif.</p>
                        )}
                        <input type="file" onChange={e=>setFilePopup(e.target.files?.[0]||null)} className="w-full text-xs" />
                    </div>

                    <button disabled={savingTema} className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold hover:bg-purple-700 shadow-lg transition">{savingTema?'Menyimpan Perubahan...':'Simpan Semua Tampilan ✨'}</button>
                </form>
            </div>
        )}

        {/* --- TAB 4: TESTIMONI --- */}
        {activeTab === 'testimoni' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-3xl shadow-lg h-fit border border-green-200 sticky top-4">
                    <h2 className="font-bold mb-4 text-green-700 text-xl">{idTesti?'Edit Testimoni':'Tambah Testimoni'}</h2>
                    <form onSubmit={handleSimpanTesti} className="space-y-4">
                        <div><label className="text-xs font-bold text-gray-500">Nama</label><input className="w-full p-3 border rounded-xl" value={namaTesti} onChange={e=>setNamaTesti(e.target.value)} required /></div>
                        <div><label className="text-xs font-bold text-gray-500">Role / Pekerjaan</label><input className="w-full p-3 border rounded-xl" value={roleTesti} onChange={e=>setRoleTesti(e.target.value)} required /></div>
                        <div><label className="text-xs font-bold text-gray-500">Isi Review</label><textarea className="w-full p-3 border rounded-xl h-24" value={textTesti} onChange={e=>setTextTesti(e.target.value)} required /></div>
                        <div><label className="text-xs font-bold text-gray-500">Avatar</label><select className="w-full p-3 border rounded-xl text-2xl" value={avatarTesti} onChange={e=>setAvatarTesti(e.target.value)}><option>😎</option><option>👩‍💻</option><option>🤴</option><option>👸</option><option>🔥</option></select></div>
                        <button className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg">Simpan Testimoni</button>
                    </form>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
                    <div className="space-y-4">
                        {daftarTesti.map(t=>(
                            <div key={t.id} className={`flex gap-4 p-4 border rounded-2xl items-start ${t.tampil ? 'bg-white' : 'bg-gray-50'}`}>
                                <div className="text-3xl p-2 bg-gray-100 rounded-full">{t.avatar}</div>
                                <div className="flex-grow">
                                    <div className="flex justify-between">
                                        <h3 className="font-bold text-gray-800">{t.nama} <span className="text-xs text-gray-500 font-normal">({t.role})</span></h3>
                                        <div className="flex gap-2">
                                            <button onClick={()=>toggleStatusTesti(t.id, t.tampil)} className={`text-xs px-2 py-1 rounded font-bold ${t.tampil?'bg-green-100 text-green-700':'bg-gray-200 text-gray-600'}`}>{t.tampil?'Tampil':'Sembunyi'}</button>
                                            <button onClick={()=>handleEditTesti(t)} className="text-orange-500 bg-orange-50 p-1.5 rounded hover:bg-orange-100"><FaPalette /></button>
                                            <button onClick={()=>handleHapusTesti(t.id)} className="text-red-500 bg-red-50 p-1.5 rounded hover:bg-red-100"><FaTrash /></button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1 italic">"{t.text}"</p>
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