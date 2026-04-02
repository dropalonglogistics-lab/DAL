import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireUser } from '@/utils/api-helpers';

// POST /api/errand-workers/apply
export async function POST(req: Request) {
    const auth = await requireUser();
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const { phone, area, skills, transport_type = 'Bike' } = body;

    if (!phone || !area) {
        return NextResponse.json({ error: 'phone and area are required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: existing } = await supabase.from('errand_worker_profiles').select('id, status').eq('user_id', auth.data.id).maybeSingle();
    if (existing) return NextResponse.json({ error: `Application already submitted (status: ${existing.status})` }, { status: 400 });

    const { data, error } = await supabase
        .from('errand_worker_profiles')
        .insert({ user_id: auth.data.id, phone, area, skills: skills ?? null, transport_type, status: 'pending' })
        .select('id').single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ id: data.id, message: 'Errand worker application submitted' }, { status: 201 });
}
