import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
    const supabase = await createClient()
    const { searchParams } = new URL(req.url)
    const countOnly = searchParams.get('count') === 'true'
    const area = searchParams.get('area')
    const severity = searchParams.get('severity')

    if (countOnly) {
        const { count } = await supabase
            .from('alerts')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        return NextResponse.json({ count: count ?? 0 }, { headers: { 'Cache-Control': 'public, max-age=60' } })
    }

    let query = supabase
        .from('alerts')
        .select('id, type, description, area, severity, vote_score, created_at')
        .order('created_at', { ascending: false })
        .limit(60)

    if (area) query = query.ilike('area', `%${area}%`)
    if (severity && severity !== 'all') query = query.eq('severity', severity)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ alerts: data ?? [] }, { headers: { 'Cache-Control': 'public, max-age=300' } })
}

export async function POST(req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

    const body = await req.json()
    const { type, description, area, severity } = body

    if (!type || !description) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const { data, error } = await supabase.from('alerts').insert({
        type,
        description,
        area: area || null,
        severity: severity || 'info',
        reported_by: user.id,
    }).select('id, area').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Award Points
    await supabase.from('points_history').insert({
        user_id: user.id,
        action: 'alert_submission',
        points_change: 20,
        balance_after: 0, // Profile sync trigger handles the truth
        reference_id: data.id,
        description: `Alert: ${type} at ${area || 'Unknown Area'}`,
    });

    // Trigger push notifications to premium users with matching saved routes
    if (data.area) {
        try {
            // Find premium users who have this area in their saved routes
            const { data: subscribers } = await supabase
                .from('saved_routes')
                .select('user_id, profiles!inner(is_premium)')
                .eq('profiles.is_premium', true)
                .ilike('name', `%${data.area}%`);

            if (subscribers && subscribers.length > 0) {
                const userIds = Array.from(new Set(subscribers.map(s => s.user_id)));
                for (const userId of userIds) {
                    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/notifications/push`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId,
                            title: `Road Alert: ${data.area} ⚠️`,
                            body: description
                        })
                    });
                }
            }
        } catch (e) {
            console.error('Alert push notification failed', e);
        }
    }

    return NextResponse.json({ id: data.id })
}
