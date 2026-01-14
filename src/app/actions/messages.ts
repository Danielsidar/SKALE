'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createNotification, notifyAllStudents, notifyCourseStudents } from './notifications'

export async function sendAcademyMessage(data: {
  recipientId?: string | null;
  courseIds?: string[] | null;
  subject: string;
  content: string;
  orgSlug: string;
}) {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get organization ID from slug
  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', data.orgSlug)
    .single()

  if (!organization) throw new Error('Organization not found')

  // Verify sender is admin/support
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .eq('organization_id', organization.id)
    .single()

  if (!profile || !['admin', 'support'].includes(profile.role)) {
    throw new Error('Unauthorized: Only admins can send messages')
  }

  const { data: insertedMessage, error } = await supabase
    .from('academy_messages')
    .insert([{
      organization_id: organization.id,
      sender_id: user.id,
      recipient_id: data.recipientId || null,
      course_ids: data.courseIds || null,
      subject: data.subject,
      content: data.content,
    }])
    .select()
    .single()

  if (error) throw new Error(error.message)

  // Notify recipients based on targeting
  try {
    if (data.recipientId) {
      await createNotification({
        userId: data.recipientId,
        organizationId: organization.id,
        type: 'message',
        title: 'הודעה חדשה מהאקדמיה',
        content: data.subject,
        link: `/academy/${data.orgSlug}/messages`,
        actorId: user.id,
        targetId: insertedMessage.id
      })
    } else if (data.courseIds && data.courseIds.length > 0) {
      for (const courseId of data.courseIds) {
        await notifyCourseStudents({
          courseId,
          organizationId: organization.id,
          type: 'message',
          title: 'הודעה חדשה מהאקדמיה',
          content: data.subject,
          link: `/academy/${data.orgSlug}/messages`,
          actorId: user.id,
          targetId: insertedMessage.id
        })
      }
    } else {
      await notifyAllStudents({
        organizationId: organization.id,
        type: 'message',
        title: 'הודעה חדשה מהאקדמיה',
        content: data.subject,
        link: `/academy/${data.orgSlug}/messages`,
        actorId: user.id,
        targetId: insertedMessage.id
      })
    }
  } catch (notifyError) {
    console.error('Failed to send notifications for message:', notifyError)
    // We don't throw here to not break the message sending itself
  }

  revalidatePath(`/academy/${data.orgSlug}/home`)
  revalidatePath(`/academy/${data.orgSlug}/messages`)
  return { success: true }
}

export async function markMessageAsRead(messageId: string, orgId: string) {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('message_reads')
    .upsert({ 
        message_id: messageId, 
        profile_id: user.id,
        organization_id: orgId
    }, { 
        onConflict: 'message_id, profile_id, organization_id' 
    })

  if (error) console.error('Error marking message as read:', error)
  
  revalidatePath('/(dashboard)/overview', 'layout')
  revalidatePath('/academy/[orgSlug]', 'layout')
}

export async function getAcademyMessages(orgSlug: string) {
    const supabase = createClient(cookies())
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: organization } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', orgSlug)
        .single()

    if (!organization) return []

    // Fetch user enrollments to filter by course
    const { data: enrollments } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('profile_id', user.id)
    
    const userCourseIds = enrollments?.map(e => e.course_id) || []

    // Build filter string
    // 1. Message is for everyone (recipient_id is null AND course_ids is null)
    // 2. Message is for this specific student
    // 3. Message is for specific courses the student is enrolled in
    let filter = `and(recipient_id.is.null,course_ids.is.null),recipient_id.eq.${user.id}`
    if (userCourseIds.length > 0) {
        filter += `,course_ids.ov.{${userCourseIds.join(',')}}`
    }

    const { data: messages, error } = await supabase
        .from('academy_messages')
        .select(`
            *,
            sender:profiles!fk_sender(name),
            reads:message_reads(profile_id)
        `)
        .eq('organization_id', organization.id)
        .or(filter)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching messages:', error)
        return []
    }

    return messages.map(msg => ({
        ...msg,
        isRead: msg.reads?.some((r: any) => r.profile_id === user.id)
    }))
}

export async function getOrgCourses(orgSlug: string) {
    const supabase = createClient(cookies())
    
    const { data: organization } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', orgSlug)
        .single()

    if (!organization) return []

    const { data: courses, error } = await supabase
        .from('courses')
        .select('id, title')
        .eq('organization_id', organization.id)
        .order('title')

    if (error) {
        console.error('Error fetching courses:', error)
        return []
    }

    return courses
}

export async function getOrgStudents(orgSlug: string) {
    const supabase = createClient(cookies())
    
    const { data: organization } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', orgSlug)
        .single()

    if (!organization) return []

    const { data: students, error } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('organization_id', organization.id)
        .eq('role', 'student')

    if (error) {
        console.error('Error fetching students:', error)
        return []
    }

    return students
}
