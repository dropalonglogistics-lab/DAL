import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireAdmin } from '@/utils/api-helpers';

export const dynamic = 'force-dynamic';

// GET /api/admin/routes/pending — list unverified routes
export async function GET() {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    const supabase = await createClient();
    const { data, error } = await supabase
        .from('routes')
        .select('*, profiles(full_name)')
        .eq('verified', false)
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ routes: data ?? [] });
}
