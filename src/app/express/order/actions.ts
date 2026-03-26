'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import * as Sentry from '@sentry/nextjs';

export async function submitExpressOrder(formData: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Prevent SQL injection by explicitly destructuring the expected payload
    const {
        pickup_address, pickup_name, pickup_phone,
        dropoff_address, dropoff_name, dropoff_phone, instructions,
        package_size, is_fragile, contains_high_value,
        base_fee, distance_km, per_km_rate, total_fee, payment_method,
    } = formData;

    const { error, data } = await supabase.from('express_orders').insert({
        user_id: user?.id || null,
        pickup_address, pickup_name, pickup_phone,
        dropoff_address, dropoff_name, dropoff_phone,
        instructions, package_size, is_fragile, contains_high_value,
        base_fee: Number(base_fee) || 0,
        distance_km: Number(distance_km) || 0, 
        per_km_rate: Number(per_km_rate) || 0, 
        total_fee: Number(total_fee) || 0,
        payment_method,
        status: 'placed'
    }).select('id').single();

    if (error) return { success: false, error: error.message };

    // Charge wallet if applicable
    if (payment_method === 'wallet' && user) {
        const { data: p } = await supabase.from('profiles').select('wallet_balance').eq('id', user.id).single();
        if (p && p.wallet_balance >= total_fee) {
            await supabase.from('profiles').update({ wallet_balance: p.wallet_balance - total_fee }).eq('id', user.id);
            await supabase.from('wallet_transactions').insert({
                user_id: user.id,
                amount: total_fee,
                type: 'debit',
                reference: `EXP-${data.id}`,
                description: 'Express Delivery Payment'
            });
            await supabase.from('express_orders').update({ status: 'paid' }).eq('id', data.id);
        } else {
            // Revert order creation if insufficient funds
            await supabase.from('express_orders').delete().eq('id', data.id);
            return { success: false, error: 'Insufficient DAL Wallet balance.' };
        }
    } else {
        // If card, assume success for this mock
        await supabase.from('express_orders').update({ status: 'paid' }).eq('id', data.id);
    }

    // Fire Order Confirmation Email
    if (user && user.email) {
        // Note: In prod, replace dal-three.vercel.app with dynamic start_location or absolute URL if using fetch from server action.
        // Actually, since it's a server action, it's cleaner to just instantiate Resend directly or call our API via absolute URL.
        // I will use fetch to the API route to decouple.
        try {
            await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/notifications/email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: user.email,
                    template: 'order-confirmation',
                    userId: user.id,
                    data: {
                        refCode: `EXP-${data.id.substring(0, 5).toUpperCase()}`,
                        from: pickup_address,
                        to: dropoff_address,
                        item: package_size,
                        fee: `₦${total_fee}`
                    }
                })
            });
        } catch (e: any) {
            console.error('Email trigger failed', e);
            Sentry.captureException(e, { extra: { context: 'order creation' } });
        }
    }

    revalidatePath('/dashboard');
    return { success: true, id: data.id };
}
