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

// Auth pages that logged-in users should NOT see
const AUTH_PAGES = ['/auth/login', '/auth/register']

function matchesPrefix(pathname: string, prefixes: string[]) {
    return prefixes.some(prefix =>
        pathname === prefix || pathname.startsWith(prefix + '/')
    )
}

export default async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    let response = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll() },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    response = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Refresh session cookies
    const { data: { user } } = await supabase.auth.getUser()

    // Redirect logged-in users away from auth pages
    if (user && matchesPrefix(pathname, AUTH_PAGES)) {
        return NextResponse.redirect(new URL('/profile', request.url))
    }

    // Protect general dashboard/role routes — require session
    if (matchesPrefix(pathname, PROTECTED_PREFIXES)) {
        if (!user) {
            const loginUrl = new URL('/auth/login', request.url)
            loginUrl.searchParams.set('next', pathname)
            return NextResponse.redirect(loginUrl)
        }
    }

    // Admin + superadmin routes: session required.
    // Role check happens server-side in the route's own layout.tsx (isAdmin()),
    // not here — avoids Edge Runtime DB queries that fail on Vercel.
    if (pathname.startsWith('/admin') || pathname.startsWith('/superadmin')) {
        if (!user) {
            return NextResponse.redirect(new URL('/auth/login', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
