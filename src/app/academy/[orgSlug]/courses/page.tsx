import React from "react"
import Link from "next/link"
import { 
  Search, 
  Clock, 
  GraduationCap, 
  ChevronLeft,
  ArrowRight,
  Lock
} from "lucide-react"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export default async function StudentCoursesPage({ 
  params,
  searchParams
}: { 
  params: { orgSlug: string },
  searchParams: { view?: string }
}) {
  const orgSlug = params.orgSlug
  const view = searchParams.view || 'mine'
  const supabase = createClient(cookies())

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Get organization
  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', orgSlug)
    .single()

  if (!organization) return <div>הארגון לא נמצא</div>

  // Fetch lesson completions for the user
  const { data: completions } = await supabase
    .from('lesson_completions')
    .select('lesson_id')
    .eq('profile_id', user.id)
  
  const completedLessonIds = new Set(completions?.map(c => c.lesson_id) || [])

  // Fetch courses for this organization with counts
  const { data: coursesData } = await supabase
    .from('courses')
    .select(`
      *,
      modules (
        id,
        order_index,
        lessons (
          id,
          order_index
        )
      )
    `)
    .eq('organization_id', organization.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  const courses = (coursesData || []).map(course => {
    const modules = [...(course.modules || [])].sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
    const firstModule = modules[0]
    const lessons = [...(firstModule?.lessons || [])].sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
    const firstLessonId = lessons[0]?.id

    return {
      ...course,
      firstLessonId
    }
  })

  // Fetch user's enrollments
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('course_id')
    .eq('profile_id', user.id)
  
  const enrolledCourseIds = new Set(enrollments?.map(e => e.course_id) || [])

  // Get user profile for role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .eq('organization_id', organization.id)
    .single()

  const isManager = profile?.role === 'admin' || profile?.role === 'owner'

  // Filter courses based on view
  const displayedCourses = view === 'mine' 
    ? courses.filter(c => enrolledCourseIds.has(c.id) || isManager)
    : courses

  return (
    <div className="p-6 md:p-8 space-y-6 w-full pb-32 text-right">
      {/* Minimalist Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in duration-500">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {view === 'mine' ? 'הקורסים שלי' : 'קטלוג הקורסים'}
            </h1>
            <Badge variant="secondary" className="bg-primary/5 text-primary border-none py-0.5 px-2 text-[9px] font-bold rounded uppercase tracking-widest">
              {displayedCourses.length} קורסים {view === 'mine' ? 'שלי' : 'זמינים'}
            </Badge>
          </div>
          <p className="text-sm text-slate-400 font-medium">
            {view === 'mine' 
              ? 'המשך ללמוד מהמקום שבו עצרת.' 
              : 'גלה את הקורסים שלנו והתחל ללמוד היום.'}
          </p>
        </div>
      </div>

      {/* Filters & Search Bar - More Minimalist */}
      <div className="flex flex-col xl:flex-row gap-4 items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex w-full md:w-fit gap-6">
          <Link 
            href={`/academy/${orgSlug}/courses?view=mine`}
            className={cn(
              "px-0 font-bold text-sm h-full transition-all flex-1 md:flex-none pb-2 border-b-2",
              view === 'mine' ? "text-primary border-primary" : "text-slate-400 border-transparent hover:text-slate-600"
            )}
          >
            הקורסים שלי
          </Link>
          <Link 
            href={`/academy/${orgSlug}/courses?view=all`}
            className={cn(
              "px-0 font-bold text-sm h-full transition-all flex-1 md:flex-none pb-2 border-b-2",
              view === 'all' ? "text-primary border-primary" : "text-slate-400 border-transparent hover:text-slate-600"
            )}
          >
            כל הקורסים
          </Link>
        </div>

        <div className="flex items-center gap-3 w-full xl:w-auto">
          <div className="relative w-full md:w-[280px] group">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="חפש קורס..." 
              className="pr-9 h-10 rounded-lg border-slate-100 bg-white focus:ring-primary/10 transition-all font-bold text-sm shadow-sm" 
            />
          </div>
        </div>
      </div>

      {/* Courses Grid - Full Width, 3 Columns */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {displayedCourses.map((course: any) => {
          const isEnrolled = enrolledCourseIds.has(course.id)
          const hasAccess = isEnrolled || isManager
          const modulesCount = course.modules?.length || 0
          
          const allLessons = course.modules?.flatMap((m: any) => m.lessons || []) || []
          const lessonsCount = allLessons.length
          const completedCount = allLessons.filter((l: any) => completedLessonIds.has(l.id)).length
          const progressPercentage = lessonsCount > 0 ? Math.round((completedCount / lessonsCount) * 100) : 0
          
          const courseUrl = `/academy/${orgSlug}/courses/${course.id}`
          const lessonUrl = course.firstLessonId 
            ? `/academy/${orgSlug}/courses/${course.id}/lessons/${course.firstLessonId}`
            : courseUrl

          const targetUrl = hasAccess ? lessonUrl : `/academy/${orgSlug}/contact`

          return (
            <Card key={course.id} className={cn(
              "overflow-hidden group border border-slate-100 shadow-sm hover:shadow-md transition-all duration-500 rounded-xl bg-white flex flex-col relative",
              !hasAccess && "opacity-95"
            )}>
              <div className="aspect-[16/10] w-full relative overflow-hidden">
                <img 
                  src={course.image_url || "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=400&h=200&auto=format&fit=crop"} 
                  alt={course.title}
                  className={cn(
                    "object-cover w-full h-full transition-transform duration-700 group-hover:scale-105",
                    !hasAccess && "grayscale-[0.8] blur-[1px]"
                  )}
                />
                
                {/* Overlay for enrolled/non-enrolled */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-6">
                  <Button className="w-full font-bold rounded-lg h-10 shadow-lg text-sm transition-all gap-2" asChild>
                    <Link href={targetUrl}>
                      {hasAccess ? (isEnrolled ? "המשך ללמוד" : "צפייה בקורס") : "לפרטים ורכישה"}
                      <ArrowRight className="w-4 h-4 rotate-180" />
                    </Link>
                  </Button>
                </div>

                {/* Locked State Center Icon */}
                {!hasAccess && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl transition-transform duration-500 group-hover:scale-110">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                  </div>
                )}

                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  {!hasAccess && (
                    <Badge className="border-none py-0.5 px-2 text-[8px] font-bold uppercase tracking-wider rounded-md shadow-lg backdrop-blur-md bg-slate-900/80 text-white flex items-center gap-1.5">
                      <Lock className="w-2.5 h-2.5" />
                      נעול
                    </Badge>
                  )}
                  {hasAccess && (
                    <Badge className={cn(
                      "border-none py-0.5 px-2 text-[8px] font-bold uppercase tracking-wider rounded-md shadow-lg backdrop-blur-md text-white",
                      isEnrolled ? "bg-emerald-500/90" : "bg-primary/90"
                    )}>
                      {isEnrolled ? (progressPercentage === 100 ? "הושלם" : "רשום") : "מנהל"}
                    </Badge>
                  )}
                </div>
              </div>
              
              <CardHeader className="p-5 pb-2">
                <h3 className={cn(
                  "font-bold text-lg leading-tight text-slate-800 line-clamp-2 transition-colors min-h-[3rem] tracking-tight",
                  hasAccess ? "group-hover:text-primary" : "text-slate-500"
                )}>{course.title}</h3>
              </CardHeader>
              
              <CardContent className="px-5 flex-1 space-y-4">
                <p className="text-xs font-medium text-slate-400 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                  {course.description}
                </p>

                {hasAccess && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-wider text-slate-400">
                      <span>התקדמות</span>
                      <span className="text-primary">{progressPercentage}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-1 bg-slate-100" />
                  </div>
                )}
                
                <div className="flex items-center justify-between py-3 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100 shadow-sm">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] font-bold text-slate-700">{modulesCount} פרקים</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-100 shadow-sm">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] font-bold text-slate-700">{lessonsCount} שיעורים</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="p-5 pt-0">
                 <Button variant={hasAccess ? "outline" : "default"} size="sm" className={cn(
                   "w-full h-9 rounded-lg border font-bold text-xs transition-all gap-1.5 group/btn shadow-sm",
                   !hasAccess && "bg-slate-900 hover:bg-slate-800 text-white border-none"
                 )} asChild>
                   <Link href={targetUrl}>
                     {hasAccess ? (
                       <>
                         {isEnrolled ? "המשך למידה" : "צפייה בשיעורים"}
                         <ChevronLeft className="w-3 h-3 group-hover/btn:-translate-x-1 transition-transform" />
                       </>
                     ) : (
                       <>
                         לרכישת הקורס
                         <Lock className="w-3 h-3" />
                       </>
                     )}
                   </Link>
                 </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
