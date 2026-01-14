"use client"

import React, { createContext, useContext, useState, useEffect, useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"

export interface Tab {
  id: string
  title: string
  href: string
  icon?: any
  closable?: boolean
}

interface TabsContextType {
  tabs: Tab[]
  activeTabId: string
  isNavigating: boolean
  navigatingTo: string | null
  addTab: (tab: Omit<Tab, 'closable'>) => void
  removeTab: (id: string) => void
  setActiveTab: (id: string) => void
  updateTabTitle: (id: string, title: string) => void
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

export function TabsProvider({ children }: { children: React.ReactNode }) {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: "overview", title: "סקירה", href: "/overview", closable: false }
  ])
  const [activeTabId, setActiveTabId] = useState("overview")
  const [isNavigating, startTransition] = useTransition()
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  const updateTabTitle = (id: string, title: string) => {
    setTabs(prev => prev.map(t => t.id === id || t.href === id ? { ...t, title } : t))
  }

  // Clear navigating state when pathname changes
  useEffect(() => {
    setNavigatingTo(null)
  }, [pathname])

  // Sync active tab with pathname and add tab if it doesn't exist
  useEffect(() => {
    const existingTab = tabs.find(t => t.href === pathname)
    if (existingTab) {
      setActiveTabId(existingTab.id)
    } else {
      // Try to determine a title for the new tab
      let title = "דף חדש"
      let id = pathname.replace(/^\/+/, "").replace(/\//g, "-") || "overview"
      
      if (pathname === "/overview") title = "סקירה"
      else if (pathname === "/courses") title = "קורסים"
      else if (pathname.startsWith("/courses/")) {
        title = "עריכת קורס"
      }
      else if (pathname === "/students") title = "סטודנטים"
      else if (pathname === "/permissions") title = "הרשאות"
      else if (pathname === "/branding") title = "מיתוג"
      else if (pathname === "/settings") title = "הגדרות"
      
      setTabs(prev => {
        const finalId = prev.some(t => t.id === id) ? `${id}-${Date.now()}` : id
        setActiveTabId(finalId)
        return [...prev, { id: finalId, title, href: pathname, closable: true }]
      })
    }
  }, [pathname])

  const addTab = (newTab: Omit<Tab, 'closable'>) => {
    const exists = tabs.find(t => t.id === newTab.id || t.href === newTab.href)
    if (exists) {
      // Immediately set active tab
      setActiveTabId(exists.id)
      if (pathname !== exists.href) {
        setNavigatingTo(exists.title)
        startTransition(() => {
          router.push(exists.href)
        })
      }
      return
    }

    const tabWithClose = { ...newTab, closable: true }
    setTabs(prev => [...prev, tabWithClose])
    // Immediately set active tab
    setActiveTabId(newTab.id)
    setNavigatingTo(newTab.title)
    startTransition(() => {
      router.push(newTab.href)
    })
  }

  const removeTab = (id: string) => {
    const tabToRemove = tabs.find(t => t.id === id)
    if (!tabToRemove || !tabToRemove.closable) return

    const newTabs = tabs.filter(t => t.id !== id)
    setTabs(newTabs)

    if (activeTabId === id) {
      const lastTab = newTabs[newTabs.length - 1]
      setActiveTabId(lastTab.id)
      startTransition(() => {
        router.push(lastTab.href)
      })
    }
  }

  const setActiveTab = (id: string) => {
    const tab = tabs.find(t => t.id === id)
    if (tab) {
      // Immediately set active tab
      setActiveTabId(id)
      if (pathname !== tab.href) {
        setNavigatingTo(tab.title)
        startTransition(() => {
          router.push(tab.href)
        })
      }
    }
  }

  return (
    <TabsContext.Provider value={{ tabs, activeTabId, isNavigating, navigatingTo, addTab, removeTab, setActiveTab, updateTabTitle }}>
      {children}
    </TabsContext.Provider>
  )
}

export function useTabs() {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error("useTabs must be used within a TabsProvider")
  }
  return context
}

