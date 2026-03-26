import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'superadmin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { payouts } = await req.json() as {
        payouts: Array<{ id: number; name: string; amount: number; type: string; recipientCode?: string }>
    }

    const PAYSTACK_KEY = process.env.PAYSTACK_SECRET_KEY

    const results: Array<{ id: number; status: string; transferCode?: string; message: string }> = []

    for (const payout of payouts) {
        if (!PAYSTACK_KEY) {
            // Stub mode — Paystack key not configured
            results.push({
                id: payout.id,
                status: 'simulated',
                message: `Transfer of ₦${payout.amount.toLocaleString()} to ${payout.name} logged (Paystack key not configured — production mode disabled)`,
            })
            continue
        }

        try {
            // Paystack Transfer API
            const response = await fetch('https://api.paystack.co/transfer', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${PAYSTACK_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    source: 'balance',
                    reason: `DAL platform payout for ${payout.type}`,
                    amount: payout.amount * 100, // Paystack uses kobo
                    recipient: payout.recipientCode || payout.name,
                    currency: 'NGN',
                }),
            })

            const data = await response.json()

            if (data.status) {
                results.push({
                    id: payout.id,
                    status: 'success',
                    transferCode: data.data?.transfer_code,
                    message: `Transfer initiated for ${payout.name}`,
                })
            } else {
                results.push({
                    id: payout.id,
                    status: 'failed',
                    message: data.message || 'Paystack transfer failed',
                })
            }
        } catch (err) {
            results.push({
                id: payout.id,
                status: 'error',
                message: `Network error: ${err instanceof Error ? err.message : 'Unknown error'}`,
            })
        }
    }

    return NextResponse.json({ results })
}
