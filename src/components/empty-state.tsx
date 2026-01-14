import React from "react"
import { LucideIcon, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed rounded-xl bg-muted/30 animate-in fade-in zoom-in-95 duration-500">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-primary opacity-50" />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-8">
        {description}
      </p>
      {actionLabel && (
        <Button onClick={onAction} className="gap-2">
          <Plus className="w-4 h-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

