'use client'

import React from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { markMessageAsRead } from "@/app/actions/messages"
import { format } from "date-fns"
import { he } from "date-fns/locale"
import { Calendar, User } from "lucide-react"

interface MessageViewerDialogProps {
  message: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MessageViewerDialog({ 
  message, 
  open, 
  onOpenChange 
}: MessageViewerDialogProps) {
  React.useEffect(() => {
    if (open && message && !message.isRead) {
      markMessageAsRead(message.id, message.organization_id)
    }
  }, [open, message])

  if (!message) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-0 border-none shadow-2xl" dir="rtl">
        <div className="bg-primary/5 p-8 pb-12">
            <DialogHeader className="text-right space-y-4">
                <div className="flex items-center gap-2 text-primary bg-primary/10 w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    הודעה מהאקדמיה
                </div>
                <DialogTitle className="text-3xl font-black text-slate-900 leading-tight">
                    {message.subject}
                </DialogTitle>
                <div className="flex flex-wrap items-center gap-6 text-slate-500 font-bold text-xs pt-2">
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        <span>מאת: {message.sender?.name || "צוות האקדמיה"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>{format(new Date(message.created_at), "d MMMM yyyy, HH:mm", { locale: he })}</span>
                    </div>
                </div>
            </DialogHeader>
        </div>

        <div className="p-8 -mt-8 bg-white rounded-t-[2.5rem] relative z-10">
            <div 
                className="prose prose-slate max-w-none text-right font-medium text-slate-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: message.content }}
            />
        </div>

        <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100 rounded-b-[2.5rem]">
          <Button 
            onClick={() => onOpenChange(false)}
            className="rounded-2xl font-black px-8 h-12 bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            סגור הודעה
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


