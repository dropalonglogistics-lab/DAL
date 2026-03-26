import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: alertId } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('alert_comments')
        .select('id, body, created_at, profiles:user_id(full_name, avatar_url)')
        .eq('alert_id', alertId)
        .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ comments: data ?? [] })
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: alertId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Login required' }, { status: 401 })

    const { body } = await req.json()
    if (!body?.trim()) return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 })

    const { data, error } = await supabase.from('alert_comments')
        .insert({ alert_id: alertId, user_id: user.id, body: body.trim() })
        .select('id, body, created_at, profiles:user_id(full_name, avatar_url)')
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ comment: data })
}
