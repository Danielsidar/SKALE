import React from "react"
import Link from "next/link"
import { 
  BookOpen, 
  Clock, 
  ChevronLeft, 
  TrendingUp, 
  Trophy, 
  Star,
  PlayCircle,
  CheckCircle2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { getAcademyMessages } from "@/app/actions/messages"
import { AcademyMessagesList } from "@/components/academy/academy-messages-list"

export default async function StudentDashboardPage({ params }: { params: { orgSlug: string } }) {
  const orgSlug = params.orgSlug
  const supabase = createClient(cookies())

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const messages = await getAcademyMessages(orgSlug)

  const { data: organization } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', orgSlug)
    .single()

  if (!organization) return <div>הארגון לא נמצא</div>

  // Get profile for this specific organization
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, organizations(*)')
    .eq('id', user.id)
    .eq('organization_id', organization.id)
    .single()

  const isManager = profile?.role === 'admin' || profile?.role === 'owner'

  // Fetch lesson completions for the user
  const { data: completions } = await supabase
    .from('lesson_completions')
    .select('lesson_id')
    .eq('profile_id', user.id)
  
  const completedLessonIds = new Set(completions?.map(c => c.lesson_id) || [])

  // Fetch courses based on role
  let myCourses = []
  
  if (isManager) {
    const { data: allCourses } = await supabase
      .from('courses')
      .select('*, modules(id, order_index, lessons(id, order_index))')
      .eq('organization_id', organization.id)
      .eq('status', 'published')
    
    myCourses = (allCourses || []).map(c => {
      const sortedModules = (c.modules || []).sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
      const allLessons = sortedModules.flatMap(m => m.lessons || [])
      const totalLessons = allLessons.length
      const completedCount = allLessons.filter(l => completedLessonIds.has(l.id)).length
      const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

      const firstModule = sortedModules[0]
      const lessons = [...(firstModule?.lessons || [])].sort((a: any, b: any) => a.order_index - b.order_index)
      const firstLessonId = lessons[0]?.id

      return {
        id: c.id,
        title: c.title,
        progress: progressPercentage,
        lastLesson: "תצוגת מנהל",
        image: c.image_url || "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=400&h=200&auto=format&fit=crop",
        modulesCount: c.modules?.length || 0,
        firstLessonId
      }
    })
  } else {
    // Fetch enrolled courses for students
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('*, courses(*, modules(id, order_index, lessons(id, order_index)))')
      .eq('profile_id', user.id)

    myCourses = (enrollments || []).map(e => {
      const c = e.courses
      const sortedModules = (c.modules || []).sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
      const allLessons = sortedModules.flatMap(m => m.lessons || [])
      const totalLessons = allLessons.length
      const completedCount = allLessons.filter(l => completedLessonIds.has(l.id)).length
      const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

      const firstModule = sortedModules[0]
      const lessons = [...(firstModule?.lessons || [])].sort((a: any, b: any) => a.order_index - b.order_index)
      const firstLessonId = lessons[0]?.id

      return {
        id: c.id,
        title: c.title,
        progress: progressPercentage,
        lastLesson: "המשך למידה",
        image: c.image_url || "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=400&h=200&auto=format&fit=crop",
        modulesCount: c.modules?.length || 0,
        firstLessonId
      }
    })
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full pb-24 text-right">
      {/* Welcome Header */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in fade-in duration-500">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">שלום, {profile?.name.split(" ")[0]}! 👋</h1>
            <Badge variant="secondary" className={cn(
              "border-none py-0.5 px-2 text-[9px] font-bold rounded uppercase tracking-widest",
              isManager ? "bg-primary text-white" : "bg-primary/5 text-primary"
            )}>
              {isManager ? 'מנהל אקדמיה' : 'תלמיד פעיל'}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 font-medium max-w-xl leading-relaxed">
            {isManager 
              ? `איזה כיף לראות אותך. יש לך גישה מלאה לכל ${myCourses.length} הקורסים באקדמיה שלך.`
              : `איזה כיף לראות אותך שוב. מוכן להמשיך מהמקום שהפסקת? יש לך ${myCourses.length} קורסים בתהליך.`
            }
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col items-center gap-1 min-w-[100px]">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 shadow-sm border border-amber-100">
              <Trophy className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold text-slate-900 leading-none mt-1">{profile?.xp || 0}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">נקודות XP</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col items-center gap-1 min-w-[100px]">
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
              <Star className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold text-slate-900 leading-none mt-1">{profile?.certificates_count || 0}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">תעודות</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main Content: Active Courses */}
        <div className="lg:col-span-8 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">המשך למידה</h2>
            <Button variant="ghost" size="sm" asChild className="text-primary font-bold hover:bg-primary/5 rounded-lg gap-1.5 text-xs">
              <Link href={`/academy/${orgSlug}/courses?view=mine`}>
                לכל הקורסים שלי
                <ChevronLeft className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {myCourses.length > 0 ? myCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden flex flex-col hover:shadow-md transition-all duration-500 border border-slate-100 rounded-xl bg-white group">
                <div className="aspect-[16/10] relative overflow-hidden">
                  <img 
                    src={course.image} 
                    alt={course.title}
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                    <Button variant="secondary" size="sm" className="w-full font-bold rounded-lg h-9 shadow-lg text-xs" asChild>
                      <Link href={course.firstLessonId ? `/academy/${orgSlug}/courses/${course.id}/lessons/${course.firstLessonId}` : `/academy/${orgSlug}/courses/${course.id}`}>המשך שיעור</Link>
                    </Button>
                  </div>
                </div>
                <CardHeader className="p-5 pb-2">
                  <CardTitle className="text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-primary transition-colors leading-tight">{course.title}</CardTitle>
                  <div className="flex items-center gap-1.5 mt-1.5 text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span className="text-[10px] font-bold tracking-tight">שיעור אחרון: {course.lastLesson}</span>
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-0 flex-1">
                  <div className="space-y-2.5 bg-slate-50/50 p-3 rounded-lg border border-slate-100/50">
                    <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-wider text-slate-400">
                      <span>התקדמות הקורס</span>
                      <span className="text-primary font-bold">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-1.5 bg-slate-200" />
                  </div>
                </CardContent>
                <CardFooter className="p-5 pt-0">
                  <Button size="sm" className="w-full gap-1.5 rounded-lg h-10 font-bold text-xs shadow-sm transition-all" asChild>
                    <Link href={course.firstLessonId ? `/academy/${orgSlug}/courses/${course.id}/lessons/${course.firstLessonId}` : `/academy/${orgSlug}/courses/${course.id}`}>
                      {course.progress > 0 ? "המשך למידה" : "התחל קורס"}
                      <PlayCircle className="w-4 h-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )) : (
              <div className="col-span-full py-12 text-center bg-white rounded-xl border border-slate-100 border-dashed">
                <p className="text-slate-400 font-bold text-base mb-4">עוד לא נרשמת לאף קורס</p>
                <Button size="sm" asChild className="rounded-lg font-bold h-9 px-5">
                  <Link href={`/academy/${orgSlug}/courses?view=all`}>לקטלוג הקורסים</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Announcements & Activity */}
        <div className="lg:col-span-4 space-y-5">
          <AcademyMessagesList initialMessages={messages} orgName={organization.name} />

          <Card className="border-none shadow-sm rounded-xl bg-slate-900 text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-primary/20 transition-all duration-700" />
            <CardHeader className="p-6 relative z-10 text-right">
              <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center mb-3 shadow-inner border border-white/10">
                 <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-lg font-bold leading-tight">נשמח לעזור לך להצליח! 🤝</CardTitle>
              <CardDescription className="text-white/40 font-medium mt-1 leading-relaxed text-xs">
                יש לך שאלה? נתקלת בקושי? אנחנו כאן לכל דבר שתצטרך.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6 relative z-10">
              <Button size="sm" className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-lg h-10 shadow-sm border-none transition-all" asChild>
                <Link href={`/academy/${orgSlug}/contact`}>צרו קשר עכשיו</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
