'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
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

export function LanguageSelector() {
  const { lang, setLang } = useLanguage()
  return (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value as LanguageCode)}
      className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-green-500 outline-none cursor-pointer"
      aria-label="Select language"
    >
      {Object.entries(LANGUAGES).map(([code, { native }]) => (
        <option key={code} value={code}>
          🌐 {native}
        </option>
      ))}
    </select>
  )
}
