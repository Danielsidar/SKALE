import React from "react"
import Link from "next/link"
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  Users, 
  Calendar,
  LayoutGrid,
  List
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { CreateCourseSheet } from "@/components/courses/create-course-sheet"
import { CourseActions } from "@/components/courses/course-actions"
import { getActiveProfile } from "@/lib/auth-utils"

export default async function CoursesPage() {
  const supabase = createClient(cookies())
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const profile = await getActiveProfile()

  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('organization_id', profile?.organization_id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8 pb-10 text-right">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">הקורסים שלי 📚</h1>
          <p className="text-sm text-slate-500 font-medium">נהל את התכנים הלימודיים שלך והצץ בסטטיסטיקות.</p>
        </div>
        <CreateCourseSheet />
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-slate-100">
        <Tabs defaultValue="all" className="w-full md:w-auto">
          <TabsList className="bg-slate-50 p-1 rounded-lg h-10 border border-slate-100">
            <TabsTrigger value="all" className="rounded-md px-4 font-bold text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary h-full transition-all">הכל</TabsTrigger>
            <TabsTrigger value="published" className="rounded-md px-4 font-bold text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-600 h-full transition-all">פורסם</TabsTrigger>
            <TabsTrigger value="draft" className="rounded-md px-4 font-bold text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-600 h-full transition-all">טיוטה</TabsTrigger>
            <TabsTrigger value="archived" className="rounded-md px-4 font-bold text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-rose-600 h-full transition-all">ארכיון</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input placeholder="חפש קורס..." className="pr-9 h-10 rounded-lg border-slate-100 bg-slate-50 focus:bg-white transition-all font-medium text-right text-sm" />
          </div>
          <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-100 h-10 shrink-0">
            <Button variant="ghost" size="icon" className="rounded-md h-full w-8 text-primary bg-white shadow-sm">
              <LayoutGrid className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-md h-full w-8 text-slate-400">
              <List className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {courses?.map((course) => (
          <Card key={course.id} className="overflow-hidden group border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl bg-white flex flex-col relative">
            <Link href={`/courses/${course.id}`} className="absolute inset-0 z-10" />
            <div className="aspect-[16/10] w-full relative overflow-hidden">
              <img 
                src={course.image_url || "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=400&h=200&auto=format&fit=crop"} 
                alt={course.title}
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-2 left-2 z-20">
                <Badge className={cn(
                  "border-none py-0.5 px-2 text-[9px] font-bold uppercase tracking-wider rounded shadow-sm",
                  course.status === "published" ? "bg-emerald-500 text-white" : 
                  course.status === "draft" ? "bg-slate-500 text-white" : "bg-rose-500 text-white"
                )}>
                  {course.status === "published" ? "פורסם" : 
                   course.status === "draft" ? "טיוטה" : "בארכיון"}
                </Badge>
              </div>
            </div>
            <CardHeader className="p-4 pb-2 z-20">
              <div className="flex justify-between items-start gap-3">
                <h3 className="font-bold text-base leading-tight text-slate-800 line-clamp-2 group-hover:text-primary transition-colors">{course.title}</h3>
                <div className="relative z-30">
                  <CourseActions courseId={course.id} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-1 z-20">
              <p className="text-xs font-medium text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                {course.description}
              </p>
              <div className="flex items-center gap-4 py-2 border-t border-slate-50">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Users className="w-3 h-3" />
                  <span className="text-[10px] font-bold">{course.students_count || 0}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-3 h-3" />
                  <span className="text-[10px] font-bold">{new Date(course.updated_at).toLocaleDateString('he-IL').replace(/\//g, '.')}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex gap-2 z-30">
              <Button variant="outline" size="sm" className="flex-1 rounded-lg font-bold border hover:bg-slate-50 h-9 text-xs" asChild>
                <Link href={`/courses/${course.id}`}>
                  ניהול
                </Link>
              </Button>
              <Button size="sm" className="flex-1 rounded-lg font-bold h-9 text-xs shadow-sm">
                סטטיסטיקה
              </Button>
            </CardFooter>
          </Card>
        ))}
        
        {/* Add Course Placeholder */}
        <CreateCourseSheet isPlaceholder />
      </div>
    </div>
  )
}

