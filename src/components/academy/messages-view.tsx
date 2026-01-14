'use client'

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageViewerDialog } from "./message-viewer-dialog"
import { format } from "date-fns"
import { he } from "date-fns/locale"
import { Mail, MailOpen, Calendar, User, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface MessagesViewProps {
  initialMessages: any[]
}

export function MessagesView({ initialMessages }: MessagesViewProps) {
  const [selectedMessage, setSelectedMessage] = React.useState<any | null>(null)
  const [isViewerOpen, setIsViewerOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredMessages = initialMessages.filter(msg => 
    msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleOpenMessage = (msg: any) => {
    setSelectedMessage(msg)
    setIsViewerOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input 
          placeholder="חפש הודעות..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded-xl border-slate-200 pr-10 h-11 bg-white shadow-sm"
        />
      </div>

      <div className="grid gap-4">
        {filteredMessages.length > 0 ? (
          filteredMessages.map((msg) => (
            <Card 
              key={msg.id} 
              className={cn(
                "overflow-hidden border border-slate-100 hover:shadow-md transition-all cursor-pointer group rounded-2xl",
                !msg.isRead ? "bg-primary/[0.02] border-primary/10" : "bg-white"
              )}
              onClick={() => handleOpenMessage(msg)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-3",
                        !msg.isRead ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-slate-100 text-slate-400"
                    )}>
                        {!msg.isRead ? <Mail className="w-6 h-6" /> : <MailOpen className="w-6 h-6" />}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className={cn(
                          "text-lg tracking-tight",
                          !msg.isRead ? "font-black text-slate-900" : "font-bold text-slate-600"
                        )}>
                          {msg.subject}
                        </h3>
                        {!msg.isRead && (
                          <Badge className="bg-primary text-white text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded">חדש</Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          <span>מאת: {msg.sender?.name || "צוות האקדמיה"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{format(new Date(msg.created_at), "d MMMM yyyy", { locale: he })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className="text-xs text-slate-500 line-clamp-2 md:max-w-xs md:text-left font-medium leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: msg.content.substring(0, 150) }}
                  />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 border-dashed">
            <Mail className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold">לא נמצאו הודעות</p>
          </div>
        )}
      </div>

      <MessageViewerDialog 
        message={selectedMessage}
        open={isViewerOpen}
        onOpenChange={setIsViewerOpen}
      />
    </div>
  )
}


