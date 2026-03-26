import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: Request, { params }: { params: Promise<{ reference: string }> }) {
    const { reference } = await params;
    
    try {
        const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
        });
        
        const data = await res.json();
        if (!data.status) {
            return NextResponse.json({ error: data.message }, { status: 400 });
        }

        const tx = data.data;
        const status = tx.status; // 'success', 'failed', 'abandoned'
        const amount = tx.amount / 100;
        const meta = tx.metadata || {};
        const type = meta.type || 'unknown';
        const userId = meta.userId;
        const orderId = meta.orderId;

        const supabase = await createClient();

        if (status === 'success') {
            // Immediately execute fulfillment for known specific synchronous types over verify hook 
            // (Note: webhooks act as a reliable fallback/async trigger)
            
            if (type === 'wallet_topup' && userId) {
                // Check if this reference is already in wallet_transactions to prevent double crediting
                const { data: existing } = await supabase.from('wallet_transactions').select('id').eq('reference', reference).single();
                if (!existing) {
                    await supabase.from('wallet_transactions').insert({
                        user_id: userId,
                        amount,
                        type: 'credit',
                        reference,
                        description: 'Paystack Wallet Top-up'
                    });
                    
                    // Increment wallet
                    const { data: userProfile } = await supabase.from('profiles').select('wallet_balance').eq('id', userId).single();
                    if (userProfile) {
                        await supabase.from('profiles').update({ wallet_balance: userProfile.wallet_balance + amount }).eq('id', userId);
                    }
                }
            }

            if (type === 'order' && orderId) {
                await supabase.from('express_orders').update({ status: 'paid' }).eq('id', orderId);
            }
        }

        return NextResponse.json({
            status,
            amount,
            type,
            orderId,
            reference
        });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
