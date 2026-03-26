import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { userId, email, planCode } = await req.json();

        // 1 NGN = 100 kobo (Wait, subscription amounts are governed by the plan, so we don't strictly pass amount unless overriden)
        // Just triggering the initialize with a plan code is sufficient.

        const res = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                amount: 50 * 100, // Safe dummy default incase plan has no default
                plan: planCode,
                metadata: {
                    userId,
                    type: 'subscription'
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
