'use client'

import React, { useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MessageCircle, Send, Loader2, User, ShieldCheck } from 'lucide-react'
import { createLessonQuestion, answerLessonQuestion } from '@/app/actions/courses'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Simple relative time formatter for Hebrew
function formatRelativeTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'ממש עכשיו'
  if (diffInSeconds < 3600) return `לפני ${Math.floor(diffInSeconds / 60)} דקות`
  if (diffInSeconds < 86400) return `לפני ${Math.floor(diffInSeconds / 3600)} שעות`
  return `לפני ${Math.floor(diffInSeconds / 86400)} ימים`
}

interface Question {
  id: string
  content: string
  answer?: string
  created_at: string
  answered_at?: string
  profile: {
    name: string
    avatar_url?: string
  }
}

interface LessonQuestionsProps {
  lessonId: string
  courseId: string
  orgSlug: string
  initialQuestions: any[]
  currentUserId: string
  currentUserName: string
  isAdmin: boolean
}

export function LessonQuestions({
  lessonId,
  courseId,
  orgSlug,
  initialQuestions,
  currentUserId,
  currentUserName,
  isAdmin
}: LessonQuestionsProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [answeringId, setAnsweringId] = useState<string | null>(null)
  const [answerContent, setAnswerContent] = useState('')

  const handleSubmitQuestion = async () => {
    if (!content.trim()) return

    setLoading(true)
    try {
      await createLessonQuestion(lessonId, content, courseId, orgSlug)
      setContent('')
      toast.success('השאלה נשלחה בהצלחה')
      router.refresh()
    } catch (error) {
      toast.error('שגיאה בשליחת השאלה')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAnswer = async (questionId: string) => {
    if (!answerContent.trim()) return

    setLoading(true)
    try {
      await answerLessonQuestion(questionId, answerContent, lessonId, courseId, orgSlug)
      setAnsweringId(null)
      setAnswerContent('')
      toast.success('התשובה נשלחה בהצלחה')
      router.refresh()
    } catch (error) {
      toast.error('שגיאה בשליחת התשובה')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* New Question Form */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
        <Avatar className="w-10 h-10 rounded-xl border-2 border-white shadow-sm shrink-0">
          <AvatarFallback className="bg-primary text-white font-bold text-xs">
            {currentUserName.substring(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-3 text-right">
          <Textarea 
            placeholder="יש לך שאלה על השיעור? כתוב אותה כאן..." 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] rounded-xl bg-white border-slate-200 p-4 text-sm font-medium focus:ring-primary/20 transition-all resize-none shadow-inner text-right" 
          />
          <div className="flex justify-start">
            <Button 
              onClick={handleSubmitQuestion} 
              disabled={loading || !content.trim()}
              className="rounded-xl px-6 h-11 font-bold text-sm bg-primary shadow-lg shadow-primary/20 gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 rotate-180" />}
              פרסם שאלה
            </Button>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {initialQuestions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
               <MessageCircle className="w-8 h-8 text-slate-200" />
            </div>
            <h4 className="text-slate-900 font-bold text-lg">עדיין אין שאלות בשיעור זה</h4>
            <p className="text-slate-400 font-medium text-sm mt-1 max-w-xs mx-auto">תהיה הראשון לשאול ולהתחיל דיון! אנחנו כאן לכל שאלה.</p>
          </div>
        ) : (
          initialQuestions.map((q) => (
            <div key={q.id} className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
              {/* Question Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                    {formatRelativeTime(q.created_at)}
                  </span>
                  <div className="flex items-center gap-3 text-right">
                    <div className="text-right">
                      <p className="font-bold text-slate-900 text-sm">{q.profiles?.name || 'סטודנט'}</p>
                      <p className="text-[10px] text-slate-400 font-bold">סטודנט</p>
                    </div>
                    <Avatar className="w-9 h-9 rounded-lg border border-slate-100 shrink-0">
                      <AvatarFallback className="bg-slate-100 text-slate-400 font-bold text-[10px]">
                        {(q.profiles?.name || 'S').substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                
                <p className="text-slate-700 font-medium text-sm leading-relaxed text-right">{q.content}</p>

                {isAdmin && !q.answer && answeringId !== q.id && (
                  <div className="pt-2 flex justify-start">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setAnsweringId(q.id)}
                      className="rounded-lg text-xs font-bold border-slate-200 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all"
                    >
                      הוסף תשובה
                    </Button>
                  </div>
                )}
              </div>

              {/* Answer Card */}
              {q.answer ? (
                <div className="mr-8 bg-primary/[0.03] p-6 rounded-2xl border border-primary/10 space-y-4 relative">
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-primary/60">
                      {q.answered_at ? formatRelativeTime(q.answered_at) : ''}
                    </span>
                    <div className="flex items-center gap-3 text-right">
                      <div className="text-right">
                        <p className="font-bold text-primary text-sm">צוות האקדמיה</p>
                        <p className="text-[10px] text-primary/60 font-bold">מענה רשמי</p>
                      </div>
                      <Avatar className="w-9 h-9 rounded-lg border border-primary/20 shrink-0">
                        <AvatarFallback className="bg-primary text-white font-bold text-[10px]">
                          AD
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  <p className="text-slate-800 font-bold text-sm leading-relaxed text-right">{q.answer}</p>
                </div>
              ) : answeringId === q.id && (
                <div className="mr-8 bg-primary/[0.03] p-5 rounded-2xl border border-primary/20 space-y-3 animate-in slide-in-from-top-2 duration-300">
                  <Textarea 
                    placeholder="כתוב את התשובה שלך כאן..." 
                    value={answerContent}
                    onChange={(e) => setAnswerContent(e.target.value)}
                    className="min-h-[80px] rounded-xl bg-white border-primary/20 p-3 text-sm font-bold focus:ring-primary/20 transition-all resize-none text-right" 
                  />
                  <div className="flex justify-start gap-2">
                    <Button 
                      size="sm"
                      onClick={() => handleSubmitAnswer(q.id)}
                      disabled={loading || !answerContent.trim()}
                      className="rounded-lg px-4 h-9 font-bold text-xs bg-primary shadow-md shadow-primary/10"
                    >
                      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'פרסם תשובה'}
                    </Button>
                    <Button 
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setAnsweringId(null)
                        setAnswerContent('')
                      }}
                      className="rounded-lg px-4 h-9 font-bold text-xs"
                    >
                      ביטול
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

