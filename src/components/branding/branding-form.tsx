"use client"

import React, { useState, useRef } from "react"
import { 
  Upload, 
  RotateCcw, 
  Save,
  Loader2,
  X
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { uploadFile } from "@/lib/supabase/storage"
import { updateBranding } from "@/app/actions/branding"
import { toast } from "sonner"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface BrandingFormProps {
  initialData: {
    primaryColor: string
    sidebarColor: string
    logoUrl: string | null
    academyName: string
  }
}

export function BrandingForm({ initialData }: BrandingFormProps) {
  const router = useRouter()
  const [primaryColor, setPrimaryColor] = useState(initialData.primaryColor)
  const [sidebarColor, setSidebarColor] = useState(initialData.sidebarColor)
  const [logoUrl, setLogoUrl] = useState<string | null>(initialData.logoUrl)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('הקובץ גדול מדי (מקסימום 2MB)')
      return
    }

    setIsUploading(true)
    try {
      const publicUrl = await uploadFile(file, 'courses', 'branding')
      setLogoUrl(publicUrl)
      toast.success('הלוגו הועלה בהצלחה')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('שגיאה בהעלאת הלוגו')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateBranding({
        primaryColor,
        sidebarColor,
        logoUrl
      })
      toast.success("המיתוג נשמר בהצלחה!")
      router.refresh()
    } catch (error: any) {
      console.error('Save error:', error)
      toast.error("שגיאה בשמירת המיתוג: " + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">מיתוג ועיצוב 🎨</h1>
          <p className="text-sm text-slate-500">התאם את המראה והתחושה של האקדמיה למותג שלך.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 h-9 rounded-lg font-bold border-slate-200" 
            onClick={() => {
              setPrimaryColor(initialData.primaryColor)
              setSidebarColor(initialData.sidebarColor)
              setLogoUrl(initialData.logoUrl)
            }}
            disabled={isSaving}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            איפוס
          </Button>
          <Button 
            size="sm" 
            className="gap-2 h-9 rounded-lg font-bold" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            שמור שינויים
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-slate-100 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="p-6 border-b border-slate-50">
              <CardTitle className="text-base font-bold text-slate-800 text-right">לוגו האקדמיה</CardTitle>
              <CardDescription className="text-xs text-right">יופיע בסרגל הניווט ובעמודי הנחיתה.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleLogoUpload}
                accept="image/svg+xml,image/png,image/jpeg"
              />
              {logoUrl ? (
                <div className="relative group aspect-video rounded-lg border border-slate-200 flex items-center justify-center bg-slate-50 overflow-hidden">
                  <Image 
                    src={logoUrl} 
                    alt="Academy Logo" 
                    fill 
                    className="object-contain p-4"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-lg font-bold h-8 text-xs"
                    >
                      החלף תמונה
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      onClick={() => setLogoUrl(null)}
                      className="rounded-lg h-8 w-8"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {isUploading ? <Loader2 className="w-5 h-5 text-primary animate-spin" /> : <Upload className="w-5 h-5 text-primary" />}
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-xs text-slate-600">לחץ להעלאה או גרור לכאן</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">SVG, PNG, JPG (עד 2MB)</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="p-6 border-b border-slate-50">
              <CardTitle className="text-base font-bold text-slate-800 text-right">צבעי המערכת</CardTitle>
              <CardDescription className="text-xs text-right">הצבעים שיגדירו את חוויית המשתמש באקדמיה.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="grid gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider text-right">צבע ראשי (Primary)</label>
                <div className="flex gap-2">
                  <Input 
                    type="color" 
                    value={primaryColor} 
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 p-1 cursor-pointer rounded-lg border-slate-200" 
                  />
                  <Input 
                    value={primaryColor} 
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="font-mono h-10 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider text-right">צבע סיידבר (Sidebar)</label>
                <div className="flex gap-2">
                  <Input 
                    type="color" 
                    value={sidebarColor} 
                    onChange={(e) => setSidebarColor(e.target.value)}
                    className="w-10 h-10 p-1 cursor-pointer rounded-lg border-slate-200" 
                  />
                  <Input 
                    value={sidebarColor} 
                    onChange={(e) => setSidebarColor(e.target.value)}
                    className="font-mono h-10 rounded-lg text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-end gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">
            תצוגה מקדימה חיה
          </div>
          <Card className="overflow-hidden border border-slate-200 rounded-[2rem] h-[600px] flex shadow-xl shadow-primary/5">
            {/* Academy Preview Sidebar */}
            <div 
              className="w-48 border-l flex flex-col transition-colors duration-300"
              style={{ backgroundColor: sidebarColor }}
            >
              <div className="p-6 pt-10">
                {logoUrl ? (
                  <div className="h-8 w-full relative">
                    <img src={logoUrl} alt="Logo" className="h-full w-auto object-contain" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20" style={{ backgroundColor: primaryColor }}>
                    {initialData.academyName[0].toUpperCase()}
                  </div>
                )}
              </div>
              <nav className="flex-1 px-3 space-y-1 mt-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className={cn("h-8 rounded-lg mb-2 opacity-20", i === 1 ? "bg-primary opacity-100" : "bg-white")} style={i === 1 ? { backgroundColor: primaryColor } : {}} />
                ))}
              </nav>
            </div>

            {/* Academy Preview Main Content */}
            <div className="flex-1 flex flex-col bg-slate-50/50">
              <div className="h-14 bg-white border-b flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100" />
                  <div className="w-20 h-3 bg-slate-100 rounded" />
                </div>
                <div className="w-6 h-6 rounded-full bg-slate-200" />
              </div>

              <div className="flex-1 p-8 space-y-8 overflow-auto">
                <div className="space-y-2 text-right">
                  <div className="h-4 w-24 bg-slate-200 rounded mr-auto opacity-50" />
                  <div className="h-10 w-64 bg-slate-300 rounded mr-auto" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {[1, 2].map(i => (
                    <Card key={i} className="bg-white border-none shadow-sm rounded-2xl overflow-hidden">
                      <div className="aspect-video bg-slate-100 flex items-center justify-center">
                         <div className="w-12 h-12 rounded-full bg-white/50 blur-xl" />
                      </div>
                      <div className="p-4 space-y-4">
                        <div className="space-y-2">
                          <div className="h-4 w-full bg-slate-200 rounded" />
                          <div className="h-4 w-2/3 bg-slate-100 rounded" />
                        </div>
                        <div className="h-10 w-full rounded-xl shadow-lg shadow-primary/20 transition-colors" style={{ backgroundColor: primaryColor }} />
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-center gap-3">
                   <div className="px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-lg transition-colors duration-300" style={{ backgroundColor: primaryColor }}>כפתור ראשי</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}


