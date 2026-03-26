'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitErrandOrder(formData: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const {
        errand_type, description, location, delivery_address,
        max_budget, deadline, instructions, service_fee, payment_method
    } = formData;

    const { error, data } = await supabase.from('errand_orders').insert({
        user_id: user?.id || null,
        errand_type, description, location, delivery_address,
        max_budget: Number(max_budget) || 0,
        deadline, instructions,
        service_fee: Number(service_fee) || 0,
        status: 'placed'
    }).select('id').single();

    if (error) return { success: false, error: error.message };

    // Charge wallet if applicable (for service fee)
    if (payment_method === 'wallet' && user) {
        const { data: p } = await supabase.from('profiles').select('wallet_balance').eq('id', user.id).single();
        if (p && p.wallet_balance >= service_fee) {
            await supabase.from('profiles').update({ wallet_balance: p.wallet_balance - service_fee }).eq('id', user.id);
            await supabase.from('wallet_transactions').insert({
                user_id: user.id,
                amount: service_fee,
                type: 'debit',
                reference: `ORDER-${data.id}`,
                description: 'Errand Service Fee Payment'
            });
            await supabase.from('errand_orders').update({ status: 'paid' }).eq('id', data.id);
        } else {
            await supabase.from('errand_orders').delete().eq('id', data.id);
            return { success: false, error: 'Insufficient DAL Wallet balance for the service fee.' };
        }
    } else {
        // If card, assume success for this mock
        await supabase.from('errand_orders').update({ status: 'paid' }).eq('id', data.id);
    }

    revalidatePath('/dashboard');
    return { success: true, id: data.id };
}
