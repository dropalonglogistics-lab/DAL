import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function SetupAdminPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return (
            <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily: 'system-ui' }}>
                <h1 style={{ color: '#0F172A' }}>Authentication Required</h1>
                <p>Please login with <strong>ekechristopher56@gmail.com</strong> first.</p>
                <a href="/login?next=/setup-admin" style={{ display: 'inline-block', marginTop: '10px', color: '#2563EB', textDecoration: 'underline' }}>Login here</a>
            </div>
        )
    }

    const targetEmail = 'ekechristopher56@gmail.com'
    const isTargetUser = user.email?.toLowerCase().trim() === targetEmail.toLowerCase().trim()

    if (!isTargetUser) {
        return (
            <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily: 'system-ui', border: '1px solid #FECACA', borderRadius: '8px', background: '#FEF2F2' }}>
                <h1 style={{ color: '#EF4444' }}>Unauthorized</h1>
                <p>This recovery tool is only for the master admin account.</p>
                <div style={{ background: '#fff', padding: '15px', borderRadius: '4px', marginTop: '10px' }}>
                    <p style={{ margin: 0, fontSize: '0.9em', color: '#64748B' }}>Current Logged In User:</p>
                    <p style={{ margin: '5px 0 0 0', fontWeight: 'bold' }}>{user.email}</p>
                    <p style={{ margin: '5px 0 0 0', fontSize: '0.8em', color: '#94A3B8' }}>ID: {user.id}</p>
                </div>
            </div>
        )
    }

    // Attempt Force Update
    console.log(`Attempting to promote user ${user.id} (${user.email})`)

    const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    let updateError = null

    // Create profile if missing
    if (!profile) {
        const { error: insertError } = await supabase
            .from('profiles')
            .insert([{
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || 'Admin User',
                is_admin: true // Set true on create
            }])
        updateError = insertError
    } else {
        // Update existing
        const { error: e } = await supabase
            .from('profiles')
            .update({ is_admin: true })
            .eq('id', user.id)
        updateError = e
    }

    if (updateError) {
        const isMissingColumn = updateError.code === 'PGRST204' || updateError.message?.includes('is_admin')

        return (
            <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily: 'system-ui' }}>
                <h1 style={{ color: '#EF4444' }}>Setup Failed</h1>

                {isMissingColumn ? (
                    <div style={{ background: '#FFF7ED', border: '1px solid #F97316', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                        <h3 style={{ color: '#EA580C', marginTop: 0 }}>⚠️ Database Update Required</h3>
                        <p>The <code>is_admin</code> column is missing from your database.</p>
                        <p><strong>You must run this SQL in your Supabase Dashboard:</strong></p>
                        <pre style={{ background: '#1E293B', color: '#F8FAFC', padding: '15px', borderRadius: '4px', overflowX: 'auto' }}>
                            {`ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

NOTIFY pgrst, 'reload schema';`}
                        </pre>
                        <p style={{ fontSize: '0.9em', color: '#666' }}>Go to Supabase -> SQL Editor -> New Query -> Paste & Run.</p>
                    </div>
                ) : (
                    <p>We tried to update your profile but encountered an error. This might be due to database permissions (RLS).</p>
                )}

                <div style={{ background: '#F1F5F9', padding: '15px', borderRadius: '4px', marginTop: '10px', overflowX: 'auto' }}>
                    <pre style={{ margin: 0, fontSize: '0.85em' }}>{JSON.stringify(updateError, null, 2)}</pre>
                </div>
                <div style={{ marginTop: '20px' }}>
                    <h3>Diagnostic Info:</h3>
                    <ul>
                        <li>Email Match: Yes</li>
                        <li>User ID: {user.id}</li>
                        <li>Profile Exists: {profile ? 'Yes' : 'No'}</li>
                        {profile && <li>Current Admin Status: {String(profile.is_admin)}</li>}
                    </ul>
                </div>
            </div>
        )
    }

    // Verification Fetch
    const { data: finalProfile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

    if (finalProfile?.is_admin) {
        redirect('/admin')
    } else {
        return (
            <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily: 'system-ui' }}>
                <h1 style={{ color: '#F59E0B' }}>Update Verification Failed</h1>
                <p>The update command ran without error, but the read-back verification says you are still not an admin.</p>
                <p>This strongly suggests a database Row Level Security (RLS) policy is silently blocking the update.</p>
            </div>
        )
    }
}
