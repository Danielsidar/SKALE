"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  BookOpen, 
  Home, 
  MessageSquare,
  Mail,
  ChevronRight,
  ChevronLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AcademySidebarProps {
  orgSlug: string
  organizationName: string
  logoUrl?: string | null
}

export function AcademySidebar({ orgSlug, organizationName, logoUrl }: AcademySidebarProps) {
  const pathname = usePathname()
  const isLessonPage = pathname.includes("/lessons/")
  const [isCollapsed, setIsCollapsed] = React.useState(isLessonPage)

  // Persist collapse state
  React.useEffect(() => {
    // On lesson pages, we want it collapsed by default regardless of saved state
    // unless the user has already interacted with it in this session? 
    // Actually, "default" usually means initial state.
    if (isLessonPage) {
      setIsCollapsed(true)
      return
    }

    const saved = localStorage.getItem("academy-sidebar-collapsed")
    if (saved !== null) {
      setIsCollapsed(saved === "true")
    }
  }, [isLessonPage])

  const handleToggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem("academy-sidebar-collapsed", String(newState))
  }

  // Sidebar should be hidden only on the landing/login page
  const isLandingPage = pathname === `/academy/${orgSlug}`
  if (isLandingPage) return null

  const menuItems = [
    { name: "דף הבית", href: `/academy/${orgSlug}/home`, icon: Home },
    { name: "הקורסים שלי", href: `/academy/${orgSlug}/courses`, icon: BookOpen },
    { name: "הודעות", href: `/academy/${orgSlug}/messages`, icon: Mail },
    { name: "יצירת קשר", href: `/academy/${orgSlug}/contact`, icon: MessageSquare },
  ]

  return (
    <aside className={cn(
      "hidden lg:flex border-l border-slate-900 bg-[hsl(var(--sidebar))] flex-col h-full sticky top-0 right-0 z-50 transition-all duration-300 ease-in-out relative shrink-0 self-start",
      isCollapsed ? "w-20" : "w-60"
    )}>
      {/* Floating Toggle Button */}
      <Button
        variant="secondary"
        size="icon"
        onClick={handleToggleCollapse}
        className="absolute top-10 -left-3 h-6 w-6 rounded-full border border-slate-800 bg-[hsl(var(--sidebar))] text-slate-400 hover:text-white hover:bg-slate-800 shadow-xl z-[60] p-0"
      >
        {isCollapsed ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </Button>

      <div className="flex flex-col h-full text-[hsl(var(--sidebar-foreground)/0.6)] overflow-hidden">
        <div className={cn("p-6 pt-10", isCollapsed && "px-4")}>
          <div className="flex items-center justify-center font-bold text-lg text-[hsl(var(--sidebar-foreground))]">
            <Link href={`/academy/${orgSlug}/home`} className="flex items-center justify-center group overflow-hidden w-full">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={organizationName} 
                  className={cn(
                    "object-contain transition-all duration-300",
                    isCollapsed ? "w-10 h-10" : "h-14 w-auto max-w-[160px]"
                  )}
                />
              ) : (
                <div className={cn(
                  "bg-primary rounded-lg flex items-center justify-center text-[hsl(var(--primary-foreground))] font-bold transition-all shadow-lg shadow-primary/20",
                  isCollapsed ? "w-10 h-10 text-xl" : "w-14 h-14 text-2xl"
                )}>
                  {organizationName[0].toUpperCase()}
                </div>
              )}
            </Link>
          </div>
        </div>
        
        <nav className="flex-1 px-3 py-2 space-y-1 mt-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative overflow-hidden",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "hover:bg-white/5 hover:text-[hsl(var(--sidebar-foreground)/0.9)]",
                  isCollapsed ? "justify-center px-0" : ""
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-colors shrink-0",
                  isActive ? "text-primary" : "text-[hsl(var(--sidebar-foreground)/0.5)] group-hover:text-[hsl(var(--sidebar-foreground)/0.8)]"
                )} />
                {!isCollapsed && (
                  <span className={cn(
                    "font-medium text-sm tracking-tight transition-colors truncate",
                    isActive ? "font-bold text-[hsl(var(--sidebar-foreground))]" : ""
                  )}>{item.name}</span>
                )}
                {isActive && !isCollapsed && (
                  <div className="mr-auto w-1 h-4 bg-primary rounded-full" />
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

