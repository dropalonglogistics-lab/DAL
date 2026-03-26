import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    const supabase = await createClient()

    // Active competition
    const { data: active } = await supabase
        .from('competitions')
        .select('*')
        .eq('status', 'active')
        .order('start_date', { ascending: false })
        .limit(1)
        .single()

    if (active) {
        return NextResponse.json({ competition: active, state: 'active' })
    }

    // No active — return last ended one
    const { data: last } = await supabase
        .from('competitions')
        .select('*')
        .eq('status', 'ended')
        .order('end_date', { ascending: false })
        .limit(1)
        .single()

    return NextResponse.json({ competition: last ?? null, state: last ? 'ended' : 'none' })
}
