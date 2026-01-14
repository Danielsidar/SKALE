'use client'

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, Loader2, Info, Calendar, BookOpen, GraduationCap, Clock } from "lucide-react"
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
  trigger_type: z.enum(["inactive_days", "lesson_completed", "course_completed"]),
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
          <Button className="rounded-full font-bold gap-2">
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
                    <FormLabel className="font-bold">שם האוטומציה</FormLabel>
                    <FormControl>
                      <Input placeholder="לדוגמה: תזכורת חוסר פעילות 3 ימים" {...field} className="rounded-xl h-12" />
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
                      <FormLabel className="font-bold">סוג טריגר</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl h-12 flex-row-reverse">
                            <SelectValue placeholder="בחר טריגר" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent dir="rtl">
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
                        <FormLabel className="font-bold">מספר ימי חוסר פעילות</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className="rounded-xl h-12" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {(triggerType === "lesson_completed" || triggerType === "course_completed") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="trigger_config.course_id"
                    render={({ field }) => (
                      <FormItem className="text-right">
                        <FormLabel className="font-bold">בחר קורס</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl h-12 flex-row-reverse">
                              <SelectValue placeholder="בחר קורס" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent dir="rtl">
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
                          <FormLabel className="font-bold">בחר שיעור</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedCourseId}>
                            <FormControl>
                              <SelectTrigger className="rounded-xl h-12 flex-row-reverse">
                                <SelectValue placeholder="בחר שיעור" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent dir="rtl">
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

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-3 items-start">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-bold text-slate-900">טיפ למיילים</p>
                  <p className="text-slate-500">השתמש בשפה אישית ומעודדת כדי להניע את התלמידים שלך לפעולה.</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="font-black text-lg">תוכן המייל</h3>
                
                <FormField
                  control={form.control}
                  name="email_subject"
                  render={({ field }) => (
                    <FormItem className="text-right">
                      <FormLabel className="font-bold">נושא המייל</FormLabel>
                      <FormControl>
                        <Input placeholder="לדוגמה: היי, התגעגענו אליך!" {...field} className="rounded-xl h-12" />
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
                      <FormLabel className="font-bold">תוכן המייל</FormLabel>
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

            <div className="flex gap-3 justify-start pt-6">
              <Button type="submit" className="rounded-full px-8 font-bold h-12" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    יוצר...
                  </>
                ) : (
                  "צור תזכורת"
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="rounded-full px-8 font-bold h-12" 
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

