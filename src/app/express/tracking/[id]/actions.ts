'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function cancelExpressOrder(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    // Update status to cancelled
    const { error } = await supabase.from('express_orders').update({ status: 'cancelled' }).eq('id', id).eq('user_id', user.id);
    if (error) return { success: false, error: error.message };

    revalidatePath(`/express/tracking/${id}`);
    revalidatePath('/dashboard');
    return { success: true };
}

export async function submitOrderRating(id: string, rating: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    // For this prototype, we'll award the user points for rating
    const { data: profile } = await supabase.from('profiles').select('points').eq('id', user.id).single();
    if (profile) {
        await supabase.from('profiles').update({ points: profile.points + 50 }).eq('id', user.id);
    }
    
    // Mock updating the order with a rating (since we didn't add a rating column to express_orders)
    // In production we'd insert into a reviews table.
    return { success: true, reward: 50 };
}
