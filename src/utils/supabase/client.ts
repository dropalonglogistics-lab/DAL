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
                        if (typeof window === 'undefined') return null
                        try {
                            const cookies = document.cookie.split('; ')
                            for (const cookie of cookies) {
                                if (!cookie.includes('=')) continue
                                const [name, ...valueParts] = cookie.split('=')
                                const value = valueParts.join('=')
                                if (name.trim() === key) return decodeURIComponent(value)
                            }
                        } catch (e) {
                            console.error('Cookie parse error:', e)
                        }
                        return null
                    },
                    setItem: (key, value) => {
                        if (typeof window === 'undefined') return
                        try {
                            // Secure, SameSite=Lax, and Path=/
                            document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax; Secure`
                        } catch (e) {
                            console.error('Cookie set error:', e)
                        }
                    },
                    removeItem: (key) => {
                        if (typeof window === 'undefined') return
                        try {
                            document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax; Secure`
                        } catch (e) {
                            console.error('Cookie remove error:', e)
                        }
                    }
                }
            }
        }
    )
    return client
}
