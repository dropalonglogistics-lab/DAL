'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()

    const data = {
        full_name: formData.get('fullName') as string,
        address: formData.get('address') as string,
        date_of_birth: formData.get('dob') as string || null,
        avatar_url: formData.get('avatarUrl') as string,
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const { error } = await supabase
        .from('profiles')
        .update({
            full_name: data.full_name,
            address: data.address,
            date_of_birth: data.date_of_birth,
            avatar_url: data.avatar_url,
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/profile')
    return { success: true }
}
