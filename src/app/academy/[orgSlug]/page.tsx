"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2, Mail, Lock, GraduationCap, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { cn, hexToHsl, getContrastColor } from "@/lib/utils"
import { checkEmailStatus, completeRegistration } from "@/app/actions/auth"

export default function AcademyLoginPage({ params }: { params: { orgSlug: string } }) {
  const [isLoading, setIsLoading] = useState(false)
  const [orgData, setOrgData] = useState<any>(null)
  const [step, setStep] = useState<'email' | 'password'>('email')
  const [email, setEmail] = useState('')
  const [userStatus, setUserStatus] = useState<{ exists: boolean, needsPasswordSetup: boolean, name?: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const { orgSlug } = params

  useEffect(() => {
    async function fetchOrg() {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('slug', orgSlug)
        .single()
      
      if (error || !data) {
        toast.error("אקדמיה לא נמצאה")
        router.push('/')
        return
      }
      setOrgData(data)
    }
    fetchOrg()
  }, [orgSlug, supabase, router])

  const sidebarHex = orgData?.sidebar_color || "#020617"
  const sidebarHsl = hexToHsl(sidebarHex)
  const sidebarForeground = getContrastColor(sidebarHex)
  const primaryHsl = hexToHsl(orgData?.primary_color || "#3b82f6")

  const handleNextStep = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const emailInput = formData.get("email") as string
    setEmail(emailInput)

    try {
      const status = await checkEmailStatus(emailInput, orgSlug)
      
      if (!status.exists) {
        toast.error("אימייל זה אינו רשום באקדמיה זו. פנה למנהל להזמנה.")
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

      toast.success(userStatus?.needsPasswordSetup ? "הסיסמה הוגדרה בהצלחה! ברוכים הבאים." : `ברוכים הבאים ל-${orgData?.name || 'אקדמיה'}!`)
      router.push(`/academy/${orgSlug}/home`)
      router.refresh()
    } catch (error: any) {
      toast.error("שגיאה בלתי צפויה: " + error.message)
      setIsLoading(false)
    }
  }

  if (!orgData) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col lg:flex-row font-assistant rtl" dir="rtl">
      {/* Inject custom branding variables for login page too */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --primary: ${primaryHsl};
          --sidebar: ${sidebarHsl};
          --sidebar-foreground: ${sidebarForeground};
        }
      `}} />
      
      {/* Left Side: Branding & Info */}
      <div 
        className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between relative overflow-hidden transition-colors duration-500"
        style={{ backgroundColor: sidebarHex }}
      >
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            {orgData.logo_url ? (
              <div className="h-12 w-auto min-w-[48px] relative">
                <img src={orgData.logo_url} alt={orgData.name} className="h-full object-contain" />
              </div>
            ) : (
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 cursor-default">
                {orgData.name[0].toUpperCase()}
              </div>
            )}
            <div style={{ color: `hsl(${sidebarForeground})` }}>
              <h2 className="text-lg font-bold tracking-tight leading-none opacity-90">{orgData.name}</h2>
              <span className="opacity-50 text-[10px] font-bold uppercase tracking-widest mt-1.5 block">פורטל למידה דיגיטלית</span>
            </div>
          </div>

          <div className="space-y-5 mt-16 text-right">
            <h1 className="text-3xl md:text-4xl font-bold text-white leading-[1.2] tracking-tight max-w-lg">
              המקום שלך <span className="text-primary">לצמוח</span> ולהתפתח מקצועית.
            </h1>
            <p className="opacity-60 text-base font-medium max-w-md leading-relaxed" style={{ color: `hsl(${sidebarForeground})` }}>
              הצטרפו לאלפי סטודנטים שכבר לומדים באקדמיה שלנו ונהנים מהתכנים האיכותיים ביותר.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <div className="flex -space-x-2 space-x-reverse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-8 h-8 rounded-lg border-2 border-slate-900 bg-slate-800 overflow-hidden shadow-md">
                <Avatar className="w-full h-full">
                  <AvatarFallback className="bg-slate-800 text-slate-500 text-[8px] font-bold">
                    U{i}
                  </AvatarFallback>
                </Avatar>
              </div>
            ))}
          </div>
          <p className="opacity-50 text-[10px] font-bold tracking-tight uppercase leading-tight" style={{ color: `hsl(${sidebarForeground})` }}>
            הצטרפו לקהילת הלומדים <br /> של {orgData.name}
          </p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-24 bg-[#f8fafc] relative">
        <Link href="/" className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-2 font-bold text-xs group">
          חזרה לאתר הראשי
          <ChevronLeft className="w-3.5 h-3.5 group-hover:translate-x-[-2px] transition-transform" />
        </Link>

        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-1.5 text-right">
            <div className="lg:hidden w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-xl font-bold mb-6">
              {orgData.name[0].toUpperCase()}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {step === 'email' ? 'ברוכים הבאים 👋' : `שלום ${userStatus?.name?.split(' ')[0] || 'שוב'}!`}
            </h1>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              {step === 'email' 
                ? 'הזינו את כתובת האימייל שלכם כדי להיכנס לפורטל הלמידה.' 
                : userStatus?.needsPasswordSetup 
                  ? 'נראה שזו הכניסה הראשונה שלך! בחר סיסמה חדשה כדי להשלים את ההרשמה.' 
                  : 'הזינו את הסיסמה שלכם כדי להתחבר.'}
            </p>
          </div>

          {step === 'email' ? (
            <form onSubmit={handleNextStep} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">כתובת אימייל</Label>
                  <div className="relative group">
                    <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input 
                      id="email"
                      name="email"
                      type="email" 
                      placeholder="name@example.com" 
                      required
                      className="h-11 pr-10 rounded-lg border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-primary/10 transition-all font-medium text-left text-sm"
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-11 rounded-lg text-sm font-bold shadow-sm"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "המשך"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-1">
                    <Label htmlFor="password" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {userStatus?.needsPasswordSetup ? 'סיסמה חדשה' : 'סיסמה'}
                    </Label>
                    {!userStatus?.needsPasswordSetup && (
                      <Link href="#" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors">שכחת סיסמה?</Link>
                    )}
                  </div>
                  <div className="relative group">
                    <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input 
                      id="password"
                      name="password"
                      type="password" 
                      placeholder="••••••••" 
                      required
                      autoFocus
                      className="h-11 pr-10 rounded-lg border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-primary/10 transition-all font-medium text-left text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-11 rounded-lg text-sm font-bold shadow-sm"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : userStatus?.needsPasswordSetup ? "השלמת הרשמה וכניסה" : "כניסה לאקדמיה"}
                </Button>
                
                <Button 
                  type="button" 
                  variant="ghost"
                  onClick={() => setStep('email')}
                  className="w-full h-11 rounded-lg text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  חזרה למייל
                </Button>
              </div>
            </form>
          )}

          <div className="pt-6 border-t border-slate-50">
            <div className="bg-slate-50/50 rounded-xl p-4 flex items-start gap-3 border border-slate-100/50">
              <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4 text-primary" />
              </div>
              <div className="space-y-0.5 text-right">
                <h4 className="font-bold text-slate-800 text-xs">נתקלת בבעיה?</h4>
                <p className="text-slate-500 text-[10px] font-medium leading-relaxed">
                  אם אינך מצליח להתחבר או שטרם קיבלת פרטי גישה, ניתן לפנות למחלקת התמיכה שלנו.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

