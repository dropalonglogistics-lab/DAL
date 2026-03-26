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

// GET /api/superadmin/platform-config
export async function GET() {
    const supabase = await createClient()
    const { error: authError } = await requireSuperAdmin(supabase)
    if (authError) return NextResponse.json({ error: authError }, { status: authError === 'Unauthenticated' ? 401 : 403 })

    const { data: rows, error } = await supabase
        .from('platform_config')
        .select('key, value, updated_by, updated_at')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Convert rows to a flat object: { pricing: {...}, commissions: {...}, ... }
    const config: Record<string, unknown> = {}
    for (const row of rows || []) {
        config[row.key] = {
            value: row.value,
            updatedAt: row.updated_at,
            updatedBy: row.updated_by,
        }
    }

    // Fetch updater name for each section that has updated_by
    const updaterIds = (rows || []).filter(r => r.updated_by).map(r => r.updated_by as string)
    let nameMap: Record<string, string> = {}
    if (updaterIds.length > 0) {
        const uniqueIds = Array.from(new Set(updaterIds))
        const { data: updaters } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', uniqueIds)
        ;(updaters || []).forEach(u => { nameMap[u.id] = u.full_name || 'Admin' })
    }

    // Enrich config with updater name
    for (const row of rows || []) {
        if (row.updated_by && config[row.key]) {
            (config[row.key] as Record<string, unknown>).updatedByName = nameMap[row.updated_by] || 'Admin'
        }
    }

    return NextResponse.json({ config })
}

// POST /api/superadmin/platform-config
// Body: { key: string, value: object }
export async function POST(req: Request) {
    const supabase = await createClient()
    const { error: authError, user: caller } = await requireSuperAdmin(supabase)
    if (authError) return NextResponse.json({ error: authError }, { status: authError === 'Unauthenticated' ? 401 : 403 })

    const { key, value } = await req.json() as { key: string; value: Record<string, unknown> }
    if (!key || value === undefined) return NextResponse.json({ error: 'Missing key or value' }, { status: 400 })

    const { error } = await supabase
        .from('platform_config')
        .upsert({
            key,
            value,
            updated_by: caller!.id,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'key' })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
}
