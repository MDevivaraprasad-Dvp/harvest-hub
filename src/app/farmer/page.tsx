'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Sprout, Tractor, Camera, MapPin, Plus, Pencil, Trash2,
  Phone, Package, ArrowRight, X, Check, RefreshCw,
  BarChart3, Handshake, LayoutDashboard, User, Brain, ClipboardList,
} from 'lucide-react'
import { supabase, type Listing, type Order, type OrderStatus } from '@/lib/supabase'
import { useLanguage } from '@/lib/LanguageContext'
import { MarketInsights } from '@/components/MarketInsights'
import { ListingAnalytics } from '@/components/ListingAnalytics'
import { Sidebar, SidebarLayout, type SidebarItem } from '@/components/Sidebar'
import { FarmerContracts } from '@/components/Contracts'
import { KnowledgeNetwork } from '@/components/KnowledgeNetwork'
import { SkeletonGrid, SkeletonRow } from '@/components/ui/Skeleton'
import { useUrlTab } from '@/lib/hooks/useUrlTab'
import { prefetchListings, prefetchOrders, prefetchContracts } from '@/lib/prefetch'

type FarmerProfile = { name: string; phone: string }
type FarmerTab = 'listings' | 'orders' | 'contracts' | 'insights' | 'knowledge'
const FARMER_TABS: readonly FarmerTab[] = ['listings', 'orders', 'contracts', 'insights', 'knowledge'] as const

export default function FarmerPage() {
  const { t } = useLanguage()
  const [profile, setProfile] = useState<FarmerProfile | null>(null)
  const [showSignIn, setShowSignIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useUrlTab<FarmerTab>('listings', FARMER_TABS)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const stored = localStorage.getItem('farmeasy_farmer')
    if (stored) setProfile(JSON.parse(stored))
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!profile) return
    const loadPending = async () => {
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('farmer_phone', profile.phone)
        .in('status', ['pending', 'negotiating'])
      setPendingCount(count ?? 0)
    }
    loadPending()
  }, [profile, tab])

  const handleSignIn = (name: string, phone: string) => {
    const p = { name, phone }
    localStorage.setItem('farmeasy_farmer', JSON.stringify(p))
    setProfile(p)
    setShowSignIn(false)
  }

  const handleSignOut = () => {
    localStorage.removeItem('farmeasy_farmer')
    setProfile(null)
    setTab('listings')
  }

  if (loading) return null

  const items: (SidebarItem & { key: FarmerTab })[] = [
    { key: 'listings', label: t('myListings'), Icon: LayoutDashboard, onPrefetch: profile ? () => prefetchListings(profile.phone) : undefined },
    { key: 'orders', label: t('orders'), Icon: ClipboardList, badge: pendingCount, onPrefetch: profile ? () => prefetchOrders({ farmerPhone: profile.phone }) : undefined },
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
        subtitle={t('welcomeFarmer')}
        userName={profile?.name}
        onSignOut={profile ? handleSignOut : undefined}
      />
      <SidebarLayout>
        <main className="max-w-[1400px] mx-auto px-6 py-8">
          {tab === 'listings' && (
            profile ? <ListingsView profile={profile} /> : <SignInGate onSignIn={() => setShowSignIn(true)} />
          )}
          {tab === 'orders' && (
            profile ? <OrdersView profile={profile} /> : <SignInGate onSignIn={() => setShowSignIn(true)} />
          )}
          {tab === 'contracts' && (
            <FarmerContracts profile={profile} onSignInRequired={() => setShowSignIn(true)} />
          )}
          {tab === 'insights' && (
            <div>
              <div className="mb-6">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-green-900 tracking-tight">{t('marketInsights')}</h1>
                <p className="text-gray-600 mt-1">{t('insightsSubtitle')}</p>
              </div>
              <MarketInsights />
            </div>
          )}
          {tab === 'knowledge' && <KnowledgeNetwork />}
        </main>
      </SidebarLayout>

      {showSignIn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-green-900">{t('welcomeFarmer')}</h2>
                <button
                  onClick={() => setShowSignIn(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <SignInForm onSignIn={handleSignIn} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function SignInGate({ onSignIn }: { onSignIn: () => void }) {
  const { t } = useLanguage()
  return (
    <div className="bg-linear-to-r from-green-600 to-green-700 text-white rounded-2xl shadow-lg p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Tractor className="w-12 h-12 shrink-0" />
        <div>
          <div className="text-2xl font-bold">{t('welcomeFarmer')}</div>
          <p className="text-green-50 text-sm mt-1">{t('signInPrompt')}</p>
        </div>
      </div>
      <button
        onClick={onSignIn}
        className="bg-white text-green-700 hover:bg-green-50 font-semibold px-6 py-3 rounded-lg shadow whitespace-nowrap inline-flex items-center gap-2"
      >
        <span>{t('signInToSell')}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  )
}

function SignInForm({ onSignIn }: { onSignIn: (name: string, phone: string) => void }) {
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (name.trim() && phone.trim()) {
      onSignIn(name.trim(), phone.trim())
      setName('')
      setPhone('')
    }
  }

  return (
    <div>
      <p className="text-gray-600 mb-4">{t('signInPrompt')}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('yourName')}</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('yourNamePlaceholder')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {t('continue')}
        </button>
      </form>
    </div>
  )
}

function ListingsView({ profile }: { profile: FarmerProfile }) {
  const { t } = useLanguage()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Listing | null>(null)
  const [analyticsListing, setAnalyticsListing] = useState<Listing | null>(null)

  const fetchListings = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('farmer_phone', profile.phone)
      .order('created_at', { ascending: false })
    if (error) console.error(error)
    setListings(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchListings()
  }, [profile.phone])

  const handleDelete = async (id: number) => {
    if (!confirm(t('confirmDelete'))) return
    const { error } = await supabase.from('listings').delete().eq('id', id)
    if (error) return alert(error.message)
    fetchListings()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-green-900 tracking-tight">{t('myListings')}</h1>
          <p className="text-gray-600 mt-1">
            {listings.length} {listings.length === 1 ? t('activeListings') : t('activeListingsPlural')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/farmer/${encodeURIComponent(profile.phone)}`}
            className="bg-white border border-green-600 text-green-700 hover:bg-green-50 font-semibold px-4 py-3 rounded-lg inline-flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            <span>{t('viewProfile')}</span>
          </Link>
          <button
            onClick={() => { setEditing(null); setShowForm(true) }}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>{t('addProduce').replace('+ ', '')}</span>
          </button>
        </div>
      </div>

      {showForm && (
        <ListingForm
          profile={profile}
          existing={editing}
          onClose={() => { setShowForm(false); setEditing(null) }}
          onSaved={() => { setShowForm(false); setEditing(null); fetchListings() }}
        />
      )}

      {loading ? (
        <SkeletonGrid count={4} />
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <Sprout className="w-16 h-16 text-green-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{t('noListingsYet')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {listings.map((l) => (
            <div key={l.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {l.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={l.image_url} alt={l.produce_name} className="w-full h-40 object-cover" />
              )}
              <div className="p-4">
                <h3 className="font-extrabold text-lg text-green-900 tracking-tight truncate" title={l.produce_name}>{l.produce_name}</h3>
                <p className="text-sm text-gray-600 mt-1 inline-flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-green-600" />
                  <span className="truncate">{l.location}</span>
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-extrabold text-green-700 tabular-nums leading-none">₹{l.price_per_kg}<span className="text-sm font-semibold text-gray-500">/kg</span></div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mt-1">{l.quantity_kg} {t('kgAvailable')}</div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => { setEditing(l); setShowForm(true) }}
                    className="flex-1 text-sm bg-gray-100 hover:bg-gray-200 py-2 rounded-lg font-medium inline-flex items-center justify-center gap-1"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>{t('edit')}</span>
                  </button>
                  <button
                    onClick={() => handleDelete(l.id)}
                    className="flex-1 text-sm bg-red-50 hover:bg-red-100 text-red-700 py-2 rounded-lg font-medium inline-flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('delete')}</span>
                  </button>
                </div>
                <button
                  onClick={() => setAnalyticsListing(l)}
                  className="mt-2 w-full text-sm bg-green-50 hover:bg-green-100 text-green-800 py-2 rounded-lg font-medium inline-flex items-center justify-center gap-1"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>{t('viewAnalytics')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {analyticsListing && (
        <ListingAnalytics
          listing={analyticsListing}
          onClose={() => setAnalyticsListing(null)}
        />
      )}
    </div>
  )
}

function OrdersView({ profile }: { profile: FarmerProfile }) {
  const { t } = useLanguage()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [counteringOrder, setCounteringOrder] = useState<Order | null>(null)

  const fetchOrders = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('farmer_phone', profile.phone)
      .order('created_at', { ascending: false })
    if (error) console.error(error)
    setOrders(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  }, [profile.phone])

  const updateStatus = async (id: number, newStatus: OrderStatus, confirmKey: 'confirmMarkCompleted' | 'confirmCancelOrder') => {
    if (!confirm(t(confirmKey))) return
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id)
    if (error) return alert(error.message)
    fetchOrders()
  }

  const acceptOffer = async (o: Order) => {
    if (!confirm(t('confirmAcceptOffer'))) return
    const agreed = o.offered_price ?? o.price_per_kg
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'pending', price_per_kg: agreed })
        .eq('id', o.id)
      if (error) {
        console.error('acceptOffer failed', error)
        alert(error.message || 'Update failed')
        return
      }
      fetchOrders()
    } catch (e) {
      console.error('acceptOffer threw', e)
      alert(e instanceof Error ? e.message : String(e))
    }
  }

  const rejectOffer = async (o: Order) => {
    if (!confirm(t('confirmRejectOffer'))) return
    try {
      const { error } = await supabase.from('orders').update({ status: 'cancelled' }).eq('id', o.id)
      if (error) {
        console.error('rejectOffer failed', error)
        alert(error.message || 'Update failed')
        return
      }
      fetchOrders()
    } catch (e) {
      console.error('rejectOffer threw', e)
      alert(e instanceof Error ? e.message : String(e))
    }
  }

  const groupedNegotiating = orders.filter((o) => o.status === 'negotiating' || o.status === 'counter_offered')
  const groupedPending = orders.filter((o) => o.status === 'pending')
  const groupedCompleted = orders.filter((o) => o.status === 'completed')
  const groupedCancelled = orders.filter((o) => o.status === 'cancelled')

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-green-900 tracking-tight">{t('orders')}</h1>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <Package className="w-16 h-16 text-green-300 mx-auto mb-4" />
          <p className="text-gray-600">{t('noOrdersYet')}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedNegotiating.length > 0 && (
            <OrderGroup
              title={t('negotiationPending')}
              orders={groupedNegotiating}
              onAcceptOffer={acceptOffer}
              onRejectOffer={rejectOffer}
              onCounterOffer={setCounteringOrder}
            />
          )}
          {groupedPending.length > 0 && (
            <OrderGroup
              title={t('pendingOrders')}
              orders={groupedPending}
              onMarkCompleted={(id) => updateStatus(id, 'completed', 'confirmMarkCompleted')}
              onCancel={(id) => updateStatus(id, 'cancelled', 'confirmCancelOrder')}
            />
          )}
          {groupedCompleted.length > 0 && (
            <OrderGroup title={t('completedOrders')} orders={groupedCompleted} />
          )}
          {groupedCancelled.length > 0 && (
            <OrderGroup title={t('cancelledOrders')} orders={groupedCancelled} />
          )}
        </div>
      )}

      {counteringOrder && (
        <CounterOfferModal
          order={counteringOrder}
          onClose={() => setCounteringOrder(null)}
          onSent={() => { setCounteringOrder(null); fetchOrders() }}
        />
      )}
    </div>
  )
}

function CounterOfferModal({
  order,
  onClose,
  onSent,
}: {
  order: Order
  onClose: () => void
  onSent: () => void
}) {
  const { t } = useLanguage()
  const [price, setPrice] = useState(
    order.offered_price != null ? String(order.offered_price) : String(order.price_per_kg)
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const num = parseFloat(price)
    if (isNaN(num) || num <= 0) return setError(t('quantityRequired'))
    setSubmitting(true)
    const { error: dbErr } = await supabase
      .from('orders')
      .update({ status: 'counter_offered', counter_price: num })
      .eq('id', order.id)
    setSubmitting(false)
    if (dbErr) return setError(dbErr.message)
    onSent()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-green-900">{t('counterOffer')}</h2>
              <p className="text-sm text-gray-600 mt-0.5">
                {order.produce_name} · {order.buyer_name}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('listedAt')}</span>
              <span className="font-semibold text-gray-900">₹{order.price_per_kg}/kg</span>
            </div>
            {order.offered_price != null && (
              <div className="flex justify-between mt-1">
                <span className="text-gray-600">{t('yourOffer').replace('Your', "Buyer's")}</span>
                <span className="font-semibold text-blue-700">₹{order.offered_price}/kg</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('counterPriceLabel')}</label>
              <input
                type="number"
                required
                step="0.5"
                min="0.5"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">{error}</div>
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
                {submitting ? t('saving') : t('submitCounter')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function OrderGroup({
  title,
  orders,
  onMarkCompleted,
  onCancel,
  onAcceptOffer,
  onRejectOffer,
  onCounterOffer,
}: {
  title: string
  orders: Order[]
  onMarkCompleted?: (id: number) => void
  onCancel?: (id: number) => void
  onAcceptOffer?: (o: Order) => void
  onRejectOffer?: (o: Order) => void
  onCounterOffer?: (o: Order) => void
}) {
  const { t } = useLanguage()
  return (
    <div>
      <h2 className="text-xl font-extrabold text-green-900 mb-3 tracking-tight">
        {title} <span className="text-gray-400 font-bold">({orders.length})</span>
      </h2>
      <div className="space-y-3">
        {orders.map((o) => {
          const total = o.quantity_kg * o.price_per_kg
          const statusMeta: Record<OrderStatus, { cls: string; label: string }> = {
            pending: { cls: 'bg-yellow-100 text-yellow-800', label: t('orderStatusPending') },
            completed: { cls: 'bg-green-100 text-green-800', label: t('orderStatusCompleted') },
            cancelled: { cls: 'bg-gray-100 text-gray-600', label: t('orderStatusCancelled') },
            negotiating: { cls: 'bg-blue-100 text-blue-800', label: t('orderStatusNegotiating') },
            counter_offered: { cls: 'bg-purple-100 text-purple-800', label: t('orderStatusCounterOffered') },
          }
          const meta = statusMeta[o.status] ?? { cls: 'bg-gray-100 text-gray-600', label: String(o.status) }

          return (
            <div key={o.id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-lg text-green-900 tracking-tight">{o.produce_name}</h3>
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${meta.cls}`}>
                      {meta.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1 font-medium">
                    <span className="tabular-nums">{o.quantity_kg}</span> kg × <span className="tabular-nums">₹{o.price_per_kg}</span>/kg =
                    <span className="font-extrabold text-green-700 text-base tabular-nums"> ₹{total.toFixed(2)}</span>
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('buyer')}</span>
                      <span className="ml-1.5 font-bold text-green-900">{o.buyer_name}</span>
                    </div>
                    <a href={`tel:${o.buyer_phone}`} className="text-sm font-bold text-green-700 hover:underline inline-flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" strokeWidth={2.5} /> {o.buyer_phone}
                    </a>
                  </div>
                  {o.note && (
                    <p className="text-sm text-gray-600 mt-1 italic">&ldquo;{o.note}&rdquo;</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(o.created_at).toLocaleString()}
                  </p>

                  {o.status === 'negotiating' && o.offered_price != null && (
                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
                      <div className="font-semibold inline-flex items-center gap-1 mb-1">
                        <Handshake className="w-3.5 h-3.5" />
                        {t('yourOffer').replace('Your', "Buyer's")}: ₹{o.offered_price}/kg
                      </div>
                      <p className="text-xs">
                        {t('listedAt')} ₹{o.price_per_kg}/kg
                      </p>
                    </div>
                  )}

                  {o.status === 'counter_offered' && o.counter_price != null && (
                    <div className="mt-3 bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm text-purple-900">
                      <div className="font-semibold inline-flex items-center gap-1">
                        <Handshake className="w-3.5 h-3.5" />
                        {t('awaitingFarmer').replace('farmer', 'buyer')} · ₹{o.counter_price}/kg
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  {onMarkCompleted && onCancel && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onMarkCompleted(o.id)}
                        className="text-sm bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-2 rounded-lg inline-flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        <span>{t('markCompleted')}</span>
                      </button>
                      <button
                        onClick={() => onCancel(o.id)}
                        className="text-sm bg-red-50 hover:bg-red-100 text-red-700 font-medium px-3 py-2 rounded-lg inline-flex items-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        <span>{t('cancelOrder')}</span>
                      </button>
                    </div>
                  )}
                  {o.status === 'negotiating' && onAcceptOffer && onRejectOffer && onCounterOffer && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => onAcceptOffer(o)}
                        className="text-sm bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-2 rounded-lg inline-flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        <span>{t('acceptOffer')}</span>
                      </button>
                      <button
                        onClick={() => onCounterOffer(o)}
                        className="text-sm bg-purple-600 hover:bg-purple-700 text-white font-medium px-3 py-2 rounded-lg inline-flex items-center gap-1"
                      >
                        <Handshake className="w-4 h-4" />
                        <span>{t('counterOffer')}</span>
                      </button>
                      <button
                        onClick={() => onRejectOffer(o)}
                        className="text-sm bg-red-50 hover:bg-red-100 text-red-700 font-medium px-3 py-2 rounded-lg inline-flex items-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        <span>{t('rejectOffer')}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ListingForm({
  profile,
  existing,
  onClose,
  onSaved,
}: {
  profile: FarmerProfile
  existing: Listing | null
  onClose: () => void
  onSaved: () => void
}) {
  const { t } = useLanguage()
  const [produceName, setProduceName] = useState(existing?.produce_name ?? '')
  const [quantityKg, setQuantityKg] = useState(existing?.quantity_kg?.toString() ?? '')
  const [pricePerKg, setPricePerKg] = useState(existing?.price_per_kg?.toString() ?? '')
  const [location, setLocation] = useState(existing?.location ?? '')
  const [imageUrl, setImageUrl] = useState(existing?.image_url ?? '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(existing?.image_url ?? null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setImageUrl('')
  }

  const resetForm = () => {
    setProduceName('')
    setQuantityKg('')
    setPricePerKg('')
    setLocation('')
    setImageUrl('')
    setImageFile(null)
    setPreviewUrl(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleCancel = () => {
    resetForm()
    onClose()
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return imageUrl || null
    setUploading(true)
    setError(null)

    const ext = imageFile.name.split('.').pop() || 'jpg'
    const path = `${profile.phone}/${Date.now()}.${ext}`

    const { error: uploadErr } = await supabase.storage
      .from('produce-images')
      .upload(path, imageFile, { contentType: imageFile.type, upsert: false })

    if (uploadErr) {
      setUploading(false)
      setError(uploadErr.message)
      return null
    }

    const { data } = supabase.storage.from('produce-images').getPublicUrl(path)
    setUploading(false)
    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!existing && !imageFile) {
      setError(t('photoRequired'))
      return
    }

    setSaving(true)
    const finalImageUrl = await uploadImage()
    if (imageFile && !finalImageUrl) {
      setSaving(false)
      return
    }

    const payload = {
      farmer_name: profile.name,
      farmer_phone: profile.phone,
      produce_name: produceName.trim(),
      quantity_kg: parseFloat(quantityKg),
      price_per_kg: parseFloat(pricePerKg),
      location: location.trim(),
      image_url: finalImageUrl,
    }
    const { error: dbErr } = existing
      ? await supabase.from('listings').update(payload).eq('id', existing.id)
      : await supabase.from('listings').insert(payload)
    setSaving(false)
    if (dbErr) return setError(dbErr.message)
    resetForm()
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-green-900 mb-4">
            {existing ? t('editListing') : t('addNewProduce')}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label={t('produceName')} placeholder={t('producePlaceholder')} value={produceName} onChange={setProduceName} required />
            <div className="grid grid-cols-2 gap-4">
              <Field label={t('quantityKg')} type="number" placeholder="50" value={quantityKg} onChange={setQuantityKg} required />
              <Field label={t('pricePerKg')} type="number" placeholder="25" value={pricePerKg} onChange={setPricePerKg} required />
            </div>
            <Field label={t('location')} placeholder={t('locationPlaceholder')} value={location} onChange={setLocation} required />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('capturePhoto')} {!existing && <span className="text-red-500">*</span>}
              </label>
              {previewUrl ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover rounded-lg border border-gray-200" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 w-full bg-gray-100 hover:bg-gray-200 py-2 rounded-lg font-medium text-sm inline-flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>{t('retakePhoto')}</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-6 border-2 border-dashed border-green-300 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 font-medium flex flex-col items-center gap-2"
                >
                  <Camera className="w-8 h-8" />
                  <span>{t('capturePhoto')}</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCapture}
                className="hidden"
              />
              <p className="text-xs text-gray-500 mt-2">{t('photoHint')}</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving || uploading}
                className="flex-1 bg-gray-100 hover:bg-gray-200 font-medium py-3 rounded-lg disabled:opacity-50"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={saving || uploading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50"
              >
                {uploading ? t('uploadingPhoto') : saving ? t('saving') : existing ? t('update') : t('addListing')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        step={type === 'number' ? '0.01' : undefined}
        min={type === 'number' ? '0' : undefined}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
      />
    </div>
  )
}
