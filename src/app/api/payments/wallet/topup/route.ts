import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
    try {
        const { userId, amount } = await req.json();

        const supabase = await createClient();
        const { data: user } = await supabase.from('profiles').select('email').eq('id', userId).single();
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const res = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: user.email,
                amount: amount * 100,
                metadata: {
                    userId,
                    type: 'wallet_topup'
                }
            })
        });

        const data = await res.json();
        if (!data.status) {
            return NextResponse.json({ error: data.message }, { status: 400 });
        }

        return NextResponse.json({
            authorization_url: data.data.authorization_url,
            reference: data.data.reference
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
