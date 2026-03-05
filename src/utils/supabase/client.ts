import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | undefined

export function createClient() {
    if (typeof window === 'undefined') {
        return createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
    }

    if (client) return client

    client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
                storage: {
                    getItem: (key) => {
                        if (typeof window === 'undefined') return null
                        const cookies = document.cookie.split('; ')
                        for (const cookie of cookies) {
                            const [name, value] = cookie.split('=')
                            if (name === key) return decodeURIComponent(value)
                        }
                        return null
                    },
                    setItem: (key, value) => {
                        if (typeof window === 'undefined') return
                        // Secure, SameSite=Lax, and Path=/
                        document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax; Secure`
                    },
                    removeItem: (key) => {
                        if (typeof window === 'undefined') return
                        document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax; Secure`
                    }
                }
            }
        }
    )
    return client
}
