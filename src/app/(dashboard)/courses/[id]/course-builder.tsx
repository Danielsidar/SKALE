"use client"

import React, { useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LessonEditor } from "@/components/courses/lesson-editor"
import { 
  ChevronRight, 
  Save, 
  X, 
  Plus, 
  GripVertical, 
  Video, 
  FileText, 
  Link as LinkIcon, 
  Paperclip,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  UserPlus,
  Settings as SettingsIcon,
  Layout,
  Loader2,
  Copy,
  ExternalLink,
  Upload,
  Play,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { uploadFile } from "@/lib/supabase/storage"
import { 
  updateCourse, 
  createModule, 
  updateModule, 
  deleteModule, 
  createLesson, 
  updateLesson, 
  deleteLesson,
  reorderModules,
  reorderLessons
} from "@/app/actions/courses"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useTabs } from "@/lib/tabs-context"
import { usePathname } from "next/navigation"
import Image from "next/image"
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface CourseBuilderProps {
  course: any
  initialModules: any[]
}

// Sortable Module Item Component
function SortableModule({ 
  module, 
  mIndex, 
  editingModuleId, 
  setEditingModuleId, 
  handleDeleteModule, 
  handleAddLesson, 
  handleDeleteLesson, 
  handleEditLesson,
  onUpdateModuleTitle,
  onUpdateLessonTitle,
  activeLessonId
}: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: module.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : 1,
  }

  const [localTitle, setLocalTitle] = useState(module.title)

  return (
    <div ref={setNodeRef} style={style} className="rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white">
      {/* Module Header */}
      <div className="bg-[#0f172a] p-3 text-white flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center font-bold text-xs shrink-0">
            {mIndex + 1}
          </div>
          <div className="text-right flex-1 flex items-center gap-2">
            {editingModuleId === module.id ? (
              <div className="flex items-center gap-2 w-full max-w-md">
                <Input 
                  value={localTitle} 
                  onChange={(e) => setLocalTitle(e.target.value)}
                  className="bg-white/5 border-white/10 text-white font-bold text-sm h-8 focus:bg-white/10 text-right"
                  autoFocus
                  onBlur={() => {
                    onUpdateModuleTitle(module.id, localTitle)
                    setEditingModuleId(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onUpdateModuleTitle(module.id, localTitle)
                      setEditingModuleId(null)
                    }
                    if (e.key === 'Escape') setEditingModuleId(null)
                  }}
                />
              </div>
            ) : (
              <div className="cursor-pointer group/title" onClick={() => setEditingModuleId(module.id)}>
                <h3 className="text-sm font-bold group-hover/title:text-primary transition-colors leading-tight">{module.title}</h3>
                <p className="text-white/40 text-[10px] font-medium uppercase tracking-wider">{module.lessons.length} שיעורים</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-white/10 text-white/40 hover:text-rose-400" onClick={() => handleDeleteModule(module.id)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
          <div {...attributes} {...listeners} className="p-1 cursor-grab active:cursor-grabbing hover:bg-white/10 rounded-lg transition-colors ms-1">
            <GripVertical className="w-4 h-4 text-white/20" />
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <CardContent className="p-2 space-y-1 bg-slate-50/50">
        <SortableContext items={module.lessons.map((l: any) => l.id)} strategy={verticalListSortingStrategy}>
          {module.lessons.map((lesson: any, lIndex: number) => (
            <SortableLesson 
              key={lesson.id} 
              lesson={lesson} 
              lIndex={lIndex} 
              isActive={activeLessonId === lesson.id}
              handleDeleteLesson={handleDeleteLesson} 
              handleEditLesson={handleEditLesson}
              onUpdateLessonTitle={onUpdateLessonTitle}
            />
          ))}
        </SortableContext>
        
        <div className="pt-1">
          <Button 
            onClick={() => handleAddLesson(module.id, module.lessons.length)}
            variant="ghost" 
            className="w-full h-9 border border-dashed border-slate-200 hover:border-primary/30 hover:bg-primary/[0.02] text-slate-400 hover:text-primary font-bold text-xs rounded-lg transition-all gap-2"
          >
            <Plus className="w-4 h-4" />
            הוסף שיעור
          </Button>
        </div>
      </CardContent>
    </div>
  )
}

// Sortable Lesson Item Component
function SortableLesson({ lesson, lIndex, isActive, handleDeleteLesson, handleEditLesson, onUpdateLessonTitle }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: lesson.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : 1,
  }

  const [isEditing, setIsEditing] = useState(false)
  const [localTitle, setLocalTitle] = useState(lesson.title)

  const handleTitleSubmit = () => {
    if (localTitle !== lesson.title) {
      onUpdateLessonTitle(lesson.id, localTitle)
    }
    setIsEditing(false)
  }

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-white border p-2 rounded-lg flex items-center justify-between group transition-all cursor-pointer",
        isActive ? "border-primary bg-primary/[0.02]" : "border-slate-100 hover:border-slate-200"
      )}
      onClick={() => handleEditLesson(lesson)}
    >
      <div className="flex items-center gap-2 flex-1">
        <div {...attributes} {...listeners} className="p-1 cursor-grab active:cursor-grabbing hover:bg-slate-50 rounded transition-colors" onClick={(e) => e.stopPropagation()}>
          <GripVertical className="w-3.5 h-3.5 text-slate-300" />
        </div>
        <div className={cn(
          "w-5 h-5 rounded border flex items-center justify-center font-bold text-[10px]",
          isActive ? "bg-primary text-white border-primary" : "bg-slate-50 border-slate-100 text-slate-400"
        )}>
          {lIndex + 1}
        </div>
        <div className="text-right flex-1 min-w-0">
          {isEditing ? (
            <Input 
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSubmit()
                if (e.key === 'Escape') setIsEditing(false)
              }}
              className="h-7 font-bold text-slate-800 text-xs border-primary/20 bg-slate-50/50 text-right"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <h4 
              className={cn(
                "font-bold text-xs truncate cursor-text hover:text-primary transition-colors",
                isActive ? "text-primary" : "text-slate-700"
              )}
              onClick={(e) => {
                e.stopPropagation()
                setIsEditing(true)
              }}
            >
              {lesson.title}
            </h4>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 text-slate-400 hover:text-primary hover:bg-primary/5 rounded" 
          onClick={(e) => {
            e.stopPropagation()
            setIsEditing(true)
          }}
        >
          <Edit2 className="w-3 h-3" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded" 
          onClick={(e) => {
            e.stopPropagation()
            handleDeleteLesson(lesson.id)
          }}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  )
}

export function CourseBuilder({ course, initialModules }: CourseBuilderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { updateTabTitle } = useTabs()
  const [loading, setLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [courseImageUrl, setCourseImageUrl] = useState(course.image_url || '')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null)
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null)
  const [modules, setModules] = useState(initialModules)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [courseTitle, setCourseTitle] = useState(course.title || '')
  const [courseDescription, setCourseDescription] = useState(course.description || '')
  const [courseStatus, setCourseStatus] = useState(course.status || 'draft')
  const [courseSaveStatus, setCourseSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  // Store the initial pathname to avoid updating wrong tabs when navigating away
  const initialPathnameRef = useRef(pathname)
  
  // Sync state with props
  React.useEffect(() => {
    // Only sync if we're not currently saving or in a "saved" state
    if (courseSaveStatus !== 'idle') return
    
    setCourseTitle(course.title || '')
    setCourseDescription(course.description || '')
    setCourseStatus(course.status || 'draft')
    setCourseImageUrl(course.image_url || '')
  }, [course, courseSaveStatus])

  // Auto-save Course logic
  const triggerCourseSave = useRef((updates: any) => {
    setCourseSaveStatus('saving')
    
    // Clear existing timer if any
    if ((triggerCourseSave as any).timeout) clearTimeout((triggerCourseSave as any).timeout)

    // Set new debounce timer
    ;(triggerCourseSave as any).timeout = setTimeout(async () => {
      const formData = new FormData()
      formData.append('title', updates.title)
      formData.append('description', updates.description)
      formData.append('status', updates.status)
      formData.append('image_url', updates.image_url || '')

      try {
        await updateCourse(course.id, formData)
        setCourseSaveStatus('saved')
        router.refresh()
        setTimeout(() => setCourseSaveStatus('idle'), 3000)
      } catch (error) {
        console.error('Course auto-save error:', error)
        setCourseSaveStatus('error')
        toast.error('שגיאה בשמירה אוטומטית של פרטי הקורס')
      }
    }, 1000)
  })

  const onCourseFieldChange = (fieldName: string, value: any) => {
    if (fieldName === 'title') setCourseTitle(value)
    if (fieldName === 'description') setCourseDescription(value)
    if (fieldName === 'status') setCourseStatus(value)
    if (fieldName === 'image_url') setCourseImageUrl(value)

    const updates = {
      title: fieldName === 'title' ? value : courseTitle,
      description: fieldName === 'description' ? value : courseDescription,
      status: fieldName === 'status' ? value : courseStatus,
      image_url: fieldName === 'image_url' ? value : courseImageUrl,
    }

    triggerCourseSave.current(updates)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const publicUrl = await uploadFile(file, 'courses', 'course-covers')
      onCourseFieldChange('image_url', publicUrl)
      toast.success('התמונה הועלתה בהצלחה')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('שגיאה בהעלאת התמונה')
    } finally {
      setIsUploading(false)
    }
  }

  // Keep state in sync with props when they change (e.g. after revalidatePath)
  React.useEffect(() => {
    setModules(initialModules)
  }, [initialModules])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const selectedLesson = editingLessonId 
    ? modules.flatMap(m => m.lessons).find(l => l.id === editingLessonId)
    : null

  // Course Details Form
  // (Removed manual onUpdateDetails in favor of auto-save useEffect)

  // Module Handlers
  async function handleAddModule() {
    try {
      const orderIndex = modules.length + 1
      await createModule(course.id, 'פרק חדש', orderIndex)
      toast.success('פרק חדש נוסף')
    } catch (error) {
      toast.error('שגיאה בהוספת פרק')
    }
  }

  const handleSaveCourse = () => {
    router.push('/courses')
  }

  async function handleDeleteModule(moduleId: string) {
    if (!confirm('האם למחוק את הפרק וכל השיעורים בתוכו?')) return
    try {
      await deleteModule(moduleId, course.id)
      toast.success('הפרק נמחק')
    } catch (error) {
      toast.error('שגיאה במחיקה')
    }
  }

  async function onUpdateModuleTitle(moduleId: string, title: string) {
    if (!title.trim()) return
    const oldModules = [...modules]
    const newModules = modules.map(m => m.id === moduleId ? { ...m, title } : m)
    
    // UI First
    setModules(newModules)
    
    try {
      await updateModule(moduleId, title, course.id)
      toast.success('שם הפרק עודכן')
    } catch (error) {
      setModules(oldModules) // Revert
      toast.error('שגיאה בעדכון שם הפרק')
    }
  }

  async function onUpdateLessonTitle(lessonId: string, title: string) {
    if (!title.trim()) return
    const oldModules = [...modules]
    const newModules = modules.map(m => ({
      ...m,
      lessons: m.lessons.map((l: any) => l.id === lessonId ? { ...l, title } : l)
    }))
    
    // UI First
    setModules(newModules)
    
    try {
      await updateLesson(lessonId, { title }, course.id)
      // No toast for silent success
    } catch (error) {
      setModules(oldModules) // Revert
      toast.error('שגיאה בעדכון שם השיעור')
    }
  }

  // Lesson Handlers
  async function handleAddLesson(moduleId: string, lessonCount: number) {
    const tempId = `temp-${Date.now()}`
    const newLesson = {
      id: tempId,
      title: 'שיעור חדש',
      order_index: lessonCount + 1,
      type: 'video',
      module_id: moduleId,
      isTemp: true
    }

    const oldModules = [...modules]
    const newModules = modules.map(m => 
      m.id === moduleId ? { ...m, lessons: [...m.lessons, newLesson] } : m
    )

    // UI First
    setModules(newModules)

    try {
      const savedLesson = await createLesson(moduleId, 'שיעור חדש', lessonCount + 1, course.id)
      // Replace temp lesson with real one to get the real ID
      setModules(prev => prev.map(m => 
        m.id === moduleId ? { 
          ...m, 
          lessons: m.lessons.map((l: any) => l.id === tempId ? savedLesson : l) 
        } : m
      ))
      setEditingLessonId(savedLesson.id)
      toast.success('שיעור חדש נוסף')
    } catch (error) {
      setModules(oldModules) // Revert
      toast.error('שגיאה בהוספת שיעור')
    }
  }

  const handleEditLesson = (lesson: any) => {
    setEditingLessonId(lesson.id)
  }

  async function handleDeleteLesson(lessonId: string) {
    if (!confirm('האם למחוק את השיעור?')) return
    try {
      await deleteLesson(lessonId, course.id)
      if (editingLessonId === lessonId) {
        setEditingLessonId(null)
      }
      toast.success('השיעור נמחק')
    } catch (error) {
      toast.error('שגיאה במחיקה')
    }
  }

  // Drag and Drop Handlers
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    // 1. Check if dragging a Module
    const activeModuleIndex = modules.findIndex(m => m.id === activeId)
    const overModuleIndex = modules.findIndex(m => m.id === overId)

    if (activeModuleIndex !== -1 && overModuleIndex !== -1) {
      const newModules = arrayMove(modules, activeModuleIndex, overModuleIndex)
      setModules(newModules)
      
      try {
        await reorderModules(course.id, newModules.map(m => m.id))
        toast.success('סדר המודולים עודכן')
      } catch (error) {
        setModules(modules)
        toast.error('שגיאה בעדכון סדר המודולים')
      }
      return
    }

    // 2. Check if dragging a Lesson
    const activeModule = modules.find(m => m.lessons.some((l: any) => l.id === activeId))
    const overModule = modules.find(m => m.lessons.some((l: any) => l.id === overId))

    if (activeModule && overModule) {
      // Reordering within the same module
      if (activeModule.id === overModule.id) {
        const oldIndex = activeModule.lessons.findIndex((l: any) => l.id === activeId)
        const newIndex = activeModule.lessons.findIndex((l: any) => l.id === overId)
        
        const newLessons = arrayMove(activeModule.lessons, oldIndex, newIndex)
        const newModules = modules.map(m => 
          m.id === activeModule.id ? { ...m, lessons: newLessons } : m
        )
        
        setModules(newModules)
        
        try {
          await reorderLessons(course.id, activeModule.id, newLessons.map((l: any) => l.id))
          toast.success('סדר השיעורים עודכן')
        } catch (error) {
          setModules(modules)
          toast.error('שגיאה בעדכון סדר השיעורים')
        }
      } 
      // Moving to a different module
      else {
        const activeLessonIndex = activeModule.lessons.findIndex((l: any) => l.id === activeId)
        const activeLesson = activeModule.lessons[activeLessonIndex]
        
        // Remove from source module
        const newSourceLessons = activeModule.lessons.filter((l: any) => l.id !== activeId)
        
        // Add to destination module
        const overLessonIndex = overModule.lessons.findIndex((l: any) => l.id === overId)
        const newDestLessons = [...overModule.lessons]
        newDestLessons.splice(overLessonIndex, 0, activeLesson)
        
        const newModules = modules.map(m => {
          if (m.id === activeModule.id) return { ...m, lessons: newSourceLessons }
          if (m.id === overModule.id) return { ...m, lessons: newDestLessons }
          return m
        })
        
        setModules(newModules)
        
        try {
          // Update both modules in the database
          await Promise.all([
            reorderLessons(course.id, activeModule.id, newSourceLessons.map((l: any) => l.id)),
            reorderLessons(course.id, overModule.id, newDestLessons.map((l: any) => l.id))
          ])
          toast.success('השיעור הועבר וסודר מחדש')
        } catch (error) {
          setModules(modules)
          toast.error('שגיאה בהעברת השיעור')
        }
      }
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-160px)]" dir="rtl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-3 border-b border-slate-100 bg-white shrink-0 px-4 -mx-4 mb-4">
        <div className="flex items-center gap-4">
          <Link href="/courses" className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-slate-600">
            <ChevronRight className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              עריכת קורס
              <span className="text-slate-400 font-medium text-base">/ {course.title}</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="rounded-lg font-bold h-9 px-4 border-slate-200 gap-2 text-sm">
                <SettingsIcon className="w-3.5 h-3.5" />
                הגדרות קורס
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[400px] sm:w-[480px] overflow-y-auto custom-scrollbar p-0 border-r-0">
              <div className="p-6 space-y-8">
                <SheetHeader className="text-right">
                  <div className="flex items-center justify-between mb-2">
                    <SheetTitle className="text-2xl font-bold">הגדרות הקורס</SheetTitle>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100">
                      {courseSaveStatus === 'saving' && (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin text-primary" />
                          <span className="text-[10px] font-bold text-slate-500">שומר...</span>
                        </>
                      )}
                      {courseSaveStatus === 'saved' && (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span className="text-[10px] font-bold text-emerald-600">נשמר</span>
                        </>
                      )}
                    </div>
                  </div>
                  <SheetDescription className="text-sm font-medium">ערוך את פרטי הקורס והגדרות המערכת. השינויים נשמרים אוטומטית.</SheetDescription>
                </SheetHeader>

                <div className="space-y-6">
                  <div className="grid gap-5">
                    <div className="grid gap-2">
                      <label className="text-xs font-bold text-slate-500 ms-1 uppercase tracking-wider text-right">שם הקורס</label>
                      <Input 
                        value={courseTitle} 
                        onChange={(e) => onCourseFieldChange('title', e.target.value)}
                        className="h-10 rounded-lg border-slate-200 bg-slate-50 focus:bg-white transition-all font-bold text-base px-4 text-right" 
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-bold text-slate-500 ms-1 uppercase tracking-wider text-right">תיאור הקורס</label>
                      <Textarea 
                        rows={4} 
                        value={courseDescription}
                        onChange={(e) => onCourseFieldChange('description', e.target.value)}
                        className="rounded-lg border-slate-200 bg-slate-50 focus:bg-white transition-all font-medium text-sm px-4 py-3 resize-none text-right"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-bold text-slate-500 ms-1 uppercase tracking-wider text-right">תמונת קורס</label>
                      <input 
                        type="file" 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload}
                        accept="image/*"
                      />
                      {courseImageUrl ? (
                        <div className="relative group aspect-video rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                          <Image 
                            src={courseImageUrl} 
                            alt="Course Cover" 
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button type="button" variant="secondary" size="sm" className="rounded-lg font-bold h-8 text-xs" onClick={() => fileInputRef.current?.click()}>החלף</Button>
                            <Button type="button" variant="destructive" size="icon" onClick={() => onCourseFieldChange('image_url', '')} className="rounded-lg h-8 w-8"><X className="w-4 h-4" /></Button>
                          </div>
                        </div>
                      ) : (
                        <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 transition-colors cursor-pointer group">
                          <div className="w-10 h-10 rounded-lg bg-slate-50 group-hover:bg-primary/10 flex items-center justify-center transition-all">
                            {isUploading ? <Loader2 className="w-5 h-5 text-primary animate-spin" /> : <Upload className="w-5 h-5 text-slate-400 group-hover:text-primary" />}
                          </div>
                          <p className="font-bold text-xs text-slate-500">העלאת תמונה</p>
                        </div>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-bold text-slate-500 ms-1 uppercase tracking-wider text-right">סטטוס</label>
                      <Select value={courseStatus} onValueChange={(val) => onCourseFieldChange('status', val)}>
                        <SelectTrigger className="h-10 rounded-lg border-slate-200 bg-slate-50 font-bold text-sm px-4 text-right">
                          <SelectValue placeholder="בחר סטטוס" />
                        </SelectTrigger>
                        <SelectContent dir="rtl" className="rounded-lg p-1">
                          <SelectItem value="published" className="rounded-md font-bold text-emerald-600 text-right text-sm">פורסם</SelectItem>
                          <SelectItem value="draft" className="rounded-md font-bold text-slate-500 text-right text-sm">טיוטה</SelectItem>
                          <SelectItem value="archived" className="rounded-md font-bold text-rose-500 text-right text-sm">ארכיון</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={() => setIsSettingsOpen(false)} className="w-full h-10 rounded-lg font-bold text-base mt-4 bg-slate-900">
                    סגור הגדרות
                  </Button>
                </div>

                <div className="pt-8 border-t border-slate-100 space-y-4">
                  <div className="text-right">
                    <h4 className="text-lg font-bold text-rose-600 mb-1 text-right">אזור מסוכן</h4>
                    <p className="text-slate-500 font-medium text-xs text-right">פעולות אלו הן בלתי הפיכות.</p>
                  </div>
                  <div className="p-5 border border-rose-100 rounded-xl bg-rose-50/30 flex items-center justify-between gap-4">
                    <span className="font-bold text-slate-700 text-sm">מחיקת הקורס לצמיתות</span>
                    <Button variant="destructive" size="sm" className="rounded-lg font-bold h-8 text-xs">מחק קורס</Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Button variant="outline" className="rounded-lg font-bold h-9 px-4 border-slate-200 text-sm" asChild>
            <Link href="/courses">ביטול</Link>
          </Button>
          <Button 
            onClick={handleSaveCourse}
            className="rounded-lg font-bold h-9 px-4 bg-[#0f172a] hover:bg-[#1e293b] gap-2 text-sm"
          >
            סיום עריכה
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-12 gap-6 h-full pb-4">
          {/* Sidebar: Modules and Lessons List (Right side in RTL) */}
          <div className="col-span-12 lg:col-span-4 order-1 h-full">
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between mb-4 shrink-0">
                <div className="text-right">
                  <h2 className="text-lg font-bold text-slate-900">מבנה הקורס</h2>
                  <p className="text-slate-500 font-medium text-xs">{modules.length} מודולים</p>
                </div>
                <Button onClick={handleAddModule} size="sm" className="rounded-lg font-bold bg-[#0f172a] hover:bg-[#1e293b] gap-2 h-8 text-xs">
                  <Plus className="w-3.5 h-3.5" />
                  הוסף מודול
                </Button>
              </div>

              <div className="space-y-3 overflow-y-auto custom-scrollbar px-1 pb-4 flex-1">
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCorners}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext 
                    items={modules.map(m => m.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {modules.map((module, mIndex) => (
                      <SortableModule 
                        key={module.id} 
                        module={module} 
                        mIndex={mIndex} 
                        editingModuleId={editingModuleId}
                        setEditingModuleId={setEditingModuleId}
                        activeLessonId={editingLessonId}
                        handleDeleteModule={handleDeleteModule}
                        handleAddLesson={handleAddLesson}
                        handleDeleteLesson={handleDeleteLesson}
                        handleEditLesson={handleEditLesson}
                        onUpdateModuleTitle={onUpdateModuleTitle}
                        onUpdateLessonTitle={onUpdateLessonTitle}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            </div>
          </div>

          {/* Main Content: Lesson Editor (Left side in RTL) */}
          <div className="col-span-12 lg:col-span-8 order-2 h-full overflow-y-auto custom-scrollbar pr-2">
            {selectedLesson ? (
              <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                <LessonEditor 
                  key={selectedLesson.id}
                  lesson={selectedLesson} 
                  courseId={course.id} 
                  onClose={() => setEditingLessonId(null)}
                />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl text-center">
                <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4">
                  <Edit2 className="w-6 h-6 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">בחר שיעור לעריכה</h3>
                <p className="text-slate-500 font-medium text-sm max-w-sm mx-auto">לחץ על אחד השיעורים ברשימה מימין כדי להתחיל לערוך את התוכן, ההגדרות והתרגילים שלו.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


