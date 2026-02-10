import { ImageResponse } from 'next/og'

// Ukuran Gambar
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// 🔥 INI BAGIAN YANG MENGGAMBAR LOGO
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: '#2563eb', // Ini kode warna BIRU
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',        // Ini warna huruf PUTIH
          borderRadius: '8px',   // Ini bikin sudutnya TUMPUL
          fontWeight: 800,
        }}
      >
        L 
      </div>
    ),
    { ...size }
  )
}