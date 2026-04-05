'use server'

import { createClient } from '@/utils/supabase/server'

export async function fetchFinancialData() {
    const supabase = await createClient()

    try {
        // 1. Total Revenue (all time / kobo to Naira)
        const { data: revenueData } = await supabase
            .from('orders')
            .select('fee_amount')
            .eq('status', 'completed')
        
        const totalRevenue = revenueData?.reduce((acc, curr) => acc + (curr.fee_amount || 0), 0) || 0
        const revenueNaira = totalRevenue / 100

        // 2. Monthly Revenue (MTD)
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0,0,0,0)

        const { data: mtdData } = await supabase
            .from('orders')
            .select('fee_amount')
            .eq('status', 'completed')
            .gte('created_at', startOfMonth.toISOString())
        
        const mtdRevenue = mtdData?.reduce((acc, curr) => acc + (curr.fee_amount || 0), 0) || 0
        const mtdNaira = mtdRevenue / 100

        // 3. User & Worker stats
        const { count: riderCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'driver')
        const { count: errandCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'errand_worker')

        // 4. Open Disputes
        const { data: disputes } = await supabase
            .from('orders')
            .select('id, reference, user_id, fee_amount, status, created_at, profiles(full_name)')
            .eq('status', 'disputed')
            .order('created_at', { ascending: false })

        return {
            totalRevenue: revenueNaira,
            mtdRevenue: mtdNaira,
            stats: {
                riders: riderCount || 0,
                errands: errandCount || 0
            },
            disputes: disputes || []
        }
    } catch (err) {
        console.error('Financial fetch error:', err)
        return null
    }
}
