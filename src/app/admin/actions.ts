'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function promoteToAdmin(formData: FormData) {
    try {
        const userId = formData.get('userId') as string
        const supabase = await createClient()

        // Security check: Only admins can promote others
        const { data: authData } = await supabase.auth.getUser()
        const user = authData?.user

        const { data: actorProfile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user?.id)
            .single()

        if (!actorProfile?.is_admin) {
            return { error: 'Unauthorized: Only admins can promote users.' }
        }

        const { error } = await supabase
            .from('profiles')
            .update({ is_admin: true })
            .eq('id', userId)

        if (error) return { error: error.message }

        revalidatePath('/admin/users')
        return { success: true }
    } catch (err: any) {
        return { error: err.message || 'An unexpected error occurred.' }
    }
}

export async function demoteToUser(formData: FormData) {
    try {
        const userId = formData.get('userId') as string
        const supabase = await createClient()

        // Security check: Only admins can demote others
        const { data: authData } = await supabase.auth.getUser()
        const user = authData?.user

        const { data: actorProfile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user?.id)
            .single()

        if (!actorProfile?.is_admin) {
            return { error: 'Unauthorized: Only admins can demote users.' }
        }

        const { error } = await supabase
            .from('profiles')
            .update({ is_admin: false })
            .eq('id', userId)

        if (error) return { error: error.message }

        revalidatePath('/admin/users')
        return { success: true }
    } catch (err: any) {
        return { error: err.message || 'An unexpected error occurred.' }
    }
}

export async function approveRoute(formData: FormData) {
    try {
        const routeId = formData.get('routeId') as string
        const supabase = await createClient()

        const { data: authData } = await supabase.auth.getUser()
        const user = authData?.user

        const { data: actorProfile } = await supabase.from('profiles').select('is_admin').eq('id', user?.id).single()

        if (!actorProfile?.is_admin) return { error: 'Unauthorized' }

        const { data: route } = await supabase.from('routes').select('submitted_by, name').eq('id', routeId).single()
        
        const { error } = await supabase.from('routes').update({ 
            status: 'approved',
            approved_by: user?.id 
        }).eq('id', routeId)
        
        if (error) return { error: error.message }

        // 1. Award Achievement Points (Bonus for Approval)
        if (route?.submitted_by) {
            await supabase.from('points_history').insert({
                user_id: route.submitted_by,
                action: 'route_approved',
                points_change: 100, // Bonus for approval
                balance_after: 0,
                reference_id: routeId,
                description: `Route Matched: Your suggestion "${route.name}" was approved by an admin!`,
            });
            
            // 2. Send Notification
            await supabase.from('notifications').insert({
                user_id: route.submitted_by,
                type: 'achievement',
                title: 'Route Approved!',
                body: `Your suggested route "${route.name}" is now live on the DAG map. +100 EXP!`,
                link: `/search?q=${encodeURIComponent(route.name)}`
            });
        }

        revalidatePath('/admin/routes')
        revalidatePath('/search')
        return { success: true }
    } catch (err: any) {
        return { error: err.message }
    }
}

export async function rejectRoute(formData: FormData) {
    try {
        const routeId = formData.get('routeId') as string
        const supabase = await createClient()

        const { data: authData } = await supabase.auth.getUser()
        const user = authData?.user

        const { data: actorProfile } = await supabase.from('profiles').select('is_admin').eq('id', user?.id).single()

        if (!actorProfile?.is_admin) return { error: 'Unauthorized' }

        const { error } = await supabase.from('routes').update({ status: 'rejected' }).eq('id', routeId)
        if (error) return { error: error.message }

        revalidatePath('/admin/routes')
        return { success: true }
    } catch (err: any) {
        return { error: err.message }
    }
}

// ---- NEW ACTIONS FOR ALL ROUTES MANAGEMENT ----

export async function deleteRoute(formData: FormData) {
    try {
        const routeId = formData.get('routeId') as string
        const supabase = await createClient()

        const { data: authData } = await supabase.auth.getUser()
        const user = authData?.user

        const { data: actorProfile } = await supabase.from('profiles').select('is_admin').eq('id', user?.id).single()

        if (!actorProfile?.is_admin) return { error: 'Unauthorized' }

        const { error } = await supabase.from('routes').delete().eq('id', routeId)
        if (error) return { error: error.message }

        revalidatePath('/admin/all-routes')
        revalidatePath('/admin/routes')
        revalidatePath('/route-suggest')
        return { success: true }
    } catch (err: any) {
        return { error: err.message }
    }
}

export async function updateRouteStatus(formData: FormData) {
    try {
        const routeId = formData.get('routeId') as string
        const newStatus = formData.get('status') as string
        const supabase = await createClient()

        if (!['pending', 'approved', 'rejected'].includes(newStatus)) {
            return { error: 'Invalid status' }
        }

        const { data: authData } = await supabase.auth.getUser()
        const user = authData?.user

        const { data: actorProfile } = await supabase.from('profiles').select('is_admin').eq('id', user?.id).single()

        if (!actorProfile?.is_admin) return { error: 'Unauthorized' }

        const { error } = await supabase.from('routes').update({ status: newStatus }).eq('id', routeId)
        if (error) return { error: error.message }

        revalidatePath('/admin/all-routes')
        revalidatePath('/admin/routes')
        revalidatePath('/route-suggest')
        return { success: true }
    } catch (err: any) {
        return { error: err.message }
    }
}

export async function updateRouteDetails(formData: FormData) {
    try {
        const routeId = formData.get('routeId') as string
        const name = formData.get('name') as string
        const origin = formData.get('start_location') as string
        const destination = formData.get('destination') as string
        const description = formData.get('description') as string
        const status = formData.get('status') as string
        const itineraryStr = formData.get('stopsJSON') as string

        let legs = []
        if (itineraryStr) {
            try {
                legs = JSON.parse(itineraryStr)
            } catch (e) { /* ignore */ }
        }

        const supabase = await createClient()

        const { data: authData } = await supabase.auth.getUser()
        const user = authData?.user

        const { data: actorProfile } = await supabase.from('profiles').select('is_admin').eq('id', user?.id).single()

        if (!actorProfile?.is_admin) return { error: 'Unauthorized' }

        const updates: any = {
            name,
            origin,
            destination,
            description,
            legs,
            status
        }

        const { error } = await supabase.from('routes').update(updates).eq('id', routeId)
        if (error) return { error: error.message }
        
        revalidatePath('/admin/routes')
        revalidatePath('/search')
        return { success: true }
    } catch (err: any) {
        return { error: err.message }
    }
}

export async function getAdminDashboardData() {
    try {
        const supabase = await createClient()

        // 1. Get Metrics
        const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: pendingRoutes } = await supabase.from('routes').select('*', { count: 'exact', head: true }).eq('status', 'pending');
        const { count: activeAlerts } = await supabase.from('alerts').select('*', { count: 'exact', head: true }).eq('status', 'active');
        const { count: openDeliveries } = await supabase.from('orders').select('*', { count: 'exact', head: true }).neq('status', 'completed');

        // 2. Get Recent Alerts
        const { data: recentAlerts } = await supabase
            .from('alerts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5)

        // 3. Get Recent Routes
        const { data: pendingRouteList } = await supabase
            .from('routes')
            .select('*, profiles(full_name)')
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(3)

        // 4. Get Activity Log (using alerts and points_history as a proxy)
        const { data: activityLog } = await supabase
            .from('points_history')
            .select('*, profiles(full_name)')
            .order('created_at', { ascending: false })
            .limit(5)

        // 5. Get Recent Visits (Analytics)
        const { data: recentVisits } = await supabase
            .from('profiles')
            .select('id, full_name, last_visited_at')
            .not('last_visited_at', 'is', null)
            .order('last_visited_at', { ascending: false })
            .limit(5)

        return {
            metrics: {
                activeUsers: userCount || 0,
                pendingRoutes: pendingRoutes || 0,
                activeAlerts: activeAlerts || 0,
                openDeliveries: openDeliveries || 0,
            },
            recentAlerts: recentAlerts || [],
            pendingRoutes: pendingRouteList || [],
            activityLog: activityLog || [],
            recentVisits: recentVisits || []
        }
    } catch (err: any) {
        console.error('Error fetching admin dashboard data:', err)
        return null
    }
}

export async function getAdminUsers() {
    try {
        const supabase = await createClient()
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })
        
        if (error) throw error
        return { success: true, data: profiles }
    } catch (err: any) {
        return { error: err.message }
    }
}

export async function getAdminAlerts() {
    try {
        const supabase = await createClient()
        const { data: alerts, error } = await supabase
            .from('alerts')
            .select('*, profiles:reported_by(full_name)')
            .order('created_at', { ascending: false })
        
        if (error) throw error
        return { success: true, data: alerts }
    } catch (err: any) {
        return { error: err.message }
    }
}

export async function getAdminBusinesses() {
    try {
        const supabase = await createClient()
        const { data: businesses, error } = await supabase
            .from('businesses')
            .select('*, profiles:owner_id(full_name)')
            .order('created_at', { ascending: false })
        
        if (error) throw error
        return { success: true, data: businesses }
    } catch (err: any) {
        return { error: err.message }
    }
}

export async function updateUserStatus(formData: FormData) {
    try {
        const userId = formData.get('userId') as string
        const status = formData.get('status') as string // 'active' | 'suspended'
        const supabase = await createClient()

        const { data: authData } = await supabase.auth.getUser()
        if (!(await supabase.from('profiles').select('is_admin').eq('id', authData.user?.id).single()).data?.is_admin) {
            return { error: 'Unauthorized' }
        }

        const { error } = await supabase
            .from('profiles')
            .update({ status })
            .eq('id', userId)

        if (error) throw error
        revalidatePath('/admin/users')
        return { success: true }
    } catch (err: any) {
        return { error: err.message }
    }
}

export async function recordVisit() {
    try {
        const supabase = await createClient()
        const { data: authData } = await supabase.auth.getUser()
        if (!authData.user) return

        const { error } = await supabase
            .from('profiles')
            .update({ last_visited_at: new Date().toISOString() })
            .eq('id', authData.user.id)

        if (error) console.error('Failed to record visit:', error.message)
    } catch (err) {
        // Silent fail
    }
}

export async function updateAlertStatus(formData: FormData) {
    try {
        const alertId = formData.get('alertId') as string
        const status = formData.get('status') as string
        const supabase = await createClient()

        const { data: authData } = await supabase.auth.getUser()
        if (!(await supabase.from('profiles').select('is_admin').eq('id', authData.user?.id).single()).data?.is_admin) {
            return { error: 'Unauthorized' }
        }

        const { error } = await supabase
            .from('alerts')
            .update({ status })
            .eq('id', alertId)

        if (error) throw error
        revalidatePath('/admin/alerts')
        return { success: true }
    } catch (err: any) {
        return { error: err.message }
    }
}

export async function updateBusinessStatus(formData: FormData) {
    try {
        const businessId = formData.get('businessId') as string
        const status = formData.get('status') as string
        const supabase = await createClient()

        const { data: authData } = await supabase.auth.getUser()
        if (!(await supabase.from('profiles').select('is_admin').eq('id', authData.user?.id).single()).data?.is_admin) {
            return { error: 'Unauthorized' }
        }

        const { error } = await supabase
            .from('businesses')
            .update({ status })
            .eq('id', businessId)

        if (error) throw error
        revalidatePath('/admin/businesses')
        return { success: true }
    } catch (err: any) {
        return { error: err.message }
    }
}
