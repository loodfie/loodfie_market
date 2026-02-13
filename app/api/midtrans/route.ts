import { NextResponse } from 'next/server';
import Midtrans from 'midtrans-client'; // 👈 Kita pakai import, bukan require

export async function POST(request: Request) {
    const { id, total, items, customer } = await request.json();

    // 1. Setup Snap Midtrans
    const snap = new Midtrans.Snap({
        isProduction: true, // Mode Live
        serverKey: process.env.MIDTRANS_SERVER_KEY,
        clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
    });

    const parameter = {
        transaction_details: {
            order_id: id,
            gross_amount: total,
        },
        item_details: items,
        customer_details: {
            first_name: customer.name || 'Pelanggan',
            email: customer.email,
        },
        callbacks: {
            finish: 'https://loodfie-market.vercel.app/dashboard'
        }
    };

    try {
        // 2. Minta Token
        const token = await snap.createTransaction(parameter);
        console.log("✅ Token Sukses:", token);
        return NextResponse.json(token);
    } catch (error: any) {
        console.error("🔥 Gagal Minta Token:", error.message);
        // Kirim pesan error detail ke Frontend biar ketahuan
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}