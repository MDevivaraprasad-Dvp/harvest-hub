'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Tractor, ShoppingCart, IndianRupee, Leaf, Handshake, Sprout,
  Camera, Eye, MessageCircle, Truck, Users, Package, MapPin,
  X, Check, ArrowRight, ArrowDown, Sparkles,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useLanguage, LanguageSelector } from '@/lib/LanguageContext'
import { HeroIllustration } from '@/components/HeroIllustration'
import { supabase, type Listing } from '@/lib/supabase'

type Stats = { farmers: number; kg: number; locations: number }

export default function Home() {
  const { t } = useLanguage()
  const [featured, setFeatured] = useState<Listing[]>([])
  const [stats, setStats] = useState<Stats>({ farmers: 0, kg: 0, locations: 0 })

  useEffect(() => {
    const load = async () => {
      const [listingsRes, ordersRes] = await Promise.all([
        supabase.from('listings').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('quantity_kg').neq('status', 'cancelled'),
      ])
      const allListings = listingsRes.data ?? []
      const orders = ordersRes.data ?? []
      setFeatured(allListings.slice(0, 6))
      setStats({
        farmers: new Set(allListings.map((l) => l.farmer_phone)).size,
        kg: Math.round(orders.reduce((s, o) => s + Number(o.quantity_kg), 0)),
        locations: new Set(allListings.map((l) => l.location)).size,
      })
    }
    load()
  }, [])

  return (
    <div className="h-dvh bg-linear-to-b from-green-50 to-emerald-100 py-2 sm:py-3 flex flex-col overflow-hidden">
      <div className="w-full flex-1 flex flex-col min-h-0">
        {/* Roof / Awning */}
        <header className="relative bg-green-600 rounded-t-[80px] sm:rounded-t-[120px] lg:rounded-t-[160px] px-6 sm:px-10 lg:px-14 pt-6 sm:pt-8 pb-4 shadow-lg shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shadow-sm">
                <Sprout className="w-6 h-6 text-green-700" strokeWidth={2.25} />
              </div>
              <span className="text-2xl font-bold text-white">{t('appName')}</span>
            </div>
            <LanguageSelector />
          </div>
        </header>

        {/* Scalloped awning fringe */}
        <svg
          viewBox="0 0 120 8"
          preserveAspectRatio="none"
          className="block w-full h-6 sm:h-7 lg:h-9 -mt-px drop-shadow-md relative z-10 shrink-0"
          aria-hidden="true"
        >
          <path
            d="M0 0 L120 0 L120 1 Q 112.5 10 105 1 Q 97.5 10 90 1 Q 82.5 10 75 1 Q 67.5 10 60 1 Q 52.5 10 45 1 Q 37.5 10 30 1 Q 22.5 10 15 1 Q 7.5 10 0 1 Z"
            fill="#16a34a"
          />
        </svg>

        {/* Hut body — scrollable */}
        <main className="flex-1 bg-white border-x-4 sm:border-x-6 lg:border-x-8 border-b-4 sm:border-b-6 lg:border-b-8 border-green-600 rounded-b-[36px] sm:rounded-b-[44px] shadow-2xl -mt-4 sm:-mt-5 lg:-mt-6 mx-3 sm:mx-6 lg:mx-10 relative z-0 overflow-y-auto overflow-x-hidden min-h-0">
          <div className="px-6 sm:px-10 lg:px-14 py-10 lg:py-14 space-y-20 lg:space-y-28">
            <HeroSection />
            <ProblemSolutionSection />
            <HowItWorksSection />
            <FeaturedSection listings={featured} />
            <ImpactSection stats={stats} />
            <CtaSection />
            <FooterSection />
          </div>
        </main>
      </div>
    </div>
  )
}

function HeroSection() {
  const { t } = useLanguage()
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
      <div>
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Farm to cart, made simple</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-green-900 leading-tight mb-5">
          {t('heroLine1')}
          <br />
          <span className="text-green-600">{t('heroLine2')}</span>
        </h1>
        <p className="text-lg text-gray-700 mb-8 max-w-lg">{t('heroSubtitle')}</p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-md">
          <Link
            href="/farmer"
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-colors"
          >
            <Tractor className="w-5 h-5" />
            <span>{t('imFarmer')}</span>
          </Link>
          <Link
            href="/buyer"
            className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-green-700 font-semibold py-4 px-6 rounded-xl shadow-lg border-2 border-green-600 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>{t('imBuyer')}</span>
          </Link>
        </div>
      </div>

      <div className="lg:pl-8 relative">
        {/* Animated sun */}
        <div className="absolute top-4 right-6 w-16 h-16 sm:w-20 sm:h-20 pointer-events-none animate-spin-slow z-0">
          <div className="absolute inset-2 rounded-full bg-yellow-300 shadow-[0_0_40px_rgba(253,224,71,0.7)]" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <div
              key={deg}
              className="absolute top-1/2 left-1/2 w-1 h-3 bg-yellow-400 rounded-full origin-bottom"
              style={{ transform: `translate(-50%, -100%) rotate(${deg}deg) translateY(-4px)` }}
            />
          ))}
        </div>
        <div className="animate-float-y relative z-10">
          <HeroIllustration className="w-full h-auto drop-shadow-xl" />
        </div>
      </div>
    </section>
  )
}

function ProblemSolutionSection() {
  const { t } = useLanguage()
  const old = [t('oldWayItem1'), t('oldWayItem2'), t('oldWayItem3')]
  const nu = [t('newWayItem1'), t('newWayItem2'), t('newWayItem3')]
  return (
    <section>
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-green-900">{t('problemSolutionTitle')}</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 lg:p-8">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <X className="w-6 h-6 text-red-600" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold text-red-700">{t('oldWayLabel')}</span>
          </div>
          <ul className="space-y-3">
            {old.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-700">
                <X className="w-4 h-4 text-red-500 mt-1 shrink-0" strokeWidth={2.5} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 lg:p-8 relative overflow-hidden">
          <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-green-100 opacity-50" />
          <div className="flex items-center gap-2 mb-5 relative">
            <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center">
              <Check className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold text-green-800">{t('newWayLabel')}</span>
          </div>
          <ul className="space-y-3 relative">
            {nu.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-700">
                <Check className="w-4 h-4 text-green-600 mt-1 shrink-0" strokeWidth={2.5} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

const HOW_STEPS: { Icon: LucideIcon; titleKey: string; bodyKey: string }[] = [
  { Icon: Camera, titleKey: 'step1Title', bodyKey: 'step1Body' },
  { Icon: Eye, titleKey: 'step2Title', bodyKey: 'step2Body' },
  { Icon: MessageCircle, titleKey: 'step3Title', bodyKey: 'step3Body' },
  { Icon: Truck, titleKey: 'step4Title', bodyKey: 'step4Body' },
]

function HowItWorksSection() {
  const { t } = useLanguage()
  return (
    <section>
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-green-900 mb-2">{t('howItWorksTitle')}</h2>
        <p className="text-gray-600">{t('howItWorksSubtitle')}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 relative">
        {HOW_STEPS.map(({ Icon, titleKey, bodyKey }, i) => (
          <div key={i} className="relative">
            <div className="bg-white border-2 border-green-100 rounded-2xl p-6 text-center hover:border-green-300 hover:shadow-md transition-all h-full">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 rounded-2xl bg-green-100 animate-grow-bob" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon className="w-7 h-7 text-green-700" strokeWidth={2} />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center shadow">
                  {i + 1}
                </div>
              </div>
              <h3 className="font-bold text-green-900 mb-2">{t(titleKey as never)}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{t(bodyKey as never)}</p>
            </div>
            {i < HOW_STEPS.length - 1 && (
              <>
                <ArrowRight className="hidden lg:block absolute top-1/2 -right-3 w-6 h-6 text-green-300 -translate-y-1/2 animate-drift-x z-10" strokeWidth={2.5} />
                <ArrowDown className="lg:hidden mx-auto my-2 w-5 h-5 text-green-300 animate-float-y" strokeWidth={2.5} />
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

function FeaturedSection({ listings }: { listings: Listing[] }) {
  const { t } = useLanguage()
  return (
    <section>
      <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold text-green-900 mb-2">{t('featuredTitle')}</h2>
          <p className="text-gray-600">{t('featuredSubtitle')}</p>
        </div>
        <Link href="/buyer" className="text-green-700 font-semibold text-sm inline-flex items-center gap-1 hover:underline">
          <span>{t('browseAll')}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="bg-green-50 border border-green-100 rounded-2xl p-10 text-center">
          <Leaf className="w-12 h-12 text-green-300 mx-auto mb-3 animate-sway" />
          <p className="text-gray-600 text-sm">{t('noFeaturedYet')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {listings.map((l) => (
            <Link
              key={l.id}
              href="/buyer"
              className="group block bg-white border border-green-100 rounded-xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              {l.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={l.image_url} alt={l.produce_name} className="w-full h-24 sm:h-28 object-cover" />
              ) : (
                <div className="w-full h-24 sm:h-28 bg-linear-to-br from-green-100 to-green-200 flex items-center justify-center">
                  <Leaf className="w-8 h-8 text-green-600 group-hover:animate-sway" />
                </div>
              )}
              <div className="p-2.5">
                <div className="text-sm font-semibold text-green-900 truncate">{l.produce_name}</div>
                <div className="text-xs text-gray-500 truncate inline-flex items-center gap-0.5">
                  <MapPin className="w-3 h-3" />
                  <span>{l.location}</span>
                </div>
                <div className="text-sm font-bold text-green-700 mt-1">₹{l.price_per_kg}<span className="text-[10px] font-normal text-gray-500">/kg</span></div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

function ImpactSection({ stats }: { stats: Stats }) {
  const { t } = useLanguage()
  const cards: { Icon: LucideIcon; value: number; label: string; hue: string }[] = [
    { Icon: Users, value: stats.farmers, label: t('impactFarmers'), hue: 'green' },
    { Icon: Package, value: stats.kg, label: t('impactKgSold'), hue: 'emerald' },
    { Icon: MapPin, value: stats.locations, label: t('impactLocations'), hue: 'teal' },
  ]
  return (
    <section className="bg-linear-to-br from-green-600 to-emerald-700 rounded-3xl p-8 lg:p-12 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/4" />

      <div className="text-center mb-8 relative">
        <h2 className="text-3xl sm:text-4xl font-bold mb-2">{t('impactTitle')}</h2>
        <p className="text-green-50">{t('impactSubtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 relative">
        {cards.map(({ Icon, value, label }, i) => (
          <div
            key={i}
            className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 animate-count-in"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/25 flex items-center justify-center">
              <Icon className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <div className="text-4xl lg:text-5xl font-bold tabular-nums">{value.toLocaleString()}</div>
            <div className="text-sm text-green-50 mt-1">{label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function CtaSection() {
  const { t } = useLanguage()
  return (
    <section className="text-center relative">
      <div className="max-w-2xl mx-auto">
        <div className="inline-flex mb-6 relative">
          <div className="absolute inset-0 rounded-full bg-green-300 animate-ping opacity-30" />
          <div className="relative w-16 h-16 rounded-full bg-green-100 flex items-center justify-center animate-grow-bob">
            <Handshake className="w-8 h-8 text-green-700" strokeWidth={2} />
          </div>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-green-900 mb-3">{t('ctaTitle')}</h2>
        <p className="text-gray-600 mb-8">{t('ctaSubtitle')}</p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <Link
            href="/farmer"
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-colors"
          >
            <Tractor className="w-5 h-5" />
            <span>{t('imFarmer')}</span>
          </Link>
          <Link
            href="/buyer"
            className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-green-700 font-semibold py-4 px-6 rounded-xl shadow-lg border-2 border-green-600 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>{t('imBuyer')}</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

function FooterSection() {
  const { t } = useLanguage()
  return (
    <footer className="pt-6 border-t border-green-100 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
      <FooterFeature Icon={IndianRupee} title={t('feature1Title')} body={t('feature1Body')} />
      <FooterFeature Icon={Leaf} title={t('feature2Title')} body={t('feature2Body')} />
      <FooterFeature Icon={Handshake} title={t('feature3Title')} body={t('feature3Body')} />
      <div className="sm:col-span-3 text-center text-gray-500 inline-flex items-center justify-center gap-2 pt-4 border-t border-green-100 mt-2">
        <Sprout className="w-4 h-4 text-green-600 animate-sway" />
        <span>{t('footer')}</span>
      </div>
    </footer>
  )
}

function FooterFeature({ Icon, title, body }: { Icon: LucideIcon; title: string; body: string }) {
  return (
    <div>
      <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-2">
        <Icon className="w-5 h-5 text-green-700" />
      </div>
      <h4 className="font-semibold text-green-900 mb-1">{title}</h4>
      <p className="text-gray-600 text-xs leading-relaxed">{body}</p>
    </div>
  )
}
