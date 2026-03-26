import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

async function requireSuperAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthenticated', user: null }

    const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'superadmin') return { error: 'Forbidden', user: null }
    return { error: null, user: { id: user.id, full_name: profile.full_name } }
}

// GET /api/superadmin/points-log?start=&end=&admin=&direction=
export async function GET(req: Request) {
    const supabase = await createClient()
    const { error: authError } = await requireSuperAdmin(supabase)
    if (authError) return NextResponse.json({ error: authError }, { status: authError === 'Unauthenticated' ? 401 : 403 })

    const { searchParams } = new URL(req.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')
    const admin = searchParams.get('admin')
    const direction = searchParams.get('direction')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    let query = supabase
        .from('points_admin_log')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

    if (start) query = query.gte('created_at', start)
    if (end) query = query.lte('created_at', end + 'T23:59:59')
    if (admin) query = query.ilike('admin_name', `%${admin}%`)
    if (direction && direction !== 'all') query = query.eq('direction', direction)

    const { data: rows, error, count } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ rows: rows || [], total: count ?? 0, page, limit })
}

// POST /api/superadmin/points-log — insert a new points adjustment
export async function POST(req: Request) {
    const supabase = await createClient()
    const { error: authError, user: caller } = await requireSuperAdmin(supabase)
    if (authError) return NextResponse.json({ error: authError }, { status: authError === 'Unauthenticated' ? 401 : 403 })

    const body = await req.json() as {
        targetUserId: string
        targetEmail: string
        direction: '+' | '-'
        amount: number
        reason: string
    }

    // Fetch current balance
    const { data: profile } = await supabase
        .from('profiles')
        .select('points_balance')
        .eq('id', body.targetUserId)
        .single()

    const balanceBefore = profile?.points_balance ?? 0
    const balanceAfter = body.direction === '+'
        ? balanceBefore + body.amount
        : Math.max(0, balanceBefore - body.amount)

    // Update the user's points balance
    await supabase
        .from('profiles')
        .update({ points_balance: balanceAfter })
        .eq('id', body.targetUserId)

    // Insert immutable log entry
    const { error: insertErr } = await supabase.from('points_admin_log').insert({
        admin_id: caller!.id,
        admin_name: caller!.full_name || 'Super Admin',
        target_user_id: body.targetUserId,
        target_email: body.targetEmail,
        direction: body.direction,
        amount: body.amount,
        reason: body.reason,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
    })

    if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })

    return NextResponse.json({ success: true, balanceBefore, balanceAfter })
}
