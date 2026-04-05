'use server'

import { createClient } from '@/utils/supabase/server'

export async function fetchAdminStats() {
    const supabase = await createClient()

    // Parallelize aggregate counts
    const [userRes, alertRes, routeRes, verifiedRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('alerts').select('*', { count: 'exact', head: true }),
        supabase.from('routes').select('*', { count: 'exact', head: true }),
        supabase.from('routes').select('*', { count: 'exact', head: true }).eq('status', 'approved')
    ]);

    return { 
        userCount: userRes.count || 0, 
        alertCount: alertRes.count || 0, 
        routeCount: routeRes.count || 0,
        verifiedCount: verifiedRes.count || 0
    }
}
