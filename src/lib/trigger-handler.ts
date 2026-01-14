import { createAdminClient } from './supabase/admin'
import { sendEmail } from './resend'

type TriggerType = 'inactive_days' | 'lesson_completed' | 'course_completed'

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

  // 2. Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, name')
    .eq('id', profileId)
    .eq('organization_id', organizationId)
    .single()

  if (!profile || !profile.email) return

  for (const reminder of reminders) {
    const config = reminder.trigger_config as any

    // 3. Check if specific condition matches
    let shouldSend = false

    if (type === 'lesson_completed') {
      if (config.lesson_id === context.lessonId) {
        shouldSend = true
      }
    } else if (type === 'course_completed') {
      if (config.course_id === context.courseId) {
        // Check if all lessons in the course are completed
        const { data: totalLessons } = await supabase
          .from('lessons')
          .select('id', { count: 'exact', head: true })
          .filter('module_id', 'in', 
            supabase.from('modules').select('id').eq('course_id', context.courseId)
          )
        
        // This query above is complex for Supabase JS. Let's do it simpler.
        const { data: modules } = await supabase.from('modules').select('id').eq('course_id', context.courseId)
        const moduleIds = modules?.map(m => m.id) || []
        
        const { count: lessonsCount } = await supabase
          .from('lessons')
          .select('*', { count: 'exact', head: true })
          .in('module_id', moduleIds)

        const { count: completionsCount } = await supabase
          .from('lesson_completions')
          .select('*', { count: 'exact', head: true })
          .eq('profile_id', profileId)
          .in('lesson_id', 
            (await supabase.from('lessons').select('id').in('module_id', moduleIds)).data?.map(l => l.id) || []
          )

        if (lessonsCount && completionsCount && lessonsCount === completionsCount) {
          shouldSend = true
        }
      }
    }

    if (shouldSend) {
      // 4. Check if already sent to avoid duplicates (especially for action-based)
      const { data: alreadySent } = await supabase
        .from('sent_reminders')
        .select('id')
        .eq('reminder_id', reminder.id)
        .eq('profile_id', profileId)
        .limit(1)

      if (alreadySent && alreadySent.length > 0) continue

      // 5. Send Email
      const emailHtml = reminder.email_content.replace('{{name}}', profile.name || 'תלמיד/ה')
      
      const { data: sentData, error: sendError } = await sendEmail({
        to: profile.email,
        subject: reminder.email_subject,
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

// Function to check for inactive users - DEPRECATED: Now handled by Supabase Edge Function 'check-inactive-reminders'
export async function checkInactiveUsers() {
  console.warn('checkInactiveUsers is deprecated. Use Supabase Edge Function instead.');
}


