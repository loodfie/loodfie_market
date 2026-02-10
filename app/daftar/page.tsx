'use client'

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { FaArrowLeft, FaEnvelope, FaLock, FaUserPlus } from 'react-icons/fa';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Mendaftarkan akun...");

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Pendaftaran Berhasil! Silakan Masuk.", { id: toastId });
      // Setelah daftar sukses, arahkan ke halaman login
      setTimeout(() => {
        router.push('/masuk');
      }, 1500);
      
    } catch (err: any) {
      toast.error("Gagal Daftar: " + err.message, { id: toastId });
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
            <div className="bg-green-500 text-white w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow-lg shadow-green-500/30">
              <FaUserPlus />
            </div>
            <h1 className="text-2xl font-black text-gray-800">Daftar Member Baru</h1>
            <p className="text-gray-500 text-sm mt-2">Gabung sekarang dan nikmati akses produk digital.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 ml-1 uppercase tracking-wide">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400"><FaEnvelope /></span> 
                </div>
                <input 
                  type="email" 
                  required 
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition outline-none bg-gray-50 focus:bg-white" 
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
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition outline-none bg-gray-50 focus:bg-white" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              disabled={loading} 
              className="w-full bg-green-500 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-green-500/30 hover:bg-green-600 hover:shadow-green-600/40 transition transform active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="animate-pulse">Memproses...</span>
              ) : (
                <>Daftar Sekarang <FaUserPlus /></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
              Sudah punya akun? <Link href="/masuk" className="text-green-600 font-bold hover:underline">Masuk di sini</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}