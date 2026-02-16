import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
// Kita pakai Script bawaan Next.js biar loading lancar
import Script from "next/script"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Loodfie Market",
  description: "Marketplace Produk Digital Terpercaya",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* 👇 INI KUNCINYA BOS! Script Jembatan Midtrans Sandbox */}
        {/* Kita pasang Client Key Sandbox langsung disini (Hardcode) biar 100% Akur */}
        <script
          type="text/javascript"
          src="https://app.sandbox.midtrans.com/snap/snap.js" 
          data-client-key="Mid-client-oXTEmTWQwcCK6cKR"
        ></script>
      </head>
      <body className={inter.className}>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}