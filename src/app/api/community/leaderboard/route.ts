import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
    const supabase = await createClient()
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 25
    const offset = (page - 1) * limit

    const { data: { user } } = await supabase.auth.getUser()

    // Top users by points
    const { data: rows, count } = await supabase
        .from('profiles')
        .select('id, full_name, points, city', { count: 'exact' })
        .not('points', 'is', null)
        .order('points', { ascending: false })
        .range(offset, offset + limit - 1)

    const leaderboard = (rows ?? []).map((u, i) => {
        const rank = offset + i + 1
        const firstName = (u.full_name || 'Anonymous').split(' ')[0]
        const lastInitial = (u.full_name || '').split(' ').slice(1).join(' ').charAt(0)
        return {
            rank,
            name: lastInitial ? `${firstName} ${lastInitial}.` : firstName,
            points: u.points ?? 0,
            location: u.city || 'Port Harcourt',
            id: u.id,
        }
    })

    // User's own rank
    let userRank: { rank: number; points: number; totalParticipants: number } | null = null
    if (user) {
        const { data: userProfile } = await supabase
            .from('profiles')
            .select('points')
            .eq('id', user.id)
            .single()

        if (userProfile) {
            const { count: aboveCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .gt('points', userProfile.points ?? 0)

            userRank = {
                rank: (aboveCount ?? 0) + 1,
                points: userProfile.points ?? 0,
                totalParticipants: count ?? 0,
            }
        }
    }

    return NextResponse.json({
        leaderboard,
        total: count ?? 0,
        page,
        userRank,
    })
}
