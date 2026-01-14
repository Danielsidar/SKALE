import React from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { 
  ChevronRight, 
  ChevronLeft, 
  PlayCircle, 
  FileText, 
  CheckCircle2, 
  Circle,
  Menu,
  Download,
  ExternalLink,
  BookOpen,
  MessageCircle,
  Paperclip,
  Globe,
  Lock,
  Video
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { LessonCompletionButton } from "@/components/academy/lesson-completion-button"
import { VideoPlayer } from "@/components/academy/video-player"
import { LessonQuestions } from "@/components/academy/lesson-questions"
import { LessonExerciseBanner } from "@/components/academy/lesson-exercise-banner"

export default async function LessonViewPage({ params }: { params: { orgSlug: string, courseId: string, lessonId: string } }) {
  const { orgSlug, courseId, lessonId } = params
  const supabase = createClient(cookies())

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch course
  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single()
  
  if (!course) return <div className="p-20 text-center font-black text-2xl">קורס לא נמצא</div>

  // Get organization
  const { data: organization } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('slug', orgSlug)
    .single()

  // Get user profile for role and name
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, name')
    .eq('id', user.id)
    .eq('organization_id', organization?.id)
    .single()

  const isManager = profile?.role === 'admin' || profile?.role === 'owner'

  // Check enrollment
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('*')
    .eq('profile_id', user.id)
    .eq('course_id', courseId)
    .single()
  
  const hasAccess = enrollment || isManager

  if (!hasAccess) {
    // Redirect to contact page if not enrolled and not a manager
    return redirect(`/academy/${orgSlug}/contact`)
  }

  // Fetch modules and lessons with attachments
  const { data: modulesData } = await supabase
    .from('modules')
    .select(`
      *,
      lessons (
        *,
        lesson_attachments (*)
      )
    `)
    .eq('course_id', courseId)
    .order('order_index', { ascending: true })

  const sortedModules = modulesData?.map(m => ({
    ...m,
    lessons: (m.lessons || []).sort((a: any, b: any) => a.order_index - b.order_index)
  })) || []

  const allLessons = sortedModules.flatMap(m => m.lessons)
  const currentLessonIndex = allLessons.findIndex(l => l.id === lessonId)
  const currentLesson = allLessons[currentLessonIndex]

  if (!currentLesson) return <div className="p-20 text-center font-black text-2xl">שיעור לא נמצא</div>

  const nextLesson = allLessons[currentLessonIndex + 1]
  const nextLessonUrl = nextLesson 
    ? `/academy/${orgSlug}/courses/${courseId}/lessons/${nextLesson.id}`
    : null

  // Fetch completions
  const { data: completions } = await supabase
    .from('lesson_completions')
    .select('lesson_id')
    .eq('profile_id', user.id)
    .in('lesson_id', allLessons.map(l => l.id))

  const completedLessonIds = new Set(completions?.map(c => c.lesson_id) || [])
  const totalLessons = allLessons.length
  const completedCount = completedLessonIds.size
  const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  // Fetch questions for this lesson
  const { data: questions } = await supabase
    .from('lesson_questions')
    .select(`
      *,
      profiles!lesson_questions_profile_fkey (
        name
      )
    `)
    .eq('lesson_id', lessonId)
    .order('created_at', { ascending: false })

  const curriculum = (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b space-y-3 bg-white">
        <Button variant="ghost" asChild className="p-0 h-auto text-primary font-bold hover:bg-transparent group/back">
          <Link href={`/academy/${orgSlug}/courses`} className="flex items-center gap-2 text-xs">
            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover/back:translate-x-1" />
            חזרה לקורסים שלי
          </Link>
        </Button>
        <div className="space-y-2">
          <h2 className="font-bold text-lg text-slate-900 leading-tight">{course.title}</h2>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-slate-400">
              <span>{enrollment ? 'התקדמות אישית' : 'מצב תצוגת מנהל'}</span>
              <span className="text-primary">{enrollment ? `${progressPercentage}%` : 'גישה מלאה'}</span>
            </div>
            {enrollment && (
              <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progressPercentage}%` }} />
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 bg-slate-50/20 max-h-[calc(100vh-25rem)]">
        <Accordion type="multiple" defaultValue={sortedModules.map(m => m.id)} className="w-full space-y-1.5">
          {sortedModules.map((module) => {
            const moduleLessonIds = module.lessons?.map((l: any) => l.id) || []
            const moduleCompletedCount = moduleLessonIds.filter((id: string) => completedLessonIds.has(id)).length

            return (
              <AccordionItem key={module.id} value={module.id} className="border-none">
                <AccordionTrigger className="px-4 hover:no-underline py-3 bg-white border border-slate-100 shadow-sm rounded-lg data-[state=open]:rounded-b-none transition-all">
                  <div className="flex flex-col items-start gap-0.5 text-right">
                    <span className="text-sm font-bold text-slate-800 tracking-tight">{module.title}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {moduleCompletedCount}/{module.lessons?.length || 0} שיעורים
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-1 space-y-0.5 bg-white/50 border-x border-b border-slate-100 rounded-b-lg">
                  {module.lessons?.map((lesson: any) => {
                    const isLessonCompleted = completedLessonIds.has(lesson.id)
                    return (
                      <Link
                        key={lesson.id}
                        href={`/academy/${orgSlug}/courses/${courseId}/lessons/${lesson.id}`}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 rounded text-xs font-bold transition-all group border border-transparent",
                          lessonId === lesson.id
                            ? "bg-primary text-white shadow-sm border-primary" 
                            : isLessonCompleted 
                              ? "bg-emerald-50/40 text-emerald-600 border-emerald-100/50 hover:bg-emerald-50" 
                              : "text-slate-500 hover:bg-white hover:text-slate-900"
                        )}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          {lesson.type === "video" && (
                            <Video className={cn(
                              "w-3.5 h-3.5 shrink-0", 
                              lessonId === lesson.id ? "text-white" : isLessonCompleted ? "text-emerald-500" : "text-blue-500"
                            )} />
                          )}
                          {lesson.type === "text" && (
                            <FileText className={cn(
                              "w-3.5 h-3.5 shrink-0", 
                              lessonId === lesson.id ? "text-white" : isLessonCompleted ? "text-emerald-500" : "text-emerald-500"
                            )} />
                          )}
                          {!["video", "text"].includes(lesson.type) && (
                            <Paperclip className={cn(
                              "w-3.5 h-3.5 shrink-0", 
                              lessonId === lesson.id ? "text-white" : isLessonCompleted ? "text-emerald-500" : "text-slate-400"
                            )} />
                          )}
                          <span className="truncate tracking-tight">{lesson.title}</span>
                        </div>
                        {isLessonCompleted && lessonId !== lesson.id && (
                          <CheckCircle2 className="w-3 h-3 text-emerald-500/50" />
                        )}
                      </Link>
                    )
                  })}
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 md:p-8 relative font-assistant bg-[hsl(var(--background)/0.3)] min-h-full">
      {/* Lesson Sidebar (Right visually in RTL) - STICKY CARD */}
      <aside className="w-full lg:w-[320px] shrink-0 order-2 lg:order-none text-right">
        <div className="sticky top-24">
          {curriculum}
        </div>
      </aside>

      {/* Main Content (Left visually in RTL) */}
      <div className="flex-1 space-y-6 pb-32 max-w-5xl order-1 lg:order-none">
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Video Player Area */}
          {currentLesson.type === 'video' && currentLesson.video_url && (
            <VideoPlayer 
              videoUrl={currentLesson.video_url} 
              thumbnailUrl={course.image_url} 
            />
          )}

          {/* Lesson Content */}
          <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-slate-100/50 space-y-8 text-right">
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{currentLesson.title}</h1>
                <div className="w-12 h-1 bg-primary rounded-full" />
              </div>

              <LessonExerciseBanner 
                lesson={currentLesson}
                courseId={courseId}
                orgSlug={orgSlug}
                isCompleted={completedLessonIds.has(lessonId)}
              />
            </div>
            
            <div className="prose prose-slate prose-sm md:prose-base max-w-none font-medium text-slate-600 leading-relaxed space-y-4 text-right">
              <div dangerouslySetInnerHTML={{ __html: currentLesson.content || "אין תוכן לשיעור זה עדיין." }} />
            </div>

            {/* Attachments Section */}
            {currentLesson.lesson_attachments && currentLesson.lesson_attachments.length > 0 && (
              <div className="mt-10 p-6 bg-primary/[0.03] rounded-2xl border border-primary/10 space-y-5">
                <div className="flex items-center gap-4 border-b border-primary/10 pb-4 justify-end">
                  <div className="text-right">
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">קבצים וחומרי עזר</h3>
                    <p className="text-xs text-slate-500 font-medium">הורד את החומרים הנלווים לשיעור זה</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                    <Paperclip className="w-6 h-6" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentLesson.lesson_attachments.map((file: any) => (
                    <a 
                      key={file.id} 
                      href={file.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl group hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 transition-all duration-300"
                    >
                      <div className="flex items-center gap-2 text-primary font-bold text-xs shrink-0 bg-primary/5 px-3 py-1.5 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                        <Download className="w-3.5 h-3.5" />
                        <span>הורדה</span>
                      </div>
                      <div className="flex items-center gap-3 overflow-hidden text-right">
                        <div className="text-right overflow-hidden">
                          <p className="font-bold text-slate-700 truncate text-sm group-hover:text-primary transition-colors">{file.name}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors">
                          <Paperclip className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Questions Section - Collapsible */}
          <div className="bg-slate-50/50 rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm transition-all hover:shadow-md">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="questions" className="border-none">
                <AccordionTrigger className="px-6 md:px-10 py-6 hover:no-underline group">
                  <div className="flex items-center gap-4 text-right">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center group-data-[state=open]:bg-primary group-data-[state=open]:text-white transition-all duration-300">
                      <MessageCircle className="w-6 h-6 text-slate-400 group-data-[state=open]:text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">שאלות על השיעור 💬</h3>
                        {questions && questions.length > 0 && (
                          <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full">
                            {questions.length}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-slate-400 mt-0.5">נתקלת במשהו לא ברור? אנחנו כאן לעזור.</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 md:px-10 pb-10 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="pt-6 border-t border-slate-200/60">
                    <LessonQuestions 
                      lessonId={lessonId}
                      courseId={courseId}
                      orgSlug={orgSlug}
                      initialQuestions={questions || []}
                      currentUserId={user.id}
                      currentUserName={profile?.name || user.email || "S"}
                      isAdmin={isManager}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-6 left-6 z-50 animate-in slide-in-from-left-8 duration-700">
        <LessonCompletionButton 
          lessonId={lessonId}
          courseId={courseId}
          orgSlug={orgSlug}
          initialIsCompleted={completedLessonIds.has(lessonId)}
          nextLessonUrl={nextLessonUrl}
          lesson={currentLesson}
        />
      </div>
    </div>
  )
}
