import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

type CookieToSet = { name: string; value: string; options: CookieOptions }

export function createClient(cookieStore?: ReturnType<typeof cookies>) {
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
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }: CookieToSet) =>
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
