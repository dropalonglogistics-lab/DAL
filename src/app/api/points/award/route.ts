import { NextResponse } from 'next/server';
import { requireBotSecret, serviceRoleClient } from '@/utils/api-helpers';

// POST /api/points/award — [INTERNAL/BOT] award points + log entry
// Body: { userId, action, points, description }
export async function POST(req: Request) {
    const auth = requireBotSecret(req);
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const { userId, action, points, description } = body;

    if (!userId || !action || typeof points !== 'number') {
        return NextResponse.json({ error: 'Missing required fields: userId, action, points' }, { status: 400 });
    }

    const supabase = serviceRoleClient();

    // Log the points entry
    const { error: logErr } = await supabase.from('points_history').insert({
        user_id: userId,
        action,
        points,
        description: description ?? action,
    });

    if (logErr) return NextResponse.json({ error: logErr.message }, { status: 500 });

    // Increment user's total points balance
    const { data: profile } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', userId)
        .single();

    const newBalance = (profile?.points ?? 0) + points;
    const { error: updateErr } = await supabase
        .from('profiles')
        .update({ points: newBalance })
        .eq('id', userId);

    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

    return NextResponse.json({ success: true, newBalance });
}
