import React from "react"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { InviteStudentSheet } from "@/components/students/invite-student-sheet"
import { StudentsTable } from "@/components/students/students-table"
import { getActiveProfile } from "@/lib/auth-utils"

export default async function StudentsPage() {
  const supabase = createClient(cookies())
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const profile = await getActiveProfile()

  const { data: students } = await supabase
    .from('profiles')
    .select('*')
    .eq('organization_id', profile?.organization_id)
    .in('role', ['student', 'support'])
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 pb-10 text-right">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">סטודנטים 👥</h1>
          <p className="text-sm text-slate-500 font-medium">נהל את הסטודנטים והרשאות הגישה בארגון שלך.</p>
        </div>
        <InviteStudentSheet />
      </div>

      <StudentsTable initialStudents={students || []} />
    </div>
  )
}
