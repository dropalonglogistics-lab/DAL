import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireUser } from '@/utils/api-helpers';

// POST /api/drivers/apply
export async function POST(req: Request) {
    const auth = await requireUser();
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const { phone, vehicle_make, vehicle_model, plate_number, license_number, errand_opt_in = false } = body;

    if (!phone || !vehicle_make || !plate_number) {
        return NextResponse.json({ error: 'phone, vehicle_make, and plate_number are required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: existing } = await supabase.from('driver_profiles').select('id, status').eq('user_id', auth.data.id).maybeSingle();
    if (existing) return NextResponse.json({ error: `Application already submitted (status: ${existing.status})` }, { status: 400 });

    const { data, error } = await supabase
        .from('driver_profiles')
        .insert({ user_id: auth.data.id, phone, vehicle_make, vehicle_model: vehicle_model ?? null, plate_number, license_number: license_number ?? null, errand_opt_in, status: 'pending' })
        .select('id').single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ id: data.id, message: 'Driver application submitted' }, { status: 201 });
}
