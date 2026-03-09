import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { bvn } = await request.json();

        if (!bvn || bvn.length !== 11) {
            return NextResponse.json(
                { status: false, message: 'Please provide a valid 11-digit BVN' },
                { status: 400 }
            );
        }

        const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

        if (!PAYSTACK_SECRET_KEY) {
            console.error('Missing PAYSTACK_SECRET_KEY environment variable');
            return NextResponse.json(
                { status: false, message: 'Server configuration error' },
                { status: 500 }
            );
        }

        // Call Paystack API
        // https://paystack.com/docs/identity-verification/verify-bvn-match/
        const response = await fetch(`https://api.paystack.co/bank/resolve_bvn/${bvn}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            },
            cache: 'no-store'
        });

        const data = await response.json();

        // Let the client know if the resolve failed or succeeded
        if (data.status) {
            return NextResponse.json({
                status: true,
                message: 'BVN verified successfully',
                data: data.data
            }, { status: 200 });
        } else {
            return NextResponse.json({
                status: false,
                message: data.message || 'BVN verification failed',
            }, { status: 400 });
        }

    } catch (error: any) {
        console.error('Error verifying BVN:', error);
        return NextResponse.json(
            { status: false, message: 'Internal server error verifying BVN' },
            { status: 500 }
        );
    }
}
