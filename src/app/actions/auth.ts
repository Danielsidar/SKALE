'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function signUp(formData: FormData) {
  const supabase = createClient()
  const admin = createAdminClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const academyName = formData.get('academyName') as string

  // 1. Sign up the user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (authError) throw new Error(authError.message)
  if (!authData.user) throw new Error('שגיאה ביצירת משתמש')

  const userId = authData.user.id
  const slug = academyName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')

  // 2. Create the organization (using admin client to bypass initial RLS if needed, or if policies aren't set yet)
  const { data: orgData, error: orgError } = await admin
    .from('organizations')
    .insert([
      {
        name: academyName,
        slug: slug,
      },
    ])
    .select()
    .single()

  if (orgError) {
    // If slug exists, try to append a random number
    if (orgError.code === '23505') {
      const randomSlug = `${slug}-${Math.floor(Math.random() * 1000)}`
      const { data: orgDataRetry, error: orgErrorRetry } = await admin
        .from('organizations')
        .insert([
          {
            name: academyName,
            slug: randomSlug,
          },
        ])
        .select()
        .single()
      
      if (orgErrorRetry) throw new Error('שגיאה ביצירת אקדמיה: ' + orgErrorRetry.message)
      // Continue with orgDataRetry
    } else {
      throw new Error('שגיאה ביצירת אקדמיה: ' + orgError.message)
    }
  }

  const organization = orgData || (await admin.from('organizations').select().eq('name', academyName).single()).data
  if (!organization) throw new Error('שגיאה בשליפת נתוני האקדמיה')

  // 3. Create/Update the profile
  const { error: profileError } = await admin
    .from('profiles')
    .insert([
      {
        id: userId,
        name: fullName,
        email: email,
        role: 'admin',
        organization_id: organization.id,
      },
    ])

  if (profileError) throw new Error('שגיאה ביצירת פרופיל: ' + profileError.message)

  revalidatePath('/overview')
  return { success: true }
}

export async function getRedirectUrl() {
  try {
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log('getRedirectUrl: No user found', userError)
      return '/login'
    }

    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*, organizations(slug)')
      .eq('id', user.id)

    if (profileError) {
      console.error('getRedirectUrl: Profile fetch error', profileError)
      return '/overview'
    }

    if (!profiles || profiles.length === 0) {
      console.log('getRedirectUrl: No profile found for user', user.id)
      return '/overview'
    }

    if (profiles.length > 1) {
      return '/select-academy'
    }

    const profile = profiles[0]
    
    // Set active organization cookie for the single organization
    if (profile.organization_id) {
      cookies().set('active_org_id', profile.organization_id, { path: '/' })
    }

    if (profile.role === 'admin' || profile.role === 'support' || profile.role === 'owner') {
      return '/overview'
    }

    // Student
    // Handle potential array or object for organizations join
    const org = Array.isArray(profile.organizations) 
      ? profile.organizations[0] 
      : profile.organizations

    if (org?.slug) {
      return `/academy/${org.slug}/home`
    }

    console.log('getRedirectUrl: Fallback to /overview', { role: profile.role, hasOrg: !!org })
    return '/overview' // Fallback
  } catch (error) {
    console.error('getRedirectUrl: Unexpected error', error)
    return '/overview' // Final fallback
  }
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function setActiveOrganization(orgId: string, redirectUrl: string) {
  cookies().set('active_org_id', orgId, { path: '/' })
  redirect(redirectUrl)
}

export async function checkEmailStatus(email: string, orgSlug?: string) {
  const admin = createAdminClient()
  
  // 1. Check if user is in this organization (or just exists if no orgSlug provided)
  let query = admin
    .from('profiles')
    .select('*, organizations(slug)')
    .eq('email', email)

  if (orgSlug) {
    // If orgSlug is provided, we use !inner join to filter by it
    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('*, organizations!inner(slug)')
      .eq('email', email)
      .eq('organizations.slug', orgSlug)
      .maybeSingle()
    
    if (!profile) return { exists: false }
    
    // Check password status
    const { data: { users }, error: listError } = await admin.auth.admin.listUsers()
    if (listError) throw new Error(listError.message)
    const authUser = users.find(u => u.email === email)
    const needsPasswordSetup = authUser?.user_metadata?.needs_password_setup === true

    return { exists: true, needsPasswordSetup, name: profile.name }
  } else {
    // General login - just check if any profile exists
    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle()

    if (!profile) return { exists: false }

    // Check password status
    const { data: { users }, error: listError } = await admin.auth.admin.listUsers()
    if (listError) throw new Error(listError.message)
    const authUser = users.find(u => u.email === email)
    const needsPasswordSetup = authUser?.user_metadata?.needs_password_setup === true

    return { exists: true, needsPasswordSetup, name: profile.name }
  }
}

export async function completeRegistration(email: string, password: string) {
  const admin = createAdminClient()
  
  const { data: { users }, error: listError } = await admin.auth.admin.listUsers()
  if (listError) throw new Error(listError.message)
  
  const authUser = users.find(u => u.email === email)
  if (!authUser) throw new Error("User not found")

  // Update password and remove the flag
  const { error: updateError } = await admin.auth.admin.updateUserById(authUser.id, {
    password: password,
    user_metadata: { 
      ...authUser.user_metadata, 
      needs_password_setup: false 
    }
  })

  if (updateError) throw new Error(updateError.message)

  return { success: true }
}

