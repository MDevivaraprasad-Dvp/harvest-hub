'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Leaf, Tractor, MapPin, Sparkles, BarChart3 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { supabase, type Listing, type Order, type Review } from '@/lib/supabase'
import { useLanguage } from '@/lib/LanguageContext'
import { RatingSummary } from './StarRating'

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

export function BuyerInsights() {
  const { t } = useLanguage()
  const [listings, setListings] = useState<Listing[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [lRes, oRes, rRes] = await Promise.all([
        supabase.from('listings').select('*'),
        supabase.from('orders').select('*').neq('status', 'cancelled'),
        supabase.from('reviews').select('*'),
      ])
      if (lRes.error) console.error(lRes.error)
      if (oRes.error) console.error(oRes.error)
      if (rRes.error) console.error(rRes.error)
      setListings(lRes.data ?? [])
      setOrders(oRes.data ?? [])
      setReviews(rRes.data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const stats = useMemo(() => {
    const now = Date.now()
    const uniqueProduce = new Set(listings.map((l) => l.produce_name))
    const uniqueFarmers = new Set(listings.map((l) => l.farmer_phone))
    const uniqueLocations = new Set(listings.map((l) => l.location))
    const newThisWeek = listings.filter((l) => now - new Date(l.created_at).getTime() < SEVEN_DAYS_MS)

    // Trusted farmers — group reviews by farmer_phone, compute avg + count
    const reviewMap = new Map<string, { total: number; count: number }>()
    for (const r of reviews) {
      const e = reviewMap.get(r.farmer_phone) ?? { total: 0, count: 0 }
      e.total += r.rating
      e.count += 1
      reviewMap.set(r.farmer_phone, e)
    }

    const listingsByPhone = new Map<string, Listing[]>()
    for (const l of listings) {
      const arr = listingsByPhone.get(l.farmer_phone) ?? []
      arr.push(l)
      listingsByPhone.set(l.farmer_phone, arr)
    }

    const trustedFarmers = Array.from(reviewMap.entries())
      .filter(([, v]) => v.count >= 2)
      .map(([phone, v]) => {
        const farmerListings = listingsByPhone.get(phone) ?? []
        return {
          phone,
          name: farmerListings[0]?.farmer_name ?? 'Unknown',
          location: farmerListings[0]?.location ?? '',
          avgRating: v.total / v.count,
          reviewCount: v.count,
          listingCount: farmerListings.length,
        }
      })
      .sort((a, b) => b.avgRating - a.avgRating || b.reviewCount - a.reviewCount)
      .slice(0, 5)

    // Price range per produce
    const priceMap = new Map<string, { prices: number[]; lowFarmer: string; lowLocation: string; lowPrice: number }>()
    for (const l of listings) {
      const e = priceMap.get(l.produce_name) ?? {
        prices: [],
        lowFarmer: l.farmer_name,
        lowLocation: l.location,
        lowPrice: Number(l.price_per_kg),
      }
      e.prices.push(Number(l.price_per_kg))
      if (Number(l.price_per_kg) < e.lowPrice) {
        e.lowPrice = Number(l.price_per_kg)
        e.lowFarmer = l.farmer_name
        e.lowLocation = l.location
      }
      priceMap.set(l.produce_name, e)
    }
    const priceRange = Array.from(priceMap.entries())
      .map(([produce, e]) => ({
        produce,
        low: Math.min(...e.prices),
        high: Math.max(...e.prices),
        avg: Math.round(e.prices.reduce((s, p) => s + p, 0) / e.prices.length),
        bestFarmer: e.lowFarmer,
        bestLocation: e.lowLocation,
      }))
      .sort((a, b) => (a.low ?? 0) - (b.low ?? 0))

    // Fast-selling by area — for each location, find top 3 produce by order count
    const phoneToLocation = new Map<string, string>()
    for (const l of listings) phoneToLocation.set(l.farmer_phone, l.location)

    const areaProduceMap = new Map<string, Map<string, number>>()
    for (const o of orders) {
      const loc = phoneToLocation.get(o.farmer_phone)
      if (!loc) continue
      const areaMap = areaProduceMap.get(loc) ?? new Map<string, number>()
      areaMap.set(o.produce_name, (areaMap.get(o.produce_name) ?? 0) + Number(o.quantity_kg))
      areaProduceMap.set(loc, areaMap)
    }
    const fastSellingByArea = Array.from(areaProduceMap.entries())
      .map(([location, produceMap]) => {
        const totalKg = Array.from(produceMap.values()).reduce((s, v) => s + v, 0)
        const top = Array.from(produceMap.entries())
          .map(([produce, kg]) => ({ produce, kg: Math.round(kg) }))
          .sort((a, b) => b.kg - a.kg)
          .slice(0, 3)
        return { location, totalKg: Math.round(totalKg), top }
      })
      .sort((a, b) => b.totalKg - a.totalKg)
      .slice(0, 4)

    // Fresh arrivals — listings in last 7 days, latest first
    const freshArrivals = listings
      .filter((l) => now - new Date(l.created_at).getTime() < SEVEN_DAYS_MS)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 6)

    return {
      produceCount: uniqueProduce.size,
      farmerCount: uniqueFarmers.size,
      locationCount: uniqueLocations.size,
      newThisWeekCount: newThisWeek.length,
      trustedFarmers,
      priceRange,
      fastSellingByArea,
      freshArrivals,
    }
  }, [listings, orders, reviews])

  if (loading) return <p className="text-gray-500">{t('loading')}</p>

  if (listings.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
        <BarChart3 className="w-16 h-16 text-green-300 mx-auto mb-4" />
        <p className="text-gray-600">{t('noInsightsYet')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard Icon={Leaf} label={t('produceVarieties')} value={stats.produceCount.toString()} />
        <KpiCard Icon={Tractor} label={t('activeFarmers')} value={stats.farmerCount.toString()} />
        <KpiCard Icon={MapPin} label={t('locationsCovered')} value={stats.locationCount.toString()} />
        <KpiCard Icon={Sparkles} label={t('newThisWeek')} value={stats.newThisWeekCount.toString()} />
      </div>

      <ChartCard title={t('trustedFarmers')} subtitle={t('trustedFarmersSubtitle')}>
        {stats.trustedFarmers.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">{t('noReviewsYet')}</p>
        ) : (
          <div className="space-y-2">
            {stats.trustedFarmers.map((f, i) => (
              <Link
                key={f.phone}
                href={`/farmer/${encodeURIComponent(f.phone)}`}
                className="flex items-center gap-3 p-3 rounded-xl border border-green-100 hover:bg-green-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-green-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-green-900 truncate">{f.name}</div>
                  <div className="text-xs text-gray-500 truncate inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{f.location}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <RatingSummary average={f.avgRating} count={f.reviewCount} size="sm" />
                  <div className="text-xs text-gray-500 mt-0.5">
                    {f.listingCount} {t('listingsShort')}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </ChartCard>

      <ChartCard title={t('priceRange')} subtitle={t('priceRangeSubtitle')}>
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-200">
                <th className="pb-2 font-medium">{t('produceName')}</th>
                <th className="pb-2 font-medium text-right">{t('lowestPrice')}</th>
                <th className="pb-2 font-medium text-right">{t('avgPrice')}</th>
                <th className="pb-2 font-medium text-right">{t('highestPrice')}</th>
                <th className="pb-2 font-medium">{t('bestDealAt')}</th>
              </tr>
            </thead>
            <tbody>
              {stats.priceRange.map((p) => (
                <tr key={p.produce} className="border-b border-gray-100 last:border-0">
                  <td className="py-2.5 font-medium text-green-900">{p.produce}</td>
                  <td className="py-2.5 text-right font-semibold text-green-700">₹{p.low}</td>
                  <td className="py-2.5 text-right text-gray-700">₹{p.avg}</td>
                  <td className="py-2.5 text-right text-gray-700">₹{p.high}</td>
                  <td className="py-2.5 text-xs text-gray-600">
                    <div>{p.bestFarmer}</div>
                    <div className="text-gray-400">{p.bestLocation}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>

      <ChartCard title={t('fastSellingByArea')} subtitle={t('fastSellingByAreaSubtitle')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.fastSellingByArea.map((area) => (
            <div key={area.location} className="border border-green-100 rounded-xl p-4">
              <div className="flex items-baseline justify-between mb-3">
                <div className="font-semibold text-green-900 inline-flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{area.location}</span>
                </div>
                <div className="text-xs text-gray-500">{area.totalKg} {t('kg')}</div>
              </div>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={area.top} layout="vertical" margin={{ left: 0, right: 15 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="produce" type="category" tick={{ fontSize: 11 }} width={100} />
                  <Tooltip formatter={(v) => [`${v} ${t('kg')}`, '']} />
                  <Bar dataKey="kg" radius={[0, 4, 4, 0]}>
                    {area.top.map((_, i) => (
                      <Cell key={i} fill={['#16a34a', '#22c55e', '#4ade80'][i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      </ChartCard>

      <ChartCard title={t('freshArrivals')} subtitle={t('freshArrivalsSubtitle')}>
        {stats.freshArrivals.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">{t('noFreshArrivals')}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {stats.freshArrivals.map((l) => (
              <div key={l.id} className="border border-green-100 rounded-xl overflow-hidden">
                {l.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.image_url} alt={l.produce_name} className="w-full h-24 object-cover" />
                ) : (
                  <div className="w-full h-24 bg-linear-to-br from-green-100 to-green-200 flex items-center justify-center">
                    <Leaf className="w-8 h-8 text-green-600" />
                  </div>
                )}
                <div className="p-2.5">
                  <div className="font-semibold text-sm text-green-900 truncate">{l.produce_name}</div>
                  <div className="text-xs text-gray-500 truncate inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{l.location}</span>
                  </div>
                  <div className="text-sm font-bold text-green-700 mt-1">₹{l.price_per_kg}/{t('kg')}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ChartCard>
    </div>
  )
}

function KpiCard({ Icon, label, value }: { Icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center gap-2 text-gray-600 text-sm">
        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
          <Icon className="w-4 h-4 text-green-700" />
        </div>
        <span>{label}</span>
      </div>
      <div className="text-2xl font-bold text-green-800 mt-2 truncate" title={value}>{value}</div>
    </div>
  )
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <h3 className="font-bold text-green-900">{title}</h3>
      <p className="text-xs text-gray-500 mb-4">{subtitle}</p>
      {children}
    </div>
  )
}
