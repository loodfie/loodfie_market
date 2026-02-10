import Link from 'next/link';
import { FaCompass } from 'react-icons/fa';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center px-4">
      <div className="text-9xl font-black text-gray-200 select-none">404</div>
      
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <FaCompass className="text-6xl text-blue-500 mb-4 animate-bounce" />
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          Waduh, Nyasar Bos?
        </h2>
        <p className="text-gray-500 mb-6 max-w-md">
          Halaman yang kamu cari sepertinya sudah hilang atau dipindahkan ke dimensi lain.
        </p>
        
        <Link 
          href="/" 
          className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold shadow-lg hover:bg-blue-700 hover:scale-105 transition transform"
        >
          Putar Balik ke Home 🏠
        </Link>
      </div>
    </div>
  );
}