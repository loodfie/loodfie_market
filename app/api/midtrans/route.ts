import { NextResponse } from 'next/server';

// @ts-ignore
import Midtrans from 'midtrans-client'; 

export async function POST(request: Request) {
    try {
        const { id, total, items, customer } = await request.json();

        // --- 🛡️ SECURITY CHECK 1: Cek Server Key ---
        if (!process.env.MIDTRANS_SERVER_KEY) {
            console.error("❌ MIDTRANS_SERVER_KEY tidak ditemukan di .env");
            return NextResponse.json({ error: "Konfigurasi Server Bermasalah" }, { status: 500 });
        }

        // --- 🛡️ SECURITY CHECK 2: Validasi Hitungan Matematika ---
        // Kita hitung ulang total dari item yang dikirim. Jangan percaya 'total' mentah dari frontend.
        const calculatedTotal = items.reduce((acc: number, item: any) => {
            return acc + (Number(item.price) * Number(item.quantity));
        }, 0);

        if (calculatedTotal !== Number(total)) {
            console.error(`🚨 PERCOBAAN MANIPULASI HARGA! Client: ${total}, Server: ${calculatedTotal}`);
            return NextResponse.json({ error: "Total harga tidak valid/dimanipulasi." }, { status: 400 });
        }

        // --- 🧹 DATA SANITIZATION (Pembersihan Data) ---
        // Midtrans mewajibkan harga bulat (integer), tidak boleh ada koma.
        const cleanItems = items.map((item: any) => ({
            id: item.id,
            price: Math.round(Number(item.price)), // Pastikan bulat
            quantity: Math.round(Number(item.quantity)),
            name: item.name.substring(0, 50) // Midtrans membatasi nama max 50 karakter
        }));

        const snap = new Midtrans.Snap({
            isProduction: true, // Pastikan ini true untuk Live Mode
            serverKey: process.env.MIDTRANS_SERVER_KEY,
            clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
        });

        const parameter = {
            transaction_details: {
                order_id: id,
                gross_amount: Math.round(calculatedTotal), // Pakai hasil hitungan server
            },
            item_details: cleanItems,
            customer_details: {
                first_name: customer.name || 'Pelanggan',
                email: customer.email,
            },
            callbacks: {
                finish: 'https://loodfie-market.vercel.app/dashboard' // Redirect setelah bayar
            }
        };

        const token = await snap.createTransaction(parameter);
        console.log("✅ Token Midtrans Berhasil Dibuat:", id);
        
        return NextResponse.json(token);

    } catch (error: any) {
        console.error("🔥 Error Midtrans:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}