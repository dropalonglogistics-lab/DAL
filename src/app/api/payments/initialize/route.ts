import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { email, amount, userId, type, metadata = {} } = await req.json();

        // 1 NGN = 100 kobo
        const payload = {
            email,
            amount: amount * 100, 
            metadata: {
                userId,
                type,
                ...metadata
            }
        };

        const res = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
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
