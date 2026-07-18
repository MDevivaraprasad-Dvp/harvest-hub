'use client'

import { useEffect, useMemo, useState } from 'react'
import { X, Eye, ShoppingBag, TrendingUp, CalendarDays } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { supabase, type Listing, type Order, type ListingView } from '@/lib/supabase'
import { useLanguage } from '@/lib/LanguageContext'
import type { TranslationKey } from '@/lib/i18n'

const DAY_KEYS: TranslationKey[] = ['daySun', 'dayMon', 'dayTue', 'dayWed', 'dayThu', 'dayFri', 'daySat']

export function ListingAnalytics({ listing, onClose }: { listing: Listing; onClose: () => void }) {
  const { t } = useLanguage()
  const [views, setViews] = useState<ListingView[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const [vRes, oRes] = await Promise.all([
        supabase.from('listing_views').select('*').eq('listing_id', listing.id),
        supabase.from('orders').select('*').eq('listing_id', listing.id),
      ])
      if (vRes.error) console.error(vRes.error)
      if (oRes.error) console.error(oRes.error)
      setViews(vRes.data ?? [])
      setOrders(oRes.data ?? [])
      setLoading(false)
    }
    load()
  }, [listing.id])

  const confirmedOrders = orders.filter((o) => o.status !== 'cancelled')
  const viewCount = views.length
  const orderCount = confirmedOrders.length
  const conversion = viewCount > 0 ? (orderCount / viewCount) * 100 : 0

  const dayBreakdown = useMemo(() => {
    const buckets = DAY_KEYS.map((k) => ({ day: t(k), views: 0, orders: 0 }))
    for (const v of views) {
      const d = new Date(v.created_at).getDay()
      buckets[d].views += 1
    }
    for (const o of confirmedOrders) {
      const d = new Date(o.created_at).getDay()
      buckets[d].orders += 1
    }
    return buckets
  }, [views, confirmedOrders, t])

  const bestDay = dayBreakdown.reduce(
    (best, cur) => (cur.views > best.views ? cur : best),
    dayBreakdown[0]
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-green-900">{t('listingAnalytics')}</h2>
              <p className="text-sm text-gray-600 mt-0.5">{listing.produce_name} · ₹{listing.price_per_kg}/kg</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
            <p className="text-gray-500">{t('loading')}</p>
          ) : viewCount === 0 && orderCount === 0 ? (
            <div className="text-center py-8">
              <Eye className="w-12 h-12 text-green-300 mx-auto mb-3" />
              <p className="text-gray-600">{t('noViewsYet')}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <KpiCard Icon={Eye} label={t('viewsCount')} value={viewCount} accent="text-blue-700 bg-blue-50" />
                <KpiCard Icon={ShoppingBag} label={t('ordersCountLabel')} value={orderCount} accent="text-green-700 bg-green-50" />
                <KpiCard Icon={TrendingUp} label={t('conversionRate')} value={`${conversion.toFixed(1)}%`} accent="text-purple-700 bg-purple-50" />
                <KpiCard Icon={CalendarDays} label={t('bestDayToList')} value={bestDay.views > 0 ? bestDay.day : '—'} accent="text-orange-700 bg-orange-50" />
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="font-semibold text-green-900 mb-3">{t('viewsByDay')}</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={dayBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <Tooltip cursor={{ fill: '#f0fdf4' }} />
                    <Bar dataKey="views" fill="#22c55e" radius={[4, 4, 0, 0]} name={t('viewsCount')} />
                    <Bar dataKey="orders" fill="#166534" radius={[4, 4, 0, 0]} name={t('ordersCountLabel')} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function KpiCard({
  Icon,
  label,
  value,
  accent,
}: {
  Icon: React.ComponentType<{ className?: string }>
  label: string
  value: number | string
  accent: string
}) {
  return (
    <div className="rounded-xl border border-gray-100 p-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${accent}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-bold text-green-900 mt-0.5">{value}</div>
    </div>
  )
}
