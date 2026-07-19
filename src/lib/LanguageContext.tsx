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
          className={`absolute right-0 w-52 rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto p-1.5 ${
            openUpward
              ? 'bottom-full mb-2 animate-in fade-in slide-in-from-bottom-1'
              : 'top-full mt-2 animate-in fade-in slide-in-from-top-1'
          }`}
        >
          {(Object.entries(LANGUAGES) as [LanguageCode, typeof LANGUAGES[LanguageCode]][]).map(
            ([code, meta]) => {
              const active = code === lang
              const showEnglish = meta.native !== meta.name
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
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    active
                      ? 'bg-green-600 hover:bg-green-600'
                      : 'bg-white hover:bg-green-50'
                  }`}
                >
                  <span className="flex flex-col min-w-0">
                    <span className={`text-base font-bold truncate leading-tight ${active ? 'text-white' : 'text-green-900'}`}>
                      {meta.native}
                    </span>
                    {showEnglish && (
                      <span className={`text-xs font-medium truncate mt-0.5 ${active ? 'text-green-50' : 'text-gray-500'}`}>
                        {meta.name}
                      </span>
                    )}
                  </span>
                  {active && <Check className="w-4 h-4 text-white shrink-0" strokeWidth={3} />}
                </button>
              )
            }
          )}
        </div>
      )}
    </div>
  )
}
