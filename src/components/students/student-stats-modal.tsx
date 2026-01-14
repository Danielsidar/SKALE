'use client'

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  Loader2,
  Mail,
  MoreHorizontal,
  Pencil,
  Play,
  Plus,
  Save,
  Shield,
  Target,
  Trash2,
  TrendingUp,
  User,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  removeStudent, 
  updateStudent, 
  updateStudentRole,
  enrollStudentInCourse,
  unenrollStudentFromCourse
} from "@/app/actions/students"
import { createClient } from "@/lib/supabase/client"

const roleLabels = {
  admin: "מנהל",
  support: "תמיכה",
  student: "סטודנט",
}

const statusLabels = {
  completed: { label: "הושלם", color: "bg-emerald-100 text-emerald-700" },
  in_progress: { label: "בהתקדמות", color: "bg-blue-100 text-blue-700" },
  not_started: { label: "טרם התחיל", color: "bg-slate-100 text-slate-500" }
}

interface StudentStatsModalProps {
  student: any
  isOpen: boolean
  onClose: () => void
}

// CountUp Component for numbers
const CountUp = ({ end, duration = 1.5 }: { end: number, duration?: number }) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const endValue = end
    if (start === endValue) return

    const totalMiliseconds = duration * 1000
    const incrementTime = 20
    const totalSteps = totalMiliseconds / incrementTime
    const increment = endValue / totalSteps

    const timer = setInterval(() => {
      start += increment
      if (start >= endValue) {
        setCount(endValue)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, incrementTime)

    return () => clearInterval(timer)
  }, [end, duration])

  return <span>{count}</span>
}

export function StudentStatsModal({ student, isOpen, onClose }: StudentStatsModalProps) {
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editData, setEditData] = useState({ name: "", email: "" })
  const [isScrolled, setIsScrolled] = useState(false)
  
  // Stats data
  const [stats, setStats] = useState({
    totalEnrolledCourses: 0,
    totalLessonsCompleted: 0,
    totalLessonsInCourses: 0,
    overallProgress: 0,
    lastActivity: null as string | null
  })
  const [courseProgress, setCourseProgress] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  
  // Course management
  const [allCourses, setAllCourses] = useState<any[]>([])
  const [enrolledIds, setEnrolledIds] = useState<string[]>([])
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null)
  const [showCourseManager, setShowCourseManager] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen && student) {
      setEditData({ name: student.name || "", email: student.email || "" })
      setIsEditing(false)
      setShowCourseManager(false)
      fetchAllData()
    }
  }, [isOpen, student])

  async function fetchAllData() {
    if (!student) return
    setIsLoading(true)

    try {
      // Fetch enrollments with course details
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`
          id,
          enrolled_at,
          course_id,
          courses (
            id,
            title,
            status,
            image_url
          )
        `)
        .eq('profile_id', student.id)

      // Fetch all courses for enrollment management
      const { data: orgCourses } = await supabase
        .from('courses')
        .select('id, title, status')
        .eq('organization_id', student.organization_id)
      
      setAllCourses(orgCourses || [])
      setEnrolledIds(enrollments?.map(e => e.course_id) || [])

      // Fetch all lessons for enrolled courses
      const courseIds = enrollments?.map(e => e.course_id) || []
      
      let courseLessons: any[] = []
      if (courseIds.length > 0) {
        const { data: modules } = await supabase
          .from('modules')
          .select('id, course_id')
          .in('course_id', courseIds)
        
        const moduleIds = modules?.map(m => m.id) || []
        
        if (moduleIds.length > 0) {
          const { data: lessons } = await supabase
            .from('lessons')
            .select('id, title, module_id')
            .in('module_id', moduleIds)
          
          courseLessons = (lessons || []).map(lesson => {
            const module = modules?.find(m => m.id === lesson.module_id)
            return {
              ...lesson,
              course_id: module?.course_id
            }
          })
        }
      }

      // Fetch lesson completions
      const { data: completions } = await supabase
        .from('lesson_completions')
        .select(`
          id,
          lesson_id,
          created_at,
          lessons (
            id,
            title,
            modules (
              id,
              title,
              courses (
                id,
                title
              )
            )
          )
        `)
        .eq('profile_id', student.id)
        .order('created_at', { ascending: false })

      // Calculate statistics
      const totalEnrolledCourses = enrollments?.length || 0
      const totalLessonsCompleted = completions?.length || 0
      const totalLessonsInCourses = courseLessons.length
      const overallProgress = totalLessonsInCourses > 0 
        ? Math.round((totalLessonsCompleted / totalLessonsInCourses) * 100)
        : 0
      const lastActivity = completions && completions.length > 0 
        ? completions[0].created_at 
        : null

      setStats({
        totalEnrolledCourses,
        totalLessonsCompleted,
        totalLessonsInCourses,
        overallProgress,
        lastActivity
      })

      // Calculate per-course progress
      const progress = enrollments?.map(enrollment => {
        const course = enrollment.courses as any
        const lessonsInCourse = courseLessons.filter(
          (l: any) => l.course_id === course.id
        )
        const completedInCourse = completions?.filter(
          (c: any) => lessonsInCourse.some((l: any) => l.id === c.lesson_id)
        ) || []
        
        const courseProgressValue = lessonsInCourse.length > 0
          ? Math.round((completedInCourse.length / lessonsInCourse.length) * 100)
          : 0
        
        const lastCourseActivity = completedInCourse.length > 0
          ? completedInCourse.sort((a: any, b: any) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0]?.created_at
          : null

        return {
          courseId: course.id,
          courseTitle: course.title,
          courseStatus: course.status,
          courseImage: course.image_url,
          enrolledAt: enrollment.enrolled_at,
          totalLessons: lessonsInCourse.length,
          completedLessons: completedInCourse.length,
          progress: courseProgressValue,
          lastActivity: lastCourseActivity,
          status: courseProgressValue === 100 ? 'completed' : courseProgressValue > 0 ? 'in_progress' : 'not_started'
        }
      }) || []

      setCourseProgress(progress)

      // Recent activity - Fetch ALL completions
      const recent = completions?.map((c: any) => ({
        id: c.id,
        lessonTitle: c.lessons?.title || 'שיעור',
        moduleTitle: c.lessons?.modules?.title || 'מודול',
        courseTitle: c.lessons?.modules?.courses?.title || 'קורס',
        completedAt: c.created_at,
        type: 'completion'
      })) || []

      // Add "Joined" event
      recent.push({
        id: 'joined',
        lessonTitle: 'הצטרפות למערכת',
        moduleTitle: '',
        courseTitle: 'ברוך הבא! 🎉',
        completedAt: student.created_at,
        type: 'joined'
      })

      setRecentActivity(recent)

    } catch (error) {
      console.error('Error fetching data:', error)
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

  async function handleRemove() {
    if (!confirm("האם אתה בטוח שברצונך להסיר סטודנט זה?")) return
    try {
      await removeStudent(student.id)
      toast.success("הסטודנט הוסר בהצלחה")
      onClose()
    } catch (error: any) {
      toast.error(error.message || "שגיאה בהסרת הסטודנט")
    }
  }

  async function handleChangeRole() {
    const newRole = student.role === 'student' ? 'support' : 'student'
    try {
      await updateStudentRole(student.id, newRole)
      toast.success("התפקיד עודכן בהצלחה")
    } catch (error: any) {
      toast.error(error.message || "שגיאה בעדכון התפקיד")
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
      fetchAllData()
    } catch (error: any) {
      toast.error(error.message || "שגיאה בביצוע הפעולה")
    } finally {
      setIsActionLoading(null)
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  function formatDateTime(date: string) {
    return new Date(date).toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function getTimeAgo(date: string) {
    const now = new Date()
    const past = new Date(date)
    const diffMs = now.getTime() - past.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'היום'
    if (diffDays === 1) return 'אתמול'
    if (diffDays < 7) return `לפני ${diffDays} ימים`
    if (diffDays < 30) return `לפני ${Math.floor(diffDays / 7)} שבועות`
    return `לפני ${Math.floor(diffDays / 30)} חודשים`
  }

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-8 lg:inset-12 bg-slate-50 rounded-[2rem] z-[101] overflow-hidden shadow-2xl flex flex-col"
            dir="rtl"
          >
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-6 left-6 z-[110] rounded-full bg-white/80 hover:bg-white shadow-lg h-10 w-10 transition-transform hover:rotate-90 duration-300"
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Sticky Compact Header */}
            <AnimatePresence>
              {isScrolled && !isLoading && (
                <motion.div 
                  initial={{ y: -100 }}
                  animate={{ y: 0 }}
                  exit={{ y: -100 }}
                  className="absolute top-0 inset-x-0 h-20 bg-white/80 backdrop-blur-xl z-[105] border-b border-slate-100 px-12 flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 rounded-xl shadow-sm border border-slate-100">
                      <AvatarFallback className="bg-primary/5 text-primary font-black text-sm rounded-xl">
                        {student?.name?.split(" ").map((n: string) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-right">
                      <h3 className="font-black text-slate-900 leading-none mb-1">{student?.name}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{roleLabels[student?.role as keyof typeof roleLabels]}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-black text-slate-900">{stats.overallProgress}%</span>
                      <span className="text-[9px] text-slate-400 font-bold">התקדמות</span>
                    </div>
                    <div className="w-px h-8 bg-slate-100" />
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-black text-slate-900">{stats.totalLessonsCompleted}</span>
                      <span className="text-[9px] text-slate-400 font-bold">שיעורים</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div 
              className="flex-1 overflow-y-auto custom-scrollbar"
              onScroll={(e) => {
                const scrollTop = e.currentTarget.scrollTop
                setIsScrolled(scrollTop > 150)
              }}
            >
              <div className="p-8 md:p-12 space-y-8">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <p className="text-slate-400 font-bold animate-pulse">טוען סטטיסטיקות...</p>
                  </div>
                ) : (
                  <>
                    {/* Student Info Card */}
                    <motion.div 
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl"
                    >
                      {/* Background decoration */}
                      <motion.div 
                        animate={{ 
                          scale: [1, 1.2, 1],
                          rotate: [0, 90, 0]
                        }}
                        transition={{ duration: 20, repeat: Infinity }}
                        className="absolute top-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" 
                      />
                      <motion.div 
                        animate={{ 
                          scale: [1, 1.3, 1],
                          rotate: [0, -90, 0]
                        }}
                        transition={{ duration: 15, repeat: Infinity }}
                        className="absolute bottom-0 right-0 w-48 h-48 bg-violet-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" 
                      />
                      
                      <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                        >
                          <Avatar className="h-24 w-24 rounded-2xl shadow-2xl border-4 border-white/10">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-violet-600 text-white font-black text-2xl rounded-2xl">
                              {student?.name?.split(" ").map((n: string) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                        </motion.div>
                        
                        <div className="flex-1 space-y-2 text-right">
                          {isEditing ? (
                            <div className="space-y-4 max-w-md">
                              <div className="space-y-2">
                                <Label className="text-white/60 text-xs font-bold">שם מלא</Label>
                                <Input 
                                  value={editData.name}
                                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-white/60 text-xs font-bold">אימייל</Label>
                                <Input 
                                  value={editData.email}
                                  onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl"
                                />
                              </div>
                              <div className="flex gap-2 pt-2">
                                <Button 
                                  size="sm"
                                  onClick={handleUpdateStudent}
                                  disabled={isUpdating}
                                  className="rounded-xl bg-white text-slate-900 hover:bg-white/90 font-bold"
                                >
                                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Save className="w-4 h-4 ml-2" />}
                                  שמור
                                </Button>
                                <Button 
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setIsEditing(false)
                                    setEditData({ name: student.name, email: student.email })
                                  }}
                                  className="rounded-xl text-white hover:bg-white/10 font-bold"
                                >
                                  <X className="w-4 h-4 ml-2" />
                                  ביטול
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-3">
                                <h2 className="text-3xl font-black tracking-tight">{student?.name}</h2>
                                <Badge className="rounded-lg bg-white/20 text-white border-none font-bold text-xs px-2 py-0.5">
                                  {roleLabels[student?.role as keyof typeof roleLabels]}
                                </Badge>
                              </div>
                              <p className="text-white/60 font-medium">{student?.email}</p>
                              <div className="flex items-center gap-4 pt-2 text-sm text-white/40">
                                <span className="flex items-center gap-1.5">
                                  <Calendar className="w-4 h-4" />
                                  הצטרף ב-{formatDate(student?.created_at)}
                                </span>
                              </div>
                            </>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {!isEditing && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setIsEditing(true)}
                              className="rounded-xl text-white/60 hover:text-white hover:bg-white/10 font-bold transition-all"
                            >
                              <Pencil className="w-4 h-4 ml-2" />
                              ערוך
                            </Button>
                          )}
                          <DropdownMenu dir="rtl">
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="rounded-xl text-white/60 hover:text-white hover:bg-white/10">
                                <MoreHorizontal className="w-5 h-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="rounded-xl p-1.5 min-w-[160px] shadow-xl border-slate-100">
                              <DropdownMenuLabel className="font-bold text-[9px] text-slate-400 px-2 py-1 uppercase tracking-widest">פעולות</DropdownMenuLabel>
                              <DropdownMenuItem 
                                className="gap-2.5 rounded-lg cursor-pointer py-2 focus:bg-slate-50"
                                onClick={() => setShowCourseManager(!showCourseManager)}
                              >
                                <BookOpen className="w-4 h-4 text-slate-400" />
                                <span className="font-bold text-sm">ניהול קורסים</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2.5 rounded-lg cursor-pointer py-2 focus:bg-slate-50">
                                <Mail className="w-4 h-4 text-slate-400" />
                                <span className="font-bold text-sm">שלח אימייל</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="gap-2.5 rounded-lg cursor-pointer py-2 focus:bg-slate-50"
                                onClick={handleChangeRole}
                              >
                                <Shield className="w-4 h-4 text-slate-400" />
                                <span className="font-bold text-sm">שנה תפקיד</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="my-1" />
                              <DropdownMenuItem 
                                className="gap-2.5 rounded-lg cursor-pointer py-2 text-rose-600 focus:bg-rose-50 focus:text-rose-600"
                                onClick={handleRemove}
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="font-bold text-sm">הסר מהארגון</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </motion.div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { icon: BookOpen, color: "blue", label: "קורסים רשומים", value: stats.totalEnrolledCourses },
                        { icon: CheckCircle2, color: "emerald", label: "שיעורים הושלמו", value: stats.totalLessonsCompleted },
                        { icon: Target, color: "violet", label: "התקדמות כללית", value: stats.overallProgress, suffix: "%" },
                        { icon: Clock, color: "amber", label: "פעילות אחרונה", value: stats.lastActivity ? getTimeAgo(stats.lastActivity) : 'אין פעילות', isTime: true }
                      ].map((item, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          whileHover={{ y: -5, shadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
                          className="bg-white rounded-[1.5rem] p-6 border border-slate-100 shadow-sm transition-all text-right"
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div className={`w-12 h-12 rounded-xl bg-${item.color}-100 flex items-center justify-center`}>
                              <item.icon className={`w-6 h-6 text-${item.color}-600`} />
                            </div>
                          </div>
                          <div className="flex items-baseline gap-0.5">
                            <p className="text-3xl font-black text-slate-900">
                              {typeof item.value === 'number' ? <CountUp end={item.value} /> : item.value}
                            </p>
                            {item.suffix && <span className="text-xl font-black text-slate-900">{item.suffix}</span>}
                          </div>
                          <p className="text-sm text-slate-500 font-bold mt-1">{item.label}</p>
                        </motion.div>
                      ))}
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Course Progress - Takes 2 columns */}
                      <motion.div 
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="lg:col-span-2 bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex flex-col"
                      >
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                              <GraduationCap className="w-6 h-6 text-primary" />
                              התקדמות בקורסים
                            </h3>
                            <Badge variant="secondary" className="rounded-lg font-bold bg-slate-100 text-slate-500 border-none">
                              {courseProgress.length} קורסים
                            </Badge>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setShowCourseManager(!showCourseManager)}
                            className={cn(
                              "rounded-xl font-bold border-slate-200 transition-all gap-2",
                              showCourseManager ? "bg-primary text-white border-primary" : "hover:bg-slate-50"
                            )}
                          >
                            {showCourseManager ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            {showCourseManager ? "סגור ניהול" : "שייך קורס נוסף"}
                          </Button>
                        </div>

                        {/* Course Management List - Inline */}
                        <AnimatePresence>
                          {showCourseManager && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="mb-8 border-2 border-primary/20 rounded-2xl p-6 bg-primary/5 overflow-hidden shadow-inner"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="font-black text-sm text-primary uppercase tracking-widest">בחר קורסים לשיוך:</h4>
                                <span className="text-[10px] text-slate-400 font-bold">{allCourses.length} קורסים זמינים</span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {allCourses.map((course) => {
                                  const isEnrolled = enrolledIds.includes(course.id)
                                  const actionLoading = isActionLoading === course.id

                                  return (
                                    <div 
                                      key={course.id}
                                      className="flex items-center justify-between p-3 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all"
                                    >
                                      <div className="flex flex-col text-right">
                                        <span className="font-bold text-xs text-slate-800 leading-tight">{course.title}</span>
                                        <Badge variant="outline" className="w-fit mt-1 text-[8px] font-bold rounded-md bg-slate-50 border-slate-100">
                                          {course.status === 'published' ? 'מפורסם' : 'טיוטה'}
                                        </Badge>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant={isEnrolled ? "destructive" : "default"}
                                        className="rounded-lg h-7 px-3 text-[10px] font-bold"
                                        onClick={() => toggleEnrollment(course.id, isEnrolled)}
                                        disabled={actionLoading}
                                      >
                                        {actionLoading ? (
                                          <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : isEnrolled ? (
                                          <>
                                            <X className="w-3 h-3 ml-1" />
                                            בטל
                                          </>
                                        ) : (
                                          <>
                                            <Plus className="w-3 h-3 ml-1" />
                                            רשום
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  )
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {courseProgress.length === 0 ? (
                          <div className="flex-1 flex flex-col items-center justify-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-400 font-bold text-lg">אין קורסים רשומים</p>
                            <p className="text-slate-400 text-sm mt-1">התלמיד טרם נרשם לקורסים</p>
                            <Button 
                              variant="outline" 
                              className="mt-6 rounded-xl font-bold border-slate-200 hover:bg-white"
                              onClick={() => setShowCourseManager(true)}
                            >
                              <Plus className="w-4 h-4 ml-2" />
                              רשום לקורס הראשון
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {courseProgress.map((course, idx) => (
                              <motion.div 
                                key={course.courseId}
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.5 + idx * 0.1 }}
                                className="p-5 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-slate-50 transition-all group"
                              >
                                <div className="flex items-start justify-between gap-4 mb-4 text-right">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">
                                        {course.courseTitle}
                                      </h4>
                                      <Badge className={`rounded-md text-[10px] font-bold ${statusLabels[course.status as keyof typeof statusLabels].color} border-none`}>
                                        {statusLabels[course.status as keyof typeof statusLabels].label}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-slate-400 font-bold">
                                      נרשם ב-{formatDate(course.enrolledAt)}
                                      {course.lastActivity && ` • פעילות אחרונה ${getTimeAgo(course.lastActivity)}`}
                                    </p>
                                  </div>
                                  <div className="text-left">
                                    <span className="text-2xl font-black text-slate-900">
                                      <CountUp end={course.progress} />%
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${course.progress}%` }}
                                      transition={{ duration: 1, delay: 0.8 + idx * 0.1 }}
                                      className="h-full bg-primary rounded-full"
                                    />
                                  </div>
                                  <div className="flex justify-between text-xs text-slate-400 font-bold">
                                    <span>{course.completedLessons} מתוך {course.totalLessons} שיעורים</span>
                                    <span>{course.totalLessons - course.completedLessons} שיעורים נותרו</span>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </motion.div>

                      {/* Recent Activity - Takes 1 column */}
                      <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex flex-col h-[600px]"
                      >
                        <div className="flex items-center justify-between mb-6 shrink-0">
                          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-primary" />
                            פעילות אחרונה
                          </h3>
                          <Badge variant="outline" className="rounded-lg font-bold border-slate-100 text-slate-400">
                            {recentActivity.length} אירועים
                          </Badge>
                        </div>

                        {recentActivity.length === 0 ? (
                          <div className="flex-1 flex flex-col items-center justify-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                            <Play className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-400 font-bold">אין פעילות עדיין</p>
                          </div>
                        ) : (
                          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                            <div className="space-y-1">
                              {recentActivity.map((activity, index) => (
                                <motion.div 
                                  key={activity.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.6 + index * 0.05 }}
                                  className="relative pr-6 pb-6 last:pb-0 text-right"
                                >
                                  {/* Timeline line */}
                                  {index < recentActivity.length - 1 && (
                                    <div className="absolute right-[7px] top-4 bottom-0 w-0.5 bg-slate-100" />
                                  )}
                                  
                                  {/* Timeline dot */}
                                  <div className={`absolute right-0 top-1 w-4 h-4 rounded-full flex items-center justify-center ${
                                    activity.type === 'joined' ? 'bg-emerald-500/20' : 'bg-primary/20'
                                  }`}>
                                    <div className={`w-2 h-2 rounded-full ${
                                      activity.type === 'joined' ? 'bg-emerald-500' : 'bg-primary'
                                    }`} />
                                  </div>
                                  
                                  <div className={`rounded-xl p-4 border transition-all ${
                                    activity.type === 'joined' 
                                      ? 'bg-emerald-50/50 border-emerald-100 hover:bg-emerald-50 shadow-sm' 
                                      : 'bg-slate-50/50 border-transparent hover:bg-white hover:shadow-md hover:border-slate-100'
                                  }`}>
                                    <p className={`font-bold text-sm mb-1 leading-tight ${
                                      activity.type === 'joined' ? 'text-emerald-700' : 'text-slate-800'
                                    }`}>
                                      {activity.lessonTitle}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-bold mb-2">
                                      {activity.courseTitle} {activity.moduleTitle && `• ${activity.moduleTitle}`}
                                    </p>
                                    <p className={`text-[10px] font-black ${
                                      activity.type === 'joined' ? 'text-emerald-500/70' : 'text-primary/60'
                                    }`}>
                                      {formatDateTime(activity.completedAt)}
                                    </p>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </div>

                    {/* Overall Progress Bar */}
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="bg-gradient-to-br from-primary/5 to-violet-500/5 rounded-[2rem] p-8 border border-primary/10 shadow-inner"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-black text-slate-900">התקדמות כוללת במערכת</h3>
                        <span className="text-3xl font-black text-primary">
                          <CountUp end={stats.overallProgress} />%
                        </span>
                      </div>
                      <div className="h-4 w-full bg-white rounded-full overflow-hidden shadow-sm border border-slate-100">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${stats.overallProgress}%` }}
                          transition={{ duration: 1.5, delay: 1 }}
                          className="h-full bg-gradient-to-r from-primary to-violet-500 rounded-full"
                        />
                      </div>
                      <p className="text-sm text-slate-500 font-bold mt-4 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        {stats.totalLessonsCompleted} שיעורים הושלמו מתוך {stats.totalLessonsInCourses} שיעורים בסה"כ
                      </p>
                    </motion.div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
