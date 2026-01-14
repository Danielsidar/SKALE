import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export default async function CourseLandingPage({ params }: { params: { orgSlug: string, courseId: string } }) {
  const { orgSlug, courseId } = params
  const supabase = createClient(cookies())

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/academy/${orgSlug}/login`)

  // Check enrollment/access
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('*')
    .eq('profile_id', user.id)
    .eq('course_id', courseId)
    .single()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isManager = profile?.role === 'admin' || profile?.role === 'owner'
  const hasAccess = enrollment || isManager

  if (!hasAccess) {
    redirect(`/academy/${orgSlug}/contact`)
  }

  // Find first lesson
  const { data: modules } = await supabase
    .from('modules')
    .select(`
      id,
      order_index,
      lessons (
        id,
        order_index
      )
    `)
    .eq('course_id', courseId)
    .order('order_index', { ascending: true })

  const sortedModules = (modules || []).sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
  const firstModule = sortedModules[0]
  const lessons = [...(firstModule?.lessons || [])].sort((a: any, b: any) => a.order_index - b.order_index)
  const firstLessonId = lessons[0]?.id

  if (firstLessonId) {
    redirect(`/academy/${orgSlug}/courses/${courseId}/lessons/${firstLessonId}`)
  }

  // If no lessons found, redirect back to courses
  redirect(`/academy/${orgSlug}/courses`)
}
