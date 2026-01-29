import { type NextRequest, NextResponse } from 'next/server'
// The client condition is to use the server-side createClient helper, but since we're in a route handler,
// we should use the one that handles cookies.
import { createClient } from '@/utils/supabase/server'
import { getBaseUrl } from '@/utils/url'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return NextResponse.redirect(`${getBaseUrl()}${next}`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${getBaseUrl()}/auth/auth-error`)
}
