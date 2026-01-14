"use client"

import React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { 
  LogOut, 
  User, 
  Settings,
  ChevronDown,
  Bell,
  Menu,
  Home,
  BookOpen,
  MessageSquare
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface AcademyHeaderProps {
  orgSlug: string
  userName: string
  userRole: string
}

export function AcademyHeader({ orgSlug, userName, userRole }: AcademyHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const isLandingPage = pathname === `/academy/${orgSlug}`
  if (isLandingPage) return null

  const menuItems = [
    { name: "דף הבית", href: `/academy/${orgSlug}/home`, icon: Home },
    { name: "הקורסים שלי", href: `/academy/${orgSlug}/courses`, icon: BookOpen },
    { name: "יצירת קשר", href: `/academy/${orgSlug}/contact`, icon: MessageSquare },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success("התנתקת בהצלחה")
    router.push(`/academy/${orgSlug}`)
    router.refresh()
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0f172a] text-white/90">
      <div className="p-10">
        <Link href={`/academy/${orgSlug}/home`} className="flex items-center gap-4 group">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-primary/20 transition-all group-hover:scale-110 group-hover:rotate-3">
            {orgSlug[0].toUpperCase()}
          </div>
          <div className="flex flex-col text-right">
            <span className="font-black text-xl text-white tracking-tight leading-none">האקדמיה</span>
            <span className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-1.5">פורטל תלמיד</span>
          </div>
        </Link>
      </div>
      
      <nav className="flex-1 px-6 py-4 space-y-3 mt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-5 px-6 py-5 rounded-[1.5rem] transition-all duration-300 group relative overflow-hidden",
                isActive 
                  ? "bg-white/10 text-white shadow-xl shadow-black/20" 
                  : "text-white/50 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn(
                "w-7 h-7 transition-all duration-300 group-hover:scale-110",
                isActive ? "text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" : "text-white/30 group-hover:text-white/70"
              )} />
              <span className={cn(
                "font-black text-lg tracking-tight transition-colors",
                isActive ? "text-white" : ""
              )}>{item.name}</span>
              {isActive && (
                <div className="mr-auto w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),1)] animate-pulse" />
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )

  return (
    <header className="h-24 border-b bg-white/80 backdrop-blur-md flex items-center justify-between px-8 md:px-12 sticky top-0 z-40 shadow-sm border-slate-100/50" dir="rtl">
      <div className="flex items-center gap-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden hover:bg-primary/5 rounded-2xl w-12 h-12">
              <Menu className="w-7 h-7 text-primary" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-0 w-80 border-l-0">
            {sidebarContent}
          </SheetContent>
        </Sheet>
        
        <div className="hidden lg:flex items-center gap-4 bg-slate-50 px-5 py-2.5 rounded-[1.25rem] border border-slate-100 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">פורטל תלמיד</span>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
          <span className="text-sm font-black text-slate-800 tracking-tight">
            {menuItems.find(item => pathname === item.href)?.name || "סקירה"}
          </span>
        </div>

        <Link href={`/academy/${orgSlug}/home`} className="flex lg:hidden items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black">
            {orgSlug[0].toUpperCase()}
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-5">
        <div className="hidden sm:flex items-center bg-white border border-slate-100 shadow-sm rounded-[1.25rem] p-1.5">
          <Button variant="ghost" size="icon" className="rounded-xl h-11 w-11 text-slate-400 hover:bg-slate-50 hover:text-primary transition-all group">
            <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </Button>
        </div>
        
        <DropdownMenu dir="rtl">
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-4 p-1.5 pe-6 rounded-[1.25rem] border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all h-auto group">
              <div className="relative">
                <Avatar className="w-12 h-12 rounded-xl border-2 border-primary/10 shadow-sm transition-transform group-hover:scale-105">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary/5 text-primary font-black rounded-xl">
                    {userName.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
              </div>
              <div className="hidden sm:flex flex-col items-start text-right">
                <span className="font-black text-sm text-slate-800 tracking-tight leading-none">{userName}</span>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1.5">{userRole}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 p-3 rounded-[1.5rem] mt-3 shadow-2xl border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <DropdownMenuLabel className="px-4 pb-3 pt-2 font-black text-slate-400 text-[10px] uppercase tracking-widest border-b border-slate-50 mb-2">החשבון שלי</DropdownMenuLabel>
            <DropdownMenuItem 
              className="rounded-xl py-4 px-4 gap-4 focus:bg-primary/5 focus:text-primary transition-all cursor-pointer group"
              onClick={() => router.push(`/academy/${orgSlug}/settings`)}
            >
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-focus:bg-primary/10 transition-colors">
                <Settings className="w-4 h-4" />
              </div>
              <span className="font-bold">פרופיל והגדרות</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-2 bg-slate-50" />
            <DropdownMenuItem 
              className="rounded-xl py-4 px-4 gap-4 text-rose-600 focus:bg-rose-50 focus:text-rose-600 transition-all cursor-pointer group"
              onClick={handleLogout}
            >
              <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center group-focus:bg-rose-100 transition-colors">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="font-black">התנתק מהפורטל</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}


