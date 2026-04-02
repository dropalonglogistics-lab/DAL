import { NextResponse } from 'next/server';
import { requireUser } from '@/utils/api-helpers';

// POST /api/users/wallet/topup — init Paystack top-up
export async function POST(req: Request) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const { amount } = await req.json();

  if (!amount || amount < 100) {
    return NextResponse.json({ error: 'minimum top-up amount is 100 NGN' }, { status: 400 });
  }

  // Reuse the payment initialization logic
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/initialize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: auth.data.email,
        amount,
        userId: auth.data.id,
        type: 'wallet_topup'
      })
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
