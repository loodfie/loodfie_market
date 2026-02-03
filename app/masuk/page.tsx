'use client'

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// 👇 Import Toast
import toast from 'react-hot-toast';

export default function UserAuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isDaftar, setIsDaftar] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleAuth(e: any) {
    e.preventDefault();
    setLoading(true);

    // Tampilkan Loading Toast
    const loadingToast = toast.loading('Sedang memproses...');

    try {
        if (isDaftar) {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            });
            if (error) throw error;
            
            // 👇 Ganti Alert jadi Toast Success
            toast.dismiss(loadingToast); // Tutup loading
            toast.success("✅ Pendaftaran Berhasil! Kamu otomatis login.");
        } else {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;

            // 👇 Ganti Alert jadi Toast Success
            toast.dismiss(loadingToast);
            toast.success("👋 Berhasil Masuk! Selamat datang.");
        }

        router.push('/');
        router.refresh();

    } catch (error: any) {
        toast.dismiss(loadingToast);
        // 👇 Ganti Alert jadi Toast Error
        toast.error("❌ Gagal: " + error.message);
    } finally {
        setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        
        <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">
            {isDaftar ? 'Daftar Akun Baru 📝' : 'Silakan Masuk 👋'}
        </h1>
        <p className="text-center text-gray-500 mb-6 text-sm">
            {isDaftar ? 'Isi data untuk mulai belanja' : 'Masuk untuk melanjutkan pembelian'}
        </p>

        <form onSubmit={handleAuth} className="space-y-4">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="nama@email.com"
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Minimal 6 karakter"
                />
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
            >
                {loading ? 'Memproses...' : (isDaftar ? 'Daftar Sekarang' : 'Masuk')}
            </button>
        </form>

        <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
                {isDaftar ? 'Sudah punya akun?' : 'Belum punya akun?'}
                <button 
                    onClick={() => setIsDaftar(!isDaftar)}
                    className="text-blue-600 font-bold ml-1 hover:underline"
                >
                    {isDaftar ? 'Login disini' : 'Daftar disini'}
                </button>
            </p>
        </div>

        <Link href="/" className="block text-center mt-4 text-xs text-gray-400 hover:text-gray-600">
            ← Kembali ke Toko
        </Link>

      </div>
    </div>
  );
}