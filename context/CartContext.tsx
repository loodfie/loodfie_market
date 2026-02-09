'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';

type CartItem = {
  id: number;
  nama_produk: string;
  harga: number; // Pastikan ini number
  gambar: string;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  totalHarga: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load dari LocalStorage saat pertama buka
  useEffect(() => {
    const savedCart = localStorage.getItem('keranjang_loodfie');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        // 🔥 FIX PENTING: Paksa konversi harga jadi Number saat load
        const fixedCart = parsedCart.map((item: any) => ({
          ...item,
          harga: Number(item.harga) 
        }));
        setItems(fixedCart);
      } catch (e) {
        console.error("Gagal load keranjang", e);
      }
    }
  }, []);

  // Simpan ke LocalStorage setiap ada perubahan
  useEffect(() => {
    localStorage.setItem('keranjang_loodfie', JSON.stringify(items));
  }, [items]);

  const addToCart = (newItem: CartItem) => {
    // Cek apakah barang sudah ada?
    const isExist = items.find(item => item.id === newItem.id);
    if (isExist) {
      toast.error("Barang ini sudah ada di keranjang!");
      return;
    }
    
    // 🔥 FIX PENTING: Pastikan harga yang masuk adalah Number
    const itemToSave = { ...newItem, harga: Number(newItem.harga) };
    
    setItems([...items, itemToSave]);
    toast.success("🛒 Masuk Keranjang!");
  };

  const removeFromCart = (id: number) => {
    setItems(items.filter(item => item.id !== id));
    toast.success("Dihapus dari keranjang");
  };

  const clearCart = () => setItems([]);

  // 🔥 RUMUS MATEMATIKA YANG BENAR
  // acc + Number(item.harga) -> Menjamin penjumlahan angka, bukan penggabungan teks
  const totalHarga = items.reduce((acc, item) => acc + Number(item.harga), 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, totalHarga }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart harus dipakai di dalam CartProvider");
  return context;
}