import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireUser } from '@/utils/api-helpers';

export const dynamic = 'force-dynamic';

// GET /api/users/profile — current user's profile
export async function GET() {
    const auth = await requireUser();
    if (!auth.ok) return auth.response;

    const supabase = await createClient();
    const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, avatar_url, city, points, is_premium, referral_code, onboarding_completed, created_at')
        .eq('id', auth.data.id)
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ profile: data });
}

// PUT /api/users/profile — update name, email, avatar
export async function PUT(req: Request) {
    const auth = await requireUser();
    if (!auth.ok) return auth.response;

    const supabase = await createClient();
    const body = await req.json();
    const { full_name, email, avatar_url, phone, city } = body;

    const updates: Record<string, any> = {};
    if (full_name !== undefined) updates.full_name = full_name;
    if (email !== undefined) updates.email = email;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    if (phone !== undefined) updates.phone = phone;
    if (city !== undefined) updates.city = city;

    if (Object.keys(updates).length === 0) {
        return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', auth.data.id)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ profile: data });
}
