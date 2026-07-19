'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Sprout, LogOut, Menu, X, ArrowLeft } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { LanguageSelector, useLanguage } from '@/lib/LanguageContext'
import { NewPill } from './StatusPill'

export type SidebarItem = {
  key: string
  label: string
  Icon: LucideIcon
  badge?: number
  isNew?: boolean
}

export function Sidebar<Tkey extends string>({
  items,
  active,
  onSelect,
  subtitle,
  userName,
  onSignOut,
}: {
  items: (SidebarItem & { key: Tkey })[]
  active: Tkey
  onSelect: (key: Tkey) => void
  subtitle: string
  userName?: string
  onSignOut?: () => void
}) {
  const { t } = useLanguage()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [mobileOpen])

  useEffect(() => {
    setMobileOpen(false)
  }, [active])

  const nav = (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
      <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-green-300/70">Menu</div>
      {items.map(({ key, label, Icon, badge, isNew }) => {
        const isActive = key === active
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[15px] text-left transition-all ${
              isActive
                ? 'bg-green-700/80 text-white shadow-inner border-l-4 border-green-300 pl-2 font-bold tracking-tight'
                : 'text-green-50/90 hover:bg-green-800/60 hover:text-white font-semibold'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-green-200' : 'text-green-300/80'}`} strokeWidth={isActive ? 2.5 : 2} />
            <span className="flex-1 truncate inline-flex items-center gap-1.5">
              <span className="truncate">{label}</span>
              {isNew && <NewPill />}
            </span>
            {badge !== undefined && badge > 0 && (
              <span className="ml-auto inline-flex items-center justify-center min-w-[22px] px-1.5 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full shadow">
                {badge}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )

  const header = (
    <div className="px-4 py-5 border-b border-green-700/60">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow shrink-0">
          <Sprout className="w-6 h-6 text-green-700" strokeWidth={2.5} />
        </div>
        <div className="min-w-0">
          <div className="text-xl font-extrabold text-white truncate tracking-tight">{t('appName')}</div>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-green-300/90 truncate mt-0.5">{subtitle}</div>
        </div>
      </div>
      {userName && (
        <div className="mt-4 bg-green-800/50 rounded-lg px-3 py-2 border border-green-700/60">
          <div className="text-[10px] font-bold uppercase tracking-wider text-green-300/80">{t('hi')}</div>
          <div className="text-base font-bold text-white truncate leading-snug">{userName}</div>
        </div>
      )}
    </div>
  )

  const footer = (
    <div className="p-3 border-t border-green-700/60 space-y-2">
      <div className="[&_button]:!bg-green-800/40 [&_button]:!border-green-700/60 [&_button]:!text-white [&_button]:!font-semibold [&_svg]:!text-green-200">
        <LanguageSelector openUpward />
      </div>
      <Link
        href="/"
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold text-green-100 hover:bg-green-800/60 hover:text-white transition-colors border border-green-700/40"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
        <span>{t('backToMarketplace').includes('Marketplace') ? 'Home' : t('backToMarketplace')}</span>
      </Link>
      {onSignOut && (
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold text-red-100 bg-red-900/30 hover:bg-red-800/60 hover:text-white transition-colors border border-red-800/50"
        >
          <LogOut className="w-4 h-4" strokeWidth={2.5} />
          <span>{t('signOut')}</span>
        </button>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-30 bg-green-900 text-white flex items-center justify-between px-4 py-3 shadow">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
            <Sprout className="w-5 h-5 text-green-700" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-extrabold tracking-tight">{t('appName')}</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -mr-2 rounded-lg hover:bg-green-800/60"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Desktop persistent sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-64 bg-green-900 text-white flex-col shadow-xl">
        {header}
        {nav}
        {footer}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative w-72 max-w-[85vw] bg-green-900 text-white flex flex-col shadow-2xl animate-in slide-in-from-left">
            <div className="flex items-center justify-between px-4 py-3 border-b border-green-700/60">
              <span className="text-sm text-green-200">Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 -mr-2 rounded-lg hover:bg-green-800/60"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {header}
            {nav}
            {footer}
          </aside>
        </div>
      )}
    </>
  )
}

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  return <div className="lg:pl-64 min-h-screen bg-green-50">{children}</div>
}
