'use client'

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, Loader2, Info, Calendar, BookOpen, GraduationCap, Clock, UserPlus } from "lucide-react"
import { toast } from "sonner"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { createReminder } from "@/actions/reminders"
import { cn } from "@/lib/utils"

const reminderSchema = z.object({
  title: z.string().min(2, "כותרת חייבת להכיל לפחות 2 תווים"),
  trigger_type: z.enum(["inactive_days", "lesson_completed", "course_completed", "new_user"]),
  trigger_config: z.object({
    days: z.string().optional(),
    course_id: z.string().optional(),
    lesson_id: z.string().optional(),
  }),
  email_subject: z.string().min(2, "נושא המייל חייב להכיל לפחות 2 תווים"),
  email_content: z.string().min(10, "תוכן המייל חייב להכיל לפחות 10 תווים"),
})

interface CreateReminderSheetProps {
  courses: any[]
  trigger?: React.ReactNode
}

const VARIABLE_OPTIONS = [
  { key: "{{name}}", label: "שם המשתמש" },
  { key: "{{org_name}}", label: "שם האקדמיה" },
  { key: "{{course_name}}", label: "שם הקורס (בטריגר קורס/שיעור)" },
  { key: "{{lesson_name}}", label: "שם השיעור (בטריגר שיעור)" },
  { key: "{{login_url}}", label: "קישור לכניסה לאקדמיה" },
]

export function CreateReminderSheet({ courses, trigger }: CreateReminderSheetProps) {
  const [open, setOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<z.infer<typeof reminderSchema>>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      title: "",
      trigger_type: "inactive_days",
      trigger_config: {
        days: "3",
      },
      email_subject: "",
      email_content: "",
    },
  })

  const triggerType = form.watch("trigger_type")
  const selectedCourseId = form.watch("trigger_config.course_id")

  // Filter lessons for the selected course
  const selectedCourse = courses.find(c => c.id === selectedCourseId)
  const lessons = selectedCourse?.modules?.flatMap((m: any) => m.lessons) || []

  async function onSubmit(values: z.infer<typeof reminderSchema>) {
    try {
      setIsSubmitting(true)
      await createReminder({
        ...values,
        trigger_config: {
          ...values.trigger_config,
          days: values.trigger_config.days ? parseInt(values.trigger_config.days) : undefined,
        }
      })
      toast.success("התזכורת נוצרה בהצלחה")
      setOpen(false)
      form.reset()
    } catch (error: any) {
      toast.error(error.message || "שגיאה ביצירת התזכורת")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button className="rounded-full font-bold gap-2 text-white bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4" />
            תזכורת חדשה
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-2xl overflow-y-auto" dir="rtl">
        <SheetHeader className="text-right space-y-4 mb-8">
          <SheetTitle className="text-2xl font-black">צור תזכורת למידה חדשה</SheetTitle>
          <SheetDescription className="text-slate-500 font-medium">
            הגדר מתי לשלוח את המייל ומה יהיה התוכן שלו.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="text-right">
                    <FormLabel className="font-bold text-slate-700">שם האוטומציה</FormLabel>
                    <FormControl>
                      <Input placeholder="לדוגמה: תזכורת חוסר פעילות 3 ימים" {...field} className="rounded-2xl h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="trigger_type"
                  render={({ field }) => (
                    <FormItem className="text-right">
                      <FormLabel className="font-bold text-slate-700">סוג טריגר</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-2xl h-12 flex-row-reverse bg-slate-50 border-slate-200">
                            <SelectValue placeholder="בחר טריגר" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent dir="rtl" className="rounded-2xl">
                          <SelectItem value="new_user">הצטרפות משתמש חדש</SelectItem>
                          <SelectItem value="inactive_days">לא נכנס למערכת X ימים</SelectItem>
                          <SelectItem value="lesson_completed">השלים שיעור ספציפי</SelectItem>
                          <SelectItem value="course_completed">סיים קורס ספציפי</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {triggerType === "inactive_days" && (
                  <FormField
                    control={form.control}
                    name="trigger_config.days"
                    render={({ field }) => (
                      <FormItem className="text-right">
                        <FormLabel className="font-bold text-slate-700">מספר ימי חוסר פעילות</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className="rounded-2xl h-12 bg-slate-50 border-slate-200" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {(triggerType === "lesson_completed" || triggerType === "course_completed") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <FormField
                    control={form.control}
                    name="trigger_config.course_id"
                    render={({ field }) => (
                      <FormItem className="text-right">
                        <FormLabel className="font-bold text-slate-700">בחר קורס</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl h-12 flex-row-reverse bg-white border-slate-200">
                              <SelectValue placeholder="בחר קורס" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent dir="rtl" className="rounded-xl">
                            {courses.map(course => (
                              <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {triggerType === "lesson_completed" && (
                    <FormField
                      control={form.control}
                      name="trigger_config.lesson_id"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <FormLabel className="font-bold text-slate-700">בחר שיעור</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedCourseId}>
                            <FormControl>
                              <SelectTrigger className="rounded-xl h-12 flex-row-reverse bg-white border-slate-200">
                                <SelectValue placeholder="בחר שיעור" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent dir="rtl" className="rounded-xl">
                              {lessons.map((lesson: any) => (
                                <SelectItem key={lesson.id} value={lesson.id}>{lesson.title}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )}

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-xl text-slate-900">תוכן המייל</h3>
                </div>

                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 mb-6">
                  <p className="text-xs font-bold text-primary mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    משתנים דינמיים שניתן להוסיף בטקסט:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {VARIABLE_OPTIONS.map((v) => (
                      <div key={v.key} className="flex items-center gap-2 text-[11px] bg-white p-2 rounded-lg border border-slate-100">
                        <code className="text-primary font-bold">{v.key}</code>
                        <span className="text-slate-500">{v.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="email_subject"
                  render={({ field }) => (
                    <FormItem className="text-right">
                      <FormLabel className="font-bold text-slate-700">נושא המייל</FormLabel>
                      <FormControl>
                        <Input placeholder="לדוגמה: היי {{name}}, ברוך הבא לאקדמיית {{org_name}}!" {...field} className="rounded-2xl h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email_content"
                  render={({ field }) => (
                    <FormItem className="text-right">
                      <FormLabel className="font-bold text-slate-700">תוכן המייל</FormLabel>
                      <FormControl>
                        <RichTextEditor 
                          content={field.value} 
                          onChange={field.onChange} 
                          placeholder="כתוב את תוכן המייל כאן..." 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex gap-4 justify-start pt-6">
              <Button type="submit" className="rounded-full px-10 font-bold h-12 text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    שומר...
                  </>
                ) : (
                  "צור אוטומציה"
                )}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                className="rounded-full px-10 font-bold h-12 text-slate-500 hover:bg-slate-100" 
                onClick={() => setOpen(false)}
              >
                ביטול
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
