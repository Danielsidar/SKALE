import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
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
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/signup')
  
  const isDashboardPage = request.nextUrl.pathname.startsWith('/overview') ||
                          request.nextUrl.pathname.startsWith('/courses') ||
                          request.nextUrl.pathname.startsWith('/students') ||
                          request.nextUrl.pathname.startsWith('/permissions') ||
                          request.nextUrl.pathname.startsWith('/branding') ||
                          request.nextUrl.pathname.startsWith('/settings')

  if (user) {
    if (isAuthPage || isDashboardPage) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*, organizations(slug)')
        .eq('id', user.id)

      const profile = profiles?.[0]
      const hasMultiple = (profiles?.length || 0) > 1

      if (hasMultiple && request.nextUrl.pathname !== '/select-academy') {
        return NextResponse.redirect(new URL('/select-academy', request.url))
      }

      if (profile && profile.role === 'student' && isDashboardPage) {
        if (profile.organizations?.slug) {
          return NextResponse.redirect(new URL(`/academy/${profile.organizations.slug}/home`, request.url))
        }
      }

      // Update last_seen_at for active profile
      if (profile) {
        await supabase
          .from('profiles')
          .update({ last_seen_at: new Date().toISOString() })
          .eq('id', user.id)
          .eq('organization_id', profile.organization_id)
      }

      if (user && isAuthPage) {
        if (profile && profile.role === 'student') {
          if (profile.organizations?.slug) {
            return NextResponse.redirect(new URL(`/academy/${profile.organizations.slug}/home`, request.url))
          }
        }
        return NextResponse.redirect(new URL('/overview', request.url), {
          headers: response.headers
        })
      }
    }
  }

  if (!user && !isAuthPage && !request.nextUrl.pathname.startsWith('/academy') && request.nextUrl.pathname !== '/' && !request.nextUrl.pathname.startsWith('/select-academy')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

