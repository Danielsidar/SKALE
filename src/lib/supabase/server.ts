import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient(cookieStore?: any) {
  // If cookieStore is not provided, try to get it from next/headers
  // This makes the function more flexible and robust
  const effectiveStore = cookieStore || cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          try {
            return effectiveStore.getAll()
          } catch (error) {
            return []
          }
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              effectiveStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method can be called from Server Components,
            // which cannot set cookies.
          }
        },
      },
    }
  )
}
