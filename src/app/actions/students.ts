'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export async function checkUserExists(email: string) {
  const admin = createAdminClient()
  
  // 1. Check in Auth
  const { data: { users }, error } = await admin.auth.admin.listUsers()
  if (error) throw new Error(error.message)
  
  const user = users.find(u => u.email === email)
  if (!user) return null

  // 2. Check if they are in the current admin's organization
  const supabase = createClient(cookies())
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) throw new Error('Not authenticated')

  const { data: adminProfiles } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', currentUser.id)
    .eq('role', 'admin')
  
  const organizationId = adminProfiles?.[0]?.organization_id
  if (!organizationId) return { id: user.id, email: user.email, isAlreadyInOrg: false }

  const { data: existingProfile } = await admin
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .eq('organization_id', organizationId)
    .maybeSingle()

  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.full_name || user.email?.split('@')[0],
    isAlreadyInOrg: !!existingProfile
  }
}

export async function inviteStudent(email: string, role: 'student' | 'support' = 'student') {
  const supabase = createClient(cookies())
  const admin = createAdminClient()
  
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) throw new Error('Not authenticated')

  const { data: adminProfiles } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', currentUser.id)
    .eq('role', 'admin')
  
  const organizationId = adminProfiles?.[0]?.organization_id
  if (!organizationId) throw new Error('Organization not found or not an admin')

  // Check if user exists in Auth
  const { data: { users }, error: listError } = await admin.auth.admin.listUsers()
  if (listError) throw new Error(listError.message)
  
  const existingAuthUser = users.find(u => u.email === email)

  if (existingAuthUser) {
    // User exists. Just add them to the organization if not already there.
    const { data: existingProfile } = await admin
      .from('profiles')
      .select('id')
      .eq('id', existingAuthUser.id)
      .eq('organization_id', organizationId)
      .maybeSingle()

    if (existingProfile) {
      throw new Error('הסטודנט כבר רשום במכללה זו')
    }

    const { error: profileError } = await admin
      .from('profiles')
      .insert([
        {
          id: existingAuthUser.id,
          email,
          name: existingAuthUser.user_metadata?.full_name || email.split('@')[0],
          role,
          organization_id: organizationId,
        }
      ])

    if (profileError) {
      console.error('Error inserting profile:', profileError)
      if (profileError.code === '23505') {
        throw new Error('שגיאת כפל מפתחות: יש לוודא שהמפתח הראשי בטבלת profiles הוא (id, organization_id)')
      }
      throw new Error(profileError.message)
    }
    
    revalidatePath('/students')
    return { success: true, message: 'הסטודנט התווסף למכללה בהצלחה' }
  }

  // Create new user without password (will be set on first login)
  // We use a random password initially because Supabase requires one or it sends an invite email which we might not want yet
  const tempPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).toUpperCase().slice(-12)
  
  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { 
      full_name: email.split('@')[0],
      needs_password_setup: true 
    }
  })

  if (authError) throw new Error(authError.message)

  const { error: profileError } = await admin
    .from('profiles')
    .insert([
      {
        id: authUser.user.id,
        email,
        name: email.split('@')[0],
        role,
        organization_id: organizationId,
      }
    ])

  if (profileError) throw new Error(profileError.message)
  
  revalidatePath('/students')
  return { success: true }
}

export async function updateStudent(studentId: string, data: { name?: string, email?: string, password?: string }) {
  const admin = createAdminClient()
  const supabase = createClient(cookies())

  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) throw new Error('Not authenticated')

  const { data: adminProfiles } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', currentUser.id)
    .eq('role', 'admin')
  
  const organizationId = adminProfiles?.[0]?.organization_id
  if (!organizationId) throw new Error('Not authorized')
  
  // 1. Update Auth
  const authUpdates: any = {}
  if (data.email) authUpdates.email = data.email
  if (data.password) authUpdates.password = data.password
  
  if (Object.keys(authUpdates).length > 0) {
    const { error: authError } = await admin.auth.admin.updateUserById(studentId, authUpdates)
    if (authError) throw new Error(authError.message)
  }

  // 2. Update Profile (only for the current organization)
  const profileUpdates: any = {}
  if (data.name) profileUpdates.name = data.name
  if (data.email) profileUpdates.email = data.email
  
  if (Object.keys(profileUpdates).length > 0) {
    const { error: profileError } = await admin
      .from('profiles')
      .update(profileUpdates)
      .eq('id', studentId)
      .eq('organization_id', organizationId)
    
    if (profileError) throw new Error(profileError.message)
  }

  revalidatePath('/students')
  revalidatePath(`/students/${studentId}`)
}

export async function removeStudent(studentId: string) {
  const supabase = createClient(cookies())
  const admin = createAdminClient()
  
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) throw new Error('Not authenticated')

  const { data: adminProfiles } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', currentUser.id)
    .eq('role', 'admin')
  
  const organizationId = adminProfiles?.[0]?.organization_id
  if (!organizationId) throw new Error('Not authorized')

  console.log(`Removing student ${studentId} from organization ${organizationId}`)

  // 1. Remove all related data that might have foreign key constraints
  // We do this manually to ensure deletion even if CASCADE is not set
  
  // Delete enrollments
  await admin.from('enrollments').delete().eq('profile_id', studentId)
  
  // Delete lesson completions
  await admin.from('lesson_completions').delete().eq('profile_id', studentId)
  
  // Delete lesson questions
  await admin.from('lesson_questions').delete().eq('profile_id', studentId)
  
  // Delete notifications
  await admin.from('notifications').delete().eq('profile_id', studentId)
  
  // Delete message reads
  await admin.from('message_reads').delete().eq('profile_id', studentId)

  // 2. Delete the profile for this organization
  const { error } = await admin
    .from('profiles')
    .delete()
    .eq('id', studentId)
    .eq('organization_id', organizationId)

  if (error) {
    console.error('Error deleting profile:', error)
    throw new Error(error.message)
  }

  revalidatePath('/students')
  revalidatePath('/', 'layout')
}

export async function updateStudentRole(studentId: string, role: string) {
  const supabase = createClient(cookies())
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) throw new Error('Not authenticated')

  const { data: adminProfiles } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', currentUser.id)
    .eq('role', 'admin')
  
  const organizationId = adminProfiles?.[0]?.organization_id
  if (!organizationId) throw new Error('Not authorized')
  
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', studentId)
    .eq('organization_id', organizationId)

  if (error) throw new Error(error.message)

  revalidatePath('/students')
  revalidatePath(`/students/${studentId}`)
}

export async function enrollStudentInCourse(studentId: string, courseId: string) {
  const supabase = createClient(cookies())
  
  const { error } = await supabase
    .from('enrollments')
    .insert([{ profile_id: studentId, course_id: courseId }])

  if (error) {
    if (error.code === '23505') return // Already enrolled
    throw new Error(error.message)
  }

  revalidatePath('/students')
  revalidatePath(`/students/${studentId}`)
}

export async function unenrollStudentFromCourse(studentId: string, courseId: string) {
  const supabase = createClient(cookies())
  
  const { error } = await supabase
    .from('enrollments')
    .delete()
    .eq('profile_id', studentId)
    .eq('course_id', courseId)

  if (error) throw new Error(error.message)

  revalidatePath('/students')
  revalidatePath(`/students/${studentId}`)
}
