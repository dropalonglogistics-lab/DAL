import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireUser } from '@/utils/api-helpers';

// PUT /api/routes/[id]/vote — upvote/downvote a route (authenticated)
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await requireUser();
    if (!auth.ok) return auth.response;

    const { id: routeId } = await params;
    const { vote } = await req.json() as { vote: 1 | -1 };

    if (vote !== 1 && vote !== -1) {
        return NextResponse.json({ error: 'Vote must be 1 or -1' }, { status: 400 });
    }

    const supabase = await createClient();

    // Upsert vote
    const { data: existing } = await supabase
        .from('route_votes')
        .select('id, vote')
        .eq('route_id', routeId)
        .eq('user_id', auth.data.id)
        .single();

    if (existing) {
        if (existing.vote === vote) {
            await supabase.from('route_votes').delete().eq('id', existing.id);
        } else {
            await supabase.from('route_votes').update({ vote }).eq('id', existing.id);
        }
    } else {
        await supabase.from('route_votes').insert({ route_id: routeId, user_id: auth.data.id, vote });
    }

    // Recalculate net score
    const { data: votes } = await supabase.from('route_votes').select('vote').eq('route_id', routeId);
    const netScore = (votes ?? []).reduce((s: number, v: { vote: number }) => s + v.vote, 0);
    await supabase.from('routes').update({ vote_score: netScore }).eq('id', routeId);

    return NextResponse.json({ score: netScore });
}
