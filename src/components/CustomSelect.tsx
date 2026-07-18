'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type SelectOption = {
  value: string
  label: string
  sublabel?: string
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  Icon,
  className = '',
  align = 'left',
}: {
  value: string
  onChange: (v: string) => void
  options: SelectOption[]
  placeholder?: string
  Icon?: LucideIcon
  className?: string
  align?: 'left' | 'right'
}) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const selected = options.find((o) => o.value === value)
  const displayLabel = selected?.label ?? placeholder ?? ''

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full inline-flex items-center justify-between gap-2 px-4 py-3 rounded-lg border border-gray-200 bg-white hover:border-green-300 focus:ring-2 focus:ring-green-500 outline-none transition-colors text-sm text-gray-700"
      >
        <span className="inline-flex items-center gap-2 truncate">
          {Icon && <Icon className="w-4 h-4 text-green-700 shrink-0" />}
          <span className="truncate">{displayLabel}</span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full mt-2 min-w-full max-h-72 overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-xl z-50`}
        >
          {options.map((opt) => {
            const active = opt.value === value
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors ${
                  active ? 'bg-green-50 text-green-800 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex flex-col min-w-0">
                  <span className="truncate">{opt.label}</span>
                  {opt.sublabel && (
                    <span className="text-xs text-gray-400 font-normal truncate">{opt.sublabel}</span>
                  )}
                </div>
                {active && <Check className="w-4 h-4 text-green-600 shrink-0 ml-2" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
