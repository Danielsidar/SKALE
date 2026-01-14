'use client'

import React from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { toast } from "sonner"
import { sendAcademyMessage, getOrgCourses } from "@/app/actions/messages"
import { Loader2, Send, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface SendMessageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orgSlug: string
  mode: 'all' | 'courses'
}

export function SendMessageDialog({ 
  open, 
  onOpenChange, 
  orgSlug,
  mode
}: SendMessageDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [subject, setSubject] = React.useState("")
  const [content, setContent] = React.useState("")
  const [selectedCourseIds, setSelectedCourseIds] = React.useState<string[]>([])
  const [courses, setCourses] = React.useState<{id: string, title: string}[]>([])
  const [isLoadingCourses, setIsLoadingCourses] = React.useState(false)

  React.useEffect(() => {
    if (open && mode === 'courses') {
      const fetchCourses = async () => {
        setIsLoadingCourses(true)
        try {
          const data = await getOrgCourses(orgSlug)
          setCourses(data)
        } catch (error) {
          console.error("Failed to fetch courses", error)
        } finally {
          setIsLoadingCourses(false)
        }
      }
      fetchCourses()
    } else if (open && mode === 'all') {
        setSelectedCourseIds([])
    }
  }, [open, orgSlug, mode])

  const handleSend = async () => {
    if (!subject.trim()) {
      toast.error("נא להזין נושא להודעה")
      return
    }
    if (!content.trim() || content === "<p></p>") {
      toast.error("נא להזין תוכן להודעה")
      return
    }
    if (mode === 'courses' && selectedCourseIds.length === 0) {
      toast.error("נא לבחור לפחות קורס אחד")
      return
    }

    setIsSubmitting(true)
    try {
      await sendAcademyMessage({
        courseIds: mode === 'all' ? null : selectedCourseIds,
        subject,
        content,
        orgSlug
      })
      toast.success("ההודעה נשלחה בהצלחה")
      setSubject("")
      setContent("")
      setSelectedCourseIds([])
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || "שגיאה בשליחת ההודעה")
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleCourse = (courseId: string) => {
    setSelectedCourseIds(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2rem] p-8" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle className="text-2xl font-black text-slate-900">
            {mode === 'all' ? 'שלח הודעה לכל התלמידים' : 'שלח הודעה לקורסים ספציפיים'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {mode === 'courses' && (
            <div className="space-y-3 text-right">
              <Label className="font-bold text-slate-700">בחר קורסים ({selectedCourseIds.length})</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto p-4 bg-slate-50 rounded-2xl border border-slate-100 custom-scrollbar">
                {isLoadingCourses ? (
                  <div className="col-span-2 flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                ) : courses.map(course => (
                  <button
                    key={course.id}
                    onClick={() => toggleCourse(course.id)}
                    className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border transition-all text-right",
                        selectedCourseIds.includes(course.id)
                            ? "bg-primary/10 border-primary text-primary shadow-sm"
                            : "bg-white border-slate-100 text-slate-600 hover:border-slate-200"
                    )}
                  >
                    <div className={cn(
                        "w-5 h-5 rounded flex items-center justify-center border transition-all",
                        selectedCourseIds.includes(course.id)
                            ? "bg-primary border-primary text-white"
                            : "border-slate-300 bg-white"
                    )}>
                        {selectedCourseIds.includes(course.id) && <Check className="w-3 h-3" />}
                    </div>
                    <span className="text-xs font-bold truncate">{course.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2 text-right">
            <Label htmlFor="subject" className="font-bold text-slate-700">נושא ההודעה</Label>
            <Input 
              id="subject"
              placeholder="לדוגמה: עדכון חשוב לגבי הקורס..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="rounded-xl border-slate-200 h-11"
            />
          </div>

          <div className="space-y-2 text-right">
            <Label className="font-bold text-slate-700">תוכן ההודעה</Label>
            <div className="min-h-[300px]">
              <RichTextEditor 
                content={content}
                onChange={setContent}
                placeholder="כתבו את ההודעה כאן..."
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3 sm:gap-0 mt-6">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="rounded-xl font-bold"
          >
            ביטול
          </Button>
          <Button 
            onClick={handleSend}
            disabled={isSubmitting}
            className="rounded-xl font-black px-8 gap-2 bg-primary shadow-lg shadow-primary/20"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            שלח הודעה
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
