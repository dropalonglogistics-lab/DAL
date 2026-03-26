import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
    const { orderId } = await req.json();
    const supabase = await createClient();

    // ALGORITHM: 
    // Tier 1 (0-5 min): errand_worker profile with AVAILABLE status.
    // Tier 2 (5-10 min): rider profiles with errand_opt_in=true and ONLINE.
    // Tier 3 (10-13 min): driver profiles with errand_opt_in=true and AVAILABLE.
    // After 13 min: Admin alert + customer notification.

    // For this prototype, we immediately simulate a successful match with an available profile to allow the UI to proceed seamlessly.
    
    // Fetch a real profile to satisfy the foreign key constraint on errand_orders.worker_id
    const { data: profiles } = await supabase.from('profiles').select('id, full_name, phone').neq('full_name', null).limit(1);
    
    const mockWorker = {
        id: profiles?.[0]?.id || null,
        full_name: profiles?.[0]?.full_name || 'Chidi Amadi',
        phone: profiles?.[0]?.phone || '+2348000000000',
        transport_type: 'Bike', // Simulated from Tier 1 matching
        reputation_score: 98 // 4.9 stars
    };

    if (mockWorker.id) {
        await supabase.from('errand_orders').update({ worker_id: mockWorker.id, status: 'assigned' }).eq('id', orderId);
    }

    // Simulate Whatsapp/Push sent
    console.log(`[Notification] Dispatching WhatsApp match confirmation to customer for order ${orderId}`);
    console.log(`[Notification] Dispatching Push Notification to worker ${mockWorker.full_name}`);

    // Fire OneSignal Push Notification to the Customer
    const { data: order } = await supabase.from('errand_orders').select('user_id').eq('id', orderId).single();
    if (order?.user_id) {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/notifications/push`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: order.user_id,
                    title: 'Worker Assigned ✅',
                    body: `${mockWorker.full_name} is on the way! 🏍️`
                })
            });
        } catch (e) {
            console.error('Push trigger failed', e);
        }
    }

    return NextResponse.json({ assigned: true, worker: mockWorker });
}
