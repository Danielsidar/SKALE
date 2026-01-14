'use client'

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { 
  BookOpen, 
  Loader2, 
  Plus, 
  X,
  User,
  Mail,
  Save,
  Pencil
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  enrollStudentInCourse, 
  unenrollStudentFromCourse,
  updateStudent
} from "@/app/actions/students"
import { createClient } from "@/lib/supabase/client"

interface StudentDetailsSheetProps {
  student: any
  isOpen: boolean
  onClose: () => void
}

export function StudentDetailsSheet({ student, isOpen, onClose }: StudentDetailsSheetProps) {
  const [courses, setCourses] = useState<any[]>([])
  const [enrolledIds, setEnrolledIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  
  const [editData, setEditData] = useState({
    name: "",
    email: ""
  })

  const supabase = createClient()

  useEffect(() => {
    if (isOpen && student) {
      fetchData()
      setEditData({
        name: student.name || "",
        email: student.email || ""
      })
      setIsEditing(false)
    }
  }, [isOpen, student])

  async function fetchData() {
    setIsLoading(true)
    try {
      // Fetch all courses in the organization
      const { data: allCourses } = await supabase
        .from('courses')
        .select('id, title, status')
        .eq('organization_id', student.organization_id)

      // Fetch current enrollments
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('profile_id', student.id)

      setCourses(allCourses || [])
      setEnrolledIds(enrollments?.map(e => e.course_id) || [])
    } catch (error) {
      toast.error("שגיאה בטעינת נתונים")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleUpdateStudent() {
    setIsUpdating(true)
    try {
      await updateStudent(student.id, {
        name: editData.name,
        email: editData.email
      })
      toast.success("הפרטים עודכנו בהצלחה")
      setIsEditing(false)
    } catch (error: any) {
      toast.error(error.message || "שגיאה בעדכון הפרטים")
    } finally {
      setIsUpdating(false)
    }
  }

  async function toggleEnrollment(courseId: string, isEnrolled: boolean) {
    setIsActionLoading(courseId)
    try {
      if (isEnrolled) {
        await unenrollStudentFromCourse(student.id, courseId)
        setEnrolledIds(prev => prev.filter(id => id !== courseId))
        toast.success("בוטלה ההרשמה לקורס")
      } else {
        await enrollStudentInCourse(student.id, courseId)
        setEnrolledIds(prev => [...prev, courseId])
        toast.success("הסטודנט נרשם לקורס בהצלחה")
      }
    } catch (error: any) {
      toast.error(error.message || "שגיאה בביצוע הפעולה")
    } finally {
      setIsActionLoading(null)
    }
  }

  if (!student) return null

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="left" dir="rtl" className="w-full sm:max-w-md rounded-r-[2rem] overflow-y-auto">
        <SheetHeader className="text-right">
          <SheetTitle className="text-2xl font-black">{student.name}</SheetTitle>
          <SheetDescription>
            ניהול פרטי סטודנט וגישה לקורסים
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-8">
          {/* Student Info & Edit Section */}
          <div className="bg-slate-50 p-6 rounded-[2rem] space-y-6 relative border border-slate-100 shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-black text-lg flex items-center gap-2 text-slate-800">
                <User className="w-5 h-5 text-primary" />
                פרטים אישיים
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-full hover:bg-white"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                <span className="mr-2 font-bold">{isEditing ? "ביטול" : "עריכה"}</span>
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-bold mr-1">שם מלא</Label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    value={isEditing ? editData.name : student.name} 
                    disabled={!isEditing}
                    onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                    className="pr-10 rounded-xl bg-white disabled:bg-transparent disabled:border-none disabled:shadow-none font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold mr-1">אימייל</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    value={isEditing ? editData.email : student.email} 
                    disabled={!isEditing}
                    onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                    className="pr-10 rounded-xl bg-white disabled:bg-transparent disabled:border-none disabled:shadow-none font-bold"
                  />
                </div>
              </div>

              {isEditing && (
                <Button 
                  className="w-full rounded-xl font-bold h-11 mt-4 shadow-lg shadow-primary/20" 
                  onClick={handleUpdateStudent}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  ) : (
                    <Save className="w-4 h-4 ml-2" />
                  )}
                  שמור שינויים
                </Button>
              )}
            </div>
          </div>

          <Separator className="bg-slate-100" />

          {/* Courses Section */}
          <div className="space-y-6">
            <h3 className="font-black text-lg flex items-center gap-2 text-slate-800">
              <BookOpen className="w-5 h-5 text-primary" />
              ניהול הרשמה לקורסים
            </h3>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
              </div>
            ) : (
              <div className="space-y-3">
                {courses.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold">אין קורסים זמינים בארגון.</p>
                  </div>
                ) : (
                  courses.map((course) => {
                    const isEnrolled = enrolledIds.includes(course.id)
                    const actionLoading = isActionLoading === course.id

                    return (
                      <div 
                        key={course.id}
                        className="flex items-center justify-between p-4 rounded-2xl border bg-white hover:bg-slate-50 transition-all duration-200 group shadow-sm hover:shadow-md border-slate-100"
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 group-hover:text-primary transition-colors">{course.title}</span>
                          <Badge variant="outline" className="w-fit mt-1 text-[10px] font-bold rounded-lg bg-slate-50">
                            {course.status === 'published' ? 'מפורסם' : 'טיוטה'}
                          </Badge>
                        </div>
                        
                        <Button
                          size="sm"
                          variant={isEnrolled ? "destructive" : "default"}
                          className="rounded-xl h-9 px-4 font-bold shadow-sm"
                          onClick={() => toggleEnrollment(course.id, isEnrolled)}
                          disabled={actionLoading}
                        >
                          {actionLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : isEnrolled ? (
                            <>
                              <X className="w-4 h-4 ml-2" />
                              בטל הרשמה
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 ml-2" />
                              רשום לקורס
                            </>
                          )}
                        </Button>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>

          {/* Joined Date Badge */}
          <div className="flex justify-center pt-4">
            <Badge variant="outline" className="rounded-full px-4 py-1 text-xs font-medium text-slate-400 bg-slate-50 border-none">
              הצטרף למערכת ב-{new Date(student.created_at).toLocaleDateString('he-IL')}
            </Badge>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
