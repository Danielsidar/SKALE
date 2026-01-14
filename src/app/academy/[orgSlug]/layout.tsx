import React from "react"
import Link from "next/link"
import { 
  LogOut, 
  User, 
  Settings,
  ChevronDown,
  BookOpen,
  Home,
  Bell,
  MessageSquare,
  Menu
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
import { cn, hexToHsl, getContrastColor } from "@/lib/utils"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { AcademySidebar } from "@/components/academy/academy-sidebar"
import { AcademyHeader } from "@/components/academy/academy-header"
import { getAcademyMessages } from "@/app/actions/messages"
import { getNotifications } from "@/app/actions/notifications"

// Prevent static generation - requires cookies/auth
export const dynamic = 'force-dynamic'

export default async function AcademyLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { orgSlug: string }
}) {
  const { orgSlug } = params
  const supabase = createClient(cookies())

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <>{children}</> // Should be handled by middleware or page itself

  const { data: organization } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', orgSlug)
    .single()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .eq('organization_id', organization?.id)
    .single()

  const messages = await getAcademyMessages(orgSlug)
  const notifications = await getNotifications(orgSlug)
  
  const unreadMessagesCount = messages.filter(m => !m.isRead).length
  const unreadNotificationsCount = notifications.filter(n => !n.is_read).length
  const totalUnreadCount = unreadMessagesCount + unreadNotificationsCount

  // Fetch all profiles for this user to check if they have multiple academies
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)

  const hasMultipleAcademies = (allProfiles?.length || 0) > 1

  // Extract branding colors
  const primaryHex = organization?.primary_color || "#3b82f6"
  const sidebarHex = organization?.sidebar_color || "#020617"
  
  const primaryHsl = hexToHsl(primaryHex)
  const sidebarHsl = hexToHsl(sidebarHex)
  
  const primaryForeground = getContrastColor(primaryHex)
  const sidebarForeground = getContrastColor(sidebarHex)

  return (
    <div className="h-screen bg-slate-50/50 flex font-assistant overflow-hidden" dir="rtl">
      {/* Inject custom branding variables */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --primary: ${primaryHsl};
          --primary-foreground: ${primaryForeground};
          --sidebar: ${sidebarHsl};
          --sidebar-foreground: ${sidebarForeground};
          --ring: ${primaryHsl};
        }
      `}} />

      <AcademySidebar 
        orgSlug={orgSlug} 
        organizationName={organization?.name || "האקדמיה"} 
        logoUrl={organization?.logo_url}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full">
        <AcademyHeader 
          orgSlug={orgSlug} 
          userName={profile?.name || user.email?.split('@')[0] || "סטודנט"} 
          userRole={profile?.role === 'student' ? 'תלמיד מן המניין' : profile?.role === 'support' ? 'תמיכה' : 'מנהל'}
          hasMultipleAcademies={hasMultipleAcademies}
          logoUrl={organization?.logo_url}
          unreadCount={totalUnreadCount}
          initialMessages={messages}
          initialNotifications={notifications}
        />

        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  )
}
