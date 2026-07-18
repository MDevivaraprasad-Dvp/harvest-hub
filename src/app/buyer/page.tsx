'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Sprout, ShoppingCart, MapPin, Search, Phone, Leaf,
  BarChart3, ArrowRight, Store, Heart, ClipboardList,
  LogOut, X, User,
} from 'lucide-react'
import { supabase, type Listing, type Review } from '@/lib/supabase'
import { useLanguage, LanguageSelector } from '@/lib/LanguageContext'
import { RatingSummary } from '@/components/StarRating'
import { BuyerInsights } from '@/components/BuyerInsights'
import { CustomSelect } from '@/components/CustomSelect'
import { FavoriteHeart } from '@/components/FavoriteHeart'
import { OrderForm } from '@/components/OrderForm'
import { BuyerOrders } from '@/components/BuyerOrders'
import { readFavorites } from '@/lib/favorites'

type FarmerStats = { average: number | null; count: number }
type BuyerProfile = { name: string; phone: string }
type Tab = 'marketplace' | 'saved' | 'orders' | 'insights'

const PAGE_SIZE = 12

export default function BuyerPage() {
  const { t } = useLanguage()
  const [tab, setTab] = useState<Tab>('marketplace')
  const [listings, setListings] = useState<Listing[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<number[]>([])
  const [profile, setProfile] = useState<BuyerProfile | null>(null)
  const [showSignIn, setShowSignIn] = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      const [lRes, rRes] = await Promise.all([
        supabase.from('listings').select('*').order('created_at', { ascending: false }),
        supabase.from('reviews').select('*'),
      ])
      if (lRes.error) console.error(lRes.error)
      if (rRes.error) console.error(rRes.error)
      setListings(lRes.data ?? [])
      setReviews(rRes.data ?? [])
      setLoading(false)
    }
    fetchAll()
  }, [])

  useEffect(() => {
    setFavorites(readFavorites())
    const handler = () => setFavorites(readFavorites())
    window.addEventListener('farmeasy:favorites-changed', handler)
    return () => window.removeEventListener('farmeasy:favorites-changed', handler)
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('farmeasy_buyer')
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as BuyerProfile
        if (parsed?.name && parsed?.phone) setProfile(parsed)
      } catch {}
    }
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

  return (
    <div className="min-h-screen bg-green-50">
      <header className="bg-white shadow-sm">
        <div className="w-full px-6 lg:px-10 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-green-600 flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-green-800">{t('appName')}</span>
          </Link>
          <div className="flex items-center gap-3">
            {profile ? (
              <span className="hidden sm:inline text-sm text-gray-600">
                {t('hi')}, <span className="font-semibold text-green-800">{profile.name}</span>
              </span>
            ) : (
              <span className="hidden sm:inline text-sm text-gray-600">{t('buyerMarketplace')}</span>
            )}
            <LanguageSelector />
            {profile ? (
              <button
                onClick={handleSignOut}
                className="text-sm text-red-600 hover:underline inline-flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t('signOut')}</span>
              </button>
            ) : (
              <button
                onClick={() => setShowSignIn(true)}
                className="text-sm bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1.5 rounded-lg inline-flex items-center gap-1"
              >
                <User className="w-4 h-4" />
                <span>{t('signInAsBuyer')}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="flex gap-2 mb-6 border-b border-gray-200 flex-wrap">
          <TabButton active={tab === 'marketplace'} onClick={() => setTab('marketplace')} icon={<Store className="w-4 h-4" />} label={t('tabMarketplace')} />
          <TabButton active={tab === 'saved'} onClick={() => setTab('saved')} icon={<Heart className="w-4 h-4" />} label={t('tabSaved')} badge={favorites.length > 0 ? favorites.length : undefined} />
          <TabButton active={tab === 'orders'} onClick={() => setTab('orders')} icon={<ClipboardList className="w-4 h-4" />} label={t('tabMyOrders')} />
          <TabButton active={tab === 'insights'} onClick={() => setTab('insights')} icon={<BarChart3 className="w-4 h-4" />} label={t('tabInsights')} />
        </div>

        {tab === 'insights' && (
          <>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-green-900">{t('marketInsights')}</h1>
              <p className="text-gray-600 mt-1">{t('buyerInsightsSubtitle')}</p>
            </div>
            <BuyerInsights />
          </>
        )}

        {tab === 'orders' && (
          <>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-green-900">{t('tabMyOrders')}</h1>
              <p className="text-gray-600 mt-1">{t('myOrdersSubtitle')}</p>
            </div>
            <BuyerOrders />
          </>
        )}

        {tab === 'marketplace' && (
          <>
            {!profile && (
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
                  <span>{t('signInToBuy')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
            <MarketplaceView
              listings={listings}
              farmerStats={farmerStats}
              loading={loading}
              trackViews
            />
          </>
        )}

        {tab === 'saved' && (
          <SavedView
            listings={listings.filter((l) => favorites.includes(l.id))}
            farmerStats={farmerStats}
            loading={loading}
            emptyMessage={t('noFavoritesYet')}
          />
        )}

        {showSignIn && (
          <BuyerSignInModal
            onClose={() => setShowSignIn(false)}
            onSignIn={handleSignIn}
          />
        )}
      </main>
    </div>
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
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && phone.trim()) {
      onSignIn(name.trim(), phone.trim())
      setName('')
      setPhone('')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-green-900">{t('welcomeBuyer')}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-600 mb-4 text-sm">{t('signInBuyerPrompt')}</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('yourName')}</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('yourNamePlaceholder')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('phoneNumber')}</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('phonePlaceholder')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg"
            >
              {t('continue')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  label,
  icon,
  badge,
}: {
  active: boolean
  onClick: () => void
  label: string
  icon?: React.ReactNode
  badge?: number
}) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2.5 font-medium transition-colors inline-flex items-center gap-2 ${
        active
          ? 'text-green-800 border-b-2 border-green-600'
          : 'text-gray-600 hover:text-green-700'
      }`}
    >
      {icon}
      <span>{label}</span>
      {badge !== undefined && (
        <span className="ml-1 inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 text-xs font-semibold bg-green-600 text-white rounded-full">
          {badge}
        </span>
      )}
    </button>
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
  const [locationFilter, setLocationFilter] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [orderingListing, setOrderingListing] = useState<Listing | null>(null)
  const [revealedPhone, setRevealedPhone] = useState<Record<number, boolean>>({})

  const locations = useMemo(() => {
    const set = new Set(listings.map((l) => l.location))
    return Array.from(set).sort()
  }, [listings])

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      const matchesSearch = search.trim() === '' || l.produce_name.toLowerCase().includes(search.toLowerCase())
      const matchesLocation = locationFilter === '' || l.location === locationFilter
      return matchesSearch && matchesLocation
    })
  }, [listings, search, locationFilter])

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [search, locationFilter])

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
        <h1 className="text-3xl font-bold text-green-900">{t('freshFromFarm')}</h1>
        <p className="text-gray-600 mt-1">{t('browseSubtitle')}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder={t('searchPlaceholder').replace('🔍 ', '')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
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

      {loading ? (
        <p className="text-gray-500">{t('loadingProduce')}</p>
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
          onPlaced={() => { setOrderingListing(null); alert(t('orderPlaced')) }}
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
  const [orderingListing, setOrderingListing] = useState<Listing | null>(null)
  const [revealedPhone, setRevealedPhone] = useState<Record<number, boolean>>({})

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-green-900">{t('tabSaved')}</h1>
        <p className="text-gray-600 mt-1">{t('savedSubtitle')}</p>
      </div>

      {loading ? (
        <p className="text-gray-500">{t('loadingProduce')}</p>
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
          onPlaced={() => { setOrderingListing(null); alert(t('orderPlaced')) }}
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

  return (
    <div ref={cardRef} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow relative">
      <FavoriteHeart listingId={listing.id} className="absolute top-3 right-3 z-10 w-9 h-9 shadow-md" />
      {listing.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={listing.image_url} alt={listing.produce_name} className="w-full h-48 object-cover" />
      ) : (
        <div className="w-full h-48 bg-linear-to-br from-green-100 to-green-200 flex items-center justify-center">
          <Leaf className="w-14 h-14 text-green-600" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-lg text-green-900 truncate min-w-0 flex-1" title={listing.produce_name}>{listing.produce_name}</h3>
          <div className="text-right shrink-0">
            <div className="text-xl font-bold text-green-700">₹{listing.price_per_kg}<span className="text-xs font-normal text-gray-500">/kg</span></div>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-1 flex items-center gap-1 min-w-0">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate" title={listing.location}>{listing.location}</span>
        </p>
        <p className="text-sm text-gray-500 mt-1 inline-flex items-center gap-1">
          <Sprout className="w-3.5 h-3.5" />
          <span>{listing.quantity_kg} {t('kgAvailable')}</span>
        </p>

        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-700 truncate" title={listing.farmer_name}>
                <span className="font-medium">{t('farmer')}:</span> {listing.farmer_name}
              </p>
              <div className="mt-0.5">
                <RatingSummary average={farmerStats?.average ?? null} count={farmerStats?.count ?? 0} />
              </div>
            </div>
            <Link
              href={`/farmer/${encodeURIComponent(listing.farmer_phone)}`}
              className="text-xs text-green-700 hover:underline whitespace-nowrap inline-flex items-center gap-1 shrink-0"
            >
              <span>{t('viewProfile')}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <button
            onClick={onOrder}
            className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{t('placeOrder')}</span>
          </button>

          {revealed ? (
            <a
              href={`tel:${listing.farmer_phone}`}
              className="mt-2 flex w-full items-center justify-center gap-2 bg-white hover:bg-gray-50 text-green-700 border border-green-600 font-semibold py-2 rounded-lg transition-colors text-sm"
            >
              <Phone className="w-4 h-4" />
              <span>{t('call')} {listing.farmer_phone}</span>
            </a>
          ) : (
            <button
              onClick={onReveal}
              className="mt-2 w-full bg-white hover:bg-gray-50 text-green-700 border border-green-600 font-semibold py-2 rounded-lg transition-colors text-sm inline-flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>{t('contactFarmer')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
