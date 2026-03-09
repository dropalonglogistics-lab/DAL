import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Routes that require an authenticated session
const PROTECTED_PREFIXES = [
    '/dashboard',
    '/rider',
    '/errand',
    '/driver',
    '/business',
]

// Routes that require is_admin or role in ('admin', 'superadmin')
const ADMIN_PREFIXES = ['/admin']

// Routes that require role = 'superadmin'
const SUPERADMIN_PREFIXES = ['/superadmin']

// Auth pages that logged-in users should NOT see
const AUTH_PAGES = ['/auth/login', '/auth/register']

function matchesPrefix(pathname: string, prefixes: string[]) {
    return prefixes.some(prefix => pathname === prefix || pathname.startsWith(prefix + '/'))
}

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Skip purely static asset paths
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api/auth/') || // let API routes through
        /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$/.test(pathname)
    ) {
        return NextResponse.next({ request })
    }

    let response = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll() },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    response = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Refresh session (important — do not skip)
    const { data: { user } } = await supabase.auth.getUser()

    // ── Redirect logged-in users away from auth pages ─────────────
    if (user && matchesPrefix(pathname, AUTH_PAGES)) {
        return NextResponse.redirect(new URL('/profile', request.url))
    }

    // ── Protected routes: require session ─────────────────────────
    if (matchesPrefix(pathname, PROTECTED_PREFIXES)) {
        if (!user) {
            const redirectUrl = new URL('/auth/login', request.url)
            redirectUrl.searchParams.set('next', pathname)
            return NextResponse.redirect(redirectUrl)
        }
    }

    // ── Admin routes ──────────────────────────────────────────────
    if (matchesPrefix(pathname, ADMIN_PREFIXES)) {
        if (!user) {
            return NextResponse.redirect(new URL('/auth/login', request.url))
        }

        // Fetch profile to check role  (server-side, uses service role cookie)
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin, role')
            .eq('id', user.id)
            .single()

        const isAdmin = profile?.is_admin === true || profile?.role === 'admin' || profile?.role === 'superadmin'
        if (!isAdmin) {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // ── Superadmin routes ─────────────────────────────────────────
    if (matchesPrefix(pathname, SUPERADMIN_PREFIXES)) {
        if (!user) {
            return NextResponse.redirect(new URL('/auth/login', request.url))
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'superadmin') {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
