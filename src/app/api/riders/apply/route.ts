import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireUser } from '@/utils/api-helpers';

// POST /api/riders/apply — submit rider application
export async function POST(req: Request) {
    const auth = await requireUser();
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const { vehicle_type, plate_number, license_number, phone, bank_name, account_number } = body;

    if (!vehicle_type || !plate_number || !phone) {
        return NextResponse.json({ error: 'vehicle_type, plate_number, and phone are required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Check if already applied
    const { data: existing } = await supabase.from('rider_profiles').select('id, status').eq('user_id', auth.data.id).maybeSingle();
    if (existing) {
        return NextResponse.json({ error: `Application already submitted (status: ${existing.status})` }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('rider_profiles')
        .insert({
            user_id: auth.data.id,
            vehicle_type,
            plate_number,
            license_number: license_number ?? null,
            phone,
            bank_name: bank_name ?? null,
            account_number: account_number ?? null,
            status: 'pending',
        })
        .select('id')
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ id: data.id, message: 'Rider application submitted for review' }, { status: 201 });
}
