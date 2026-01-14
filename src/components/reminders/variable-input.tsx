'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const VARIABLE_OPTIONS = [
  { key: "{{name}}", label: "שם המשתמש" },
  { key: "{{org_name}}", label: "שם האקדמיה" },
  { key: "{{course_name}}", label: "שם הקורס" },
  { key: "{{lesson_name}}", label: "שם השיעור" },
  { key: "{{login_url}}", label: "קישור התחברות" },
]

interface VariableInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string
  onChangeValue: (value: string) => void
}

export function VariableInput({ value, onChangeValue, className, ...props }: VariableInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [cursorPosition, setCursorPosition] = useState(0)
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 })
  const inputRef = useRef<HTMLInputElement>(null)

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement
    const newValue = target.value
    const position = target.selectionStart || 0
    
    onChangeValue(newValue)
    setCursorPosition(position)

    const lastChar = newValue[position - 1]
    if (lastChar === '@') {
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  const insertVariable = (variable: string) => {
    const newValue = value.slice(0, cursorPosition - 1) + variable + value.slice(cursorPosition)
    onChangeValue(newValue)
    setShowSuggestions(false)
    
    // Focus back and set cursor after the variable
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        const newPos = cursorPosition - 1 + variable.length
        inputRef.current.setSelectionRange(newPos, newPos)
      }
    }, 0)
  }

  return (
    <div className="relative w-full">
      <Input
        {...props}
        ref={inputRef}
        value={value}
        onInput={handleInput}
        className={cn(className)}
        autoComplete="off"
      />
      
      {showSuggestions && (
        <div className="absolute z-[100] mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden min-w-[200px] p-1 animate-in fade-in zoom-in-95 duration-200">
          <p className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">בחר משתנה</p>
          {VARIABLE_OPTIONS.map((v) => (
            <button
              key={v.key}
              type="button"
              className="flex flex-col items-start w-full px-3 py-2 text-right rounded-lg hover:bg-primary/5 hover:text-primary transition-colors group"
              onClick={() => insertVariable(v.key)}
            >
              <span className="font-bold text-sm group-hover:scale-105 transition-transform">{v.key}</span>
              <span className="text-[10px] text-slate-400">{v.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

