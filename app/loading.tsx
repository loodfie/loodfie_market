export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 space-y-4">
      {/* Animasi Lingkaran Berputar */}
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      
      {/* Teks Kedip-kedip */}
      <p className="font-bold text-gray-400 animate-pulse text-lg tracking-wider">
        MEMUAT TOKO...
      </p>
    </div>
  );
}