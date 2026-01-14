'use client'

import React, { useState, useRef } from 'react'
import { Plus, Loader2, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet'
import { createCourse } from '@/app/actions/courses'
import { uploadFile } from '@/lib/supabase/storage'
import { toast } from 'sonner'
import Image from 'next/image'

interface CreateCourseSheetProps {
  isPlaceholder?: boolean
}

export function CreateCourseSheet({ isPlaceholder }: CreateCourseSheetProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const publicUrl = await uploadFile(file, 'courses', 'course-covers')
      setImageUrl(publicUrl)
      toast.success('התמונה הועלתה בהצלחה')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('שגיאה בהעלאת התמונה')
    } finally {
      setIsUploading(false)
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    if (imageUrl) {
      formData.set('imageUrl', imageUrl)
    }
    
    try {
      await createCourse(formData)
      toast.success('הקורס נוצר בהצלחה!')
      setOpen(false)
      setImageUrl('')
    } catch (error) {
      toast.error('שגיאה ביצירת הקורס')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {isPlaceholder ? (
          <button className="overflow-hidden group border-2 border-dashed border-slate-200 hover:border-primary/30 hover:bg-primary/[0.02] transition-all duration-300 rounded-xl flex flex-col items-center justify-center p-8 min-h-[350px]">
            <div className="w-16 h-16 rounded-xl bg-slate-50 group-hover:bg-primary/10 flex items-center justify-center transition-colors mb-4">
              <Plus className="w-8 h-8 text-slate-300 group-hover:text-primary transition-colors" />
            </div>
            <span className="font-bold text-lg text-slate-400 group-hover:text-primary transition-colors">צור קורס חדש</span>
          </button>
        ) : (
          <Button size="lg" className="rounded-xl gap-2 px-6 font-bold h-11 bg-primary border-none hover:bg-primary/90 transition-all text-sm">
            <Plus className="w-4 h-4" />
            צור קורס חדש
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" dir="rtl" className="sm:max-w-[500px] bg-white border-l-0 rounded-l-xl p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="text-right p-8 pb-6 border-b border-slate-50">
            <SheetTitle className="text-2xl font-bold text-slate-900">יצירת קורס חדש</SheetTitle>
            <SheetDescription className="text-base text-slate-500 font-medium">
              מלא את פרטי הקורס כדי להתחיל לבנות את התוכן הלימודי.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-8">
            <form id="create-course-form" onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-5">
                <div className="space-y-2 text-right">
                  <label htmlFor="title" className="text-sm font-bold text-slate-700 mr-1">שם הקורס</label>
                  <Input 
                    id="title" 
                    name="title" 
                    placeholder="למשל: יסודות ה-React" 
                    required 
                    className="h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-primary/20 transition-all font-bold text-base px-5 text-right"
                  />
                </div>
                <div className="space-y-2 text-right">
                  <label htmlFor="description" className="text-sm font-bold text-slate-700 mr-1">תיאור הקורס</label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    placeholder="ספר קצת על מה נלמד בקורס..." 
                    className="min-h-[120px] rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-primary/20 transition-all font-medium text-base px-5 py-3 resize-none text-right"
                  />
                </div>
                <div className="space-y-2 text-right">
                  <label className="text-sm font-bold text-slate-700 mr-1">תמונת קורס</label>
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload}
                    accept="image/*"
                  />
                  {imageUrl ? (
                    <div className="relative group aspect-video rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                      <Image 
                        src={imageUrl} 
                        alt="Course Cover" 
                        fill 
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button 
                          type="button"
                          variant="destructive" 
                          size="icon" 
                          onClick={() => setImageUrl('')}
                          className="rounded-lg h-9 w-9"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:bg-slate-50 hover:border-primary/30 transition-all cursor-pointer group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-primary/10 flex items-center justify-center transition-all">
                        {isUploading ? <Loader2 className="w-6 h-6 text-primary animate-spin" /> : <Upload className="w-6 h-6 text-slate-400 group-hover:text-primary" />}
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-slate-600 text-base group-hover:text-primary transition-colors">העלאת תמונה</p>
                        <p className="text-sm text-slate-400 mt-1">מומלץ 16:9, עד 2MB</p>
                      </div>
                    </div>
                  )}
                  <input type="hidden" name="imageUrl" value={imageUrl} />
                </div>
              </div>
            </form>
          </div>
          <div className="p-8 border-t border-slate-50">
            <Button 
              form="create-course-form"
              type="submit" 
              disabled={loading}
              className="w-full rounded-xl h-12 font-bold text-base bg-primary hover:bg-primary/90 transition-all gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  יוצר קורס...
                </>
              ) : (
                'צור קורס עכשיו'
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

