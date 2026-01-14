'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  X, 
  Video, 
  FileText, 
  ClipboardList, 
  Loader2, 
  Link as LinkIcon, 
  Paperclip, 
  Trash2, 
  Upload, 
  Settings, 
  HelpCircle,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Trash,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { updateLesson, addAttachment, deleteAttachment } from '@/app/actions/courses'
import { uploadFile } from '@/lib/supabase/storage'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface LessonEditorProps {
  lesson: any
  courseId: string
  onClose: () => void
}

export function LessonEditor({ lesson, courseId, onClose }: LessonEditorProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [activeTab, setActiveTab] = useState('settings')
  const [lessonType, setLessonType] = useState(lesson.type || 'video')
  const [attachments, setAttachments] = useState(lesson.lesson_attachments || [])
  const [newAttachmentName, setNewAttachmentName] = useState('')
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('')
  const [isAddingAttachment, setIsAddingAttachment] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [content, setContent] = useState(lesson.content || '')
  const [exerciseContent, setExerciseContent] = useState(lesson.exercise_content || '')
  const [title, setTitle] = useState(lesson.title || '')
  const [description, setDescription] = useState(lesson.description || '')
  const [videoUrl, setVideoUrl] = useState(lesson.video_url || '')
  const [hasExercise, setHasExercise] = useState(lesson.has_exercise || false)
  const [exerciseConfig, setExerciseConfig] = useState(lesson.exercise_config || {
    is_quiz: false,
    passing_grade: 60,
    questions: []
  })

  // Sync state with props when lesson changes (e.g. after router.refresh())
  useEffect(() => {
    // Only sync if we're not currently saving or in a "saved" state (waiting for idle)
    // This prevents the UI from "reverting" to old prop values during the save/refresh cycle
    if (saveStatus !== 'idle') return

    setTitle(lesson.title || '')
    setDescription(lesson.description || '')
    setLessonType(lesson.type || 'video')
    setVideoUrl(lesson.video_url || '')
    setContent(lesson.content || '')
    setExerciseContent(lesson.exercise_content || '')
    setHasExercise(lesson.has_exercise || false)
    setExerciseConfig(lesson.exercise_config || {
      is_quiz: false,
      passing_grade: 60,
      questions: []
    })
    setAttachments(lesson.lesson_attachments || [])
  }, [lesson, saveStatus])

  // Auto-save logic
  const triggerSave = useRef((updates: any) => {
    setSaveStatus('saving')
    
    // Clear existing timer if any
    if ((triggerSave as any).timeout) clearTimeout((triggerSave as any).timeout)

    // Set new debounce timer
    ;(triggerSave as any).timeout = setTimeout(async () => {
      try {
        await updateLesson(lesson.id, updates, courseId)
        setSaveStatus('saved')
        router.refresh()
        setTimeout(() => setSaveStatus('idle'), 3000)
      } catch (error) {
        console.error('Auto-save error:', error)
        setSaveStatus('error')
        toast.error('שגיאה בשמירה אוטומטית')
      }
    }, 1000)
  })

  const onFieldChange = (fieldName: string, value: any) => {
    // Update local state
    if (fieldName === 'title') setTitle(value)
    if (fieldName === 'description') setDescription(value)
    if (fieldName === 'type') setLessonType(value)
    if (fieldName === 'video_url') setVideoUrl(value)
    if (fieldName === 'content') setContent(value)
    if (fieldName === 'exercise_content') setExerciseContent(value)
    if (fieldName === 'has_exercise') setHasExercise(value)
    if (fieldName === 'exercise_config') setExerciseConfig(value)

    // Trigger save with the latest values
    const allUpdates = {
      title: fieldName === 'title' ? value : title,
      description: fieldName === 'description' ? value : description,
      type: fieldName === 'type' ? value : lessonType,
      video_url: fieldName === 'video_url' ? value : videoUrl,
      content: fieldName === 'content' ? value : content,
      exercise_content: fieldName === 'exercise_content' ? value : exerciseContent,
      has_exercise: fieldName === 'has_exercise' ? value : hasExercise,
      exercise_config: fieldName === 'exercise_config' ? value : exerciseConfig,
    }

    triggerSave.current(allUpdates)
  }

  const handleAddAttachment = async () => {
    if (!newAttachmentName || !newAttachmentUrl) {
      toast.error('נא למלא שם וקישור לקובץ')
      return
    }

    try {
      const data = await addAttachment(lesson.id, newAttachmentName, newAttachmentUrl, courseId)
      setAttachments([...attachments, data])
      setNewAttachmentName('')
      setNewAttachmentUrl('')
      setIsAddingAttachment(false)
      toast.success('קובץ נוסף בהצלחה')
      router.refresh()
    } catch (error) {
      toast.error('שגיאה בהוספת קובץ')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const publicUrl = await uploadFile(file, 'courses', `lessons/${lesson.id}`)
      setNewAttachmentUrl(publicUrl)
      if (!newAttachmentName) {
        setNewAttachmentName(file.name)
      }
      toast.success('הקובץ הועלה בהצלחה')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('שגיאה בהעלאת הקובץ')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteAttachment = async (id: string) => {
    try {
      await deleteAttachment(id, courseId)
      setAttachments(attachments.filter((a: any) => a.id !== id))
      toast.success('קובץ נמחק')
      router.refresh()
    } catch (error) {
      toast.error('שגיאה במחיקת קובץ')
    }
  }

  const addQuestion = (type: string) => {
    const newQuestion = {
      id: crypto.randomUUID(),
      type,
      text: '',
      options: type === 'multiple_choice' || type === 'multi_select' ? ['', ''] : [],
      points: 10,
      correct_answer: '',
      range_min: type === 'range' ? 0 : undefined,
      range_max: type === 'range' ? 10 : undefined,
    }
    setExerciseConfig({
      ...exerciseConfig,
      questions: [...exerciseConfig.questions, newQuestion]
    })
  }

  const updateQuestion = (id: string, updates: any) => {
    setExerciseConfig({
      ...exerciseConfig,
      questions: exerciseConfig.questions.map((q: any) => q.id === id ? { ...q, ...updates } : q)
    })
  }

  const deleteQuestion = (id: string) => {
    setExerciseConfig({
      ...exerciseConfig,
      questions: exerciseConfig.questions.filter((q: any) => q.id !== id)
    })
  }

  return (
    <Card className="border border-slate-100 shadow-sm rounded-xl overflow-hidden bg-white">
      <CardHeader className="p-6 pb-4 flex items-center justify-between text-right border-b border-slate-50 mb-4">
        <div className="flex items-center gap-4">
          <div>
            <CardTitle className="text-xl font-bold">עריכת שיעור: {lesson.title}</CardTitle>
            <CardDescription className="text-sm font-medium">נהל את ההגדרות, התוכן והתרגילים של השיעור.</CardDescription>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100">
            {saveStatus === 'saving' && (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-primary" />
                <span className="text-[10px] font-bold text-slate-500">שומר שינויים...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-600">כל השינויים נשמרו</span>
              </>
            )}
            {saveStatus === 'idle' && (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                <span className="text-[10px] font-bold text-slate-400">ממתין לשינויים</span>
              </>
            )}
            {saveStatus === 'error' && (
              <>
                <AlertCircle className="w-3 h-3 text-rose-500" />
                <span className="text-[10px] font-bold text-rose-600">שגיאה בשמירה</span>
              </>
            )}
          </div>
        </div>
        <Button type="button" variant="ghost" onClick={onClose} className="rounded-lg w-9 h-9 hover:bg-slate-50">
          <X className="w-5 h-5 text-slate-400" />
        </Button>
      </CardHeader>
      
      <CardContent className="p-6 pt-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl" className="w-full">
          <TabsList className="bg-slate-50 p-1 rounded-lg h-10 border border-slate-100 mb-6 w-full justify-start">
            <TabsTrigger value="settings" className="rounded-md px-4 font-bold text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
              <FileText className="w-3.5 h-3.5" />
              הגדרות
            </TabsTrigger>
            <TabsTrigger value="content" className="rounded-md px-4 font-bold text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
              <Video className="w-3.5 h-3.5" />
              תוכן השיעור
            </TabsTrigger>
            <TabsTrigger value="exercise" className="rounded-md px-4 font-bold text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
              <ClipboardList className="w-3.5 h-3.5" />
              תרגיל
            </TabsTrigger>
          </TabsList>

          <div className="space-y-6">
            <TabsContent value="settings" className="space-y-5 text-right mt-0">
              <div className="grid gap-2">
                <label className="text-xs font-bold text-slate-500 ms-1 uppercase tracking-wider">שם השיעור</label>
                <Input 
                  name="title" 
                  value={title} 
                  onChange={(e) => onFieldChange('title', e.target.value)}
                  className="h-10 rounded-lg border-slate-200 bg-slate-50 font-bold text-base px-4 text-right focus:bg-white transition-all" 
                />
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-bold text-slate-500 ms-1 uppercase tracking-wider">תיאור השיעור</label>
                <Textarea 
                  name="description"
                  value={description}
                  onChange={(e) => onFieldChange('description', e.target.value)}
                  rows={3}
                  className="rounded-lg border-slate-200 bg-slate-50 font-medium text-sm px-4 py-3 resize-none text-right focus:bg-white transition-all"
                  placeholder="תאר בקצרה על מה השיעור..."
                />
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-6 text-right mt-0">
              <div className="grid gap-2">
                <label className="text-xs font-bold text-slate-500 ms-1 uppercase tracking-wider">סוג שיעור</label>
                <Select value={lessonType} onValueChange={(val) => onFieldChange('type', val)}>
                  <SelectTrigger className="h-10 rounded-lg border-slate-200 bg-slate-50 font-bold text-sm px-4">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir="rtl" className="rounded-lg border-slate-200">
                    <SelectItem value="video" className="py-2 font-bold text-right text-sm">וידאו</SelectItem>
                    <SelectItem value="text" className="py-2 font-bold text-right text-sm">טקסט</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {lessonType === 'video' && (
                <div className="grid gap-2">
                  <label className="text-xs font-bold text-slate-500 ms-1 uppercase tracking-wider">קישור לוידאו (YouTube/Vimeo/Wistia)</label>
                  <div className="relative">
                    <Input 
                      name="video_url" 
                      value={videoUrl} 
                      onChange={(e) => onFieldChange('video_url', e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..." 
                      className="h-10 rounded-lg border-slate-200 bg-slate-50 font-bold text-sm px-4 pe-10 text-left dir-ltr" 
                    />
                    <Video className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  </div>
                </div>
              )}

              <div className="grid gap-2">
                <label className="text-xs font-bold text-slate-500 ms-1 uppercase tracking-wider">תוכן השיעור (עורך טקסט עשיר)</label>
                <RichTextEditor 
                  content={content}
                  onChange={(val) => onFieldChange('content', val)}
                  placeholder="כתוב את תוכן השיעור כאן..."
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 ms-1 uppercase tracking-wider">קבצים מצורפים</label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsAddingAttachment(true)}
                    className="rounded-lg font-bold gap-2 h-8 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    הוסף קובץ
                  </Button>
                </div>

                {isAddingAttachment && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="grid gap-1.5">
                        <label className="text-[10px] font-bold text-slate-500 mr-2 text-right uppercase">שם הקובץ</label>
                        <Input 
                          value={newAttachmentName}
                          onChange={(e) => setNewAttachmentName(e.target.value)}
                          placeholder="למשל: מצגת השיעור" 
                          className="rounded-lg border-slate-200 text-right font-bold h-9 text-sm"
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <label className="text-[10px] font-bold text-slate-500 mr-2 text-right uppercase">קישור לקובץ / URL</label>
                        <div className="flex gap-2">
                          <Input 
                            value={newAttachmentUrl}
                            onChange={(e) => setNewAttachmentUrl(e.target.value)}
                            placeholder="https://..." 
                            className="rounded-lg border-slate-200 text-left dir-ltr font-bold flex-1 h-9 text-sm"
                          />
                          <input 
                            type="file" 
                            className="hidden" 
                            ref={fileInputRef} 
                            onChange={handleFileUpload} 
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="rounded-lg font-bold h-9 w-9 border-slate-200 shrink-0 p-0"
                            title="העלה מהמחשב"
                          >
                            {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" onClick={handleAddAttachment} className="rounded-lg font-bold px-4 bg-[#0f172a] hover:bg-[#1e293b] h-8 text-xs">הוסף</Button>
                      <Button type="button" variant="ghost" onClick={() => setIsAddingAttachment(false)} className="rounded-lg font-bold h-8 text-xs">ביטול</Button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {attachments.map((file: any) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl group hover:border-slate-200 transition-all">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                          <Paperclip className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="text-right overflow-hidden">
                          <p className="font-bold text-slate-700 truncate text-xs">{file.name}</p>
                          <p className="text-[10px] text-slate-400 truncate dir-ltr">{file.url}</p>
                        </div>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteAttachment(file.id)}
                        className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg shrink-0 w-8 h-8"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {attachments.length === 0 && !isAddingAttachment && (
                    <div className="col-span-full py-6 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-100">
                      <p className="text-slate-400 font-bold text-xs">אין קבצים מצורפים לשיעור זה</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="exercise" className="space-y-6 text-right mt-0">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100" dir="rtl">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center transition-colors shrink-0",
                  hasExercise ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                )}>
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <Label className="text-base font-bold block mb-0.5">האם יש תרגיל בשיעור?</Label>
                  <p className="text-xs text-slate-500 font-medium">הפעל כדי להוסיף שאלות ומשימות לסטודנטים.</p>
                </div>
                <Switch 
                  checked={hasExercise} 
                  onCheckedChange={(val) => onFieldChange('has_exercise', val)}
                  className="data-[state=checked]:bg-emerald-600 shrink-0"
                />
              </div>

              {hasExercise && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold">מבנה התרגיל</h3>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-lg w-8 h-8 bg-slate-100 hover:bg-slate-200">
                            <Settings className="w-4 h-4 text-slate-600" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent dir="rtl" className="w-72 p-4 rounded-xl shadow-xl border-slate-200">
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <h4 className="font-bold text-base">הגדרות התרגיל</h4>
                              <p className="text-xs text-slate-500 font-medium">קבע את סוג התרגיל ותנאי המעבר.</p>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                              <Label className="font-bold text-sm">האם זה בוחן?</Label>
                              <Switch 
                                checked={exerciseConfig.is_quiz} 
                                onCheckedChange={(checked) => onFieldChange('exercise_config', {...exerciseConfig, is_quiz: checked})} 
                              />
                            </div>
                            {exerciseConfig.is_quiz && (
                              <div className="space-y-3 pt-2">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <Label className="font-bold text-xs text-slate-600">ציון עובר</Label>
                                    <span className="font-bold text-primary text-sm">{exerciseConfig.passing_grade}%</span>
                                  </div>
                                  <Slider 
                                    value={[exerciseConfig.passing_grade]} 
                                    min={0} 
                                    max={100} 
                                    step={5} 
                                    onValueChange={([val]) => onFieldChange('exercise_config', {...exerciseConfig, passing_grade: val})}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                      <Button type="button" onClick={() => {
                        const newQuestion = {
                          id: crypto.randomUUID(),
                          type: 'open',
                          text: '',
                          options: [],
                          points: 10,
                          correct_answer: ''
                        }
                        onFieldChange('exercise_config', {
                          ...exerciseConfig,
                          questions: [...exerciseConfig.questions, newQuestion]
                        })
                      }} variant="outline" className="rounded-lg font-bold border-slate-200 gap-1.5 h-8 text-xs shrink-0">
                        <Plus className="w-3.5 h-3.5" />
                        שאלה פתוחה
                      </Button>
                      <Button type="button" onClick={() => {
                        const newQuestion = {
                          id: crypto.randomUUID(),
                          type: 'multiple_choice',
                          text: '',
                          options: ['', ''],
                          points: 10,
                          correct_answer: ''
                        }
                        onFieldChange('exercise_config', {
                          ...exerciseConfig,
                          questions: [...exerciseConfig.questions, newQuestion]
                        })
                      }} variant="outline" className="rounded-lg font-bold border-slate-200 gap-1.5 h-8 text-xs shrink-0">
                        <Plus className="w-3.5 h-3.5" />
                        אמריקאית
                      </Button>
                      <Button type="button" onClick={() => {
                        const newQuestion = {
                          id: crypto.randomUUID(),
                          type: 'multi_select',
                          text: '',
                          options: ['', ''],
                          points: 10,
                          correct_answer: ''
                        }
                        onFieldChange('exercise_config', {
                          ...exerciseConfig,
                          questions: [...exerciseConfig.questions, newQuestion]
                        })
                      }} variant="outline" className="rounded-lg font-bold border-slate-200 gap-1.5 h-8 text-xs shrink-0">
                        <Plus className="w-3.5 h-3.5" />
                        בחירה מרובה
                      </Button>
                      <Button type="button" onClick={() => {
                        const newQuestion = {
                          id: crypto.randomUUID(),
                          type: 'range',
                          text: '',
                          options: [],
                          points: 10,
                          correct_answer: '',
                          range_min: 0,
                          range_max: 10
                        }
                        onFieldChange('exercise_config', {
                          ...exerciseConfig,
                          questions: [...exerciseConfig.questions, newQuestion]
                        })
                      }} variant="outline" className="rounded-lg font-bold border-slate-200 gap-1.5 h-8 text-xs shrink-0">
                        <Plus className="w-3.5 h-3.5" />
                        טווח
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {exerciseConfig.questions.map((q: any, index: number) => (
                      <div key={q.id} className="group relative bg-white border border-slate-100 rounded-xl p-5 hover:border-slate-200 transition-all border-r-4 border-r-primary/20">
                        <div className="absolute left-4 top-5">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => {
                              onFieldChange('exercise_config', {
                                ...exerciseConfig,
                                questions: exerciseConfig.questions.filter((item: any) => item.id !== q.id)
                              })
                            }}
                            className="w-8 h-8 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-xs text-slate-500">
                                {index + 1}
                              </div>
                              <span className="text-[10px] font-bold bg-slate-50 text-slate-500 px-2 py-0.5 rounded border border-slate-100 uppercase tracking-tighter">
                                {q.type === 'open' && 'שאלה פתוחה'}
                                {q.type === 'multiple_choice' && 'שאלה אמריקאית'}
                                {q.type === 'multi_select' && 'בחירה מרובה'}
                                {q.type === 'range' && 'טווח'}
                              </span>
                            </div>
                            
                            {exerciseConfig.is_quiz && (
                              <div className="flex items-center gap-1.5">
                                <Label className="text-[10px] font-bold text-slate-400 uppercase">ניקוד:</Label>
                                <Input 
                                  type="number" 
                                  value={q.points} 
                                  onChange={(e) => {
                                    const newQuestions = exerciseConfig.questions.map((item: any) => 
                                      item.id === q.id ? { ...item, points: parseInt(e.target.value) } : item
                                    )
                                    onFieldChange('exercise_config', { ...exerciseConfig, questions: newQuestions })
                                  }}
                                  className="w-12 h-6 rounded border-slate-200 bg-slate-50 text-center font-bold text-primary p-0 text-xs"
                                />
                              </div>
                            )}
                          </div>

                          <div className="grid gap-2">
                            <Label className="text-xs font-bold text-slate-500 mr-1 uppercase">השאלה שלך</Label>
                            <Input 
                              value={q.text} 
                              onChange={(e) => {
                                const newQuestions = exerciseConfig.questions.map((item: any) => 
                                  item.id === q.id ? { ...item, text: e.target.value } : item
                                )
                                onFieldChange('exercise_config', { ...exerciseConfig, questions: newQuestions })
                              }}
                              placeholder="כתוב כאן את השאלה..."
                              className="h-10 rounded-lg border-slate-200 bg-slate-50 font-bold text-sm px-4 focus:bg-white transition-all"
                            />
                          </div>

                          {(q.type === 'multiple_choice' || q.type === 'multi_select') && (
                            <div className="space-y-3 pr-4 border-r-2 border-slate-50 mt-4">
                              <Label className="text-xs font-bold text-slate-500 block mb-1 uppercase">אפשרויות לבחירה:</Label>
                              {q.options.map((opt: string, optIndex: number) => (
                                <div key={optIndex} className="flex items-center gap-2">
                                  <div className="w-5 h-5 rounded bg-slate-50 border border-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-400 shrink-0">
                                    {String.fromCharCode(65 + optIndex)}
                                  </div>
                                  <Input 
                                    value={opt} 
                                    onChange={(e) => {
                                      const newOptions = [...q.options]
                                      newOptions[optIndex] = e.target.value
                                      const newQuestions = exerciseConfig.questions.map((item: any) => 
                                        item.id === q.id ? { ...item, options: newOptions } : item
                                      )
                                      onFieldChange('exercise_config', { ...exerciseConfig, questions: newQuestions })
                                    }}
                                    placeholder={`אפשרות ${optIndex + 1}`}
                                    className="h-8 rounded-lg border-slate-200 bg-slate-50 font-bold text-xs"
                                  />
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => {
                                      const newOptions = q.options.filter((_: any, i: number) => i !== optIndex)
                                      const newQuestions = exerciseConfig.questions.map((item: any) => 
                                        item.id === q.id ? { ...item, options: newOptions } : item
                                      )
                                      onFieldChange('exercise_config', { ...exerciseConfig, questions: newQuestions })
                                    }}
                                    className="w-7 h-7 text-slate-300 hover:text-rose-500 rounded-lg shrink-0"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              ))}
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                  const newQuestions = exerciseConfig.questions.map((item: any) => 
                                    item.id === q.id ? { ...item, options: [...item.options, ''] } : item
                                  )
                                  onFieldChange('exercise_config', { ...exerciseConfig, questions: newQuestions })
                                }}
                                className="rounded-lg font-bold text-primary hover:bg-primary/5 gap-1.5 h-7 text-[10px] mt-1"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                הוסף אפשרות
                              </Button>
                            </div>
                          )}

                          {q.type === 'range' && (
                            <div className="grid grid-cols-2 gap-4 pr-4 border-r-2 border-slate-50 mt-4">
                              <div className="grid gap-1.5">
                                <Label className="text-[10px] font-bold text-slate-400 mr-2 uppercase">ערך מינימלי</Label>
                                <Input 
                                  type="number" 
                                  value={q.range_min} 
                                  onChange={(e) => {
                                    const newQuestions = exerciseConfig.questions.map((item: any) => 
                                      item.id === q.id ? { ...item, range_min: parseInt(e.target.value) } : item
                                    )
                                    onFieldChange('exercise_config', { ...exerciseConfig, questions: newQuestions })
                                  }}
                                  className="rounded-lg border-slate-200 font-bold h-8 text-xs bg-slate-50"
                                />
                              </div>
                              <div className="grid gap-1.5">
                                <Label className="text-[10px] font-bold text-slate-400 mr-2 uppercase">ערך מקסימלי</Label>
                                <Input 
                                  type="number" 
                                  value={q.range_max} 
                                  onChange={(e) => {
                                    const newQuestions = exerciseConfig.questions.map((item: any) => 
                                      item.id === q.id ? { ...item, range_max: parseInt(e.target.value) } : item
                                    )
                                    onFieldChange('exercise_config', { ...exerciseConfig, questions: newQuestions })
                                  }}
                                  className="rounded-lg border-slate-200 font-bold h-8 text-xs bg-slate-50"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {exerciseConfig.questions.length === 0 && (
                      <div className="py-12 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-100">
                        <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-4">
                          <HelpCircle className="w-7 h-7 text-slate-200" />
                        </div>
                        <h4 className="text-base font-bold text-slate-900 mb-1">עוד אין שאלות בתרגיל</h4>
                        <p className="text-slate-500 font-medium text-xs max-w-xs mx-auto">השתמש בכפתורים למעלה כדי להוסיף שאלות פתוחות, אמריקאיות ועוד.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!hasExercise && (
                <div className="p-8 text-center bg-slate-50/50 rounded-xl border border-slate-100 flex flex-col items-center">
                  <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6">
                    <ClipboardList className="w-8 h-8 text-slate-100" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">התרגיל כבוי בשיעור זה</h3>
                  <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                    כאשר התרגיל כבוי, התלמידים לא יראו את טאב התרגול בשיעור. תוכל להפעיל אותו בכל עת.
                  </p>
                </div>
              )}
            </TabsContent>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={onClose} className="h-10 px-6 rounded-lg font-bold text-sm border-slate-200">סגור עורך</Button>
            </div>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}

