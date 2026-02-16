import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { id, total, items, customer } = await request.json();

        // 1. AMBIL KUNCI DARI VERCEL
        const serverKey = process.env.MIDTRANS_SERVER_KEY;
        
        // DEBUG: Cek apakah kunci terbaca (Tanpa membocorkan kunci asli)
        console.log("🔍 Cek Server Key:", serverKey ? "✅ ADA (Awalan: " + serverKey.substring(0, 4) + "...)" : "❌ KOSONG/UNDEFINED");

        if (!serverKey) {
            throw new Error("Server Key belum disetting di Vercel Environment Variables!");
        }

        // 2. ENCODE BASE64 (Cara Resmi Midtrans)
        const base64Key = Buffer.from(serverKey + ":").toString('base64');

        // 3. FETCH KE SANDBOX
        const response = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Basic ${base64Key}` 
            },
            body: JSON.stringify({
                transaction_details: {
                    order_id: id,
                    gross_amount: Math.round(Number(total)),
                },
                item_details: items.map((item: any) => ({
                    id: item.id,
                    price: Math.round(Number(item.price)),
                    quantity: Math.round(Number(item.quantity)),
                    name: item.name.substring(0, 50)
                })),
                customer_details: {
                    first_name: customer.name || 'Pelanggan',
                    email: customer.email,
                },
                callbacks: {
                    finish: 'https://loodfie-market-oy4u.vercel.app/dashboard'
                }
            })
        });

        const data = await response.json();

        // 4. CEK HASIL
        if (!response.ok) {
            console.error("🔥 Midtrans Menolak:", JSON.stringify(data));
            throw new Error(`Midtrans Error: ${data.error_messages?.[0] || 'Unknown Error'}`);
        }

        console.log("✅ Token Berhasil:", data.token);
        return NextResponse.json(data);

    } catch (error: any) {
        console.error("🔥 System Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}