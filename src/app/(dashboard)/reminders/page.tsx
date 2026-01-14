import React from "react"
import { Bell, Plus, Mail, Clock, BookOpen, GraduationCap } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getReminders } from "@/actions/reminders"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreateReminderSheet } from "@/components/reminders/create-reminder-sheet"
import { RemindersList } from "@/components/reminders/reminders-list"

export default async function RemindersPage() {
  const reminders = await getReminders()
  
  const supabase = createClient()
  
  // Fetch courses and lessons for the creation sheet
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user?.id)
    .single()

  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, modules(id, title, lessons(id, title))')
    .eq('organization_id', profile?.organization_id)

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">תזכורות למידה</h1>
          <p className="text-slate-500 font-medium mt-1">נהל אוטומציות לשליחת תזכורות למיילים של התלמידים שלך.</p>
        </div>
        
        <CreateReminderSheet courses={courses || []} />
      </div>

      {reminders.length === 0 ? (
        <Card className="border-dashed border-2 bg-slate-50/50 rounded-[2rem]">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Bell className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">אין תזכורות עדיין</h3>
            <p className="text-slate-500 mt-2 max-w-sm">צור את האוטומציה הראשונה שלך כדי לעזור לתלמידים שלך להתקדם בקורס.</p>
            <div className="mt-8">
              <CreateReminderSheet courses={courses || []} trigger={
                <Button className="rounded-full px-8 font-bold gap-2">
                  <Plus className="w-5 h-5" />
                  צור תזכורת ראשונה
                </Button>
              } />
            </div>
          </CardContent>
        </Card>
      ) : (
        <RemindersList reminders={reminders} courses={courses || []} />
      )}
    </div>
  )
}

