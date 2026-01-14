"use client"

import React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTabs } from "@/lib/tabs-context"
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Palette, 
  Settings, 
  ExternalLink,
  Bell,
  ChevronDown,
  Menu,
  X,
  User,
  LogOut,
  ChevronRight,
  ChevronLeft,
  MessageSquarePlus
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
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
import { SendMessageDialog } from "@/components/academy/send-message-dialog"

const sidebarItems = [
  { name: "סקירה", href: "/overview", icon: LayoutDashboard },
  { name: "קורסים", href: "/courses", icon: BookOpen },
  { name: "סטודנטים", href: "/students", icon: Users },
  { name: "תזכורות", href: "/reminders", icon: Bell },
  { name: "מיתוג", href: "/branding", icon: Palette },
  { name: "הגדרות", href: "/settings", icon: Settings },
]

interface SidebarProps {
  orgSlug?: string | null
  orgName?: string | null
}

export function Sidebar({ orgSlug: propOrgSlug, orgName: propOrgName }: SidebarProps) {
  const pathname = usePathname()
  const { addTab } = useTabs()
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  
  // Persist collapse state
  React.useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed")
    if (saved !== null) {
      setIsCollapsed(saved === "true")
    }
  }, [])

  const handleToggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem("sidebar-collapsed", String(newState))
  }

  const [stateOrgSlug, setStateOrgSlug] = React.useState<string | null>(null)
  const [stateOrgName, setStateOrgName] = React.useState<string | null>(null)
  const supabase = createClient()

  const orgSlug = propOrgSlug || stateOrgSlug
  const orgName = propOrgName || stateOrgName

  React.useEffect(() => {
    if (propOrgSlug && propOrgName) return

    async function fetchOrg() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*, organizations(*)')
        .eq('id', user.id)
      
      const activeOrgId = document.cookie
        .split('; ')
        .find(row => row.startsWith('active_org_id='))
        ?.split('=')[1]

      const activeProfile = profiles?.find((p: any) => p.organization_id === activeOrgId) || profiles?.[0]
      
      if (activeProfile?.organizations) {
        const org = Array.isArray(activeProfile.organizations) 
          ? activeProfile.organizations[0] 
          : activeProfile.organizations
        setStateOrgSlug(org?.slug || null)
        setStateOrgName(org?.name || null)
      }
    }
    fetchOrg()
  }, [propOrgSlug, propOrgName])

  const handleTabClick = (item: typeof sidebarItems[0]) => {
    addTab({
      id: item.href.replace("/", ""),
      title: item.name,
      href: item.href,
      icon: item.icon
    })
  }

  const content = (
    <div className="flex flex-col h-full bg-[#020617] text-slate-400 overflow-hidden">
      <div className={cn("p-6 pt-10", isCollapsed && "px-4")}>
        <div className={cn(
          "flex items-center font-bold text-lg text-white",
          isCollapsed ? "justify-center" : "justify-center"
        )}>
          <div className="flex items-center justify-center overflow-hidden w-full">
            {isCollapsed ? (
              <img 
                src="https://misi.site/wp-content/uploads/2026/01/ICON.png" 
                alt="Icon" 
                className="w-10 h-10 min-w-10 shrink-0 object-contain"
              />
            ) : (
              <img 
                src="https://misi.site/wp-content/uploads/2026/01/Logo.png" 
                alt="Logo" 
                className="h-14 w-auto max-w-[160px] object-contain"
              />
            )}
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-3 space-y-1 mt-2">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <button
              key={item.href}
              onClick={() => handleTabClick(item)}
              title={isCollapsed ? item.name : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative w-full text-right",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "hover:bg-white/5 hover:text-slate-200",
                isCollapsed ? "justify-center px-0" : ""
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-colors shrink-0",
                isActive ? "text-primary" : "text-slate-500 group-hover:text-slate-300"
              )} />
              {!isCollapsed && (
                <span className={cn(
                  "font-medium text-sm tracking-tight truncate",
                  isActive ? "font-bold" : ""
                )}>{item.name}</span>
              )}
              {isActive && !isCollapsed && (
                <div className="mr-auto w-1 h-4 bg-primary rounded-full" />
              )}
            </button>
          )
        })}
      </nav>

      <div className={cn("p-4 border-t border-slate-900", isCollapsed && "px-2")}>
        <Button 
          variant="ghost" 
          className={cn(
            "w-full justify-start gap-3 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg h-10 px-3 transition-colors",
            isCollapsed && "justify-center px-0"
          )} 
          asChild
          disabled={!orgSlug}
        >
          {orgSlug ? (
            <a href={`/academy/${orgSlug}/home`} target="_blank" rel="noopener noreferrer" className={cn("flex items-center gap-3 w-full h-full", isCollapsed && "justify-center px-0")}>
              <ExternalLink className="w-4 h-4 text-slate-500 shrink-0" />
              {!isCollapsed && <span className="font-medium text-sm truncate">האקדמיה שלי</span>}
            </a>
          ) : (
            <div className={cn("flex items-center gap-3 opacity-50 cursor-not-allowed", isCollapsed && "justify-center px-0")}>
              <ExternalLink className="w-4 h-4 text-slate-500 shrink-0" />
              {!isCollapsed && <span className="font-medium text-sm truncate">האקדמיה שלי (טוען...)</span>}
            </div>
          )}
        </Button>
      </div>
    </div>
  )

  return (
    <aside className={cn(
      "hidden lg:flex bg-[#020617] border-l border-slate-900 flex-col h-full sticky top-0 right-0 z-50 transition-all duration-300 ease-in-out relative shrink-0 self-start",
      isCollapsed ? "w-20" : "w-60"
    )}>
      {/* Floating Toggle Button */}
      <Button
        variant="secondary"
        size="icon"
        onClick={handleToggleCollapse}
        className="absolute top-10 -left-3 h-6 w-6 rounded-full border border-slate-800 bg-[#020617] text-slate-400 hover:text-white hover:bg-slate-800 shadow-xl z-[60] p-0"
      >
        {isCollapsed ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </Button>

      {content}
    </aside>
  )
}

interface TopBarProps {
  initialProfile?: any
  orgSlug?: string | null
  orgName?: string | null
}

export function TopBar({ initialProfile, orgSlug, orgName }: TopBarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [stateProfile, setStateProfile] = React.useState<any>(null)
  const [isMessageDialogOpen, setIsMessageDialogOpen] = React.useState(false)
  const [messageMode, setMessageMode] = React.useState<'all' | 'courses'>('all')
  const supabase = createClient()

  const profile = initialProfile || stateProfile

  const handleOpenMessageDialog = (mode: 'all' | 'courses') => {
    setMessageMode(mode)
    setIsMessageDialogOpen(true)
  }

  React.useEffect(() => {
    if (initialProfile) return

    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*, organizations(*)')
        .eq('id', user.id)
      
      const activeOrgId = document.cookie
        .split('; ')
        .find(row => row.startsWith('active_org_id='))
        ?.split('=')[1]

      const activeProfile = profiles?.find((p: any) => p.organization_id === activeOrgId) || profiles?.[0]
      
      setStateProfile(activeProfile)
    }
    fetchProfile()
  }, [initialProfile])

  const initials = profile?.name ? profile.name.split(" ").map((n: string) => n[0]).join("") : "דס"
  
  const org = profile?.organizations 
    ? (Array.isArray(profile.organizations) ? profile.organizations[0] : profile.organizations)
    : null
    
  const currentOrgName = orgName || org?.name || "האקדמיה שלי"
  const orgInitials = currentOrgName.substring(0, 2).toUpperCase()

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 md:px-8 sticky top-0 z-40 border-b border-slate-100 shadow-sm">
      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden hover:bg-slate-50 rounded-lg w-9 h-9">
              <Menu className="w-5 h-5 text-slate-600" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-0 w-60 border-l-0">
            <Sidebar orgSlug={orgSlug || org?.slug} orgName={orgName || org?.name} />
          </SheetContent>
        </Sheet>

        <div className="hidden md:flex items-center gap-3 px-3 py-1.5 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
          <div className="w-7 h-7 bg-slate-100 rounded flex items-center justify-center text-[10px] font-bold text-slate-600">
            {orgInitials}
          </div>
          <span className="text-sm font-medium text-slate-700">{currentOrgName}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu dir="rtl">
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-lg h-9 w-9 text-slate-500 hover:bg-slate-50 hover:text-primary transition-all relative"
              title="שלח הודעה חדשה"
            >
              <MessageSquarePlus className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 p-1.5 rounded-xl mt-2 shadow-xl border-slate-100">
            <DropdownMenuLabel className="px-3 py-2 font-bold text-slate-400 text-[9px] uppercase tracking-widest">שליחת הודעה</DropdownMenuLabel>
            <DropdownMenuItem 
              className="rounded-lg py-2.5 gap-2.5 focus:bg-slate-50 cursor-pointer"
              onClick={() => handleOpenMessageDialog('all')}
            >
              <Users className="w-4 h-4 text-slate-500" />
              <div className="flex flex-col">
                <span className="text-sm font-bold">לכל התלמידים</span>
                <span className="text-[10px] text-slate-400">הודעה כללית לכלל חברי האקדמיה</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="rounded-lg py-2.5 gap-2.5 focus:bg-slate-50 cursor-pointer"
              onClick={() => handleOpenMessageDialog('courses')}
            >
              <BookOpen className="w-4 h-4 text-slate-500" />
              <div className="flex flex-col">
                <span className="text-sm font-bold">לקורסים ספציפיים</span>
                <span className="text-[10px] text-slate-400">הודעה ממוקדת לתלמידים בקורסים נבחרים</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="rounded-lg h-9 w-9 text-slate-500 hover:bg-slate-50 hover:text-primary transition-all relative">
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 border-2 border-white rounded-full" />
        </Button>
        
        <div className="w-px h-6 bg-slate-100 mx-1" />
        
        <SendMessageDialog 
          open={isMessageDialogOpen} 
          onOpenChange={setIsMessageDialogOpen} 
          orgSlug={orgSlug || ""} 
          mode={messageMode}
        />
        
        <DropdownMenu dir="rtl">
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 p-1 rounded-lg hover:bg-slate-50 transition-all h-auto">
              <Avatar className="w-8 h-8 border border-slate-100 rounded-lg shadow-sm">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/5 text-primary font-bold rounded-lg text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start text-right">
                <span className="font-bold text-sm text-slate-800 tracking-tight leading-none">{profile?.name || "טוען..."}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{profile?.role === 'admin' ? 'מנהל מערכת' : 'צוות'}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-xl mt-2 shadow-xl border-slate-100">
            <DropdownMenuLabel className="px-3 py-2 font-bold text-slate-400 text-[9px] uppercase tracking-widest">ניהול חשבון</DropdownMenuLabel>
            <DropdownMenuItem 
              className="rounded-lg py-2 gap-2.5 focus:bg-slate-50 cursor-pointer"
              onClick={() => router.push("/settings")}
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span className="text-sm">פרופיל והגדרות</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem 
              className="rounded-lg py-2 gap-2.5 text-rose-600 focus:bg-rose-50 focus:text-rose-600 cursor-pointer"
              onClick={async () => {
                await supabase.auth.signOut()
                window.location.href = "/login"
              }}
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

