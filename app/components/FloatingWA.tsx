'use client'

import { FaWhatsapp } from 'react-icons/fa';

export default function FloatingWA() {
  return (
    <a 
      href="https://wa.me/6285314445959?text=Halo%20Admin,%20saya%20tertarik%20dengan%20produk%20di%20Loodfie%20Market"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:bg-green-600 hover:scale-110 transition-all duration-300 animate-bounce-slow group"
      aria-label="Chat WhatsApp"
    >
      {/* Efek Ping (Gelombang) */}
      <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping group-hover:hidden"></span>
      
      {/* Ikon WA */}
      <FaWhatsapp className="text-3xl relative z-10" />
      
      {/* Tooltip (Muncul pas di-hover) */}
      <span className="absolute right-16 bg-white text-gray-800 text-xs font-bold px-3 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
        Hubungi Admin
      </span>
    </a>
  );
}