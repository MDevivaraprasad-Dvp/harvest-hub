'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Sprout, ShoppingCart, MapPin, Search, Phone, Leaf,
  BarChart3, ArrowRight, Store,
} from 'lucide-react'
import { supabase, type Listing, type Review } from '@/lib/supabase'
import { useLanguage, LanguageSelector } from '@/lib/LanguageContext'
import { RatingSummary } from '@/components/StarRating'
import { BuyerInsights } from '@/components/BuyerInsights'
import { CustomSelect } from '@/components/CustomSelect'

type FarmerStats = { average: number | null; count: number }

const PAGE_SIZE = 12

export default function BuyerPage() {
  const { t } = useLanguage()
  const [tab, setTab] = useState<'marketplace' | 'insights'>('marketplace')
  const [listings, setListings] = useState<Listing[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [revealedPhone, setRevealedPhone] = useState<Record<number, boolean>>({})
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [orderingListing, setOrderingListing] = useState<Listing | null>(null)

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
  }, [search, locationFilter, tab])

  useEffect(() => {
    if (tab !== 'marketplace') return
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
  }, [tab, filtered.length, visibleCount])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

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
            <span className="hidden sm:inline text-sm text-gray-600">{t('buyerMarketplace')}</span>
            <LanguageSelector />
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <TabButton active={tab === 'marketplace'} onClick={() => setTab('marketplace')} icon={<Store className="w-4 h-4" />} label={t('tabMarketplace')} />
          <TabButton active={tab === 'insights'} onClick={() => setTab('insights')} icon={<BarChart3 className="w-4 h-4" />} label={t('tabInsights')} />
        </div>

        {tab === 'insights' ? (
          <>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-green-900">{t('marketInsights')}</h1>
              <p className="text-gray-600 mt-1">{t('buyerInsightsSubtitle')}</p>
            </div>
            <BuyerInsights />
          </>
        ) : (
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
            {visible.map((l) => {
              const stats = farmerStats.get(l.farmer_phone)
              return (
                <div key={l.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  {l.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={l.image_url} alt={l.produce_name} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 bg-linear-to-br from-green-100 to-green-200 flex items-center justify-center">
                      <Leaf className="w-14 h-14 text-green-600" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-lg text-green-900">{l.produce_name}</h3>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-700">₹{l.price_per_kg}<span className="text-xs font-normal text-gray-500">/kg</span></div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{l.location}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1 inline-flex items-center gap-1">
                      <Sprout className="w-3.5 h-3.5" />
                      <span>{l.quantity_kg} {t('kgAvailable')}</span>
                    </p>

                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">{t('farmer')}:</span> {l.farmer_name}
                          </p>
                          <div className="mt-0.5">
                            <RatingSummary average={stats?.average ?? null} count={stats?.count ?? 0} />
                          </div>
                        </div>
                        <Link
                          href={`/farmer/${encodeURIComponent(l.farmer_phone)}`}
                          className="text-xs text-green-700 hover:underline whitespace-nowrap inline-flex items-center gap-1"
                        >
                          <span>{t('viewProfile')}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>

                      <button
                        onClick={() => setOrderingListing(l)}
                        className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>{t('placeOrder')}</span>
                      </button>

                      {revealedPhone[l.id] ? (
                        <a
                          href={`tel:${l.farmer_phone}`}
                          className="mt-2 flex w-full items-center justify-center gap-2 bg-white hover:bg-gray-50 text-green-700 border border-green-600 font-semibold py-2 rounded-lg transition-colors text-sm"
                        >
                          <Phone className="w-4 h-4" />
                          <span>{t('call')} {l.farmer_phone}</span>
                        </a>
                      ) : (
                        <button
                          onClick={() => setRevealedPhone((p) => ({ ...p, [l.id]: true }))}
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
            })}
          </div>
          {hasMore && (
            <div ref={sentinelRef} className="mt-8 text-center text-sm text-gray-500 flex items-center justify-center gap-2 py-4">
              <Sprout className="w-4 h-4 text-green-500 animate-pulse" />
              <span>Loading more produce...</span>
            </div>
          )}
          {!hasMore && filtered.length > PAGE_SIZE && (
            <p className="mt-8 text-center text-sm text-gray-400 py-4">
              Showing all {filtered.length} listings
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
        )}
      </main>
    </div>
  )
}

function TabButton({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 font-medium transition-colors inline-flex items-center gap-2 ${
        active
          ? 'text-green-800 border-b-2 border-green-600'
          : 'text-gray-600 hover:text-green-700'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

function OrderForm({
  listing,
  onClose,
  onPlaced,
}: {
  listing: Listing
  onClose: () => void
  onPlaced: () => void
}) {
  const { t } = useLanguage()
  const [buyerName, setBuyerName] = useState('')
  const [buyerPhone, setBuyerPhone] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('farmeasy_buyer')
    if (stored) {
      const b = JSON.parse(stored) as { name: string; phone: string }
      setBuyerName(b.name)
      setBuyerPhone(b.phone)
    }
  }, [])

  const qtyNum = parseFloat(quantity)
  const total = !isNaN(qtyNum) && qtyNum > 0 ? qtyNum * listing.price_per_kg : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (isNaN(qtyNum) || qtyNum <= 0) return setError(t('quantityRequired'))

    setSubmitting(true)
    localStorage.setItem('farmeasy_buyer', JSON.stringify({
      name: buyerName.trim(),
      phone: buyerPhone.trim(),
    }))
    localStorage.setItem('farmeasy_buyer_name', buyerName.trim())

    const { error: dbErr } = await supabase.from('orders').insert({
      farmer_phone: listing.farmer_phone,
      buyer_name: buyerName.trim(),
      buyer_phone: buyerPhone.trim(),
      listing_id: listing.id,
      produce_name: listing.produce_name,
      quantity_kg: qtyNum,
      price_per_kg: listing.price_per_kg,
      status: 'pending',
      note: note.trim() || null,
    })
    setSubmitting(false)
    if (dbErr) return setError(dbErr.message)
    onPlaced()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-green-900 mb-1">{t('placeOrder')}</h2>
          <p className="text-sm text-gray-600 mb-4">
            {listing.produce_name} · ₹{listing.price_per_kg}/kg · {listing.farmer_name}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('yourName')}</label>
              <input
                type="text"
                required
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder={t('yourNamePlaceholder')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('yourPhone')}</label>
              <input
                type="tel"
                required
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                placeholder={t('phonePlaceholder')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('quantityKg')}</label>
              <input
                type="number"
                required
                step="0.1"
                min="0.1"
                max={listing.quantity_kg}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">{listing.quantity_kg} {t('kgAvailable')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('orderNote')}</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t('orderNotePlaceholder')}
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-none"
              />
            </div>

            {total > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                <span className="text-sm text-gray-700">{t('orderTotal')}</span>
                <span className="text-xl font-bold text-green-700">₹{total.toFixed(2)}</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 bg-gray-100 hover:bg-gray-200 font-medium py-3 rounded-lg disabled:opacity-50"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50"
              >
                {submitting ? t('saving') : t('placeOrder')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
