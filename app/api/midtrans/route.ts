import { NextResponse } from 'next/server';
// @ts-ignore
import Midtrans from 'midtrans-client'; 

export async function POST(request: Request) {
    try {
        const { id, total, items, customer } = await request.json();

        // Debugging: Cek apakah Server Key terbaca di Vercel
        // Kita hanya log 5 huruf awal biar aman & tidak diblokir GitHub
        const serverKeyDebug = process.env.MIDTRANS_SERVER_KEY 
            ? process.env.MIDTRANS_SERVER_KEY.substring(0, 5) + "..." 
            : "KOSONG/TIDAK TERBACA";
            
        console.log("🔑 Debug Server Key:", serverKeyDebug);
        console.log("⚙️ Mode Production:", false);

        const snap = new Midtrans.Snap({
            isProduction: false, // Wajib FALSE untuk Sandbox
            serverKey: process.env.MIDTRANS_SERVER_KEY, 
            clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY, 
        });

        // Bersihkan Data
        const cleanItems = items.map((item: any) => ({
            id: item.id,
            price: Math.round(Number(item.price)),
            quantity: Math.round(Number(item.quantity)),
            name: item.name.substring(0, 50)
        }));

        const parameter = {
            transaction_details: {
                order_id: id,
                gross_amount: Math.round(Number(total)),
            },
            item_details: cleanItems,
            customer_details: {
                first_name: customer.name || 'Pelanggan',
                email: customer.email,
            },
            // Webhook & Redirect
            notification_url: "https://loodfie-market-oy4u.vercel.app/api/webhooks/midtrans",
            callbacks: {
                finish: 'https://loodfie-market-oy4u.vercel.app/dashboard'
            }
        };

        const token = await snap.createTransaction(parameter);
        console.log("✅ Token Sukses:", token);
        return NextResponse.json(token);

    } catch (error: any) {
        console.error("🔥 Error Midtrans:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
// Bismillah fix pembayaran