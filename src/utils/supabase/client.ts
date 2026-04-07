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
                flowType: 'pkce',
                storage: {
                    getItem: (key) => {
                        const cookies = document.cookie.split('; ')
                        for (const cookie of cookies) {
                            const [name, ...valueParts] = cookie.split('=')
                            if (name.trim() === key) return decodeURIComponent(valueParts.join('='))
                        }
                        return null
                    },
                    setItem: (key, value) => {
                        document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax; Secure`
                    },
                    removeItem: (key) => {
                        document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax; Secure`
                    }
                }
            }
        }
    )
    return client
}
