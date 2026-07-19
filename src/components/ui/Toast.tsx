'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { Check, X, AlertCircle, Info } from 'lucide-react'

export type ToastVariant = 'success' | 'error' | 'info'
type Toast = { id: number; message: string; variant: ToastVariant }

type ToastContextValue = {
  push: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let counter = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = ++counter
    setToasts((prev) => [...prev, { id, message, variant }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3200)
  }, [])

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onDismiss={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [leaving, setLeaving] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setLeaving(true), 2900)
    return () => clearTimeout(timer)
  }, [])

  const meta = {
    success: { Icon: Check, cls: 'bg-green-600 text-white border-green-700' },
    error:   { Icon: AlertCircle, cls: 'bg-red-600 text-white border-red-700' },
    info:    { Icon: Info, cls: 'bg-gray-900 text-white border-gray-800' },
  }[toast.variant]

  return (
    <div
      role="status"
      className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border font-semibold text-sm ${meta.cls} ${
        leaving ? 'animate-toast-out' : 'animate-toast-in'
      }`}
    >
      <meta.Icon className="w-4 h-4 shrink-0" strokeWidth={2.75} />
      <span className="flex-1">{toast.message}</span>
      <button onClick={onDismiss} className="opacity-70 hover:opacity-100" aria-label="Dismiss">
        <X className="w-3.5 h-3.5" strokeWidth={2.5} />
      </button>
    </div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
