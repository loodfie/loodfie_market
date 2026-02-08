'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import FloatingWA from './components/FloatingWA';
import { FaChevronDown, FaChevronUp, FaStar, FaUsers, FaDownload, FaCheckCircle, FaInstagram, FaFacebookF, FaTiktok } from 'react-icons/fa';

function PopupIklan({ gambar, onClose }: { gambar: string, onClose: () => void }) {
    if (!gambar) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="relative bg-white p-2 rounded-2xl max-w-md w-full shadow-2xl transform scale-100 transition-transform">
                <button onClick={onClose} className="absolute -top-3 -right-3 bg-red-500 text-white w-8 h-8 rounded-full font-bold shadow-lg hover:bg-red-600">✕</button>
                <img src={gambar} alt="Promo" className="w-full h-auto rounded-xl" />
                <div className="mt-3 text-center"><button onClick={onClose} className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-sm shadow hover:bg-blue-700 w-full">Serbu Sekarang! 🔥</button></div>
            </div>
        </div>
    );
}

// 🔥 POPUP INPUT TESTIMONI (UNTUK KLIEN)
function PopupTestimoni({ onClose }: { onClose: () => void }) {
    const [nama, setNama] = useState('');
    const [role, setRole] = useState('');
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);

    const kirimTesti = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Default tampil = FALSE (Harus diapprove admin dulu)
        const { error } = await supabase.from('testimoni').insert([{ nama, role, text, avatar: '👤', tampil: false }]);
        setLoading(false);
        if (error) {
            toast.error("Gagal mengirim.");
        } else {
            toast.success("Terkirim! Menunggu persetujuan admin.", { duration: 4000 });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="relative bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">✕</button>
                <h3 className="text-xl font-bold mb-1 text-center">Tulis Ulasan ✍️</h3>
                <p className="text-xs text-gray-500 text-center mb-4">Bagikan pengalamanmu berbelanja di sini.</p>
                <form onSubmit={kirimTesti} className="space-y-3">
                    <input required className="w-full p-3 bg-gray-50 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nama Kamu" value={nama} onChange={e => setNama(e.target.value)} />
                    <input required className="w-full p-3 bg-gray-50 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Pekerjaan (cth: Mahasiswa)" value={role} onChange={e => setRole(e.target.value)} />
                    <textarea required className="w-full p-3 bg-gray-50 rounded-xl text-sm border focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none" placeholder="Ceritakan kepuasanmu..." value={text} onChange={e => setText(e.target.value)}></textarea>
                    <button disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg disabled:opacity-50">
                        {loading ? 'Mengirim...' : 'Kirim Ulasan 🚀'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function Home() {
  const [produk, setProduk] = useState<any[]>([]);
  const [filteredProduk, setFilteredProduk] = useState<any[]>([]);
  
  const [toko, setToko] = useState({ 
    nama_toko: 'Loodfie Market', deskripsi: 'Pusat Produk Digital Terlengkap', header_bg: null, footer_bg: null, popup_image: null, font_style: 'Inter',
    running_text: '🔥 Selamat Datang di Loodfie Market! Pusat Produk Digital Terbaik & Terpercaya. Garansi Akses Selamanya! 🚀',
    total_member: '2,500+', total_terjual: '10,000+', kepuasan: '99%'
  });
  
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('Semua');
  const [showPopup, setShowPopup] = useState(false);
  const [showTestiForm, setShowTestiForm] = useState(false); // 🔥 STATE POPUP TESTI
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [testimoni, setTestimoni] = useState<any[]>([]);

  const emailBos = "pordjox75@gmail.com"; 
  const router = useRouter();
  const socialLinks = { instagram: "https://www.instagram.com/loodfie/", facebook: "https://www.facebook.com/loodfie", tiktok: "https://www.tiktok.com/@loodfie" };

  const stats = [
    { label: "Member", value: toko.total_member, icon: <FaUsers /> },
    { label: "Terjual", value: toko.total_terjual, icon: <FaDownload /> },
    { label: "Kepuasan", value: toko.kepuasan, icon: <FaCheckCircle /> },
  ];

  const faqList = [
    { tanya: "Bagaimana cara membeli produk?", jawab: "Pilih produk, klik 'Beli', lalu selesaikan pembayaran. File akan dikirim otomatis ke email/dashboard Anda." },
    { tanya: "Apakah produk dikirim fisik?", jawab: "Tidak. Ini produk digital (Softfile). Hemat ongkir dan langsung sampai detik itu juga!" },
    { tanya: "Apakah ada garansi?", jawab: "Ya! Garansi akses selamanya. File hilang? Rusak? Kami kirim ulang GRATIS." },
    { tanya: "Metode pembayaran apa saja?", jawab: "Transfer Bank (BCA, Mandiri, BRI) dan E-Wallet (DANA, OVO, Gopay, QRIS)." },
  ];

  const toggleFaq = (index: number) => setOpenFaq(openFaq === index ? null : index);

  useEffect(() => {
    async function initData() {
      const { data: { session } } = await supabase.auth.getSession(); setUser(session?.user || null);
      
      const { data: dataProduk } = await supabase.from('produk').select('*').order('id', { ascending: false });
      if (dataProduk) { setProduk(dataProduk); setFilteredProduk(dataProduk); }
      
      const { data: dataToko } = await supabase.from('toko').select('*').single();
      if (dataToko) {
          setToko(prev => ({ ...prev, ...dataToko, running_text: dataToko.running_text || prev.running_text }));
          if (dataToko.popup_image) setShowPopup(true);
      }

      // 🔥 FILTER: HANYA TAMPILKAN YANG SUDAH DI-APPROVE (tampil = true)
      const { data: dataTesti } = await supabase.from('testimoni').select('*').eq('tampil', true).order('id', { ascending: false });
      if (dataTesti && dataTesti.length > 0) {
          setTestimoni(dataTesti);
      } else {
          setTestimoni([
            { nama: "Budi Santoso", role: "Freelancer", text: "Gila sih, template-nya premium banget! Hemat waktu ngerjain projek klien.", avatar: "👨‍💻" },
            { nama: "Siti Aminah", role: "Content Creator", text: "Ebook-nya daging semua isinya. Bahasanya mudah dimengerti.", avatar: "🧕" },
          ]);
      }
    }
    initData();
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fontMap: any = { 'Inter': 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700;900&display=swap', 'Poppins': 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;700;900&display=swap', 'Playfair Display': 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap', 'Roboto Mono': 'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap', 'Lobster': 'https://fonts.googleapis.com/css2?family=Lobster&display=swap', 'Dancing Script': 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap', 'Oswald': 'https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&display=swap', 'Montserrat': 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap' };
  useEffect(() => { let hasil = produk; if (selectedKategori !== 'Semua') { hasil = hasil.filter(item => item.kategori && item.kategori.toLowerCase() === selectedKategori.toLowerCase()); } if (searchTerm) { hasil = hasil.filter(item => item.nama_produk.toLowerCase().includes(searchTerm.toLowerCase())); } setFilteredProduk(hasil); }, [searchTerm, selectedKategori, produk]);
  const handleLogout = async () => { const toastId = toast.loading("Keluar..."); await supabase.auth.signOut(); setUser(null); router.refresh(); toast.success("Berhasil Keluar! 👋", { id: toastId }); };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900" style={{ fontFamily: `"${toko.font_style}", sans-serif` }}>
      <Toaster position="bottom-left" /> <FloatingWA />
      {showPopup && toko.popup_image && (<PopupIklan gambar={toko.popup_image} onClose={() => setShowPopup(false)} />)}
      {/* 🔥 FORM INPUT KLIEN */}
      {showTestiForm && <PopupTestimoni onClose={() => setShowTestiForm(false)} />}
      
      <style jsx global>{` @import url('${fontMap[toko.font_style] || fontMap['Inter']}'); `}</style>

      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-2.5' : 'bg-transparent py-4'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}><div className="w-8 h-8 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center text-white font-bold text-base shadow border border-white/20">L</div><span className={`text-lg font-bold tracking-tight ${scrolled ? 'text-gray-900' : 'text-white drop-shadow-md'}`}>{toko.nama_toko}</span></div>
          <div className="flex items-center gap-3">{user?.email === emailBos && (<Link href="/admin" className="hidden md:flex items-center gap-2 bg-gray-900 text-white px-3 py-1.5 rounded-full font-bold text-[11px] shadow-lg hover:bg-gray-700 transition">⚙️ Admin</Link>)}{user ? (<><Link href="/dashboard" className="hidden md:flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur px-3 py-1.5 rounded-full border border-white/20 transition text-white font-bold text-[11px]">Dashboard</Link><button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1.5 rounded-full font-bold text-[11px] shadow hover:bg-red-600 transition">Keluar</button></>) : (<Link href="/masuk" className="bg-white text-blue-600 px-4 py-1.5 rounded-full font-bold text-[11px] shadow hover:scale-105 transition">Masuk</Link>)}</div>
        </div>
      </nav>

      {/* HEADER HERO */}
      <header className="relative pt-28 pb-16 px-6 text-center overflow-hidden rounded-b-[2rem] shadow-lg bg-gray-900">
        {toko.header_bg ? (<><div className="absolute inset-0 z-0"><img src={toko.header_bg} className="w-full h-full object-cover opacity-80" /></div><div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30 z-0"></div></>) : (<div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 z-0"><div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div></div>)}
        <div className="relative z-10 max-w-3xl mx-auto text-white">
          <span className="bg-white/20 backdrop-blur px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase mb-3 inline-block border border-white/30">Platform Digital No. #1</span>
          <h1 className="text-2xl md:text-4xl font-extrabold mb-3 tracking-tight leading-tight drop-shadow-lg">{toko.nama_toko}</h1>
          <p className="text-gray-100 text-sm md:text-base mb-6 font-light max-w-xl mx-auto leading-relaxed drop-shadow-md">{toko.deskripsi}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center"><button onClick={() => document.getElementById('produk-area')?.scrollIntoView({ behavior: 'smooth' })} className="bg-white text-gray-900 px-5 py-2.5 rounded-full font-bold text-sm shadow-xl hover:scale-105 transition">Mulai Belanja 🛍️</button></div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-yellow-400 text-yellow-900 py-2 overflow-hidden z-20 shadow-inner border-t-2 border-yellow-300"><div className="flex whitespace-nowrap animate-marquee">{[...Array(10)].map((_, i) => (<div key={i} className="flex items-center mx-6 gap-6"><span className="font-bold text-sm tracking-wide uppercase">{toko.running_text}</span><span className="text-lg animate-pulse">{i % 3 === 0 ? '🔥' : i % 3 === 1 ? '⚡' : '🚀'}</span></div>))}</div></div>
      </header>

      {/* STATISTIK TOKO */}
      <section className="max-w-4xl mx-auto mt-6 px-4 relative z-10">
        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100 grid grid-cols-3 gap-2 items-center divide-x divide-gray-100">
            {stats.map((stat, idx) => (
                <div key={idx} className="text-center px-2">
                    <div className="text-blue-600 text-xl flex justify-center mb-1">{stat.icon}</div>
                    <div className="text-lg font-extrabold text-gray-900 leading-tight">{stat.value}</div>
                    <div className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">{stat.label}</div>
                </div>
            ))}
        </div>
      </section>

      {/* AREA PRODUK */}
      <div id="produk-area" className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white p-3 rounded-xl shadow-md border border-gray-100 flex flex-col md:flex-row gap-3 items-center">
                <input type="text" placeholder="Cari produk..." className="w-full pl-4 pr-4 py-2 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto scrollbar-hide">{['Semua', 'Ebook', 'Template', 'Video'].map((kat) => (<button key={kat} onClick={() => setSelectedKategori(kat)} className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${selectedKategori === kat ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{kat}</button>))}</div>
            </div>
        </div>
        {filteredProduk.length === 0 ? (<div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300"><p className="text-gray-400 text-sm">Produk tidak ditemukan...</p></div>) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
                {filteredProduk.map((item) => (
                    <div key={item.id} className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden border border-gray-100 flex flex-col h-full relative">
                        {item.harga_coret && item.harga_coret > item.harga && (<div className="absolute top-2 right-2 z-10 bg-red-500 text-white text-[9px] font-bold px-2 py-1 rounded shadow-md animate-pulse">Hemat {Math.round(((item.harga_coret - item.harga) / item.harga_coret) * 100)}%</div>)}
                        <div className="h-36 bg-gray-100 flex items-center justify-center relative overflow-hidden"><img src={item.gambar} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" /><span className="absolute top-2 left-2 bg-white/90 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide shadow-sm">{item.kategori}</span></div>
                        <div className="p-3 flex flex-col flex-grow"><h3 className="text-sm font-bold mb-1 group-hover:text-blue-600 transition leading-snug line-clamp-2">{item.nama_produk}</h3><p className="text-gray-500 text-[11px] mb-2 line-clamp-2">{item.deskripsi}</p><div className="mt-auto pt-2 border-t border-gray-100">{item.harga_coret && item.harga_coret > item.harga && (<p className="text-[10px] text-gray-400 line-through">Rp {Number(item.harga_coret).toLocaleString('id-ID')}</p>)}<div className="flex justify-between items-center"><span className="text-sm font-extrabold text-blue-600">Rp {Number(item.harga).toLocaleString('id-ID')}</span><Link href={`/produk/${item.id}`} className="bg-gray-900 text-white w-7 h-7 rounded-full flex items-center justify-center hover:bg-blue-600 transition shadow-md text-[10px]">➜</Link></div></div></div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* TESTIMONI DINAMIS */}
      <section className="bg-blue-50 py-12 mt-12">
        <div className="container mx-auto px-6">
            <h2 className="text-2xl font-bold text-center mb-4 flex items-center justify-center gap-2">💬 Apa Kata Mereka?</h2>
            {/* 🔥 TOMBOL KIRIM TESTI */}
            <div className="flex justify-center mb-8">
                <button onClick={() => setShowTestiForm(true)} className="bg-white border border-blue-200 text-blue-600 px-5 py-2 rounded-full font-bold text-xs hover:bg-blue-600 hover:text-white transition shadow-sm flex items-center gap-2">
                    ✍️ Tulis Ulasan
                </button>
            </div>
            {testimoni.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimoni.map((user, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl">{user.avatar}</div>
                                <div><p className="font-bold text-sm text-gray-900">{user.nama}</p><p className="text-xs text-gray-500">{user.role}</p></div>
                            </div>
                            <p className="text-gray-600 text-sm italic">"{user.text}"</p>
                            <div className="flex text-yellow-400 text-xs mt-3 gap-0.5"><FaStar /><FaStar /><FaStar /><FaStar /><FaStar /></div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-400 text-sm italic">Belum ada testimoni. Jadilah yang pertama!</p>
            )}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="container mx-auto px-6 py-12"><div className="max-w-3xl mx-auto"><h2 className="text-2xl font-bold text-center mb-8">❓ FAQ</h2><div className="space-y-4">{faqList.map((item, index) => (<div key={index} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"><button onClick={() => toggleFaq(index)} className={`w-full flex justify-between items-center p-4 text-left font-bold text-sm transition-colors ${openFaq === index ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-800 hover:bg-gray-50'}`}><span>{item.tanya}</span>{openFaq === index ? <FaChevronUp className="text-blue-500"/> : <FaChevronDown className="text-gray-400"/>}</button>{openFaq === index && (<div className="p-4 bg-gray-50 text-sm text-gray-600 border-t border-gray-100 leading-relaxed animate-fadeIn">{item.jawab}</div>)}</div>))}</div></div></section>
      
      <footer className="relative bg-gray-900 text-white pt-10 pb-6 border-t-4 border-blue-500 overflow-hidden">
        {toko.footer_bg && (<><div className="absolute inset-0 z-0"><img src={toko.footer_bg} className="w-full h-full object-cover opacity-60" /></div><div className="absolute inset-0 bg-black/80 z-0"></div></>)}
        <div className="relative container mx-auto px-6 z-10"><div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8"><div><h3 className="text-lg font-bold mb-3 flex items-center gap-2"><span className="bg-gradient-to-br from-blue-600 to-cyan-500 text-white w-7 h-7 rounded-lg flex items-center justify-center text-xs shadow-lg">L</span>{toko.nama_toko}</h3><p className="text-gray-300 text-sm leading-relaxed mb-4 pr-4">Platform jual beli produk digital terpercaya. Garansi akses selamanya.</p><div className="flex gap-2.5"><a href={socialLinks.instagram} target="_blank" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition shadow border border-gray-700 text-lg"><FaInstagram /></a><a href={socialLinks.facebook} target="_blank" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition shadow border border-gray-700 text-lg"><FaFacebookF /></a><a href={socialLinks.tiktok} target="_blank" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-black hover:text-white hover:border-white transition shadow border border-gray-700 text-lg"><FaTiktok /></a></div></div><div><h4 className="text-sm font-bold mb-3 text-blue-400 uppercase tracking-wider">Menu Pintas</h4><ul className="space-y-2 text-gray-300 text-sm"><li><Link href="/" className="hover:text-white transition flex items-center gap-2">🏠 Beranda</Link></li><li><Link href="/dashboard" className="hover:text-white transition flex items-center gap-2">👤 Member Area</Link></li></ul></div><div><h4 className="text-sm font-bold mb-3 text-blue-400 uppercase tracking-wider">Metode Pembayaran</h4><div className="flex flex-wrap gap-1 mb-3">{['BCA', 'Mandiri', 'BRI', 'DANA', 'OVO', 'Gopay', 'QRIS'].map((bank) => (<span key={bank} className="bg-white text-blue-900 px-2 py-0.5 rounded font-bold text-[9px] shadow-sm cursor-default">{bank}</span>))}</div><div className="p-3 bg-gray-800/80 backdrop-blur rounded-xl border border-gray-700 flex items-center gap-3"><span className="text-xl">🔒</span><div><p className="text-xs font-bold text-gray-200">Jaminan Keamanan 100%</p><p className="text-[9px] text-gray-400 mt-0.5">Transaksi terenkripsi & data privasi terjaga.</p></div></div></div></div><div className="border-t border-gray-800 pt-4 text-center relative z-10"><p className="text-gray-500 text-xs">&copy; {new Date().getFullYear()} <span className="text-white font-bold">{toko.nama_toko}</span>. All rights reserved.</p></div></div>
      </footer>
    </div>
  );
}