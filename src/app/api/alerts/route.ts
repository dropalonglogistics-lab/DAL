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
        return NextResponse.json({ count: count ?? 0 })
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
    return NextResponse.json({ alerts: data ?? [] })
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
        user_id: user.id,
    }).select('id').single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ id: data.id })
}
