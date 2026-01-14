'use client'

import React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageViewerDialog } from "./message-viewer-dialog"
import { formatDistanceToNow } from "date-fns"
import { he } from "date-fns/locale"

interface AcademyMessagesListProps {
  initialMessages: any[]
  orgName: string
}

export function AcademyMessagesList({ initialMessages, orgName }: AcademyMessagesListProps) {
  const [selectedMessage, setSelectedMessage] = React.useState<any | null>(null)
  const [isViewerOpen, setIsViewerOpen] = React.useState(false)

  const handleOpenMessage = (msg: any) => {
    setSelectedMessage(msg)
    setIsViewerOpen(true)
  }

  return (
    <>
      <Card className="border border-slate-100 shadow-sm rounded-xl bg-white overflow-hidden">
        <CardHeader className="p-5 pb-2 border-b border-slate-50">
          <CardTitle className="text-base font-bold text-slate-800 text-right">הודעות מהאקדמיה</CardTitle>
          <CardDescription className="font-medium text-slate-400 text-[10px] text-right">עדכונים אחרונים מהצוות</CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-4 space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
          {initialMessages.length > 0 ? (
            initialMessages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => handleOpenMessage(msg)}
                className="w-full text-right bg-slate-50/50 p-3.5 rounded-xl border border-slate-100 space-y-1.5 relative overflow-hidden group hover:border-primary/20 hover:bg-slate-50 transition-all"
              >
                <div className="flex items-center justify-between">
                  {!msg.isRead && (
                    <Badge variant="secondary" className="bg-primary text-white border-none font-bold text-[8px] px-1.5 py-0 rounded">חדש</Badge>
                  )}
                  <span className="text-[8px] font-bold text-slate-400 mr-auto">
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: he })}
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 tracking-tight leading-snug text-xs group-hover:text-primary transition-colors line-clamp-1">
                    {msg.subject}
                </h4>
                <div 
                    className="text-[10px] font-medium text-slate-500 leading-relaxed line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: msg.content.substring(0, 100) }}
                />
              </button>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-xs font-bold text-slate-400">אין הודעות חדשות</p>
            </div>
          )}
        </CardContent>
      </Card>

      <MessageViewerDialog 
        message={selectedMessage}
        open={isViewerOpen}
        onOpenChange={setIsViewerOpen}
      />
    </>
  )
}


