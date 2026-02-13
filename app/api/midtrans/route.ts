import { NextResponse } from 'next/server';
const Midtrans = require('midtrans-client'); // Kita pakai require biar lebih aman

export async function POST(request: Request) {
    const { id, total, items, customer } = await request.json();

    // Setup Midtrans dengan Kunci Production Bos
    let snap = new Midtrans.Snap({
        isProduction: true, // 🔥 SUDAH SAYA SET TRUE (LIVE)
        serverKey: process.env.MIDTRANS_SERVER_KEY,
        clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
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
        }
    };

    try {
        // Minta Token Transaksi ke Midtrans
        const token = await snap.createTransaction(parameter);
        return NextResponse.json(token);
    } catch (error) {
        console.log('Midtrans Error:', error);
        return NextResponse.json({ error: 'Gagal memproses token' }, { status: 500 });
    }
}