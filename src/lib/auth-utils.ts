import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"

export async function getActiveProfile() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const activeOrgId = cookies().get('active_org_id')?.value

  let query = supabase
    .from('profiles')
    .select('*, organizations(*)')
    .eq('id', user.id)

  if (activeOrgId) {
    query = query.eq('organization_id', activeOrgId)
  }

  const { data: profiles } = await query

  if (!profiles || profiles.length === 0) {
    // Fallback to first profile if activeOrgId didn't match or not set
    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('*, organizations(*)')
      .eq('id', user.id)
    
    return allProfiles?.[0] || null
  }

  return profiles[0]
}

