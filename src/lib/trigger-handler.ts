import { createAdminClient } from './supabase/admin'
import { sendEmail } from './resend'

type TriggerType = 'inactive_days' | 'lesson_completed' | 'course_completed' | 'new_user' | 'course_enrolled'

export async function processTrigger(
  type: TriggerType, 
  profileId: string, 
  organizationId: string, 
  context: { lessonId?: string, courseId?: string } = {}
) {
  const supabase = createAdminClient()

  // 1. Fetch active reminders for this organization and trigger type
  const { data: reminders, error } = await supabase
    .from('learning_reminders')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('trigger_type', type)
    .eq('is_enabled', true)

  if (error || !reminders || reminders.length === 0) return

  // 2. Fetch user profile and organization info
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, name, organizations(name, slug)')
    .eq('id', profileId)
    .eq('organization_id', organizationId)
    .single()

  if (!profile || !profile.email) return

  const org = (profile.organizations as any)
  const orgName = org?.name || ''
  const orgSlug = org?.slug || ''
  const loginUrl = orgSlug ? `${process.env.NEXT_PUBLIC_APP_URL || 'https://academy.com'}/academy/${orgSlug}` : ''

  for (const reminder of reminders) {
    const config = reminder.trigger_config as any
    let shouldSend = false
    let dynamicData: any = {
      name: profile.name || 'תלמיד/ה',
      org_name: orgName,
      login_url: loginUrl
    }

    // 3. Check if specific condition matches and fetch extra data for variables
    if (type === 'new_user') {
      shouldSend = true
    } else if (type === 'course_enrolled') {
      if (config.course_id === context.courseId) {
        shouldSend = true
        const { data: course } = await supabase
          .from('courses')
          .select('title')
          .eq('id', context.courseId)
          .single()
        
        if (course) {
          dynamicData.course_name = course.title
        }
      }
    } else if (type === 'lesson_completed') {
      if (config.lesson_id === context.lessonId) {
        shouldSend = true
        // Fetch lesson and course name for variables
        const { data: lesson } = await supabase
          .from('lessons')
          .select('title, modules(courses(title))')
          .eq('id', context.lessonId)
          .single()
        
        if (lesson) {
          dynamicData.lesson_name = lesson.title
          dynamicData.course_name = (lesson.modules as any)?.courses?.title
        }
      }
    } else if (type === 'course_completed') {
      if (config.course_id === context.courseId) {
        shouldSend = true
        
        const { data: course } = await supabase
          .from('courses')
          .select('title')
          .eq('id', context.courseId)
          .single()
        
        if (course) {
          dynamicData.course_name = course.title
        }

        // Verify it's actually completed (all lessons)
        const { data: modules } = await supabase.from('modules').select('id').eq('course_id', context.courseId)
        const moduleIds = modules?.map(m => m.id) || []
        const { count: lessonsCount } = await supabase.from('lessons').select('*', { count: 'exact', head: true }).in('module_id', moduleIds)
        const { count: completionsCount } = await supabase.from('lesson_completions').select('*', { count: 'exact', head: true }).eq('profile_id', profileId).in('lesson_id', (await supabase.from('lessons').select('id').in('module_id', moduleIds)).data?.map(l => l.id) || [])

        if (!lessonsCount || !completionsCount || lessonsCount !== completionsCount) {
          shouldSend = false
        }
      }
    } else if (type === 'inactive_days') {
      shouldSend = true
    }

    if (shouldSend) {
      // 4. Check if already sent (for action-based triggers)
      const { data: alreadySent } = await supabase
        .from('sent_reminders')
        .select('id')
        .eq('reminder_id', reminder.id)
        .eq('profile_id', profileId)
        .limit(1)

      if (alreadySent && alreadySent.length > 0) continue

      // 5. Replace dynamic variables in content and subject
      let emailHtml = reminder.email_content
      let emailSubject = reminder.email_subject

      Object.keys(dynamicData).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g')
        emailHtml = emailHtml.replace(regex, dynamicData[key] || '')
        emailSubject = emailSubject.replace(regex, dynamicData[key] || '')
      })
      
      const { error: sendError } = await sendEmail({
        to: profile.email,
        subject: emailSubject,
        html: emailHtml
      })

      if (!sendError) {
        // 6. Log to sent_reminders
        await supabase.from('sent_reminders').insert({
          reminder_id: reminder.id,
          profile_id: profileId,
          organization_id: organizationId
        })
      }
    }
  }
}

export async function checkInactiveUsers() {
  console.warn('checkInactiveUsers is deprecated. Use Supabase Edge Function instead.');
}
