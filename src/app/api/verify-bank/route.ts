import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const account_number = searchParams.get('account_number');
        const bank_code = searchParams.get('bank_code');

        if (!account_number || !bank_code) {
            return NextResponse.json(
                { status: false, message: 'Account number and bank code are required' },
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
        const response = await fetch(
            `https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                },
                cache: 'no-store'
            }
        );

        const data = await response.json();

        if (data.status) {
            return NextResponse.json({
                status: true,
                message: 'Account resolved',
                data: data.data // includes account_name
            }, { status: 200 });
        } else {
            return NextResponse.json({
                status: false,
                message: data.message || 'Could not resolve account name',
            }, { status: 400 });
        }

    } catch (error: any) {
        console.error('Error resolving bank account:', error);
        return NextResponse.json(
            { status: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
