'use client'

import React, { useTransition, useState } from "react"
import { CheckCircle2, Loader2, Circle, ArrowLeft, ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toggleLessonCompletion } from "@/app/actions/courses"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { LessonExerciseDialog } from "./lesson-exercise-dialog"

interface LessonCompletionButtonProps {
  lessonId: string
  courseId: string
  orgSlug: string
  initialIsCompleted: boolean
  nextLessonUrl?: string | null
  lesson: any
}

export const LessonCompletionButton = ({
  lessonId,
  courseId,
  orgSlug,
  initialIsCompleted,
  nextLessonUrl,
  lesson
}: LessonCompletionButtonProps) => {
  const [isPending, startTransition] = useTransition()
  const [isCompleted, setIsCompleted] = React.useState(initialIsCompleted)
  const [isExerciseOpen, setIsExerciseOpen] = useState(false)
  const [hasFailedQuiz, setHasFailedQuiz] = useState(false)
  const router = useRouter()

  const hasExercise = lesson.has_exercise && (lesson.exercise_config?.questions?.length > 0 || lesson.exercise_content)

  const handleComplete = async (score?: number) => {
    if (lesson.has_exercise && lesson.exercise_config?.is_quiz && score !== undefined) {
      const passingGrade = lesson.exercise_config.passing_grade || 60
      if (score < passingGrade) {
        setHasFailedQuiz(true)
        return
      }
    }

    setHasFailedQuiz(false)
    const nextState = true
    
    // Optimistic update
    setIsCompleted(nextState)
    
    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        try {
          await toggleLessonCompletion(lessonId, courseId, orgSlug, nextState)
          
          if (!lesson.has_exercise || !lesson.exercise_config?.is_quiz) {
            toast.success("כל הכבוד! השיעור הושלם")
          }
          
          if (nextLessonUrl && !isExerciseOpen) {
            setTimeout(() => {
              router.push(nextLessonUrl)
            }, 800)
          }
          resolve()
        } catch (error) {
          setIsCompleted(false)
          toast.error("שגיאה בעדכון מצב השיעור")
          reject(error)
        }
      })
    })
  }

  const handleClick = () => {
    if (isCompleted) {
      if (nextLessonUrl) {
        router.push(nextLessonUrl)
      } else {
        toast.info("זהו השיעור האחרון בקורס!")
      }
      return
    }

    if (hasExercise) {
      setIsExerciseOpen(true)
      return
    }

    handleComplete()
  }

  return (
    <>
      <Button 
        onClick={handleClick}
        disabled={isPending}
        className={cn(
          "gap-2.5 rounded-xl h-14 px-8 font-bold text-lg shadow-xl transition-all group",
          isCompleted 
            ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20" 
            : "bg-slate-900 text-white hover:bg-black shadow-slate-900/20",
          isPending && "opacity-80 scale-95"
        )}
      >
        {isPending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isCompleted ? (
          <CheckCircle2 className="w-5 h-5 text-white" />
        ) : hasExercise ? (
          <ClipboardList className="w-5 h-5 text-primary" />
        ) : (
          <Circle className="w-5 h-5 text-slate-400" />
        )}
        
        {isCompleted ? (
          nextLessonUrl ? "לשיעור הבא" : "שיעור הושלם"
        ) : hasExercise ? (
          hasFailedQuiz ? "נסה שוב את המטלה" : "למטלת השיעור"
        ) : (
          "סיימתי את השיעור"
        )}

        {nextLessonUrl && (
          <ArrowLeft className="w-4 h-4 mr-1 opacity-50 group-hover:translate-x-[-2px] transition-transform" />
        )}
      </Button>

      <LessonExerciseDialog 
        isOpen={isExerciseOpen}
        onOpenChange={setIsExerciseOpen}
        lesson={lesson}
        onComplete={handleComplete}
      />
    </>
  )
}

