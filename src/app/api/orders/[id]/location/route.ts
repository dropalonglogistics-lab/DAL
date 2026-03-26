import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('express_orders')
        .select('status, rider_location_lat, rider_location_lng, rider_id')
        .eq('id', id)
        .single();
        
    if (error) return NextResponse.json({ error: error.message }, { status: 404 });
    
    // Also fetch rider profile info if assigned
    let rider = null;
    if (data.rider_id) {
         const { data: p } = await supabase.from('profiles').select('full_name, avatar_url, phone, reputation_score').eq('id', data.rider_id).single();
         rider = p;
    }

    return NextResponse.json({ ...data, rider });
}
