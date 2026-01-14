import React from "react"
import { getAcademyMessages } from "@/app/actions/messages"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { MessagesView } from "@/components/academy/messages-view"

export default async function AcademyMessagesPage({ params }: { params: { orgSlug: string } }) {
  const { orgSlug } = params
  const supabase = createClient(cookies())
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const messages = await getAcademyMessages(orgSlug)

  const { data: organization } = await supabase
    .from('organizations')
    .select('name')
    .eq('slug', orgSlug)
    .single()

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto w-full pb-24 text-right">
      <div className="space-y-1 mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">הודעות ועדכונים</h1>
        <p className="text-slate-500 font-bold text-sm">כל העדכונים החשובים מהאקדמיה של {organization?.name}</p>
      </div>

      <MessagesView initialMessages={messages} />
    </div>
  )
}


