import TrackingClient from './TrackingClient';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';

export default async function ShopperTrackingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: order, error } = await supabase
        .from('errand_orders')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !order) notFound();

    return <TrackingClient initialOrder={order} />;
}
