'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export async function updateProfile(data: { name?: string; email?: string }) {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  // Get current organization from active_org_id cookie if available, 
  // or just use the first profile found. In academy context, we usually have the org context.
  // For simplicity here, we'll update the profile for the current user.
  
  const profileUpdates: any = {}
  if (data.name) profileUpdates.name = data.name
  
  if (Object.keys(profileUpdates).length > 0) {
    const { error } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', user.id)
    
    if (error) throw new Error(error.message)
  }

  // Update auth email if changed (this requires confirmation usually)
  if (data.email && data.email !== user.email) {
    const { error: authError } = await supabase.auth.updateUser({ email: data.email })
    if (authError) throw new Error(authError.message)
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function updatePassword(password: string) {
  const supabase = createClient(cookies())
  const { error } = await supabase.auth.updateUser({ password })
  
  if (error) throw new Error(error.message)
  
  return { success: true }
}

