import { NextResponse } from 'next/server';
import { requireAdmin, serviceRoleClient } from '@/utils/api-helpers';

// POST /api/admin/points/award — { userId, amount, direction, reason }
// Updates balance, creates points_history AND points_admin_log entries.
export async function POST(req: Request) {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    const { userId, amount, direction, reason } = await req.json();

    if (!userId || typeof amount !== 'number' || !direction || !reason) {
        return NextResponse.json({ error: 'userId, amount, direction, and reason are required' }, { status: 400 });
    }

    const supabase = serviceRoleClient();
    const pointsChange = direction === 'add' ? amount : -amount;

    // 1. Log in points_history
    const { error: historyErr } = await supabase.from('points_history').insert({
        user_id: userId,
        action: 'ADMIN_ADJUSTMENT',
        points: pointsChange,
        description: reason
    });

    if (historyErr) return NextResponse.json({ error: historyErr.message }, { status: 500 });

    // 2. Log in points_admin_log
    const { error: adminLogErr } = await supabase.from('points_admin_log').insert({
        admin_id: auth.data.userId,
        target_user_id: userId,
        amount: pointsChange,
        reason: reason
    });

    if (adminLogErr) return NextResponse.json({ error: adminLogErr.message }, { status: 500 });

    // 3. Update profile balance
    const { data: profile } = await supabase.from('profiles').select('points').eq('id', userId).single();
    const newBalance = (profile?.points ?? 0) + pointsChange;
    
    const { error: profileErr } = await supabase.from('profiles').update({ points: newBalance }).eq('id', userId);
    if (profileErr) return NextResponse.json({ error: profileErr.message }, { status: 500 });

    return NextResponse.json({ success: true, newBalance });
}
