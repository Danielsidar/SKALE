import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { cn } from '@/lib/utils'

export const MentionList = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index: number) => {
    const item = props.items[index]

    if (item) {
      props.command({ id: item.id })
    }
  }

  const upHandler = () => {
    setSelectedIndex(((selectedIndex + props.items.length) - 1) % props.items.length)
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useEffect(() => setSelectedIndex(0), [props.items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }

      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }

      if (event.key === 'Enter') {
        enterHandler()
        return true
      }

      return false
    },
  }))

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden min-w-[180px] p-1 z-[1000]" dir="rtl">
      {props.items.length ? (
        props.items.map((item: any, index: number) => (
          <button
            className={cn(
              "flex flex-col items-start w-full px-3 py-2 rounded-lg text-right transition-colors",
              index === selectedIndex ? "bg-primary/10 text-primary" : "hover:bg-slate-50 text-slate-700"
            )}
            key={index}
            onClick={() => selectItem(index)}
          >
            <span className="text-xs font-bold">{item.id}</span>
            <span className="text-[10px] opacity-70">{item.label}</span>
          </button>
        ))
      ) : (
        <div className="px-3 py-2 text-sm text-slate-400">לא נמצאו תוצאות</div>
      )}
    </div>
  )
})

MentionList.displayName = 'MentionList'

