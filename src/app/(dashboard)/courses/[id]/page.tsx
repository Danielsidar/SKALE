import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { CourseBuilder } from "./course-builder"

export default async function CourseBuilderPage({ params }: { params: { id: string } }) {
  const supabase = createClient(cookies())
  
  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!course) {
    notFound()
  }

  const { data: modules } = await supabase
    .from('modules')
    .select(`
      *,
      lessons (
        *,
        lesson_attachments (*)
      )
    `)
    .eq('course_id', params.id)
    .order('order_index', { ascending: true })

  // Sort lessons within modules
  const sortedModules = (modules || []).map(m => ({
    ...m,
    lessons: (m.lessons || []).sort((a: any, b: any) => a.order_index - b.order_index)
  }))

  return <CourseBuilder course={course} initialModules={sortedModules} />
}

