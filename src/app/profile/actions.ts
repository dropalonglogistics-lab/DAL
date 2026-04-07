'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()

    const data = {
        full_name: formData.get('full_name') as string,
        bio: formData.get('bio') as string,
    }

    const { data: authData } = await supabase.auth.getUser()
    const user = authData?.user

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const { error } = await supabase
        .from('profiles')
        .update({
            full_name: data.full_name,
            bio: data.bio,
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/profile')
    return { success: true }
}

export async function updateAvatarUrl(url: string) {
    const supabase = await createClient()
    
    // Get authorized user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    // Update avatar field
    const { error } = await supabase
        .from('profiles')
        .update({ 
            avatar_url: url, 
            updated_at: new Date().toISOString() 
        })
        .eq('id', user.id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/profile')
    return { success: true }
}
