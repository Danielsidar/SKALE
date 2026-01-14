"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Github, Loader2, Mail, Lock, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { getRedirectUrl, checkEmailStatus, completeRegistration } from "@/app/actions/auth"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'email' | 'password'>('email')
  const [email, setEmail] = useState('')
  const [userStatus, setUserStatus] = useState<{ exists: boolean, needsPasswordSetup: boolean, name?: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleNextStep = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const emailInput = formData.get("email") as string
    setEmail(emailInput)

    try {
      const status = await checkEmailStatus(emailInput)
      
      if (!status.exists) {
        toast.error("אימייל זה אינו רשום במערכת. פנה למנהל להזמנה או הירשם.")
        setIsLoading(false)
        return
      }

      setUserStatus(status)
      setStep('password')
    } catch (error: any) {
      toast.error("שגיאה בבדיקת המייל: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const password = formData.get("password") as string

    try {
      // If user needs password setup, do it now
      if (userStatus?.needsPasswordSetup) {
        await completeRegistration(email, password)
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error("שגיאה בהתחברות: " + error.message)
        setIsLoading(false)
        return
      }

      toast.success(userStatus?.needsPasswordSetup ? "הסיסמה הוגדרה בהצלחה! מתחברים..." : "ברוכים הבאים! מתחברים...")
      
      const redirectUrl = await getRedirectUrl()
      
      if (redirectUrl) {
        router.push(redirectUrl)
        router.refresh()
      } else {
        router.push('/overview')
      }
    } catch (error: any) {
      toast.error("שגיאה בלתי צפויה: " + error.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {step === 'email' ? 'התחברות למערכת 👋' : `שלום ${userStatus?.name?.split(' ')[0] || 'שוב'}!`}
        </h1>
        <p className="text-base text-slate-500 font-medium leading-relaxed">
          {step === 'email' 
            ? 'שמחים לראות אותך שוב! הכנס פרטים כדי להמשיך.' 
            : userStatus?.needsPasswordSetup 
              ? 'נראה שזו הכניסה הראשונה שלך! בחר סיסמה חדשה כדי להשלים את ההרשמה.' 
              : 'הזינו את הסיסמה שלכם כדי להתחבר.'}
        </p>
      </div>

      {step === 'email' ? (
        <form onSubmit={handleNextStep} className="space-y-5">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-bold text-slate-700 mr-1">אימייל</Label>
              <div className="relative group">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input 
                  id="email"
                  name="email"
                  type="email" 
                  placeholder="name@company.com" 
                  required
                  className="h-12 pr-10 rounded-xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-primary/20 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/10 bg-primary border-none transition-all active:scale-95"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "המשך"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleLogin} className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-300">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <Label htmlFor="password" className="text-sm font-bold text-slate-700">
                  {userStatus?.needsPasswordSetup ? 'סיסמה חדשה' : 'סיסמה'}
                </Label>
                {!userStatus?.needsPasswordSetup && (
                  <Link href="#" className="text-sm font-bold text-primary hover:underline">שכחת סיסמה?</Link>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input 
                  id="password"
                  name="password"
                  type="password" 
                  placeholder="••••••••" 
                  required
                  autoFocus
                  className="h-12 pr-10 rounded-xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-primary/20 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/10 bg-primary border-none transition-all active:scale-95"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : userStatus?.needsPasswordSetup ? "השלמת הרשמה וכניסה" : "התחברות למערכת"}
            </Button>
            
            <Button 
              type="button" 
              variant="ghost"
              onClick={() => setStep('email')}
              className="w-full h-12 rounded-xl text-sm font-bold text-slate-400 hover:text-slate-600"
            >
              חזרה למייל
            </Button>
          </div>
        </form>
      )}

      {step === 'email' && (
        <>
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-slate-400 font-bold">או התחבר באמצעות</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Button variant="outline" className="h-12 rounded-xl border-2 font-bold gap-3 hover:bg-slate-50">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </Button>
          </div>

          <p className="text-center text-slate-500 font-medium">
            עדיין אין לך חשבון?{" "}
            <Link href="/signup" className="text-primary font-bold hover:underline">להרשמה בחינם</Link>
          </p>
        </>
      )}
    </div>
  )
}

