import React from "react"
import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { 
  User, 
  Settings as SettingsIcon, 
  Shield, 
  Bell, 
  ChevronLeft,
  Trophy,
  Star,
  BookOpen
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileForm } from "@/components/academy/profile-form"
import { PasswordForm } from "@/components/academy/password-form"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "הגדרות ופרופיל | האקדמיה",
  description: "נהל את הפרופיל האישי והגדרות החשבון שלך",
}

export default async function StudentSettingsPage({ params }: { params: { orgSlug: string } }) {
  const { orgSlug } = params
  const supabase = createClient(cookies())
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: organization } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('slug', orgSlug)
    .single()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .eq('organization_id', organization?.id)
    .single()

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto w-full pb-24 text-right">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3 justify-end md:justify-start flex-row-reverse">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">הגדרות ופרופיל ⚙️</h1>
          </div>
          <p className="text-sm text-slate-500 font-medium">נהל את המידע האישי שלך והעדפות החשבון</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-12">
        {/* Sidebar Info */}
        <div className="md:col-span-4 space-y-6 order-2 md:order-1">
          <Card className="border-slate-100 shadow-sm rounded-[2rem] overflow-hidden bg-white">
            <CardHeader className="p-6 text-center bg-slate-50/50 border-b border-slate-100">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4 text-primary text-2xl font-black border-2 border-white shadow-sm">
                {profile?.name?.substring(0, 2) || "S"}
              </div>
              <CardTitle className="text-xl font-black text-slate-900 leading-none">{profile?.name}</CardTitle>
              <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
                {profile?.role === 'admin' ? 'מנהל מערכת' : 'תלמיד מן המניין'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm border border-amber-100">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">נקודות XP</p>
                    <p className="text-sm font-black text-slate-900 leading-none">{profile?.xp || 0}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                    <Star className="w-4 h-4" />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">תעודות</p>
                    <p className="text-sm font-black text-slate-900 leading-none">{profile?.certificates_count || 0}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-sm rounded-[2rem] overflow-hidden bg-slate-900 text-white relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full blur-3xl -mr-12 -mt-12" />
            <CardHeader className="p-6 relative z-10">
              <CardTitle className="text-lg font-black flex items-center gap-2 justify-end">
                אבטחת חשבון
                <Shield className="w-5 h-5 text-primary" />
              </CardTitle>
              <CardDescription className="text-white/40 font-medium text-xs text-right">הסיסמה שלך מוצפנת ומאובטחת בסטנדרטים הגבוהים ביותר.</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6 relative z-10">
              <p className="text-[11px] text-white/60 text-right leading-relaxed">
                מומלץ להחליף סיסמה מדי פעם ולהשתמש בסיסמה חזקה המשלבת אותיות, מספרים ותווים מיוחדים.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="md:col-span-8 order-1 md:order-2">
          <Tabs defaultValue="profile" className="w-full" dir="rtl">
            <TabsList className="w-full h-auto p-1.5 bg-slate-100 rounded-[1.5rem] border border-slate-200 mb-6 flex flex-row-reverse">
              <TabsTrigger 
                value="profile" 
                className="flex-1 py-3 rounded-xl font-black text-sm data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
              >
                <User className="w-4 h-4 ml-2" />
                פרופיל אישי
              </TabsTrigger>
              <TabsTrigger 
                value="account" 
                className="flex-1 py-3 rounded-xl font-black text-sm data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
              >
                <SettingsIcon className="w-4 h-4 ml-2" />
                הגדרות חשבון
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="flex-1 py-3 rounded-xl font-black text-sm data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
              >
                <Bell className="w-4 h-4 ml-2" />
                התראות
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="m-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Card className="border-slate-100 shadow-sm rounded-[2rem] overflow-hidden bg-white">
                <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/30">
                  <CardTitle className="text-lg font-black text-slate-900 text-right">מידע אישי</CardTitle>
                  <CardDescription className="text-right font-medium text-slate-500">ערוך את פרטי הזהות שלך שיופיעו במערכת</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <ProfileForm 
                    initialData={{
                      name: profile?.name || "",
                      email: user.email || "",
                      role: profile?.role || "student"
                    }} 
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="m-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Card className="border-slate-100 shadow-sm rounded-[2rem] overflow-hidden bg-white">
                <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/30">
                  <CardTitle className="text-lg font-black text-slate-900 text-right">אבטחת חשבון</CardTitle>
                  <CardDescription className="text-right font-medium text-slate-500">עדכן את הסיסמה שלך כדי לשמור על החשבון מאובטח</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <PasswordForm />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="m-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Card className="border-slate-100 shadow-sm rounded-[2rem] overflow-hidden bg-white">
                <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/30">
                  <CardTitle className="text-lg font-black text-slate-900 text-right">העדפות התראות</CardTitle>
                  <CardDescription className="text-right font-medium text-slate-500">בחר אילו עדכונים תרצה לקבל</CardDescription>
                </CardHeader>
                <CardContent className="p-8 text-center space-y-6">
                  <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 border-dashed">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Bell className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-bold text-sm">הגדרות התראה מתקדמות יהיו זמינות בקרוב</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

