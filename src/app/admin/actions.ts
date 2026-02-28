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
        const origin = formData.get('origin') as string
        const destination = formData.get('destination') as string
        const status = formData.get('status') as string
        const vehicle_type = formData.get('vehicle_type') as string
        const duration_minutes = formData.get('duration_minutes') ? parseInt(formData.get('duration_minutes') as string) : null
        const fare_min = formData.get('fare_max') ? parseInt(formData.get('fare_max') as string) : null // we'll use fare_min for the estimated total
        const itineraryStr = formData.get('stopsJSON') as string

        let itinerary = []
        if (itineraryStr) {
            try {
                itinerary = JSON.parse(itineraryStr)
            } catch (e) { /* ignore */ }
        }

        const supabase = await createClient()

        const { data: authData } = await supabase.auth.getUser()
        const user = authData?.user

        const { data: actorProfile } = await supabase.from('profiles').select('is_admin').eq('id', user?.id).single()

        if (!actorProfile?.is_admin) return { error: 'Unauthorized' }

        const updates: any = {
            origin,
            destination,
            vehicle_type,
            itinerary,
            status
        }

        if (duration_minutes !== null) updates.duration_minutes = duration_minutes
        if (fare_min !== null) {
            updates.fare_min = fare_min
            updates.price_estimated = fare_min
        }

        const { error } = await supabase.from('community_routes').update(updates).eq('id', routeId)

        if (error) return { error: error.message }

        // We don't revalidate here, we'll let the client redirect
        return { success: true }
    } catch (err: any) {
        return { error: err.message }
    }
}
