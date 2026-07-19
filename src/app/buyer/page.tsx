'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Sprout, ShoppingCart, MapPin, Search, Phone, Leaf,
  BarChart3, ArrowRight, Store, Heart, ClipboardList,
  X, User, Handshake, Brain, Check,
} from 'lucide-react'
import { supabase, type Listing, type Review } from '@/lib/supabase'
import { useLanguage } from '@/lib/LanguageContext'
import { RatingSummary } from '@/components/StarRating'
import { BuyerInsights } from '@/components/BuyerInsights'
import { CustomSelect } from '@/components/CustomSelect'
import { FavoriteHeart } from '@/components/FavoriteHeart'
import { OrderForm } from '@/components/OrderForm'
import { BuyerOrders } from '@/components/BuyerOrders'
import { Sidebar, SidebarLayout, type SidebarItem } from '@/components/Sidebar'
import { BuyerContracts } from '@/components/Contracts'
import { KnowledgeNetwork } from '@/components/KnowledgeNetwork'
import { StatusPill } from '@/components/StatusPill'
import { SkeletonGrid } from '@/components/ui/Skeleton'
import { SignInForm } from '@/components/shared/SignInForm'
import { readFavorites } from '@/lib/favorites'
import { useProduceImage } from '@/lib/produceImage'
import { categoriseProduce, CATEGORY_ORDER, type ProduceCategory } from '@/lib/produceCategory'
import { useDebounced } from '@/lib/hooks/useDebounced'
import { useUrlTab } from '@/lib/hooks/useUrlTab'
import { useToast } from '@/components/ui/Toast'
import { prefetchListings, prefetchContracts, prefetchOrders } from '@/lib/prefetch'
import { backfillListingImages } from '@/lib/backfillImages'

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

const CATEGORY_LABEL_KEYS: Record<ProduceCategory, string> = {
  vegetables: 'catVegetables',
  fruits: 'catFruits',
  grains: 'catGrains',
  pulses: 'catPulses',
  herbs: 'catHerbs',
  other: 'catOther',
}

type FarmerStats = { average: number | null; count: number }
type BuyerProfile = { name: string; phone: string }
type Tab = 'marketplace' | 'saved' | 'orders' | 'contracts' | 'insights' | 'knowledge'

const PAGE_SIZE = 12

const BUYER_TABS: readonly Tab[] = ['marketplace', 'saved', 'orders', 'contracts', 'insights', 'knowledge'] as const

export default function BuyerPage() {
  const { t } = useLanguage()
  const [tab, setTab] = useUrlTab<Tab>('marketplace', BUYER_TABS)
  const [listings, setListings] = useState<Listing[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<number[]>([])
  const [profile, setProfile] = useState<BuyerProfile | null>(null)
  const [showSignIn, setShowSignIn] = useState(false)

  useEffect(() => {
    const load = async () => {
      // Listings may already be warm from a hover on the landing page CTA.
      const [ls, rRes] = await Promise.all([
        prefetchListings(),
        supabase.from('reviews').select('*'),
      ])
      if (rRes.error) console.error(rRes.error)
      setListings(ls)
      setReviews(rRes.data ?? [])
      setLoading(false)
      // Fire-and-forget: fill in missing image_url values in the DB. No-op
      // after the first landing/buyer visit each session (see backfillListingImages).
      backfillListingImages(ls)
    }
    load()
  }, [])

  useEffect(() => {
    // One-time read from localStorage + subscribe to external change event.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFavorites(readFavorites())
    const handler = () => setFavorites(readFavorites())
    window.addEventListener('farmeasy:favorites-changed', handler)
    return () => window.removeEventListener('farmeasy:favorites-changed', handler)
  }, [])

  useEffect(() => {
    // Client-only identity hydration from localStorage. Safe: fires once after mount.
    const stored = localStorage.getItem('farmeasy_buyer')
    if (!stored) return
    try {
      const parsed = JSON.parse(stored) as BuyerProfile
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (parsed?.name && parsed?.phone) setProfile(parsed)
    } catch {}
  }, [])

  const handleSignIn = (name: string, phone: string) => {
    const p = { name, phone }
    localStorage.setItem('farmeasy_buyer', JSON.stringify(p))
    localStorage.setItem('farmeasy_buyer_name', name)
    setProfile(p)
    setShowSignIn(false)
  }

  const handleSignOut = () => {
    localStorage.removeItem('farmeasy_buyer')
    localStorage.removeItem('farmeasy_buyer_name')
    setProfile(null)
  }

  const farmerStats = useMemo(() => {
    const map = new Map<string, FarmerStats>()
    for (const r of reviews) {
      const s = map.get(r.farmer_phone) ?? { average: 0, count: 0 }
      s.average = (s.average ?? 0) + r.rating
      s.count += 1
      map.set(r.farmer_phone, s)
    }
    for (const [k, s] of map) {
      map.set(k, { average: s.count > 0 ? (s.average ?? 0) / s.count : null, count: s.count })
    }
    return map
  }, [reviews])

  const items: (SidebarItem & { key: Tab })[] = [
    { key: 'marketplace', label: t('tabMarketplace'), Icon: Store, onPrefetch: () => prefetchListings() },
    { key: 'saved', label: t('tabSaved'), Icon: Heart, badge: favorites.length, onPrefetch: () => prefetchListings() },
    { key: 'orders', label: t('tabMyOrders'), Icon: ClipboardList, onPrefetch: profile ? () => prefetchOrders({ buyerPhone: profile.phone }) : undefined },
    { key: 'contracts', label: t('contractFarming'), Icon: Handshake, isNew: true, onPrefetch: () => prefetchContracts() },
    { key: 'insights', label: t('marketInsights'), Icon: BarChart3, onPrefetch: () => prefetchListings() },
    { key: 'knowledge', label: t('knowledgeNavLink'), Icon: Brain, isNew: true },
  ]

  return (
    <>
      <Sidebar
        items={items}
        active={tab}
        onSelect={setTab}
        subtitle={t('buyerMarketplace')}
        userName={profile?.name}
        onSignOut={profile ? handleSignOut : undefined}
      />
      <SidebarLayout>
        <main className="max-w-[1400px] mx-auto px-6 py-8">
          {!profile && tab === 'marketplace' && (
            <div className="bg-linear-to-r from-green-600 to-green-700 text-white rounded-2xl shadow-lg p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-10 h-10 shrink-0" />
                <div>
                  <div className="text-xl font-bold">{t('welcomeBuyer')}</div>
                  <p className="text-green-50 text-sm mt-1">{t('signInBuyerPrompt')}</p>
                </div>
              </div>
              <button
                onClick={() => setShowSignIn(true)}
                className="bg-white text-green-700 hover:bg-green-50 font-semibold px-6 py-3 rounded-lg shadow whitespace-nowrap inline-flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                <span>{t('signInToBuy')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {tab === 'insights' && (
            <>
              <div className="mb-6">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-green-900 tracking-tight">{t('marketInsights')}</h1>
                <p className="text-gray-600 mt-1">{t('buyerInsightsSubtitle')}</p>
              </div>
              <BuyerInsights />
            </>
          )}

          {tab === 'orders' && (
            <>
              <div className="mb-6">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-green-900 tracking-tight">{t('tabMyOrders')}</h1>
                <p className="text-gray-600 mt-1">{t('myOrdersSubtitle')}</p>
              </div>
              <BuyerOrders />
            </>
          )}

          {tab === 'contracts' && (
            <BuyerContracts
              profile={profile}
              onSignInRequired={() => setShowSignIn(true)}
            />
          )}

          {tab === 'knowledge' && <KnowledgeNetwork />}

          {tab === 'marketplace' && (
            <MarketplaceView
              listings={listings}
              farmerStats={farmerStats}
              loading={loading}
              trackViews
            />
          )}

          {tab === 'saved' && (
            <SavedView
              listings={listings.filter((l) => favorites.includes(l.id))}
              farmerStats={farmerStats}
              loading={loading}
              emptyMessage={t('noFavoritesYet')}
            />
          )}
        </main>
      </SidebarLayout>

      {showSignIn && (
        <BuyerSignInModal
          onClose={() => setShowSignIn(false)}
          onSignIn={handleSignIn}
        />
      )}
    </>
  )
}

function BuyerSignInModal({
  onClose,
  onSignIn,
}: {
  onClose: () => void
  onSignIn: (name: string, phone: string) => void
}) {
  const { t } = useLanguage()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-extrabold text-green-900 tracking-tight">{t('welcomeBuyer')}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <SignInForm onSignIn={onSignIn} intro={t('signInBuyerPrompt')} />
        </div>
      </div>
    </div>
  )
}

function MarketplaceView({
  listings,
  farmerStats,
  loading,
  trackViews,
}: {
  listings: Listing[]
  farmerStats: Map<string, FarmerStats>
  loading: boolean
  trackViews?: boolean
}) {
  const { t } = useLanguage()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounced(search, 180)
  const [locationFilter, setLocationFilter] = useState('')
  const [activeCategories, setActiveCategories] = useState<Set<ProduceCategory>>(new Set())
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [orderingListing, setOrderingListing] = useState<Listing | null>(null)
  const [revealedPhone, setRevealedPhone] = useState<Record<number, boolean>>({})
  const toast = useToast()

  const locations = useMemo(() => {
    const set = new Set(listings.map((l) => l.location))
    return Array.from(set).sort()
  }, [listings])

  const categoryCounts = useMemo(() => {
    const counts = new Map<ProduceCategory, number>()
    for (const l of listings) {
      const c = categoriseProduce(l.produce_name)
      counts.set(c, (counts.get(c) ?? 0) + 1)
    }
    return counts
  }, [listings])

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase()
    return listings.filter((l) => {
      const matchesSearch = q === '' || l.produce_name.toLowerCase().includes(q)
      const matchesLocation = locationFilter === '' || l.location === locationFilter
      const matchesCategory = activeCategories.size === 0 || activeCategories.has(categoriseProduce(l.produce_name))
      return matchesSearch && matchesLocation && matchesCategory
    })
  }, [listings, debouncedSearch, locationFilter, activeCategories])

  const toggleCategory = (c: ProduceCategory) => {
    setActiveCategories((prev) => {
      const next = new Set(prev)
      if (next.has(c)) next.delete(c)
      else next.add(c)
      return next
    })
  }

  useEffect(() => {
    // Reset infinite-scroll cap when filters change.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisibleCount(PAGE_SIZE)
  }, [debouncedSearch, locationFilter, activeCategories])

  useEffect(() => {
    if (visibleCount >= filtered.length) return
    const node = sentinelRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((c) => Math.min(c + PAGE_SIZE, filtered.length))
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [filtered.length, visibleCount])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-green-900 tracking-tight">{t('freshFromFarm')}</h1>
        <p className="text-gray-600 mt-1">{t('browseSubtitle')}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder={t('searchPlaceholder').replace('🔍 ', '')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none font-medium"
            />
          </div>
          <div className="sm:w-64">
            <CustomSelect
              value={locationFilter}
              onChange={setLocationFilter}
              Icon={MapPin}
              options={[
                { value: '', label: t('allLocations') },
                ...locations.map((loc) => ({ value: loc, label: loc })),
              ]}
            />
          </div>
        </div>
        <div className="flex items-center flex-wrap gap-2 pt-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mr-1">
            {t('categoryFilter')}
          </span>
          {CATEGORY_ORDER.map((c) => {
            const count = categoryCounts.get(c) ?? 0
            if (count === 0) return null
            const isActive = activeCategories.has(c)
            return (
              <button
                key={c}
                onClick={() => toggleCategory(c)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-tight transition-all border ${
                  isActive
                    ? 'bg-green-600 text-white border-green-600 shadow-sm'
                    : 'bg-white text-green-800 border-green-200 hover:border-green-400 hover:bg-green-50'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center ${
                  isActive ? 'bg-white border-white' : 'border-green-400'
                }`}>
                  {isActive && <Check className="w-2.5 h-2.5 text-green-700" strokeWidth={3.5} />}
                </span>
                <span>{t(CATEGORY_LABEL_KEYS[c] as never)}</span>
                <span className={`text-[10px] tabular-nums ${isActive ? 'text-green-100' : 'text-gray-400'}`}>
                  {count}
                </span>
              </button>
            )
          })}
          {activeCategories.size > 0 && (
            <button
              onClick={() => setActiveCategories(new Set())}
              className="text-xs font-bold text-gray-500 hover:text-red-600 inline-flex items-center gap-1 ml-1"
            >
              <X className="w-3 h-3" strokeWidth={2.5} />
              {t('clearFilters')}
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <SkeletonGrid count={8} />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <Leaf className="w-16 h-16 text-green-300 mx-auto mb-4" />
          <p className="text-gray-600">
            {listings.length === 0 ? t('noListingsPublic') : t('noListingsFilter')}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {visible.map((l) => (
              <ListingCard
                key={l.id}
                listing={l}
                farmerStats={farmerStats.get(l.farmer_phone)}
                onOrder={() => setOrderingListing(l)}
                revealed={!!revealedPhone[l.id]}
                onReveal={() => setRevealedPhone((p) => ({ ...p, [l.id]: true }))}
                trackViews={trackViews}
              />
            ))}
          </div>
          {hasMore && (
            <div ref={sentinelRef} className="mt-8 text-center text-sm text-gray-500 flex items-center justify-center gap-2 py-4">
              <Sprout className="w-4 h-4 text-green-500 animate-pulse" />
              <span>{t('loadingMore')}</span>
            </div>
          )}
          {!hasMore && filtered.length > PAGE_SIZE && (
            <p className="mt-8 text-center text-sm text-gray-400 py-4">
              {t('showingAllListings').replace('{n}', String(filtered.length))}
            </p>
          )}
        </>
      )}

      {orderingListing && (
        <OrderForm
          listing={orderingListing}
          onClose={() => setOrderingListing(null)}
          onPlaced={() => { setOrderingListing(null); toast.push(t('orderPlaced'), 'success') }}
        />
      )}
    </>
  )
}

function SavedView({
  listings,
  farmerStats,
  loading,
  emptyMessage,
}: {
  listings: Listing[]
  farmerStats: Map<string, FarmerStats>
  loading: boolean
  emptyMessage: string
}) {
  const { t } = useLanguage()
  const toast = useToast()
  const [orderingListing, setOrderingListing] = useState<Listing | null>(null)
  const [revealedPhone, setRevealedPhone] = useState<Record<number, boolean>>({})

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-green-900 tracking-tight">{t('tabSaved')}</h1>
        <p className="text-gray-600 mt-1">{t('savedSubtitle')}</p>
      </div>

      {loading ? (
        <SkeletonGrid count={4} />
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <Heart className="w-16 h-16 text-red-200 mx-auto mb-4" />
          <p className="text-gray-600">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {listings.map((l) => (
            <ListingCard
              key={l.id}
              listing={l}
              farmerStats={farmerStats.get(l.farmer_phone)}
              onOrder={() => setOrderingListing(l)}
              revealed={!!revealedPhone[l.id]}
              onReveal={() => setRevealedPhone((p) => ({ ...p, [l.id]: true }))}
            />
          ))}
        </div>
      )}

      {orderingListing && (
        <OrderForm
          listing={orderingListing}
          onClose={() => setOrderingListing(null)}
          onPlaced={() => { setOrderingListing(null); toast.push(t('orderPlaced'), 'success') }}
        />
      )}
    </>
  )
}

function ListingCard({
  listing,
  farmerStats,
  onOrder,
  revealed,
  onReveal,
  trackViews,
}: {
  listing: Listing
  farmerStats: FarmerStats | undefined
  onOrder: () => void
  revealed: boolean
  onReveal: () => void
  trackViews?: boolean
}) {
  const { t } = useLanguage()
  const cardRef = useRef<HTMLDivElement>(null)
  const loggedRef = useRef(false)

  const logView = useCallback(async () => {
    if (loggedRef.current) return
    loggedRef.current = true
    try {
      const stored = localStorage.getItem('farmeasy_buyer')
      const viewerPhone = stored ? (JSON.parse(stored) as { phone: string }).phone : null
      await supabase.from('listing_views').insert({
        listing_id: listing.id,
        viewer_phone: viewerPhone,
      })
    } catch (e) {
      console.error('view log failed', e)
    }
  }, [listing.id])

  useEffect(() => {
    if (!trackViews) return
    const node = cardRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          logView()
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [trackViews, logView])

  // Snapshot "now" at mount so freshness doesn't flicker on re-renders.
  const [now] = useState(() => Date.now())
  const isFresh = now - new Date(listing.created_at).getTime() < SEVEN_DAYS_MS
  const isTrusted = farmerStats?.average != null && farmerStats.average >= 4.5 && farmerStats.count >= 2
  const autoImage = useProduceImage(listing.produce_name, listing.image_url)
  const [imgFailed, setImgFailed] = useState(false)
  const imgSrc = imgFailed ? null : autoImage

  return (
    <div ref={cardRef} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow relative">
      <FavoriteHeart listingId={listing.id} className="absolute top-3 right-3 z-10 w-9 h-9 shadow-md" />
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {isFresh && <StatusPill label={t('badgeFresh')} variant="green" pulse size="sm" />}
        {isTrusted && <StatusPill label={t('badgeTrustedFarmer')} variant="amber" size="sm" />}
      </div>
      {imgSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imgSrc}
          alt={listing.produce_name}
          className="w-full h-48 object-cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div className="w-full h-48 bg-linear-to-br from-green-100 to-green-200 flex items-center justify-center">
          <Leaf className="w-14 h-14 text-green-600" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-extrabold text-xl text-green-900 truncate min-w-0 flex-1 tracking-tight" title={listing.produce_name}>{listing.produce_name}</h3>
          <div className="text-right shrink-0">
            <div className="text-2xl font-extrabold text-green-700 tabular-nums leading-none">₹{listing.price_per_kg}<span className="text-xs font-semibold text-gray-500">/kg</span></div>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-1.5 flex items-center gap-1 min-w-0 font-medium">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-green-600" />
          <span className="truncate" title={listing.location}>{listing.location}</span>
        </p>
        <p className="text-xs text-gray-500 mt-1 inline-flex items-center gap-1 font-semibold uppercase tracking-wide">
          <Sprout className="w-3.5 h-3.5 text-green-500" />
          <span>{listing.quantity_kg} {t('kgAvailable')}</span>
        </p>

        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm truncate" title={listing.farmer_name}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('farmer')}</span>
                <span className="block font-bold text-green-900 truncate">{listing.farmer_name}</span>
              </p>
              <div className="mt-0.5">
                <RatingSummary average={farmerStats?.average ?? null} count={farmerStats?.count ?? 0} />
              </div>
            </div>
            <Link
              href={`/farmer/${encodeURIComponent(listing.farmer_phone)}`}
              className="text-xs font-bold text-green-700 hover:underline whitespace-nowrap inline-flex items-center gap-1 shrink-0"
            >
              <span>{t('viewProfile')}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <button
            onClick={onOrder}
            className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-lg transition-colors inline-flex items-center justify-center gap-2 tracking-tight"
          >
            <ShoppingCart className="w-4 h-4" strokeWidth={2.5} />
            <span>{t('placeOrder')}</span>
          </button>

          {revealed ? (
            <a
              href={`tel:${listing.farmer_phone}`}
              className="mt-2 flex w-full items-center justify-center gap-2 bg-white hover:bg-gray-50 text-green-700 border border-green-600 font-bold py-2 rounded-lg transition-colors text-sm"
            >
              <Phone className="w-4 h-4" strokeWidth={2.5} />
              <span>{t('call')} {listing.farmer_phone}</span>
            </a>
          ) : (
            <button
              onClick={onReveal}
              className="mt-2 w-full bg-white hover:bg-gray-50 text-green-700 border border-green-600 font-bold py-2 rounded-lg transition-colors text-sm inline-flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" strokeWidth={2.5} />
              <span>{t('contactFarmer')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
