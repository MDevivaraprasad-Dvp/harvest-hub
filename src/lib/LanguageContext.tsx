'use client'

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react'
import { Globe, Check, ChevronDown } from 'lucide-react'
import { LANGUAGES, translations, type LanguageCode, type TranslationKey } from './i18n'

type LanguageContextValue = {
  lang: LanguageCode
  setLang: (l: LanguageCode) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('farmeasy_lang') as LanguageCode | null
    if (stored && stored in LANGUAGES) setLangState(stored)
    setMounted(true)
  }, [])

  const setLang = (l: LanguageCode) => {
    setLangState(l)
    localStorage.setItem('farmeasy_lang', l)
  }

  const t = (key: TranslationKey): string => {
    return translations[lang][key] ?? translations.en[key] ?? key
  }

  if (!mounted) return null

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider')
  return ctx
}

export function LanguageSelector({ openUpward = false }: { openUpward?: boolean } = {}) {
  const { lang, setLang } = useLanguage()
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

  const current = LANGUAGES[lang]

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:border-green-300 hover:bg-green-50 transition-colors text-sm font-medium text-gray-700 shadow-sm"
      >
        <Globe className="w-4 h-4 text-green-700" />
        <span>{current.native}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${
            openUpward ? (open ? '' : 'rotate-180') : (open ? 'rotate-180' : '')
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className={`absolute right-0 w-48 rounded-xl border border-gray-100 bg-white shadow-xl overflow-hidden z-50 max-h-72 overflow-y-auto ${
            openUpward
              ? 'bottom-full mb-2 animate-in fade-in slide-in-from-bottom-1'
              : 'top-full mt-2 animate-in fade-in slide-in-from-top-1'
          }`}
        >
          {(Object.entries(LANGUAGES) as [LanguageCode, typeof LANGUAGES[LanguageCode]][]).map(
            ([code, meta]) => {
              const active = code === lang
              return (
                <button
                  key={code}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    setLang(code)
                    setOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors ${
                    active ? 'bg-green-50 text-green-800 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col">
                    <span>{meta.native}</span>
                    <span className="text-xs text-gray-400 font-normal">{meta.name}</span>
                  </div>
                  {active && <Check className="w-4 h-4 text-green-600 shrink-0" />}
                </button>
              )
            }
          )}
        </div>
      )}
    </div>
  )
}
