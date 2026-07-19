'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Package, Phone, RefreshCw, Handshake, ShoppingCart, Check, X, Clock,
} from 'lucide-react'
import { supabase, type Order, type Listing } from '@/lib/supabase'
import { useLanguage } from '@/lib/LanguageContext'
import { OrderForm } from './OrderForm'

type BuyerIdentity = { name: string; phone: string }

export function BuyerOrders() {
  const { t } = useLanguage()
  const [identity, setIdentity] = useState<BuyerIdentity | null>(null)
  const [phoneInput, setPhoneInput] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [reorderListing, setReorderListing] = useState<Listing | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('farmeasy_buyer')
    if (stored) {
      const parsed = JSON.parse(stored) as BuyerIdentity
      setIdentity(parsed)
      setPhoneInput(parsed.phone)
    }
  }, [])

  const fetchOrders = async (phone: string) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('buyer_phone', phone)
      .order('created_at', { ascending: false })
    if (error) console.error(error)
    setOrders(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    if (identity?.phone) fetchOrders(identity.phone)
  }, [identity?.phone])

  const handleLoadByPhone = (e: React.FormEvent) => {
    e.preventDefault()
    const phone = phoneInput.trim()
    if (!phone) return
    const existing = localStorage.getItem('farmeasy_buyer')
    const name = existing ? (JSON.parse(existing) as BuyerIdentity).name : ''
    const next = { name, phone }
    localStorage.setItem('farmeasy_buyer', JSON.stringify(next))
    setIdentity(next)
  }

  const handleReorder = async (order: Order) => {
    setNotice(null)
    if (!order.listing_id) {
      setNotice(t('listingUnavailable'))
      return
    }
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', order.listing_id)
      .maybeSingle()
    if (error || !data) {
      setNotice(t('listingUnavailable'))
      return
    }
    setReorderListing(data)
  }

  const handleAcceptCounter = async (order: Order) => {
    if (!confirm(t('confirmAcceptOffer'))) return
    const agreed = order.counter_price ?? order.price_per_kg
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'pending', price_per_kg: agreed })
        .eq('id', order.id)
      if (error) {
        console.error('handleAcceptCounter failed', error)
        alert(error.message || 'Update failed')
        return
      }
      if (identity?.phone) fetchOrders(identity.phone)
    } catch (e) {
      console.error('handleAcceptCounter threw', e)
      alert(e instanceof Error ? e.message : String(e))
    }
  }

  const handleRejectCounter = async (order: Order) => {
    if (!confirm(t('confirmRejectOffer'))) return
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', order.id)
      if (error) {
        console.error('handleRejectCounter failed', error)
        alert(error.message || 'Update failed')
        return
      }
      if (identity?.phone) fetchOrders(identity.phone)
    } catch (e) {
      console.error('handleRejectCounter threw', e)
      alert(e instanceof Error ? e.message : String(e))
    }
  }

  if (!identity?.phone) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <Phone className="w-5 h-5 text-green-700" />
          </div>
          <h2 className="text-lg font-bold text-green-900">{t('tabMyOrders')}</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">{t('buyerIdentityPrompt')}</p>
        <form onSubmit={handleLoadByPhone} className="space-y-3">
          <input
            type="tel"
            required
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            placeholder={t('phonePlaceholder')}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
          />
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg"
          >
            {t('loadOrders')}
          </button>
        </form>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
            <div className="h-5 w-2/5 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-3/5 bg-gray-100 rounded mb-2" />
            <div className="h-3 w-1/3 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
        <Package className="w-16 h-16 text-green-300 mx-auto mb-4" />
        <p className="text-gray-600">{t('noBuyerOrders')}</p>
      </div>
    )
  }

  const active = orders.filter((o) =>
    o.status === 'pending' || o.status === 'negotiating' || o.status === 'counter_offered'
  )
  const history = orders.filter((o) => o.status === 'completed' || o.status === 'cancelled')

  return (
    <div>
      {notice && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm p-3 rounded-lg mb-4">
          {notice}
        </div>
      )}

      {active.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-extrabold text-green-900 mb-3 tracking-tight">
            {t('pendingOrders')} · {active.length}
          </h2>
          <div className="space-y-3">
            {active.map((o) => (
              <BuyerOrderCard
                key={o.id}
                order={o}
                onReorder={handleReorder}
                onAcceptCounter={handleAcceptCounter}
                onRejectCounter={handleRejectCounter}
              />
            ))}
          </div>
        </section>
      )}

      {history.length > 0 && (
        <section>
          <h2 className="text-xl font-extrabold text-green-900 mb-3 tracking-tight">
            {t('completedOrders')} & {t('cancelledOrders')} · {history.length}
          </h2>
          <div className="space-y-3">
            {history.map((o) => (
              <BuyerOrderCard key={o.id} order={o} onReorder={handleReorder} />
            ))}
          </div>
        </section>
      )}

      {reorderListing && (
        <OrderForm
          listing={reorderListing}
          onClose={() => setReorderListing(null)}
          onPlaced={() => {
            setReorderListing(null)
            if (identity?.phone) fetchOrders(identity.phone)
            alert(t('orderPlaced'))
          }}
        />
      )}
    </div>
  )
}

function BuyerOrderCard({
  order,
  onReorder,
  onAcceptCounter,
  onRejectCounter,
}: {
  order: Order
  onReorder: (o: Order) => void
  onAcceptCounter?: (o: Order) => void
  onRejectCounter?: (o: Order) => void
}) {
  const { t } = useLanguage()
  const total = order.quantity_kg * order.price_per_kg

  const statusBadge = (() => {
    switch (order.status) {
      case 'pending':
        return { cls: 'bg-yellow-100 text-yellow-800', label: t('orderStatusPending'), Icon: Clock }
      case 'completed':
        return { cls: 'bg-green-100 text-green-800', label: t('orderStatusCompleted'), Icon: Check }
      case 'cancelled':
        return { cls: 'bg-gray-100 text-gray-600', label: t('orderStatusCancelled'), Icon: X }
      case 'negotiating':
        return { cls: 'bg-blue-100 text-blue-800', label: t('orderStatusNegotiating'), Icon: Handshake }
      case 'counter_offered':
        return { cls: 'bg-purple-100 text-purple-800', label: t('orderStatusCounterOffered'), Icon: Handshake }
      default:
        return { cls: 'bg-gray-100 text-gray-600', label: String(order.status), Icon: Clock }
    }
  })()
  const StatusIcon = statusBadge.Icon

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-extrabold text-lg text-green-900 tracking-tight">{order.produce_name}</h3>
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusBadge.cls}`}>
              <StatusIcon className="w-3 h-3" strokeWidth={2.5} />
              {statusBadge.label}
            </span>
          </div>
          <p className="text-sm text-gray-700 mt-1 font-medium">
            <span className="tabular-nums">{order.quantity_kg}</span> kg × <span className="tabular-nums">₹{order.price_per_kg}</span>/kg =
            <span className="font-extrabold text-green-700 text-base tabular-nums"> ₹{total.toFixed(2)}</span>
          </p>
          <div className="mt-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('orderFrom')}</span>
            <Link
              href={`/farmer/${encodeURIComponent(order.farmer_phone)}`}
              className="ml-1.5 font-bold text-green-700 hover:underline"
            >
              {order.farmer_phone}
            </Link>
          </div>
          {order.note && (
            <p className="text-sm text-gray-600 mt-1 italic">&ldquo;{order.note}&rdquo;</p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            {t('orderedOn')} {new Date(order.created_at).toLocaleString()}
          </p>

          {order.status === 'negotiating' && order.offered_price != null && (
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
              <div className="font-semibold mb-1 inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {t('awaitingFarmer')}
              </div>
              <p>
                {t('negotiationSummary')
                  .replace('{offer}', String(order.offered_price))
                  .replace('{listed}', String(order.price_per_kg))}
              </p>
            </div>
          )}

          {order.status === 'counter_offered' && order.counter_price != null && (
            <div className="mt-3 bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="text-sm font-semibold text-purple-900 mb-1 inline-flex items-center gap-1">
                <Handshake className="w-3.5 h-3.5" />
                {t('farmerCounter')}
              </div>
              <p className="text-sm text-purple-900">
                {t('counterSummary').replace('{counter}', String(order.counter_price))}
              </p>
              {onAcceptCounter && onRejectCounter && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => onAcceptCounter(order)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 rounded-lg inline-flex items-center justify-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    {t('acceptOffer')}
                  </button>
                  <button
                    onClick={() => onRejectCounter(order)}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-semibold py-2 rounded-lg inline-flex items-center justify-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    {t('rejectOffer')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {(order.status === 'completed' || order.status === 'cancelled') && (
          <button
            onClick={() => onReorder(order)}
            className="text-sm bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-2 rounded-lg inline-flex items-center gap-1 self-start"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{t('reorder')}</span>
          </button>
        )}
        {order.status === 'pending' && (
          <span className="text-xs text-gray-500 inline-flex items-center gap-1 self-start">
            <ShoppingCart className="w-3.5 h-3.5" />
            {t('orderStatusPending')}
          </span>
        )}
      </div>
    </div>
  )
}
