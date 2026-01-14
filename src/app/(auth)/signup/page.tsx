"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Github, Loader2, Mail, Lock, User, Building2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { signUp } from "@/app/actions/auth"

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    
    try {
      await signUp(formData)
      setIsSuccess(true)
      toast.success("החשבון נוצר בהצלחה!")
      
      // Delay redirect to show success state
      setTimeout(() => {
        router.push("/overview")
        router.refresh()
      }, 2000)
    } catch (error: any) {
      toast.error(error.message || "שגיאה בתהליך ההרשמה")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-12 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 animate-bounce" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-slate-900">מעולה! אנחנו יוצאים לדרך</h2>
          <p className="text-slate-500 font-medium text-lg">החשבון והאקדמיה שלך נוצרו בהצלחה. מעבירים אותך לדשבורד...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-3">
        <h1 className="text-4xl font-black tracking-tight text-slate-900">יצירת חשבון חדש 🚀</h1>
        <p className="text-lg text-slate-500 font-medium">הצעד הראשון לאקדמיה הדיגיטלית שלך מתחיל כאן.</p>
      </div>

      <form onSubmit={handleSignup} className="space-y-6">
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-black text-slate-700 mr-1">שם מלא</Label>
              <div className="relative group">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input 
                  id="fullName"
                  name="fullName"
                  placeholder="ישראל ישראלי" 
                  required
                  className="h-14 pr-12 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-primary/20 transition-all font-medium"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="academyName" className="text-sm font-black text-slate-700 mr-1">שם האקדמיה</Label>
              <div className="relative group">
                <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input 
                  id="academyName"
                  name="academyName"
                  placeholder="האקדמיה שלי" 
                  required
                  className="h-14 pr-12 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-primary/20 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-black text-slate-700 mr-1">אימייל</Label>
            <div className="relative group">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input 
                id="email"
                name="email"
                type="email" 
                placeholder="name@company.com" 
                required
                className="h-14 pr-12 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-primary/20 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-black text-slate-700 mr-1">סיסמה</Label>
            <div className="relative group">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input 
                id="password"
                name="password"
                type="password" 
                placeholder="מינימום 6 תווים" 
                required
                minLength={6}
                className="h-14 pr-12 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-primary/20 transition-all font-medium"
              />
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full h-14 rounded-2xl text-lg font-black shadow-xl shadow-primary/20 bg-gradient-to-l from-primary to-primary/80 border-none transition-all active:scale-95"
        >
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "יצירת חשבון והתחלה"}
        </Button>
      </form>

      <p className="text-center text-slate-500 font-medium">
        כבר יש לך חשבון?{" "}
        <Link href="/login" className="text-primary font-black hover:underline">להתחברות</Link>
      </p>

      <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest px-8">
        בלחיצה על "יצירת חשבון" הנך מסכים ל<Link href="#" className="underline">תנאי השימוש</Link> ול<Link href="#" className="underline">מדיניות הפרטיות</Link> שלנו.
      </p>
    </div>
  )
}

