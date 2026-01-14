'use client'

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
  Plus, 
  Loader2, 
  Info, 
  Calendar, 
  BookOpen, 
  GraduationCap, 
  Clock, 
  UserPlus,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Settings,
  Zap,
  Mail,
  Eye
} from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { createReminder } from "@/actions/reminders"
import { VariableInput } from "./variable-input"
import { cn } from "@/lib/utils"

const reminderSchema = z.object({
  title: z.string().min(2, "כותרת חייבת להכיל לפחות 2 תווים"),
  trigger_type: z.enum(["inactive_days", "lesson_completed", "course_completed", "new_user", "course_enrolled"]),
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

const steps = [
  { id: 1, title: "הגדרות כלליות", icon: Settings },
  { id: 2, title: "בחירת טריגר", icon: Zap },
  { id: 3, title: "עיצוב ההודעה", icon: Mail },
  { id: 4, title: "סיכום והפעלה", icon: Eye },
]

export function CreateReminderSheet({ courses, trigger }: CreateReminderSheetProps) {
  const [open, setOpen] = React.useState(false)
  const [currentStep, setCurrentStep] = React.useState(1)
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
  const title = form.watch("title")
  const emailSubject = form.watch("email_subject")
  const emailContent = form.watch("email_content")

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
      toast.success("האוטומציה נוצרה והופעלה בהצלחה!")
      setOpen(false)
      form.reset()
      setCurrentStep(1)
    } catch (error: any) {
      toast.error(error.message || "שגיאה ביצירת התזכורת")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext = async () => {
    let fieldsToValidate: any[] = []
    if (currentStep === 1) fieldsToValidate = ['title']
    if (currentStep === 3) fieldsToValidate = ['email_subject', 'email_content']

    const isValid = fieldsToValidate.length > 0 
      ? await form.trigger(fieldsToValidate as any)
      : true

    if (isValid) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => prev - 1)
  }

  const getTriggerLabel = (type: string) => {
    switch (type) {
      case 'new_user': return 'הצטרפות משתמש חדש'
      case 'course_enrolled': return 'פתיחת קורס למשתמש'
      case 'inactive_days': return 'חוסר פעילות של X ימים'
      case 'lesson_completed': return 'השלמת שיעור'
      case 'course_completed': return 'סיום קורס'
      default: return type
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => {
      setOpen(v)
      if (!v) {
        setCurrentStep(1)
        form.reset()
      }
    }}>
      <SheetTrigger asChild>
        {trigger || (
          <Button className="rounded-full font-bold gap-2 text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" />
            אוטומציה חדשה
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-2xl overflow-y-auto p-0" dir="rtl">
        <div className="flex flex-col h-full">
          {/* Wizard Header */}
          <div className="p-8 pb-4 border-b border-slate-100 bg-slate-50/50">
            <SheetHeader className="text-right space-y-1 mb-8">
              <SheetTitle className="text-2xl font-black">יצירת אוטומציה חכמה</SheetTitle>
              <SheetDescription className="text-slate-500 font-medium text-base">
                עקוב אחר השלבים להגדרת התזכורת המושלמת.
              </SheetDescription>
            </SheetHeader>

            {/* Step Indicators */}
            <div className="flex items-center justify-between px-2 relative">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
              {steps.map((step) => {
                const isCompleted = currentStep > step.id
                const isActive = currentStep === step.id
                const Icon = step.icon

                return (
                  <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                      isCompleted ? "bg-primary border-primary text-white" : 
                      isActive ? "bg-white border-primary text-primary shadow-lg shadow-primary/20" : 
                      "bg-white border-slate-200 text-slate-400"
                    )}>
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold whitespace-nowrap",
                      isActive ? "text-primary" : "text-slate-400"
                    )}>
                      {step.title}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col">
              <div className="flex-1 p-8">
                {/* Step 1: Settings */}
                {currentStep === 1 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-4">
                      <h3 className="text-lg font-black text-slate-900">בוא נתחיל בשם לאוטומציה</h3>
                      <p className="text-slate-500 text-sm">השם הזה מיועד רק עבורך, כדי שתוכל לזהות את האוטומציה ברשימה.</p>
                    </div>
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <FormLabel className="font-bold text-slate-700">שם האוטומציה</FormLabel>
                          <FormControl>
                            <Input placeholder="לדוגמה: תזכורת חוסר פעילות 3 ימים" {...field} className="rounded-2xl h-14 bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-lg font-medium" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 2: Trigger */}
                {currentStep === 2 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-4">
                      <h3 className="text-lg font-black text-slate-900">מתי לשלוח את המייל?</h3>
                      <p className="text-slate-500 text-sm">בחר את האירוע שיפעיל את שליחת המייל לתלמיד.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name="trigger_type"
                        render={({ field }) => (
                          <FormItem className="text-right">
                            <FormLabel className="font-bold text-slate-700">בחר אירוע (טריגר)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="rounded-2xl h-14 flex-row-reverse bg-slate-50 border-slate-200 text-lg font-medium">
                                  <SelectValue placeholder="בחר טריגר" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent dir="rtl" className="rounded-2xl">
                                <SelectItem value="new_user">הצטרפות משתמש חדש לאקדמיה</SelectItem>
                                <SelectItem value="course_enrolled">פתיחת קורס ספציפי למשתמש</SelectItem>
                                <SelectItem value="inactive_days">חוסר פעילות במערכת (ימים)</SelectItem>
                                <SelectItem value="lesson_completed">השלמת שיעור ספציפי</SelectItem>
                                <SelectItem value="course_completed">סיום קורס ספציפי</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {triggerType === "inactive_days" && (
                        <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-200 animate-in zoom-in-95 duration-200">
                          <FormField
                            control={form.control}
                            name="trigger_config.days"
                            render={({ field }) => (
                              <FormItem className="text-right">
                                <FormLabel className="font-bold text-slate-700">אחרי כמה ימי חוסר פעילות?</FormLabel>
                                <FormControl>
                                  <div className="flex items-center gap-3">
                                    <Input type="number" {...field} className="rounded-xl h-12 bg-white border-slate-200 w-24 text-center text-xl font-bold" />
                                    <span className="font-bold text-slate-600">ימים</span>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}

                      {(triggerType === "lesson_completed" || triggerType === "course_completed" || triggerType === "course_enrolled") && (
                        <div className="space-y-6 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-200 animate-in zoom-in-95 duration-200">
                          <FormField
                            control={form.control}
                            name="trigger_config.course_id"
                            render={({ field }) => (
                              <FormItem className="text-right">
                                <FormLabel className="font-bold text-slate-700">באיזה קורס מדובר?</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="rounded-xl h-12 flex-row-reverse bg-white border-slate-200 font-medium">
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
                                  <FormLabel className="font-bold text-slate-700">אחרי סיום איזה שיעור?</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedCourseId}>
                                    <FormControl>
                                      <SelectTrigger className="rounded-xl h-12 flex-row-reverse bg-white border-slate-200 font-medium">
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
                    </div>
                  </div>
                )}

                {/* Step 3: Message */}
                {currentStep === 3 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-4">
                      <h3 className="text-lg font-black text-slate-900">מה נכתוב במייל?</h3>
                      <p className="text-slate-500 text-sm">עצב את המייל שהתלמיד יקבל. הקלד <span className="font-bold text-primary">@</span> כדי להוסיף משתנים דינמיים.</p>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="email_subject"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <FormLabel className="font-bold text-slate-700">נושא המייל</FormLabel>
                          <FormControl>
                            <VariableInput 
                              placeholder="לדוגמה: היי {{name}}, מחכה לך שיעור חדש!" 
                              value={field.value}
                              onChangeValue={field.onChange}
                              className="rounded-2xl h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all font-medium" 
                            />
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
                )}

                {/* Step 4: Summary */}
                {currentStep === 4 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="text-center space-y-2">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900">הכל מוכן להפעלה!</h3>
                      <p className="text-slate-500">עבור על הסיכום ולחץ על "הפעל אוטומציה" לסיום.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-200 space-y-4">
                        <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                          <span className="text-slate-400 font-bold text-sm">שם האוטומציה:</span>
                          <span className="font-black text-slate-900">{title}</span>
                        </div>
                        <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                          <span className="text-slate-400 font-bold text-sm">טריגר:</span>
                          <div className="text-left">
                            <Badge className="bg-primary/10 text-primary border-none rounded-full px-4 font-bold">
                              {getTriggerLabel(triggerType)}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex justify-between items-start">
                          <span className="text-slate-400 font-bold text-sm">נושא המייל:</span>
                          <span className="font-bold text-slate-700">{emailSubject}</span>
                        </div>
                      </div>

                      <div className="p-6 bg-white rounded-[2rem] border border-slate-200 space-y-2">
                        <span className="text-slate-400 font-bold text-sm block mb-3">תצוגה מקדימה של התוכן:</span>
                        <div 
                          className="prose prose-sm max-w-none text-slate-600 line-clamp-6"
                          dangerouslySetInnerHTML={{ __html: emailContent }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Wizard Footer Navigation */}
              <div className="p-8 border-t border-slate-100 bg-white sticky bottom-0">
                <div className="flex gap-4 justify-between items-center">
                  {currentStep > 1 ? (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="rounded-full px-8 font-bold h-12 text-slate-500 hover:bg-slate-100" 
                      onClick={handleBack}
                    >
                      <ChevronRight className="w-4 h-4 ml-2" />
                      חזרה
                    </Button>
                  ) : (
                    <div />
                  )}

                  {currentStep < 4 ? (
                    <Button 
                      type="button" 
                      className="rounded-full px-10 font-bold h-12 text-white bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-200" 
                      onClick={handleNext}
                    >
                      המשך לשלב הבא
                      <ChevronLeft className="w-4 h-4 mr-2" />
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      className="rounded-full px-12 font-bold h-14 text-white bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 text-lg" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                          מפעיל...
                        </>
                      ) : (
                        "הפעל אוטומציה עכשיו!"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
