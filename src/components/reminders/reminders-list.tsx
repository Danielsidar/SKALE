'use client'

import React from "react"
import { 
  Bell, 
  Clock, 
  BookOpen, 
  GraduationCap, 
  Trash2, 
  MoreVertical,
  Mail,
  Calendar,
  ToggleLeft,
  ToggleRight,
  ChevronLeft
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteReminder, updateReminder } from "@/actions/reminders"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface RemindersListProps {
  reminders: any[]
  courses: any[]
}

export function RemindersList({ reminders, courses }: RemindersListProps) {
  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'inactive_days': return <Clock className="w-5 h-5" />
      case 'lesson_completed': return <BookOpen className="w-5 h-5" />
      case 'course_completed': return <GraduationCap className="w-5 h-5" />
      default: return <Bell className="w-5 h-5" />
    }
  }

  const getTriggerText = (reminder: any) => {
    const config = reminder.trigger_config
    switch (reminder.trigger_type) {
      case 'inactive_days': 
        return `חוסר פעילות של ${config.days} ימים`
      case 'lesson_completed':
        const course = courses.find(c => c.id === config.course_id)
        const lesson = course?.modules?.flatMap((m: any) => m.lessons).find((l: any) => l.id === config.lesson_id)
        return `השלמת שיעור: ${lesson?.title || 'שיעור לא ידוע'}`
      case 'course_completed':
        const c = courses.find(c => c.id === config.course_id)
        return `סיום קורס: ${c?.title || 'קורס לא ידוע'}`
      default:
        return 'טריגר לא ידוע'
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק תזכורת זו?')) return
    try {
      await deleteReminder(id)
      toast.success("התזכורת נמחקה בהצלחה")
    } catch (error: any) {
      toast.error(error.message || "שגיאה במחיקת התזכורת")
    }
  }

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      await updateReminder(id, { is_enabled: enabled })
      toast.success(enabled ? "התזכורת הופעלה" : "התזכורת הופסקה")
    } catch (error: any) {
      toast.error(error.message || "שגיאה בעדכון התזכורת")
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {reminders.map((reminder) => (
        <Card key={reminder.id} className="rounded-3xl border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                  reminder.is_enabled ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-400"
                )}>
                  {getTriggerIcon(reminder.trigger_type)}
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900">{reminder.title}</h3>
                    {!reminder.is_enabled && (
                      <Badge variant="secondary" className="bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold">לא פעיל</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      {getTriggerText(reminder)}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <Mail className="w-3.5 h-3.5" />
                      {reminder.email_subject}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">{reminder.is_enabled ? 'פעיל' : 'כבוי'}</span>
                  <Switch 
                    checked={reminder.is_enabled} 
                    onCheckedChange={(checked) => handleToggle(reminder.id, checked)}
                  />
                </div>

                <DropdownMenu dir="rtl">
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 rounded-xl border-slate-100 shadow-xl">
                    <DropdownMenuItem className="gap-2 focus:bg-slate-50 cursor-pointer rounded-lg">
                      <Bell className="w-4 h-4 text-slate-500" />
                      ערוך
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="gap-2 text-rose-600 focus:bg-rose-50 focus:text-rose-600 cursor-pointer rounded-lg"
                      onClick={() => handleDelete(reminder.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                      מחק
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

