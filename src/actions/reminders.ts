'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export async function getReminders() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile) throw new Error('Profile not found')

  const { data, error } = await supabase
    .from('learning_reminders')
    .select('*')
    .eq('organization_id', profile.organization_id)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function createReminder(data: {
  title: string
  trigger_type: string
  trigger_config: any
  email_subject: string
  email_content: string
}) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile) throw new Error('Profile not found')

  const { data: reminder, error } = await supabase
    .from('learning_reminders')
    .insert([
      {
        ...data,
        organization_id: profile.organization_id,
        is_enabled: true
      }
    ])
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/reminders')
  return reminder
}

export async function updateReminder(id: string, data: Partial<{
  title: string
  trigger_type: string
  trigger_config: any
  email_subject: string
  email_content: string
  is_enabled: boolean
}>) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('learning_reminders')
    .update(data)
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/reminders')
}

export async function deleteReminder(id: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('learning_reminders')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/reminders')
}

