'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { notifyAllStudents, notifyCourseStudents } from './notifications'
import { processTrigger } from '@/lib/trigger-handler'

// ...

export async function createCourse(formData: FormData) {
  const authClient = createClient(cookies())
  
  // Get current user's profile to find organization_id
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await authClient
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()
  
  if (!profile?.organization_id) throw new Error('Organization not found')

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const imageUrl = formData.get('imageUrl') as string
  const status = formData.get('status') as string || 'draft'

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('courses')
    .insert([
      { 
        title, 
        description, 
        image_url: imageUrl, 
        status,
        students_count: 0,
        organization_id: profile.organization_id
      },
    ])
    .select()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/courses')
  return data[0]
}

export async function updateCourse(courseId: string, formData: FormData) {
  const authClient = createClient(cookies())
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get current status and organization info
  const { data: currentCourse } = await authClient
    .from('courses')
    .select('status, title, organization_id, organizations(slug)')
    .eq('id', courseId)
    .single()

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const status = formData.get('status') as string
  const imageUrl = formData.get('image_url') as string

  const updates: any = { 
    title, 
    description, 
    status,
    image_url: imageUrl || null
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('courses')
    .update(updates)
    .eq('id', courseId)

  if (error) throw new Error(error.message)

  // Notify if published
  if (status === 'published' && currentCourse?.status !== 'published' && currentCourse?.organization_id) {
    const orgSlug = (currentCourse.organizations as any)?.slug
    await notifyAllStudents({
      organizationId: currentCourse.organization_id,
      type: 'course_published',
      title: 'קורס חדש פורסם!',
      content: `הקורס "${title}" זמין כעת באקדמיה`,
      link: orgSlug ? `/academy/${orgSlug}/courses/${courseId}` : `/academy/courses/${courseId}`,
      actorId: user.id,
      targetId: courseId
    })
  }

  revalidatePath(`/courses/${courseId}`)
  revalidatePath('/courses')
}

export async function deleteCourse(courseId: string) {
  const authClient = createClient(cookies())
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/courses')
}

// Module Actions
export async function createModule(courseId: string, title: string, orderIndex: number) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('modules')
    .insert([{ course_id: courseId, title, order_index: orderIndex }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/courses/${courseId}`)
  return data
}

export async function updateModule(moduleId: string, title: string, courseId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('modules')
    .update({ title })
    .eq('id', moduleId)

  if (error) throw new Error(error.message)
  revalidatePath(`/courses/${courseId}`)
}

export async function deleteModule(moduleId: string, courseId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('modules')
    .delete()
    .eq('id', moduleId)

  if (error) throw new Error(error.message)
  revalidatePath(`/courses/${courseId}`)
}

// Lesson Actions
export async function createLesson(moduleId: string, title: string, orderIndex: number, courseId: string) {
  const authClient = createClient(cookies())
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const supabase = createAdminClient()
  
  // Get course info to check if published
  const { data: course } = await supabase
    .from('courses')
    .select('status, organization_id, organizations(slug)')
    .eq('id', courseId)
    .single()

  const { data, error } = await supabase
    .from('lessons')
    .insert([{ module_id: moduleId, title, order_index: orderIndex, type: 'video' }])
    .select()
    .single()

  if (error) throw new Error(error.message)

  // Notify if course is already published
  if (course?.status === 'published' && course.organization_id) {
    const orgSlug = (course.organizations as any)?.slug
    await notifyCourseStudents({
      courseId,
      organizationId: course.organization_id,
      type: 'new_lesson',
      title: 'שיעור חדש נוסף!',
      content: `שיעור חדש: "${title}" נוסף לקורס שלך`,
      link: orgSlug ? `/academy/${orgSlug}/courses/${courseId}/lessons/${data.id}` : undefined,
      targetId: data.id,
      actorId: user.id
    })
  }

  revalidatePath(`/courses/${courseId}`)
  return data
}

export async function updateLesson(lessonId: string, updates: any, courseId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('lessons')
    .update(updates)
    .eq('id', lessonId)

  if (error) throw new Error(error.message)
  revalidatePath(`/courses/${courseId}`)
}

export async function deleteLesson(lessonId: string, courseId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('lessons')
    .delete()
    .eq('id', lessonId)

  if (error) throw new Error(error.message)
  revalidatePath(`/courses/${courseId}`)
}

// Attachment Actions
export async function addAttachment(lessonId: string, name: string, url: string, courseId: string) {
  const authClient = createClient(cookies())
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const supabase = createAdminClient()

  // Get course/lesson info
  const { data: course } = await supabase
    .from('courses')
    .select('status, organization_id, organizations(slug)')
    .eq('id', courseId)
    .single()

  const { data, error } = await supabase
    .from('lesson_attachments')
    .insert([{ lesson_id: lessonId, name, url }])
    .select()
    .single()

  if (error) throw new Error(error.message)

  // Notify if published
  if (course?.status === 'published' && course.organization_id) {
    const orgSlug = (course.organizations as any)?.slug
    await notifyCourseStudents({
      courseId,
      organizationId: course.organization_id,
      type: 'new_file',
      title: 'קובץ חדש נוסף!',
      content: `קובץ חדש: "${name}" נוסף לאחד השיעורים בקורס`,
      link: orgSlug ? `/academy/${orgSlug}/courses/${courseId}/lessons/${lessonId}` : undefined,
      targetId: data.id,
      actorId: user.id
    })
  }

  revalidatePath(`/courses/${courseId}`)
  return data
}

export async function deleteAttachment(attachmentId: string, courseId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('lesson_attachments')
    .delete()
    .eq('id', attachmentId)

  if (error) throw new Error(error.message)
  revalidatePath(`/courses/${courseId}`)
}

// Dummy export to trigger revalidation
export async function _ping() { return 'pong' }

// Reorder Actions
export async function reorderModules(courseId: string, moduleIds: string[]) {
  const supabase = createAdminClient()
  
  const updates = moduleIds.map((id, index) => 
    supabase
      .from('modules')
      .update({ order_index: index })
      .eq('id', id)
  )

  const results = await Promise.all(updates)
  const error = results.find(r => r.error)?.error

  if (error) throw new Error(error.message)
  revalidatePath(`/courses/${courseId}`)
}

export async function reorderLessons(courseId: string, moduleId: string, lessonIds: string[]) {
  const supabase = createAdminClient()
  
  const updates = lessonIds.map((id, index) => 
    supabase
      .from('lessons')
      .update({ 
        order_index: index,
        module_id: moduleId 
      })
      .eq('id', id)
  )

  const results = await Promise.all(updates)
  const error = results.find(r => r.error)?.error

  if (error) throw new Error(error.message)
  revalidatePath(`/courses/${courseId}`)
}

// Completion Actions
export async function toggleLessonCompletion(lessonId: string, courseId: string, orgSlug: string, isCompleted: boolean) {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  if (isCompleted) {
    const { error } = await supabase
      .from('lesson_completions')
      .insert([{ profile_id: user.id, lesson_id: lessonId }])
    
    if (error && error.code !== '23505') {
        console.error('Error inserting lesson completion:', error)
        throw new Error(error.message)
    }

    // Trigger process
    try {
      const { data: course } = await supabase
        .from('courses')
        .select('organization_id')
        .eq('id', courseId)
        .single()
      
      if (course?.organization_id) {
        // Trigger for lesson completion
        await processTrigger('lesson_completed', user.id, course.organization_id, { lessonId, courseId })
        // Trigger for course completion (logic inside processTrigger checks if it was the last lesson)
        await processTrigger('course_completed', user.id, course.organization_id, { courseId })
      }
    } catch (e) {
      console.error('Error processing triggers:', e)
    }
  } else {
    const { error } = await supabase
      .from('lesson_completions')
      .delete()
      .eq('profile_id', user.id)
      .eq('lesson_id', lessonId)
    
    if (error) {
        console.error('Error deleting lesson completion:', error)
        throw new Error(error.message)
    }
  }

  revalidatePath(`/academy/${orgSlug}/courses/${courseId}/lessons/${lessonId}`)
  revalidatePath(`/academy/${orgSlug}/courses/${courseId}`)
  revalidatePath(`/academy/${orgSlug}/home`)
}

// Question Actions
export async function createLessonQuestion(lessonId: string, content: string, courseId: string, orgSlug: string) {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get organization_id from the course
  const { data: course } = await supabase
    .from('courses')
    .select('organization_id')
    .eq('id', courseId)
    .single()
  
  if (!course?.organization_id) throw new Error('Organization not found')

  const { error } = await supabase
    .from('lesson_questions')
    .insert([{ 
      lesson_id: lessonId, 
      profile_id: user.id, 
      organization_id: course.organization_id,
      content 
    }])

  if (error) throw new Error(error.message)

  revalidatePath(`/academy/${orgSlug}/courses/${courseId}/lessons/${lessonId}`)
}

export async function answerLessonQuestion(questionId: string, answer: string, lessonId: string, courseId: string, orgSlug: string) {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Double check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin' && profile?.role !== 'owner') {
    throw new Error('Not authorized')
  }

  const { error } = await supabase
    .from('lesson_questions')
    .update({ 
      answer,
      answered_by: user.id,
      answered_at: new Date().toISOString()
    })
    .eq('id', questionId)

  if (error) throw new Error(error.message)

  revalidatePath(`/academy/${orgSlug}/courses/${courseId}/lessons/${lessonId}`)
}
