'use client'

import React, { useState } from 'react'
import { MoreVertical, Edit, Eye, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { deleteCourse } from '@/app/actions/courses'
import { toast } from 'sonner'

interface CourseActionsProps {
  courseId: string
}

export function CourseActions({ courseId }: CourseActionsProps) {
  const [loading, setLoading] = useState(false)

  async function onDelete() {
    if (!confirm('האם אתה בטוח שברצונך למחוק את הקורס? פעולה זו אינה ניתנת לביטול.')) {
      return
    }

    setLoading(true)
    try {
      await deleteCourse(courseId)
      toast.success('הקורס נמחק בהצלחה')
    } catch (error) {
      toast.error('שגיאה במחיקת הקורס')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-lg hover:bg-slate-100" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : <MoreVertical className="w-4 h-4 text-slate-400" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="rounded-xl p-1.5 w-48 shadow-xl border-slate-100">
        <DropdownMenuItem className="rounded-lg py-2 gap-3 focus:text-primary cursor-pointer font-medium">
          <Edit className="w-4 h-4" /> עריכה
        </DropdownMenuItem>
        <DropdownMenuItem className="rounded-lg py-2 gap-3 cursor-pointer font-medium">
          <Eye className="w-4 h-4" /> תצוגת תלמיד
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuItem 
          className="rounded-lg py-2 gap-3 text-rose-600 focus:text-rose-600 focus:bg-rose-50 cursor-pointer font-medium"
          onClick={onDelete}
        >
          <Trash2 className="w-4 h-4" /> מחיקה
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


