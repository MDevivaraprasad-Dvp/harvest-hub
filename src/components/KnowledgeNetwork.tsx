'use client'

import { useEffect, useState } from 'react'
import {
  Sparkles, Send, MessageCircle, UserCog, Crown, Phone, MapPin,
  ArrowRight, Bot, Zap, Users, IndianRupee, Check, Handshake,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'
import { StatusPill } from './StatusPill'

const DAILY_QUOTA = 5
const QUOTA_KEY = 'farmeasy_ai_quota'
const WAITLIST_KEY = 'farmeasy_premium_waitlist'

type QuotaState = { date: string; used: number }

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

function readQuota(): QuotaState {
  if (typeof window === 'undefined') return { date: todayStr(), used: 0 }
  try {
    const raw = localStorage.getItem(QUOTA_KEY)
    if (!raw) return { date: todayStr(), used: 0 }
    const parsed = JSON.parse(raw) as QuotaState
    if (parsed.date !== todayStr()) return { date: todayStr(), used: 0 }
    return parsed
  } catch {
    return { date: todayStr(), used: 0 }
  }
}

function writeQuota(q: QuotaState) {
  localStorage.setItem(QUOTA_KEY, JSON.stringify(q))
}

type ExpertFarmer = {
  name: string
  location: string
  years: number
  speciality: string
  phone: string
}

const EXPERT_FARMERS: ExpertFarmer[] = [
  { name: 'Ramesh Patil', location: 'Nashik, MH', years: 22, speciality: 'Tomato & Onion', phone: '9876543210' },
  { name: 'Suresh Reddy', location: 'Guntur, AP', years: 18, speciality: 'Chilli & Cotton', phone: '9876500011' },
  { name: 'Kavitha Devi', location: 'Erode, TN', years: 15, speciality: 'Turmeric & Banana', phone: '9876500022' },
  { name: 'Manoj Kumar', location: 'Ludhiana, PB', years: 25, speciality: 'Wheat & Paddy', phone: '9876500033' },
]

type AgriEngineer = {
  name: string
  location: string
  years: number
  speciality: string
  phone: string
}

const AGRI_ENGINEERS: AgriEngineer[] = [
  { name: 'Dr. Anitha Rao', location: 'ICAR, Hyderabad', years: 12, speciality: 'Soil Health & Nutrition', phone: '9876500044' },
  { name: 'Dr. Vikram Singh', location: 'PAU, Ludhiana', years: 15, speciality: 'Pest Management', phone: '9876500055' },
  { name: 'Dr. Meera Iyer', location: 'TNAU, Coimbatore', years: 10, speciality: 'Drip Irrigation', phone: '9876500066' },
]

type ChatMessage = { role: 'user' | 'ai'; text: string }

export function KnowledgeNetwork() {
  const { t } = useLanguage()
  const [quota, setQuota] = useState<QuotaState>({ date: todayStr(), used: 0 })
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [waitlisted, setWaitlisted] = useState(false)

  useEffect(() => {
    setQuota(readQuota())
    setWaitlisted(!!localStorage.getItem(WAITLIST_KEY))
  }, [])

  const remaining = Math.max(0, DAILY_QUOTA - quota.used)
  const exhausted = remaining === 0

  const send = (text: string) => {
    if (!text.trim() || thinking || exhausted) return
    const userMsg: ChatMessage = { role: 'user', text: text.trim() }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setThinking(true)
    setTimeout(() => {
      setMessages((m) => [...m, { role: 'ai', text: t('mockAIReply') }])
      const next = { date: todayStr(), used: quota.used + 1 }
      setQuota(next)
      writeQuota(next)
      setThinking(false)
    }, 900)
  }

  const joinWaitlist = () => {
    localStorage.setItem(WAITLIST_KEY, '1')
    setWaitlisted(true)
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('knowledgePrototypeBadge')}</span>
          </span>
          <StatusPill label={t('liveOnline')} variant="green" pulse size="sm" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-green-900 tracking-tight leading-tight">{t('knowledgeNetwork')}</h1>
        <p className="text-gray-600 mt-2 text-lg max-w-2xl">{t('knowledgeSubtitle')}</p>
      </div>

      {/* AI Chat */}
      <section className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center shrink-0">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-green-900">{t('askAITitle')}</h2>
              <p className="text-sm text-gray-600">{t('askAISubtitle')}</p>
            </div>
          </div>
          <div className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
            exhausted ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-800'
          }`}>
            {remaining} / {DAILY_QUOTA} {t('quotaRemaining')}
          </div>
        </div>

        {messages.length === 0 && !thinking && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
            {[t('sampleQuestion1'), t('sampleQuestion2'), t('sampleQuestion3')].map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                disabled={exhausted}
                className="text-left px-3 py-2.5 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 text-sm text-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageCircle className="w-3.5 h-3.5 inline mr-1.5 text-green-600" />
                {q}
              </button>
            ))}
          </div>
        )}

        {messages.length > 0 && (
          <div className="space-y-3 mb-4 max-h-72 overflow-y-auto">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                  m.role === 'user'
                    ? 'bg-green-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-500 text-sm px-4 py-2.5 rounded-2xl rounded-bl-sm inline-flex items-center gap-2">
                  <Bot className="w-4 h-4 animate-pulse text-green-600" />
                  {t('askAIThinking')}
                </div>
              </div>
            )}
          </div>
        )}

        {exhausted ? (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 text-sm p-4 rounded-lg">
            {t('quotaExhausted')}
          </div>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); send(input) }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('askAIPlaceholder')}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
            />
            <button
              type="submit"
              disabled={!input.trim() || thinking}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold px-4 py-3 rounded-lg inline-flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">{t('askAISend')}</span>
            </button>
          </form>
        )}
      </section>

      {/* AI + Human bridge */}
      <section className="bg-linear-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 text-green-700">
            <Handshake className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-green-900">{t('aiHumanTitle')}</h2>
            <p className="text-sm text-gray-700 mt-1 leading-relaxed">{t('aiHumanBody')}</p>
          </div>
        </div>
      </section>

      {/* Expert farmers + engineers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ExpertList
          Icon={Users}
          title={t('askExpertFarmers')}
          subtitle={t('askExpertFarmersSubtitle')}
          accent="green"
          experts={EXPERT_FARMERS}
        />
        <ExpertList
          Icon={UserCog}
          title={t('askAgriEngineer')}
          subtitle={t('askAgriEngineerSubtitle')}
          accent="blue"
          experts={AGRI_ENGINEERS}
        />
      </div>

      {/* Premium banner */}
      <section className="bg-linear-to-br from-amber-400 via-orange-500 to-amber-600 text-white rounded-2xl shadow-lg overflow-hidden relative">
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/10 rounded-full" />
        <div className="relative p-6 lg:p-8">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/25 flex items-center justify-center shrink-0">
              <Crown className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{t('premiumBannerTitle')}</h2>
              <p className="text-amber-50 text-sm mt-1 max-w-lg">{t('premiumBannerBody')}</p>
            </div>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5 text-sm">
            {[t('premiumFeature1'), t('premiumFeature2'), t('premiumFeature3'), t('premiumFeature4')].map((f) => (
              <li key={f} className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={3} />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="text-3xl font-bold inline-flex items-center gap-1">
              <IndianRupee className="w-6 h-6" />
              <span>299</span>
              <span className="text-sm font-normal text-amber-50 ml-1">/ month</span>
            </div>
            {waitlisted ? (
              <div className="bg-white/25 text-white font-semibold px-5 py-3 rounded-lg inline-flex items-center gap-2 text-sm">
                <Check className="w-4 h-4" />
                <span>{t('waitlistJoined')}</span>
              </div>
            ) : (
              <button
                onClick={joinWaitlist}
                className="bg-white text-amber-700 hover:bg-amber-50 font-semibold px-5 py-3 rounded-lg shadow inline-flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>{t('joinWaitlist')}</span>
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

function ExpertList({
  Icon,
  title,
  subtitle,
  accent,
  experts,
}: {
  Icon: LucideIcon
  title: string
  subtitle: string
  accent: 'green' | 'blue'
  experts: ExpertFarmer[]
}) {
  const { t } = useLanguage()
  const accentClasses =
    accent === 'green'
      ? { bg: 'bg-green-100', text: 'text-green-700', chip: 'bg-green-50 text-green-800' }
      : { bg: 'bg-blue-100', text: 'text-blue-700', chip: 'bg-blue-50 text-blue-800' }

  return (
    <section className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl ${accentClasses.bg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 ${accentClasses.text}`} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-green-900">{title}</h2>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
      </div>

      <div className="space-y-3">
        {experts.map((e) => (
          <div
            key={e.phone}
            className="border border-gray-100 rounded-xl p-3 hover:border-green-200 hover:bg-green-50/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-semibold text-green-900 truncate">{e.name}</div>
                  <StatusPill label="Available" variant="green" pulse size="sm" />
                </div>
                <div className="text-xs text-gray-500 inline-flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{e.location}</span>
                </div>
                <div className={`mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${accentClasses.chip}`}>
                  {e.speciality}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs text-gray-500">{e.years} {t('yearsExperience')}</div>
                <a
                  href={`tel:${e.phone}`}
                  className="mt-2 text-xs bg-green-600 hover:bg-green-700 text-white font-semibold px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" />
                  <span>{t('consultNow')}</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        disabled
        className="mt-4 w-full text-xs text-gray-500 py-2 rounded-lg border border-dashed border-gray-200 inline-flex items-center justify-center gap-1"
      >
        <ArrowRight className="w-3 h-3" />
        <span>{t('premiumComingSoon')}</span>
      </button>
    </section>
  )
}
