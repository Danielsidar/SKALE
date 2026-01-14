import React from "react"
import { 
  Building2, 
  Globe, 
  Copy, 
  Trash2, 
  AlertTriangle,
  Link as LinkIcon
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { getActiveProfile } from "@/lib/auth-utils"

export default async function SettingsPage() {
  const supabase = createClient(cookies())
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const profile = await getActiveProfile()
  
  const organization = profile?.organizations as any

  return (
    <div className="space-y-6 max-w-4xl text-right">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">הגדרות ארגון ⚙️</h1>
        <p className="text-sm text-slate-500">נהל את פרטי הארגון והגדרות המערכת הכלליות.</p>
      </div>

      <Card className="border-slate-100 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="p-6 border-b border-slate-50">
          <CardTitle className="text-base font-bold text-slate-800 text-right">מידע על הארגון</CardTitle>
          <CardDescription className="text-xs text-right">פרטים אלו משמשים לזיהוי הארגון שלך במערכת.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider text-right">שם הארגון</label>
              <Input defaultValue={organization?.name || "האקדמיה שלי"} className="h-10 rounded-lg text-sm" />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider text-right">מזהה ארגון (Slug)</label>
              <Input defaultValue={organization?.slug || "my-academy"} disabled className="h-10 rounded-lg text-sm bg-slate-50" />
              <p className="text-[10px] text-slate-400 font-medium text-right">לא ניתן לשנות את מזהה הארגון לאחר היצירה.</p>
            </div>
          </div>
          
          <Separator className="bg-slate-50" />
          
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider text-right">כתובת האקדמיה</h4>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <Input value={`https://courses.co.il/academy/${organization?.slug || 'my-academy'}`} readOnly className="pr-9 h-10 rounded-lg bg-slate-50 font-mono text-[11px] text-slate-600" />
              </div>
              <Button variant="outline" size="sm" className="gap-2 h-10 rounded-lg font-bold border-slate-200">
                <Copy className="w-3.5 h-3.5" />
                העתק
              </Button>
            </div>
            <p className="text-[10px] text-slate-400 font-medium text-right">זו הכתובת הציבורית של האקדמיה שלך אותה תוכל לשתף עם הסטודנטים.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-rose-100 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="p-6 border-b border-rose-50">
          <CardTitle className="text-base font-bold text-rose-600 flex items-center justify-end gap-2">
            אזור מסוכן
            <AlertTriangle className="w-4 h-4" />
          </CardTitle>
          <CardDescription className="text-xs text-rose-500/70 text-right">פעולות אלו הן בלתי הפיכות וישפיעו על כל הסטודנטים והקורסים בארגון.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-rose-100 rounded-lg bg-rose-50/30">
            <div className="text-right">
              <p className="font-bold text-rose-700 text-sm">מחיקת הארגון</p>
              <p className="text-xs text-rose-600/60 font-medium">כל המידע, הקורסים והסטודנטים יימחקו לצמיתות. לא ניתן לבטל פעולה זו.</p>
            </div>
            <Button variant="destructive" size="sm" className="h-9 rounded-lg font-bold">מחק ארגון</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
