'use client'

import React, { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { 
  ClipboardList, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  Trophy, 
  Loader2,
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface LessonExerciseDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  lesson: any
  onComplete: (score?: number) => Promise<void>
}

export function LessonExerciseDialog({ 
  isOpen, 
  onOpenChange, 
  lesson, 
  onComplete 
}: LessonExerciseDialogProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showQuestions, setShowQuestions] = useState(true)
  const [result, setResult] = useState<{ score: number, passed: boolean } | null>(null)

  const exerciseConfig = lesson.exercise_config || { questions: [], is_quiz: false, passing_grade: 60 }
  const questions = exerciseConfig.questions || []
  const isQuiz = exerciseConfig.is_quiz
  const passingGrade = exerciseConfig.passing_grade || 60

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const calculateResults = () => {
    let totalPoints = 0
    let earnedPoints = 0

    questions.forEach((q: any) => {
      totalPoints += q.points || 0
      const userAnswer = answers[q.id]
      
      if (q.type === 'multiple_choice') {
        if (userAnswer === q.correct_answer) {
          earnedPoints += q.points || 0
        }
      } else if (q.type === 'multi_select') {
        const correctAnswers = q.correct_answer ? (Array.isArray(q.correct_answer) ? q.correct_answer : [q.correct_answer]) : []
        const userAnswers = Array.isArray(userAnswer) ? userAnswer : []
        
        const isCorrect = correctAnswers.length === userAnswers.length && 
                         correctAnswers.every((a: any) => userAnswers.includes(a))
        
        if (isCorrect) {
          earnedPoints += q.points || 0
        }
      } else if (q.type === 'range') {
        if (Number(userAnswer) === Number(q.correct_answer)) {
          earnedPoints += q.points || 0
        }
      }
      // For 'open' questions, we don't auto-grade currently, or we can assume points if any text provided?
      // User said "if it's not a quiz just mark as complete". 
      // If it IS a quiz, open questions might need manual review, but for now we'll only grade auto-gradeable ones.
    })

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 100
    return { score, passed: score >= passingGrade }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      if (isQuiz) {
        const { score, passed } = calculateResults()
        setResult({ score, passed })
        setShowQuestions(false)
        
        if (passed) {
          await onComplete(score)
          toast.success(`כל הכבוד! עברת את המטלה בציון ${score}`)
        } else {
          toast.error(`הציון שלך הוא ${score}. צריך לפחות ${passingGrade} כדי לעבור.`)
        }
      } else {
        // Not a quiz, just mark as complete
        await onComplete()
        toast.success("המטלה הושלמה בהצלחה!")
        onOpenChange(false)
      }
    } catch (error) {
      toast.error("שגיאה בשמירת התוצאות")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetExercise = () => {
    setAnswers({})
    setShowQuestions(true)
    setResult(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] p-0 overflow-hidden flex flex-col gap-0 rounded-2xl border-none shadow-2xl text-right" dir="rtl">
        <DialogHeader className="p-6 border-b bg-white shrink-0 text-right">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-primary" />
              </div>
              <div className="text-right">
                <DialogTitle className="text-xl font-bold">מטלת שיעור: {lesson.title}</DialogTitle>
                <DialogDescription className="text-sm font-medium">
                  {isQuiz ? `בוחן הערכה - ציון עובר: ${passingGrade}%` : 'תרגול והעמקה בחומר הנלמד'}
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden relative bg-slate-50/30">
          <ScrollArea className="h-full px-6 py-8" dir="rtl">
            <div className="max-w-2xl mx-auto space-y-8">
              {showQuestions ? (
                <>
                  {/* Exercise Content/Instructions */}
                  {lesson.exercise_content && (
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm prose prose-slate prose-sm max-w-none text-right">
                      <h4 className="text-lg font-bold mb-4 text-slate-900">הוראות למטלה:</h4>
                      <div dangerouslySetInnerHTML={{ __html: lesson.exercise_content }} />
                    </div>
                  )}

                  {/* Questions */}
                  <div className="space-y-6">
                    {questions.map((q: any, index: number) => (
                      <div key={q.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-right">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                              {index + 1}
                            </span>
                            <h5 className="font-bold text-slate-900 text-right">{q.text}</h5>
                          </div>
                          {isQuiz && <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded shrink-0">{q.points} נק'</span>}
                        </div>

                        {q.type === 'open' && (
                          <Textarea 
                            placeholder="כתוב את תשובתך כאן..."
                            value={answers[q.id] || ''}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            className="min-h-[120px] rounded-xl border-slate-200 focus:ring-primary/20 text-right font-medium"
                          />
                        )}

                        {q.type === 'multiple_choice' && (
                          <RadioGroup 
                            value={answers[q.id]} 
                            onValueChange={(val) => handleAnswerChange(q.id, val)}
                            className="space-y-2"
                            dir="rtl"
                          >
                            {q.options?.map((opt: string, i: number) => (
                              <div key={i} className={cn(
                                "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer hover:bg-slate-50",
                                answers[q.id] === opt ? "border-primary bg-primary/[0.02]" : "border-slate-100"
                              )}>
                                <RadioGroupItem value={opt} id={`${q.id}-${i}`} className="shrink-0" />
                                <Label className="flex-1 cursor-pointer font-medium text-right" htmlFor={`${q.id}-${i}`}>{opt}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        )}

                        {q.type === 'multi_select' && (
                          <div className="space-y-2">
                            {q.options?.map((opt: string, i: number) => {
                              const currentAnswers = answers[q.id] || []
                              const isChecked = currentAnswers.includes(opt)
                              
                              return (
                                <div key={i} className={cn(
                                  "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer hover:bg-slate-50",
                                  isChecked ? "border-primary bg-primary/[0.02]" : "border-slate-100"
                                )}>
                                  <Checkbox 
                                    id={`${q.id}-${i}`}
                                    checked={isChecked}
                                    onCheckedChange={(checked) => {
                                      const newAnswers = checked 
                                        ? [...currentAnswers, opt]
                                        : currentAnswers.filter((a: string) => a !== opt)
                                      handleAnswerChange(q.id, newAnswers)
                                    }}
                                    className="shrink-0"
                                  />
                                  <Label className="flex-1 cursor-pointer font-medium text-right" htmlFor={`${q.id}-${i}`}>{opt}</Label>
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {q.type === 'range' && (
                          <Input 
                            type="number"
                            placeholder="הזן מספר..."
                            value={answers[q.id] || ''}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            className="rounded-xl border-slate-200 text-right font-bold"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                /* Results View */
                <div className="flex flex-col items-center justify-center text-center space-y-6 py-12 animate-in zoom-in-95 duration-500">
                  <div className={cn(
                    "w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl transition-transform duration-700 scale-110",
                    result?.passed ? "bg-emerald-500 text-white rotate-12" : "bg-rose-500 text-white -rotate-12"
                  )}>
                    {result?.passed ? <Trophy className="w-12 h-12" /> : <AlertCircle className="w-12 h-12" />}
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black text-slate-900">
                      {result?.passed ? 'כל הכבוד! עברת' : 'לא נורא, נסה שוב'}
                    </h3>
                    <p className="text-slate-500 font-bold text-lg">
                      הציון שלך במטלה: <span className={cn(
                        "text-2xl font-black",
                        result?.passed ? "text-emerald-600" : "text-rose-600"
                      )}>{result?.score}%</span>
                    </p>
                  </div>

                  <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm w-full max-w-sm">
                    <p className="text-sm font-medium text-slate-600 leading-relaxed">
                      {result?.passed 
                        ? 'השלמת את המטלה בהצלחה ועברת את ציון הסף. תוכל להמשיך לשיעור הבא בקורס.' 
                        : `כדי לעבור את המטלה עליך לקבל ציון של לפחות ${passingGrade}%. אל תתייאש, חזור על החומר ונסה שוב!`}
                    </p>
                  </div>

                  {!result?.passed && (
                    <Button 
                      onClick={resetExercise}
                      className="rounded-xl h-12 px-8 font-bold bg-slate-900 text-white gap-2"
                    >
                      נסה את המטלה שוב
                    </Button>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="p-6 border-t bg-white shrink-0 sm:justify-start">
          {showQuestions ? (
            <div className="flex gap-3 w-full sm:w-auto">
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || questions.length === 0}
                className="flex-1 sm:flex-none rounded-xl h-12 px-10 font-bold bg-primary text-white shadow-lg shadow-primary/20 gap-2"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                הגש מטלה
              </Button>
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="flex-1 sm:flex-none rounded-xl h-12 px-10 font-bold border-slate-200"
              >
                ביטול
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto rounded-xl h-12 px-10 font-bold bg-slate-900 text-white"
            >
              {result?.passed ? 'סגור והמשך' : 'סגור'}
            </Button>
          )}
        </DialogFooter>


      </DialogContent>
    </Dialog>
  )
}

