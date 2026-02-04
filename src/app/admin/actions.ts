'use client'
// Wait, actions should be 'use server' if they are server actions.
// But I need to check the user's admin status inside the action for security.
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function promoteToAdmin(formData: FormData) {
    'use server'

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
        throw new Error('Unauthorized')
    }

    const { error } = await supabase
        .from('profiles')
        .update({ is_admin: true })
        .eq('id', userId)

    if (error) throw error

    revalidatePath('/admin/users')
}
