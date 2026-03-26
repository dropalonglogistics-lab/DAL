'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitWorkerRating(id: string, rating: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    // Fake rating points logic matching F2 for the user taking time to submit a rating
    const { data: profile } = await supabase.from('profiles').select('points').eq('id', user.id).single();
    if (profile) {
        await supabase.from('profiles').update({ points: profile.points + 50 }).eq('id', user.id);
    }
    
    return { success: true, reward: 50 };
}

export async function sendMessage(orderId: string, text: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const { error } = await supabase.from('errand_messages').insert({
        order_id: orderId,
        sender_id: user.id,
        text
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
}

export async function fetchMessages(orderId: string) {
    const supabase = await createClient();
    const { data } = await supabase.from('errand_messages')
        .select('*, profiles!sender_id(full_name)')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });
    
    return data || [];
}
