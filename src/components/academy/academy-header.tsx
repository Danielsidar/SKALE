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
  MessageSquare,
  LayoutGrid,
  Mail
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { MessageViewerDialog } from "./message-viewer-dialog"
import { formatDistanceToNow } from "date-fns"
import { he } from "date-fns/locale"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { markNotificationAsRead } from "@/app/actions/notifications"

interface AcademyHeaderProps {
  orgSlug: string
  userName: string
  userRole: string
  hasMultipleAcademies?: boolean
  logoUrl?: string | null
  unreadCount?: number
  initialMessages?: any[]
  initialNotifications?: any[]
}

export function AcademyHeader({ 
  orgSlug, 
  userName, 
  userRole, 
  hasMultipleAcademies, 
  logoUrl,
  unreadCount = 0,
  initialMessages = [],
  initialNotifications = []
}: AcademyHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const [selectedMessage, setSelectedMessage] = React.useState<any | null>(null)
  const [isViewerOpen, setIsViewerOpen] = React.useState(false)

  const handleOpenMessage = (msg: any) => {
    setSelectedMessage(msg)
    setIsViewerOpen(true)
  }

  const isLandingPage = pathname === `/academy/${orgSlug}`
  if (isLandingPage) return null

  const menuItems = [
    { name: "דף הבית", href: `/academy/${orgSlug}/home`, icon: Home },
    { name: "הקורסים שלי", href: `/academy/${orgSlug}/courses`, icon: BookOpen },
    { name: "הודעות", href: `/academy/${orgSlug}/messages`, icon: Mail },
    { name: "יצירת קשר", href: `/academy/${orgSlug}/contact`, icon: MessageSquare },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success("התנתקת בהצלחה")
    router.push(`/academy/${orgSlug}`)
    router.refresh()
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground)/0.6)]">
      <div className="p-6">
        <Link href={`/academy/${orgSlug}/home`} className="flex items-center gap-3 group">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt="Logo" 
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold">
              {orgSlug[0].toUpperCase()}
            </div>
          )}
        </Link>
      </div>
      
      <nav className="flex-1 px-3 py-2 space-y-1 mt-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group relative overflow-hidden",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "hover:bg-white/5 hover:text-[hsl(var(--sidebar-foreground)/0.9)]"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-colors",
                isActive ? "text-primary" : "text-[hsl(var(--sidebar-foreground)/0.5)] group-hover:text-[hsl(var(--sidebar-foreground)/0.8)]"
              )} />
              <span className={cn(
                "font-medium text-sm tracking-tight transition-colors",
                isActive ? "font-bold text-[hsl(var(--sidebar-foreground))]" : ""
              )}>{item.name}</span>
              {isActive && (
                <div className="mr-auto w-1 h-4 bg-primary rounded-full" />
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )

  return (
    <header className="h-16 border-b bg-white/80 backdrop-blur-md flex items-center justify-between px-6 md:px-8 sticky top-0 z-40 shadow-sm border-slate-100/50" dir="rtl">
      <div className="flex items-center gap-5">
        <div className="flex lg:hidden items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-slate-50 rounded-lg w-9 h-9">
                <Menu className="w-5 h-5 text-slate-600" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-60 border-l-0">
              {sidebarContent}
            </SheetContent>
          </Sheet>
          
          <Link href={`/academy/${orgSlug}/home`} className="flex items-center gap-2">
            <img 
              src="https://misi.site/wp-content/uploads/2026/01/ICON.png" 
              alt="Icon" 
              className="w-7 h-7 object-contain"
            />
          </Link>
        </div>
        
        <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 bg-slate-50/50 rounded-lg border border-slate-100">
          <span className="text-[9px] font-bold opacity-40 uppercase tracking-widest text-foreground">פורטל תלמיד</span>
          <div className="w-1 h-1 rounded-full bg-slate-300" />
          <span className="text-xs font-bold tracking-tight text-foreground">
            {menuItems.find(item => pathname === item.href)?.name || "סקירה"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Popover dir="rtl">
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-lg h-9 w-9 text-slate-500 hover:bg-slate-50 hover:text-primary transition-all relative">
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 border-2 border-white rounded-full animate-pulse" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0 rounded-[1.5rem] shadow-2xl border-slate-100 overflow-hidden">
            <Tabs defaultValue="notifications" className="w-full">
              <div className="p-4 bg-primary/5 border-b border-slate-50 flex items-center justify-between">
                <TabsList className="bg-transparent border-0 p-0 gap-4 h-auto">
                  <TabsTrigger 
                    value="notifications" 
                    className="p-0 bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none font-black text-xs text-slate-400 data-[state=active]:text-slate-700 relative transition-all"
                  >
                    עדכונים
                    {initialNotifications.some(n => !n.is_read) && (
                      <span className="absolute -top-1 -right-2 w-1.5 h-1.5 bg-primary rounded-full" />
                    )}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="messages" 
                    className="p-0 bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none font-black text-xs text-slate-400 data-[state=active]:text-slate-700 relative transition-all"
                  >
                    הודעות
                    {initialMessages.some(m => !m.isRead) && (
                      <span className="absolute -top-1 -right-2 w-1.5 h-1.5 bg-primary rounded-full" />
                    )}
                  </TabsTrigger>
                </TabsList>
                {unreadCount > 0 && (
                  <Badge className="bg-primary text-white text-[9px] font-black">{unreadCount} חדשות</Badge>
                )}
              </div>

              <TabsContent value="notifications" className="m-0">
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  {initialNotifications.length > 0 ? (
                    initialNotifications.map((notif) => (
                      <button
                        key={notif.id}
                        onClick={async () => {
                          if (!notif.is_read) await markNotificationAsRead(notif.id);
                          
                          // If it's a message, open the viewer dialog directly
                          if (notif.type === 'message' && notif.target_id) {
                            const msg = initialMessages.find(m => m.id === notif.target_id);
                            if (msg) {
                              handleOpenMessage(msg);
                              return;
                            }
                          }
                          
                          if (notif.link) router.push(notif.link);
                        }}
                        className={cn(
                            "w-full text-right p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 relative group",
                            !notif.is_read && "bg-primary/5"
                        )}
                      >
                        {!notif.is_read && (
                            <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                        <h5 className={cn(
                            "text-xs mb-1 line-clamp-1",
                            !notif.is_read ? "font-black text-slate-900" : "font-bold text-slate-600"
                        )}>
                            {notif.title}
                        </h5>
                        {notif.content && (
                          <p className="text-[10px] text-slate-500 line-clamp-2 mb-2 font-medium">{notif.content}</p>
                        )}
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 font-bold">
                                {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: he })}
                            </span>
                            {!notif.is_read && <span className="text-[9px] text-primary font-black">חדש</span>}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-xs font-bold text-slate-400">אין עדכונים חדשים</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="messages" className="m-0">
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  {initialMessages.length > 0 ? (
                    initialMessages.map((msg) => (
                      <button
                        key={msg.id}
                        onClick={() => handleOpenMessage(msg)}
                        className={cn(
                            "w-full text-right p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 relative group",
                            !msg.isRead && "bg-primary/5"
                        )}
                      >
                        {!msg.isRead && (
                            <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                        <h5 className={cn(
                            "text-xs mb-1 line-clamp-1",
                            !msg.isRead ? "font-black text-slate-900" : "font-bold text-slate-600"
                        )}>
                            {msg.subject}
                        </h5>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 font-bold">
                                {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: he })}
                            </span>
                            {!msg.isRead && <span className="text-[9px] text-primary font-black">חדש</span>}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-xs font-bold text-slate-400">אין הודעות חדשות</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            <Button 
                variant="ghost" 
                className="w-full rounded-none h-12 text-[10px] font-black text-slate-400 hover:text-primary border-t border-slate-50"
                asChild
            >
                <Link href={`/academy/${orgSlug}/messages`}>לכל ההודעות והעדכונים</Link>
            </Button>
          </PopoverContent>
        </Popover>

        <MessageViewerDialog 
          message={selectedMessage}
          open={isViewerOpen}
          onOpenChange={setIsViewerOpen}
        />
        
        <div className="w-px h-6 bg-slate-100 mx-1" />
        
        <DropdownMenu dir="rtl">
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 p-1 rounded-lg hover:bg-slate-50 transition-all h-auto group">
              <Avatar className="w-8 h-8 rounded shadow-sm border border-slate-100 transition-transform group-hover:scale-105">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/5 text-primary font-bold rounded text-xs">
                  {userName.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start text-right">
                <span className="font-bold text-sm tracking-tight leading-none text-foreground">{userName}</span>
                <span className="text-[10px] opacity-50 font-bold uppercase tracking-widest mt-1 text-foreground">{userRole}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-xl mt-2 shadow-xl border-slate-100">
            <DropdownMenuLabel className="px-3 py-2 font-bold text-slate-400 text-[9px] uppercase tracking-widest">החשבון שלי</DropdownMenuLabel>
            
            <DropdownMenuItem 
              className={cn(
                "rounded-lg py-2 gap-2.5 transition-all group",
                hasMultipleAcademies 
                  ? "focus:bg-slate-50 cursor-pointer" 
                  : "opacity-50 cursor-not-allowed"
              )}
              onClick={() => hasMultipleAcademies && router.push('/select-academy')}
              disabled={!hasMultipleAcademies}
            >
              <LayoutGrid className="w-4 h-4 text-slate-500" />
              <span className="text-sm">המכללות שלי</span>
            </DropdownMenuItem>

            <DropdownMenuItem 
              className="rounded-lg py-2 gap-2.5 focus:bg-slate-50 cursor-pointer"
              onClick={() => router.push(`/academy/${orgSlug}/settings`)}
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span className="text-sm">פרופיל והגדרות</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem 
              className="rounded-lg py-2 gap-2.5 text-rose-600 focus:bg-rose-50 focus:text-rose-600 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-bold">התנתקות</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

