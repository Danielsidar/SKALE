import React from "react"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { BrandingForm } from "@/components/branding/branding-form"
import { getActiveProfile } from "@/lib/auth-utils"

export default async function BrandingPage() {
  const supabase = createClient(cookies())
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const profile = await getActiveProfile()
  
  const organization = profile?.organizations as any

  const initialData = {
    primaryColor: organization?.primary_color || "#3b82f6",
    sidebarColor: organization?.sidebar_color || "#020617",
    logoUrl: organization?.logo_url || null,
    academyName: organization?.name || "האקדמיה שלי"
  }

  return <BrandingForm initialData={initialData} />
}
