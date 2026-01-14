import React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GraduationCap, ShieldCheck, LogOut, ChevronLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { signOut, setActiveOrganization } from "@/app/actions/auth"
import Image from "next/image"

// Prevent static generation - requires cookies/auth
export const dynamic = 'force-dynamic'

export default async function SelectAcademyPage() {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*, organizations(*)')
    .eq('id', user.id)

  if (!profiles || profiles.length === 0) {
    redirect("/overview")
  }

  if (profiles.length === 1) {
    const profile = profiles[0]
    const org = Array.isArray(profile.organizations) 
      ? profile.organizations[0] 
      : profile.organizations

    const redirectUrl = (profile.role === 'admin' || profile.role === 'support' || profile.role === 'owner')
      ? "/overview"
      : (org?.slug ? `/academy/${org.slug}/home` : "/overview")
    
    await setActiveOrganization(profile.organization_id, redirectUrl)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-assistant" dir="rtl">
      <div className="max-w-2xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">לאן נתחבר היום?</h1>
          <p className="text-lg text-slate-500 font-medium">מצאנו מספר חשבונות המשויכים אליך. בחר את האקדמיה שאליה תרצה להיכנס.</p>
        </div>

        <div className="grid gap-4">
          {profiles.map((profile) => {
            const org = Array.isArray(profile.organizations) 
              ? profile.organizations[0] 
              : profile.organizations

            const redirectUrl = profile.role === 'student' && org?.slug
              ? `/academy/${org.slug}/home` 
              : "/overview"
            
            return (
              <form key={`${profile.organization_id}-${profile.role}`} action={async () => {
                'use server'
                await setActiveOrganization(profile.organization_id, redirectUrl)
              }}>
                <button type="submit" className="w-full text-right group">
                  <Card className="border-2 border-transparent hover:border-primary/20 hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden bg-white">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-700 group-hover:bg-primary/10 group-hover:text-primary transition-colors overflow-hidden">
                          {org?.logo_url ? (
                            <Image 
                              src={org.logo_url} 
                              alt={org.name || 'Logo'} 
                              width={56} 
                              height={56} 
                              className="w-full h-full object-contain p-2"
                            />
                          ) : (
                            org?.name?.[0]?.toUpperCase() || '?'
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">
                            {org?.name || 'אקדמיה לא ידועה'}
                          </h3>
                          <div className="flex items-center gap-2">
                            {profile.role === 'admin' || profile.role === 'owner' ? (
                              <Badge className="bg-blue-50 text-blue-600 border-none hover:bg-blue-50 font-bold px-2 py-0 h-5 text-[10px]">
                                <ShieldCheck className="w-3 h-3 ml-1" />
                                ניהול מערכת
                              </Badge>
                            ) : (
                              <Badge className="bg-emerald-50 text-emerald-600 border-none hover:bg-emerald-50 font-bold px-2 py-0 h-5 text-[10px]">
                                <GraduationCap className="w-3 h-3 ml-1" />
                                סטודנט
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronLeft className="w-5 h-5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </CardContent>
                  </Card>
                </button>
              </form>
            )
          })}
        </div>

        <div className="pt-8 border-t border-slate-200 flex flex-col items-center gap-6">
          <form action={signOut}>
            <Button variant="ghost" className="text-slate-500 font-bold hover:text-rose-600 hover:bg-rose-50 gap-2 rounded-xl">
              <LogOut className="w-4 h-4" />
              התנתקות מהחשבון
            </Button>
          </form>
          <p className="text-sm text-slate-400 font-medium">
            מחובר בתור <span className="font-bold text-slate-600">{user.email}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

