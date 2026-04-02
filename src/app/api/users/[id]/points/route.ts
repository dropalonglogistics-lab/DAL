import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

// GET /api/users/[id]/points — points balance, rank, tier
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, full_name, points, is_premium')
        .eq('id', id)
        .single();

    if (error || !profile) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Calculate rank (# of users with more points + 1)
    const { count: aboveCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gt('points', profile.points ?? 0);

    const points = profile.points ?? 0;
    const rank = (aboveCount ?? 0) + 1;

    // Determine tier
    let tier = 'Bronze';
    if (points >= 5000) tier = 'Platinum';
    else if (points >= 2000) tier = 'Gold';
    else if (points >= 500) tier = 'Silver';

    // Fetch recent points history
    const { data: history } = await supabase
        .from('points_ledger')
        .select('action, points, description, created_at')
        .eq('user_id', id)
        .order('created_at', { ascending: false })
        .limit(10);

    return NextResponse.json({ points, rank, tier, history: history ?? [] });
}
