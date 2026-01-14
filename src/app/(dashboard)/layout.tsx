import React from "react"
import { redirect } from "next/navigation"
import { Sidebar, TopBar } from "@/components/dashboard-nav"
import { TabBar } from "@/components/tab-bar"
import { TabsProvider } from "@/lib/tabs-context"
import { TabLoadingOverlay } from "@/components/tab-loading-overlay"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { getActiveProfile } from "@/lib/auth-utils"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const profile = await getActiveProfile()

  // Extra logging or debugging if needed, but let's just be careful with the org extraction
  const organizationData = profile?.organizations
  const org = organizationData 
    ? (Array.isArray(organizationData) ? organizationData[0] : organizationData)
    : null
  
  const orgSlug = org?.slug
  const orgName = org?.name

  if (profile && profile.role === 'student') {
    if (orgSlug) {
      redirect(`/academy/${orgSlug}/home`)
    }
    redirect("/login")
  }

  return (
    <TabsProvider>
      <div className="flex h-screen bg-background overflow-hidden" dir="rtl">
        <Sidebar orgSlug={orgSlug} orgName={orgName} />
        <div className="flex-1 flex flex-col min-w-0 h-full">
          <TopBar initialProfile={profile} orgSlug={orgSlug} orgName={orgName} />
          <TabBar />
          <main className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
            <TabLoadingOverlay />
            {children}
          </main>
        </div>
      </div>
    </TabsProvider>
  )
}

