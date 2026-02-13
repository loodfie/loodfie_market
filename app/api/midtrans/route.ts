import { NextResponse } from 'next/server';

// @ts-ignore
import Midtrans from 'midtrans-client'; // 👈 Mantra ini bikin error merah jadi hilang!

export async function POST(request: Request) {
    const { id, total, items, customer } = await request.json();

    const snap = new Midtrans.Snap({
        isProduction: true, // Live Mode
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
        const token = await snap.createTransaction(parameter);
        console.log("✅ Token Sukses:", token);
        return NextResponse.json(token);
    } catch (error: any) {
        console.error("🔥 Error Midtrans:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}