import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        
        // Auth guard: Super admin check
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        
        const { data: adminProfile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
        if (!adminProfile?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const { workerId, amount, bankCode, accountNumber, reason } = await req.json();

        const { data: worker } = await supabase.from('profiles').select('full_name').eq('id', workerId).single();
        if (!worker) return NextResponse.json({ error: 'Worker not found' }, { status: 404 });

        // Step 1: Create Transfer Recipient
        const recRes = await fetch('https://api.paystack.co/transferrecipient', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'nuban',
                name: worker.full_name,
                account_number: accountNumber,
                bank_code: bankCode,
                currency: 'NGN'
            })
        });

        const recData = await recRes.json();
        if (!recData.status) {
            return NextResponse.json({ error: `Bank Verification Failed: ${recData.message}` }, { status: 400 });
        }

        const recipientCode = recData.data.recipient_code;

        // Step 2: Initiate Transfer
        const ref = `PO-${Date.now()}-${workerId.substring(0, 5)}`;
        
        const transRes = await fetch('https://api.paystack.co/transfer', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                source: 'balance',
                amount: amount * 100, // Kobo
                reference: ref,
                recipient: recipientCode,
                reason: reason || 'DAL Payout'
            })
        });

        const transData = await transRes.json();
        if (!transData.status) {
            return NextResponse.json({ error: `Transfer Failed: ${transData.message}` }, { status: 400 });
        }

        // Step 3: Log to DB
        await supabase.from('payouts').insert({
            worker_id: workerId,
            amount: amount,
            bank_code: bankCode,
            account_number: accountNumber,
            reference: ref,
            status: 'pending' // Webhook will update to 'paid' when confirmed
        });

        return NextResponse.json({ success: true, reference: ref, message: transData.message });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
