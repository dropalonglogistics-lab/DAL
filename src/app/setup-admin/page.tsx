import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function SetupAdminPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <h1>Authentication Required</h1>
                <p>Please login with <strong>ekechristopher56@gmail.com</strong> first.</p>
                <a href="/login?next=/setup-admin" style={{ color: 'blue', textDecoration: 'underline' }}>Login here</a>
            </div>
        )
    }

    if (user.email !== 'ekechristopher56@gmail.com') {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>
                <h1>Unauthorized</h1>
                <p>This recovery tool is only for the master admin account.</p>
                <p>Current email: {user.email}</p>
            </div>
        )
    }

    // Force update the specific user
    const { error } = await supabase
        .from('profiles')
        .update({ is_admin: true })
        .eq('id', user.id)

    if (error) {
        return (
            <div style={{ padding: '40px', color: 'red' }}>
                <h1>Error Updating Profile</h1>
                <pre>{JSON.stringify(error, null, 2)}</pre>
            </div>
        )
    }

    // Redirect to admin dashboard on success
    redirect('/admin')
}
