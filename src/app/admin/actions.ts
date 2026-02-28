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
