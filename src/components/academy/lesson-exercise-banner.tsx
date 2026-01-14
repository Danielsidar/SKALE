'use client'

import React, { useState } from "react"
import { ClipboardList, ExternalLink, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LessonExerciseDialog } from "./lesson-exercise-dialog"
import { toggleLessonCompletion } from "@/app/actions/courses"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface LessonExerciseBannerProps {
  lesson: any
  courseId: string
  orgSlug: string
  isCompleted: boolean
}

export function LessonExerciseBanner({ 
  lesson, 
  courseId, 
  orgSlug, 
  isCompleted 
}: LessonExerciseBannerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  if (!lesson.has_exercise) return null

  const handleComplete = async (score?: number) => {
    try {
      await toggleLessonCompletion(lesson.id, courseId, orgSlug, true)
      router.refresh()
    } catch (error) {
      console.error('Error completing lesson from banner:', error)
    }
  }

  return (
    <>
      <div className={cn(
        "p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300",
        isCompleted 
          ? "bg-emerald-50/30 border-emerald-100" 
          : "bg-amber-50/50 border-amber-100 hover:bg-amber-50"
      )}>
        <div className="flex items-center gap-4 text-right w-full sm:w-auto">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
            isCompleted ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
          )}>
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-900 text-base leading-tight">מטלת תרגול והעמקה</h4>
              {isCompleted && (
                <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  הושלמה
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {isCompleted 
                ? 'כבר השלמת את המטלה הזו, אבל תמיד אפשר לחזור ולתרגל שוב.'
                : 'מומלץ לבצע את המטלה כדי לוודא שהבנת את החומר בצורה הטובה ביותר.'}
            </p>
          </div>
        </div>
        <Button 
          onClick={() => setIsOpen(true)}
          variant={isCompleted ? "outline" : "default"}
          className={cn(
            "w-full sm:w-auto rounded-xl font-bold gap-2 h-11 px-6 shadow-sm",
            !isCompleted && "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/10"
          )}
        >
          <ExternalLink className="w-4 h-4" />
          {isCompleted ? 'צפייה במטלה שוב' : 'פתח את המטלה'}
        </Button>
      </div>

      <LessonExerciseDialog 
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        lesson={lesson}
        onComplete={handleComplete}
      />
    </>
  )
}


