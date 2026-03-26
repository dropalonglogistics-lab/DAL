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

        const { error } = await supabase.from('community_routes').update({ status: 'approved' }).eq('id', routeId)
        if (error) return { error: error.message }

        revalidatePath('/admin/routes')
        revalidatePath('/route-suggest') // Revalidate main search
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

        const { error } = await supabase.from('community_routes').update({ status: 'rejected' }).eq('id', routeId)
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

        const { error } = await supabase.from('community_routes').delete().eq('id', routeId)
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

        const { error } = await supabase.from('community_routes').update({ status: newStatus }).eq('id', routeId)
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
        const start_location = formData.get('start_location') as string
        const destination = formData.get('destination') as string
        const status = formData.get('status') as string
        const vehicle_type_used = formData.get('vehicle_type_used') as string
        const estimated_travel_time_min = formData.get('estimated_travel_time_min') ? parseInt(formData.get('estimated_travel_time_min') as string) : null
        const fare_price_range_min = formData.get('fare_price_range_max') ? parseInt(formData.get('fare_price_range_max') as string) : null // we'll use fare_price_range_min for the estimated total
        const itineraryStr = formData.get('stopsJSON') as string

        let stops_along_the_way = []
        if (itineraryStr) {
            try {
                stops_along_the_way = JSON.parse(itineraryStr)
            } catch (e) { /* ignore */ }
        }

        const supabase = await createClient()

        const { data: authData } = await supabase.auth.getUser()
        const user = authData?.user

        const { data: actorProfile } = await supabase.from('profiles').select('is_admin').eq('id', user?.id).single()

        if (!actorProfile?.is_admin) return { error: 'Unauthorized' }

        const updates: any = {
            start_location,
            destination,
            vehicle_type_used,
            stops_along_the_way,
            status
        }

        if (estimated_travel_time_min !== null) updates.estimated_travel_time_min = estimated_travel_time_min
        if (fare_price_range_min !== null) {
            updates.fare_price_range_min = fare_price_range_min
            updates.fare_price_range_min = fare_price_range_min
        }

        const { error } = await supabase.from('community_routes').update(updates).eq('id', routeId)

        if (error) return { error: error.message }

        // We don't revalidate here, we'll let the client redirect
        return { success: true }
    } catch (err: any) {
        return { error: err.message }
    }
}
