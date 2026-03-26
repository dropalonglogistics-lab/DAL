import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
    try {
        const bodyStr = await req.text();
        const signature = req.headers.get('x-paystack-signature');

        const secret = process.env.PAYSTACK_SECRET_KEY || '';
        const hash = crypto.createHmac('sha512', secret).update(bodyStr).digest('hex');

        if (hash !== signature) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        const event = JSON.parse(bodyStr);
        const { event: eventName, data } = event;

        const supabase = await createClient();

        switch (eventName) {
            case 'charge.success':
                // Single charges (Topups or standard checkout)
                const type = data.metadata?.type;
                const userId = data.metadata?.userId;
                const orderId = data.metadata?.orderId;
                const reference = data.reference;

                if (type === 'wallet_topup' && userId) {
                    const { data: existing } = await supabase.from('wallet_transactions').select('id').eq('reference', reference).single();
                    if (!existing) {
                        const amount = data.amount / 100;
                        await supabase.from('wallet_transactions').insert({
                            user_id: userId, amount, type: 'credit', reference, description: 'Paystack Wallet Top-up'
                        });
                        const { data: p } = await supabase.from('profiles').select('wallet_balance').eq('id', userId).single();
                        if (p) await supabase.from('profiles').update({ wallet_balance: p.wallet_balance + amount }).eq('id', userId);
                    }
                } else if (type === 'order' && orderId) {
                    await supabase.from('express_orders').update({ status: 'paid' }).eq('id', orderId);
                    await supabase.from('errand_orders').update({ status: 'paid' }).eq('id', orderId); // Updates whichever exists
                }
                break;

            case 'subscription.create':
                // User subscribed successfully
                const customerEmail = data.customer?.email;
                if (customerEmail) {
                    const { data: userObj } = await supabase.from('profiles').select('id').eq('email', customerEmail).single();
                    if (userObj) {
                        // Assuming standard plan gives 30 days
                        const expiresAt = new Date();
                        expiresAt.setDate(expiresAt.getDate() + 30);
                        
                        await supabase.from('profiles')
                            .update({ 
                                is_premium: true, 
                                premium_expires_at: expiresAt.toISOString() 
                            })
                            .eq('id', userObj.id);
                    }
                }
                break;

            case 'subscription.not_renew':
                // Flag expiring but do not remove until expired
                break;

            case 'subscription.disable':
                // Subscription cancelled/failed
                const cEmail = data.customer?.email;
                if (cEmail) {
                    await supabase.from('profiles').update({ is_premium: false }).eq('email', cEmail);
                }
                break;

            case 'transfer.success':
                // Outbound payout resolved
                const transferRef = data.reference;
                await supabase.from('payouts').update({ status: 'paid' }).eq('reference', transferRef);
                break;

            case 'transfer.failed':
                // Outbound payout failed
                await supabase.from('payouts').update({ status: 'failed' }).eq('reference', data.reference);
                break;
        }

        return NextResponse.json({ status: 'success' });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
