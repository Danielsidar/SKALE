import React from "react"
import Link from "next/link"
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  TrendingUp, 
  Plus, 
  UserPlus,
  Clock
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { getActiveProfile } from "@/lib/auth-utils"

export default async function OverviewPage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const profile = await getActiveProfile()
  
  const orgId = profile?.organization_id
  const orgName = profile?.organizations?.name || "האקדמיה שלי"
  const firstName = profile?.name ? profile.name.split(" ")[0] : "אורח"

  // Fetch real counts filtered by organization
  const { count: coursesCount } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId)

  const { count: studentsCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId)
    .eq('role', 'student')

  const { count: publishedCount } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId)
    .eq('status', 'published')

  const { count: draftCount } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId)
    .eq('status', 'draft')

  // Fetch recent enrollments for activity
  const { data: recentEnrollments } = await supabase
    .from('enrollments')
    .select('*, profiles(name), courses(title)')
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch recently updated courses
  const { data: recentlyUpdatedCourses } = await supabase
    .from('courses')
    .select('*')
    .eq('organization_id', orgId)
    .order('updated_at', { ascending: false })
    .limit(3)

  // Combine for recent activity
  const activities = [
    ...(recentEnrollments?.map(e => ({
      user: e.profiles?.name || "סטודנט",
      action: "נרשם לקורס",
      target: e.courses?.title || "קורס",
      time: new Date(e.created_at).toLocaleDateString('he-IL'),
      avatar: (e.profiles?.name || "ס").substring(0, 2),
    })) || []),
    ...(recentlyUpdatedCourses?.map(c => ({
      user: "מנהל מערכת",
      action: "עדכן את הקורס",
      target: c.title,
      time: new Date(c.updated_at).toLocaleDateString('he-IL'),
      avatar: "ממ",
    })) || [])
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5)

  const stats = [
    {
      title: "סה\"כ קורסים",
      value: (coursesCount || 0).toString(),
      description: `${publishedCount || 0} פורסמו, ${draftCount || 0} טיוטה`,
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "סטודנטים פעילים",
      value: (studentsCount || 0).toLocaleString(),
      description: "סטודנטים רשומים בארגון",
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "הרשמות חדשות",
      value: (recentEnrollments?.length || 0).toString(),
      description: "בתקופה האחרונה",
      icon: GraduationCap,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      title: "אחוז השלמה",
      value: "0%", // Still mock, but let's keep it 0 if we don't have progress table yet
      description: "בפיתוח",
      icon: TrendingUp,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
  ]

  return (
    <div className="space-y-6 pb-10">
      {/* Page Header Area */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">אהלן, {firstName}! 👋</h1>
            <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none py-0.5 px-2 text-[9px] font-bold rounded uppercase tracking-widest">{profile?.role === 'admin' ? 'מנהל מערכת' : 'צוות'}</Badge>
          </div>
          <p className="text-sm text-slate-500 font-medium max-w-xl leading-relaxed">
            נחמד לראות אותך שוב. ריכזנו עבורך את כל העדכונים החשובים מ{orgName} להיום.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          <Button size="sm" className="rounded-lg gap-2 px-4 font-bold h-10 text-sm bg-primary border-none transition-all" asChild>
            <Link href="/courses">
              <Plus className="w-4 h-4" />
              קורס חדש
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="rounded-lg gap-2 px-4 font-bold h-10 text-sm hover:bg-slate-50 transition-all" asChild>
            <Link href="/students">
              <UserPlus className="w-4 h-4" />
              הזמנת תלמיד
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden group bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-5">
              <CardTitle className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">{stat.title}</CardTitle>
              <div className={stat.bg + " w-10 h-10 rounded-lg flex items-center justify-center transition-all group-hover:scale-105 duration-300 shadow-sm"}>
                <stat.icon className={"h-5 w-5 " + stat.color} />
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="text-3xl font-bold text-slate-900 leading-none tracking-tight">{stat.value}</div>
              <div className="mt-3 flex items-center gap-2 bg-slate-50 w-fit px-2 py-0.5 rounded border border-slate-100/50">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] font-bold text-slate-500">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-8 border-slate-100 shadow-sm rounded-xl">
          <CardHeader className="p-5 border-b border-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-800 text-right">פעילות אחרונה</CardTitle>
                <CardDescription className="font-medium text-xs text-right">עדכונים שוטפים מהתלמידים שלך</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/5 rounded-lg text-xs h-8" asChild>
                <Link href="/students">צפה בהכל</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-5">
              {activities.length > 0 ? activities.map((activity, i) => (
                <div key={i} className="flex items-center gap-4 group cursor-pointer">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                      {activity.avatar}
                    </div>
                  </div>
                  <div className="flex-1 space-y-0.5 text-right">
                    <p className="text-slate-600 text-xs font-medium">
                      <span className="font-bold text-slate-900 group-hover:text-primary transition-colors">{activity.user}</span>{" "}
                      {activity.action}{" "}
                      <span className="text-slate-700 font-bold bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded text-[10px]">{activity.target}</span>
                    </p>
                    <div className="flex items-center justify-end text-[10px] text-slate-400 font-bold gap-1.5 uppercase tracking-wider">
                      {activity.time}
                      <Clock className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <p className="text-slate-400 font-bold text-xs">אין פעילות אחרונה להצגה</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-sm rounded-xl bg-slate-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-3xl -mr-12 -mt-12" />
            
            <CardHeader className="p-5 relative">
              <CardTitle className="text-base font-bold text-right">ניהול האקדמיה 💡</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 relative text-right">
              <p className="font-medium text-slate-400 leading-relaxed text-xs">
                ככל שתעדכן את הקורסים שלך לעיתים קרובות יותר ותענה לשאלות סטודנטים, כך אחוז שביעות הרצון וההשלמה יעלה!
              </p>
              <Button className="w-full mt-5 bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-lg h-9 shadow-sm border-none text-xs" asChild>
                <Link href="/courses">לניהול הקורסים</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-sm rounded-xl">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-base font-bold text-slate-800 text-right">סיכום סטודנטים</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">סטודנטים רשומים</span>
                  <span className="text-lg font-bold text-slate-900">{studentsCount || 0}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: studentsCount ? '100%' : '0%' }} />
                </div>
                <p className="text-[10px] font-bold text-slate-400 text-right">כל הסטודנטים שקיבלו גישה לארגון</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

