"use client"

import React from "react"
import { useTabs } from "@/lib/tabs-context"
import { cn } from "@/lib/utils"
import { X, FileText, LayoutDashboard, BookOpen, Users, ShieldCheck, Palette, Settings, Loader2 } from "lucide-react"

const iconMap: Record<string, any> = {
  overview: LayoutDashboard,
  courses: BookOpen,
  students: Users,
  permissions: ShieldCheck,
  branding: Palette,
  settings: Settings,
}

export function TabBar() {
  const { tabs, activeTabId, isNavigating, navigatingTo, removeTab, setActiveTab } = useTabs()

  if (tabs.length === 0) return null

  return (
    <div className="bg-slate-50/80 backdrop-blur-sm px-4 flex items-center gap-1 overflow-x-auto no-scrollbar sticky top-16 z-30 h-12" dir="rtl">
      {tabs.map((tab) => {
        const Icon = tab.icon || iconMap[tab.id] || iconMap[tab.id.split('-')[0]] || FileText
        const isActive = activeTabId === tab.id
        const isLoading = isActive && isNavigating && navigatingTo === tab.title

        return (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] transition-all relative group cursor-pointer",
              isActive 
                ? "bg-white text-slate-900 shadow-sm font-semibold" 
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 shrink-0 text-primary animate-spin" />
            ) : (
              <Icon className={cn(
                "w-3.5 h-3.5 shrink-0 transition-colors",
                isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-500"
              )} />
            )}
            <span className="truncate max-w-[120px]">{tab.title}</span>
            
            {tab.closable && !isLoading && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeTab(tab.id)
                }}
                className={cn(
                  "p-0.5 rounded transition-all ms-0.5 -me-1",
                  isActive 
                    ? "text-slate-400 hover:bg-slate-100 hover:text-slate-600" 
                    : "text-slate-300 opacity-0 group-hover:opacity-100 hover:text-slate-500"
                )}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

