"use client"

import React from "react"
import { useTabs } from "@/lib/tabs-context"
import { Loader2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const loadingMessages = [
  "מכינים לך הכל",
  "כמעט שם",
  "עוד רגע קט",
  "מסדרים את הדברים",
]

export function TabLoadingOverlay() {
  const { isNavigating, navigatingTo } = useTabs()
  const [messageIndex, setMessageIndex] = React.useState(0)

  React.useEffect(() => {
    if (isNavigating) {
      setMessageIndex(Math.floor(Math.random() * loadingMessages.length))
    }
  }, [isNavigating])

  if (!isNavigating) return null

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-slate-50/95 via-white/98 to-slate-50/95 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex flex-col items-center gap-6 text-center px-4">
        {/* Animated loader */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center animate-pulse">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          <Sparkles className="w-5 h-5 text-amber-400 absolute -top-1 -right-1 animate-bounce" />
        </div>
        
        {/* Message */}
        <div className="space-y-2">
          <p className="text-lg font-bold text-slate-800">
            {loadingMessages[messageIndex]}...
          </p>
          {navigatingTo && (
            <p className="text-sm text-slate-500">
              כבר נראה לך את{" "}
              <span className="font-semibold text-primary">{navigatingTo}</span>
              {" "}באקדמיה שלך
            </p>
          )}
        </div>

        {/* Progress dots */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full bg-primary/30",
                "animate-pulse"
              )}
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}


