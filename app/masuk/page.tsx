'use client'

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
// Perbaikan: FaEnvelope sudah benar (huruf besar E)
import { FaArrowLeft, FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Sedang memverifikasi...");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Login Berhasil! Mengalihkan...", { id: toastId });
      router.push('/dashboard');
      router.refresh();
      
    } catch (err: any) {
      toast.error("Gagal Masuk: " + err.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <Toaster position="top-center" />
      
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 relative">
        
        {/* TOMBOL KEMBALI */}
        <div className="absolute top-4 left-4 z-10">
            <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition font-bold text-sm bg-gray-100 hover:bg-blue-50 px-3 py-2 rounded-xl">
                <FaArrowLeft /> Kembali
            </Link>
        </div>

        <div className="p-8 pt-16">
          <div className="text-center mb-8">
            <div className="bg-blue-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow-lg shadow-blue-500/30">
              L
            </div>
            <h1 className="text-2xl font-black text-gray-800">Selamat Datang! 👋</h1>
            <p className="text-gray-500 text-sm mt-2">Masuk untuk mengakses produk digitalmu.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 ml-1 uppercase tracking-wide">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400"><FaEnvelope /></span> 
                </div>
                <input 
                  type="email" 
                  required 
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition outline-none bg-gray-50 focus:bg-white" 
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 ml-1 uppercase tracking-wide">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <span className="text-gray-400"><FaLock /></span>
                </div>
                <input 
                  type="password" 
                  required 
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition outline-none bg-gray-50 focus:bg-white" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              disabled={loading} 
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-600/40 transition transform active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="animate-pulse">Memproses...</span>
              ) : (
                <>Masuk Sekarang <FaSignInAlt /></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
              Belum punya akun? <Link href="/" className="text-blue-600 font-bold hover:underline">Hubungi Admin</Link> untuk beli produk.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}