import { type NextRequest, NextResponse } from 'next/server'
// The client condition is to use the server-side createClient helper, but since we're in a route handler,
// we should use the one that handles cookies.
import { createClient } from '@/utils/supabase/server'
import { getBaseUrl } from '@/utils/url'

// reminder: configure Google provider in the Supabase dashboard
// under Authentication -> Providers -> Google using:
// Client ID: 383104353649-332sdusnt8pgv1da3498rer32jea1n2b.apps.googleusercontent.com
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const requestedRole = searchParams.get('role') || 'user'
    const origin = request.nextUrl.origin

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single()

                if (!profile) {
                    await supabase.from('profiles').insert({
                        id: user.id,
                        full_name: user.user_metadata?.full_name || '',
                        email: user.email,
                        role: requestedRole,
                        avatar_url: user.user_metadata?.avatar_url || ''
                    })
                    
                    if (user.email) {
                        fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/notifications/email`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ to: user.email, template: 'welcome', userId: user.id, data: { name: user.user_metadata?.full_name || 'User' } })
                        }).catch(console.error);
                    }
                    
                    return NextResponse.redirect(`${origin}/dashboard`)
                }

                const roleRedirects: Record<string, string> = {
                    user: '/dashboard',
                    rider: '/become-a-rider',
                    errand_worker: '/become-an-errand-worker',
                    driver: '/become-a-driver',
                    admin: '/admin',
                    super_admin: '/super-admin'
                }

                const destination = roleRedirects[profile.role] || '/dashboard'
                return NextResponse.redirect(`${origin}${destination}`)
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-error`)
}
