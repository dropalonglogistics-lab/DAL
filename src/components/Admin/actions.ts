'use server'

import { createClient } from '@/utils/supabase/server'

export async function fetchAdminStats() {
    const supabase = await createClient()

    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    const { count: alertCount } = await supabase.from('alerts').select('*', { count: 'exact', head: true })
    const { count: routeCount } = await supabase.from('community_routes').select('*', { count: 'exact', head: true })

    return { userCount: userCount || 0, alertCount: alertCount || 0, routeCount: routeCount || 0 }
}
