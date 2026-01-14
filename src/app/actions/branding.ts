'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export async function updateBranding(data: {
  primaryColor?: string;
  sidebarColor?: string;
  logoUrl?: string | null;
}) {
  const authClient = createClient(cookies())
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get organization ID from profile
  const { data: profile } = await authClient
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()
  
  if (!profile?.organization_id) throw new Error('Organization not found')

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('organizations')
    .update({
      primary_color: data.primaryColor,
      sidebar_color: data.sidebarColor,
      logo_url: data.logoUrl,
      updated_at: new Date().toISOString()
    })
    .eq('id', profile.organization_id)

  if (error) throw new Error(error.message)

  revalidatePath('/branding')
  revalidatePath('/(dashboard)/branding', 'page')
  
  return { success: true }
}

