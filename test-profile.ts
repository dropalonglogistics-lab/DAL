import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkProfile() {
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
        console.error('Auth check error:', authError)
    } else {
        const user = authUsers.users.find(u => u.email === 'ekechristopher56@gmail.com' || u.email === 'ekechrisopher56@gmail.com')
        if (user) {
            console.log('Found in Auth:', user.id, user.email)
            const { data: profile, error: profError } = await supabase.from('profiles').select('*').eq('id', user.id).single()
            console.log('Profile Data:', profile)
            console.log('Profile Error:', profError)
        } else {
            console.log('User not found in Auth system.')
        }
    }
}

checkProfile()
