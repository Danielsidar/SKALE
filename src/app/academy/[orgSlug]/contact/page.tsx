"use client"

import React from "react"
import { useParams } from "next/navigation"
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessageCircle, 
  Clock, 
  Send,
  Globe,
  Instagram,
  Facebook,
  Linkedin
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

export default function StudentContactPage() {
  const params = useParams()
  const orgSlug = params.orgSlug as string

  return (
    <div className="p-6 md:p-12 space-y-12 max-w-7xl mx-auto w-full pb-24">
      {/* Page Header Area */}
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100/50 flex flex-col md:flex-row md:items-end justify-between gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">צרו קשר 📞</h1>
            <Badge className="bg-primary/10 text-primary border-none py-1.5 px-4 text-[10px] font-black rounded-lg uppercase tracking-widest">תמיד כאן בשבילך</Badge>
          </div>
          <p className="text-xl text-slate-500 font-medium max-w-xl leading-relaxed">
            יש לכם שאלה? זקוקים לתמיכה טכנית או ייעוץ לימודי? הצוות של האקדמיה ישמח לעזור לכם בכל נושא.
          </p>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-12">
        {/* Contact Form */}
        <div className="lg:col-span-7">
          <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden p-4">
            <CardHeader className="p-8 md:p-12">
              <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">שלחו לנו הודעה</CardTitle>
              <CardDescription className="text-lg font-medium text-slate-400 mt-2">אנחנו מבטיחים לחזור אליכם תוך פחות מ-24 שעות.</CardDescription>
            </CardHeader>
            <CardContent className="px-8 md:px-12 pb-12">
              <form className="space-y-8">
                <div className="grid gap-8 md:grid-cols-2">
                  <div className="space-y-3">
                    <label className="text-sm font-black text-slate-700 pr-2">שם מלא</label>
                    <Input placeholder="ישראל ישראלי" className="h-16 rounded-[1.25rem] border-slate-100 bg-slate-50 focus:bg-white focus:ring-primary/20 transition-all font-bold text-lg px-6" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-black text-slate-700 pr-2">כתובת אימייל</label>
                    <Input placeholder="name@company.com" className="h-16 rounded-[1.25rem] border-slate-100 bg-slate-50 focus:bg-white focus:ring-primary/20 transition-all font-bold text-lg px-6" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-black text-slate-700 pr-2">נושא הפנייה</label>
                  <Input placeholder="באיזה נושא נוכל לעזור?" className="h-16 rounded-[1.25rem] border-slate-100 bg-slate-50 focus:bg-white focus:ring-primary/20 transition-all font-bold text-lg px-6" />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-black text-slate-700 pr-2">הודעה</label>
                  <Textarea placeholder="כתבו כאן את כל הפרטים..." className="min-h-[200px] rounded-[1.25rem] border-slate-100 bg-slate-50 focus:bg-white focus:ring-primary/20 transition-all font-bold text-lg p-6 resize-none" />
                </div>

                <Button className="w-full md:w-auto min-w-[240px] gap-3 rounded-[1.25rem] h-16 font-black text-xl shadow-xl shadow-primary/20 bg-gradient-to-l from-primary to-primary/80 border-none hover:scale-[1.02] active:scale-95 transition-all">
                  שלח הודעה
                  <Send className="w-6 h-6" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Contact Info Sidebar */}
        <div className="lg:col-span-5 space-y-8">
          <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden p-2">
            <CardHeader className="p-10 pb-6">
              <CardTitle className="text-2xl font-black text-slate-900">פרטי התקשרות</CardTitle>
            </CardHeader>
            <CardContent className="px-10 pb-10 space-y-8">
              <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 bg-primary/10 rounded-[1.25rem] flex items-center justify-center text-primary shadow-inner group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">אימייל</p>
                  <p className="text-lg font-black text-slate-800 tracking-tight">support@academy.com</p>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 bg-emerald-50 rounded-[1.25rem] flex items-center justify-center text-emerald-500 shadow-inner group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">טלפון</p>
                  <p className="text-lg font-black text-slate-800 tracking-tight">050-1234567</p>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 bg-amber-50 rounded-[1.25rem] flex items-center justify-center text-amber-500 shadow-inner group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">WhatsApp</p>
                  <p className="text-lg font-black text-slate-800 tracking-tight">לחצו למענה מהיר</p>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 bg-rose-50 rounded-[1.25rem] flex items-center justify-center text-rose-500 shadow-inner group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">שעות פעילות</p>
                  <p className="text-lg font-black text-slate-800 tracking-tight">א' - ה', 09:00 - 18:00</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-10 pt-0 flex gap-4">
              <Button variant="ghost" size="icon" className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 transition-all">
                <Globe className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 transition-all">
                <Instagram className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 transition-all">
                <Facebook className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 transition-all">
                <Linkedin className="w-5 h-5" />
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-none shadow-sm rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-sky-700 text-white overflow-hidden p-2 relative group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <CardHeader className="p-10 relative z-10">
              <CardTitle className="text-2xl font-black">תמיכה טכנית מהירה</CardTitle>
              <CardDescription className="text-white/60 font-medium mt-2 leading-relaxed text-base">
                נתקלתם בבעיה טכנית באתר? אל דאגה, אנחנו זמינים עבורכם גם במייל הישיר של מחלקת המחשוב.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-10 pb-10 relative z-10">
               <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                 <p className="text-sm font-black tracking-tight">tech@academy.com</p>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}



