'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function promoteToAdmin(formData: FormData) {
    try {
        const userId = formData.get('userId') as string
        const supabase = await createClient()

        // Security check: Only admins can promote others
        const { data: { user } } = await supabase.auth.getUser()
        const { data: actorProfile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user?.id)
            .single()

        if (!actorProfile?.is_admin) {
            return { error: 'Unauthorized: Only admins can promote users.' }
        }

        const { error, count } = await supabase
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
        const { data: { user } } = await supabase.auth.getUser()
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
