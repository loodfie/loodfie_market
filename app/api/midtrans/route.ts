import { NextResponse } from 'next/server';
const Midtrans = require('midtrans-client');

export async function POST(request: Request) {
    // 1. CEK KUNCI DULU (DEBUGGING)
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

    console.log("🔍 MENCARI KUNCI DI VERCEL...");
    
    if (!serverKey) {
        console.error("❌ GAWAT! Server Key TIDAK DITEMUKAN di Vercel Environment Variables!");
        return NextResponse.json({ error: 'Server Key Midtrans Kosong di Vercel' }, { status: 500 });
    } else {
        console.log("✅ Server Key Ada (Depan: " + serverKey.substring(0, 5) + "...)");
    }

    try {
        const { id, total, items, customer } = await request.json();

        // 2. SETUP MIDTRANS
        let snap = new Midtrans.Snap({
            isProduction: true, // SUDAH LIVE
            serverKey: serverKey,
            clientKey: clientKey
        });

        const parameter = {
            transaction_details: {
                order_id: id,
                gross_amount: total
            },
            item_details: items,
            customer_details: {
                first_name: customer.name,
                email: customer.email
            },
            callbacks: {
                finish: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://loodfie-market.vercel.app'}/dashboard`
            }
        };

        console.log("🚀 Mengirim request ke Midtrans untuk Order ID:", id);

        // 3. MINTA TOKEN
        const token = await snap.createTransaction(parameter);
        console.log("🎉 Token Berhasil Didapat:", token);
        
        return NextResponse.json(token);

    } catch (error: any) {
        // INI AKAN MUNCUL DI LOGS KALAU ERROR
        console.error("🔥 ERROR MIDTRANS ASLI:", error);
        console.error("Pesan Error:", error.message);
        
        return NextResponse.json({ error: error.message || 'Gagal memproses token' }, { status: 500 });
    }
}