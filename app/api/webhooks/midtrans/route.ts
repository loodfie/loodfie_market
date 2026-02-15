import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        // 1. Ambil Data Notifikasi dari Midtrans
        const text = await request.text();
        const notification = JSON.parse(text);

        const orderId = notification.order_id;
        const transactionStatus = notification.transaction_status;
        const fraudStatus = notification.fraud_status;
        const statusCode = notification.status_code;
        const grossAmount = notification.gross_amount;
        
        // 2. 🛡️ KEAMANAN: Verifikasi Signature Key (Supaya gak ditembak hacker)
        // Rumus: SHA512(order_id + status_code + gross_amount + ServerKey)
        const serverKey = process.env.MIDTRANS_SERVER_KEY;
        const mySignature = crypto
            .createHash('sha512')
            .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
            .digest('hex');

        if (notification.signature_key !== mySignature) {
            console.error("⛔ Signature Key Tidak Cocok! Potensi serangan Hacker.");
            return NextResponse.json({ message: 'Invalid Signature' }, { status: 403 });
        }

        console.log(`🔔 Webhook Midtrans Masuk: ${orderId} | Status: ${transactionStatus}`);

        // 3. Tentukan Status Transaksi
        let statusTransaksi = 'PENDING';

        if (transactionStatus == 'capture') {
            if (fraudStatus == 'challenge') {
                statusTransaksi = 'CHALLENGE';
            } else if (fraudStatus == 'accept') {
                statusTransaksi = 'LUNAS';
            }
        } else if (transactionStatus == 'settlement') {
            statusTransaksi = 'LUNAS';
        } else if (
            transactionStatus == 'cancel' ||
            transactionStatus == 'deny' ||
            transactionStatus == 'expire'
        ) {
            statusTransaksi = 'GAGAL';
        } else if (transactionStatus == 'pending') {
            statusTransaksi = 'PENDING';
        }

        // 4. Update Database Supabase Otomatis
        if (statusTransaksi === 'LUNAS' || statusTransaksi === 'GAGAL') {
            const { error } = await supabase
                .from('transaksi')
                .update({ status: statusTransaksi })
                .eq('order_id', orderId);

            if (error) {
                console.error("❌ Gagal Update Database:", error.message);
                return NextResponse.json({ message: 'Database Error' }, { status: 500 });
            }
            console.log(`✅ Database Updated: ${statusTransaksi} untuk Order ${orderId}`);
        }

        return NextResponse.json({ ok: true });

    } catch (error: any) {
        console.error("🔥 Webhook Error:", error.message);
        return NextResponse.json({ message: 'Error' }, { status: 500 });
    }
}