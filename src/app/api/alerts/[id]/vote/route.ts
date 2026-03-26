import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: alertId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Login required' }, { status: 401 })

    const { vote } = await req.json() as { vote: 1 | -1 }
    if (vote !== 1 && vote !== -1) return NextResponse.json({ error: 'Vote must be 1 or -1' }, { status: 400 })

    // Upsert vote (one per user per alert)
    const { data: existing } = await supabase
        .from('alert_votes')
        .select('id, vote')
        .eq('alert_id', alertId)
        .eq('user_id', user.id)
        .single()

    if (existing) {
        if (existing.vote === vote) {
            // Toggle off — remove vote
            await supabase.from('alert_votes').delete().eq('id', existing.id)
        } else {
            // Flip vote
            await supabase.from('alert_votes').update({ vote }).eq('id', existing.id)
        }
    } else {
        await supabase.from('alert_votes').insert({ alert_id: alertId, user_id: user.id, vote })
    }

    // Recalculate net score
    const { data: votes } = await supabase
        .from('alert_votes')
        .select('vote')
        .eq('alert_id', alertId)

    const netScore = (votes ?? []).reduce((s: number, v: { vote: number }) => s + v.vote, 0)

    await supabase.from('alerts').update({ vote_score: netScore }).eq('id', alertId)

    return NextResponse.json({ score: netScore })
}

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: alertId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: votes } = await supabase
        .from('alert_votes')
        .select('vote, user_id')
        .eq('alert_id', alertId)

    const score = (votes ?? []).reduce((s: number, v: { vote: number }) => s + v.vote, 0)
    const userVote = user ? (votes ?? []).find((v: { user_id: string }) => v.user_id === user.id)?.vote ?? 0 : 0

    return NextResponse.json({ score, userVote })
}
