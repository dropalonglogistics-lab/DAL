import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Refresh session cookies
    const { data: { user } } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl

    // 1. Redirect logged-in users away from auth pages
    const authPages = ['/login', '/signup', '/auth/login', '/auth/register']
    if (user && authPages.some(page => pathname === page || pathname.startsWith(page + '/'))) {
        return NextResponse.redirect(new URL('/profile', request.url))
    }

    // 2. Protect sensitive routes
    const protectedPrefixes = ['/dashboard', '/rider', '/errand', '/driver', '/business', '/admin', '/superadmin']
    if (protectedPrefixes.some(prefix => pathname === prefix || pathname.startsWith(prefix + '/'))) {
        if (!user) {
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('next', pathname)
            return NextResponse.redirect(loginUrl)
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public assets (svg, png, etc)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
