'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line,
} from 'recharts'
import { Package, Scale, Tractor, Flame, BarChart3 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { supabase, type Order, type Listing } from '@/lib/supabase'
import { useLanguage } from '@/lib/LanguageContext'

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function MarketInsights() {
  const { t } = useLanguage()
  const [orders, setOrders] = useState<Order[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [oRes, lRes] = await Promise.all([
        supabase.from('orders').select('*').neq('status', 'cancelled'),
        supabase.from('listings').select('*'),
      ])
      if (oRes.error) console.error(oRes.error)
      if (lRes.error) console.error(lRes.error)
      setOrders(oRes.data ?? [])
      setListings(lRes.data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const stats = useMemo(() => {
    const totalOrders = orders.length
    const totalKg = orders.reduce((sum, o) => sum + Number(o.quantity_kg), 0)
    const uniqueFarmers = new Set(listings.map((l) => l.farmer_phone)).size

    // Top selling produce (kg sold)
    const produceMap = new Map<string, number>()
    for (const o of orders) {
      produceMap.set(o.produce_name, (produceMap.get(o.produce_name) ?? 0) + Number(o.quantity_kg))
    }
    const topProduce = Array.from(produceMap.entries())
      .map(([name, kg]) => ({ name, kg: Math.round(kg) }))
      .sort((a, b) => b.kg - a.kg)
      .slice(0, 8)

    // Sales by location (using farmer's listing location per farmer_phone)
    const phoneToLocation = new Map<string, string>()
    for (const l of listings) phoneToLocation.set(l.farmer_phone, l.location)

    const locationMap = new Map<string, number>()
    for (const o of orders) {
      const loc = phoneToLocation.get(o.farmer_phone) ?? 'Unknown'
      locationMap.set(loc, (locationMap.get(loc) ?? 0) + 1)
    }
    const topLocations = Array.from(locationMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)

    // Monthly trend (last 6 months of order counts)
    const now = new Date()
    const monthly: { month: string; orders: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      const count = orders.filter((o) => {
        const od = new Date(o.created_at)
        return `${od.getFullYear()}-${od.getMonth()}` === key
      }).length
      monthly.push({ month: MONTH_LABELS[d.getMonth()], orders: count })
    }

    // Trending this month (top produce by kg in current month)
    const thisMonthKey = `${now.getFullYear()}-${now.getMonth()}`
    const thisMonthMap = new Map<string, number>()
    for (const o of orders) {
      const od = new Date(o.created_at)
      if (`${od.getFullYear()}-${od.getMonth()}` !== thisMonthKey) continue
      thisMonthMap.set(o.produce_name, (thisMonthMap.get(o.produce_name) ?? 0) + Number(o.quantity_kg))
    }
    const trendingCrop = Array.from(thisMonthMap.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'

    // Avg prices per produce
    const priceMap = new Map<string, { total: number; count: number }>()
    for (const o of orders) {
      const entry = priceMap.get(o.produce_name) ?? { total: 0, count: 0 }
      entry.total += Number(o.price_per_kg)
      entry.count += 1
      priceMap.set(o.produce_name, entry)
    }
    const avgPrices = Array.from(priceMap.entries())
      .map(([name, { total, count }]) => ({ name, price: Math.round(total / count) }))
      .sort((a, b) => b.price - a.price)
      .slice(0, 8)

    return {
      totalOrders,
      totalKg: Math.round(totalKg),
      uniqueFarmers,
      trendingCrop,
      topProduce,
      topLocations,
      monthly,
      avgPrices,
    }
  }, [orders, listings])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
              <div className="h-4 w-2/3 bg-gray-100 rounded mb-3" />
              <div className="h-7 w-1/2 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5 animate-pulse">
          <div className="h-5 w-1/3 bg-gray-200 rounded mb-2" />
          <div className="h-3 w-1/2 bg-gray-100 rounded mb-6" />
          <div className="h-64 bg-gray-100 rounded" />
        </div>
      </div>
    )
  }

  const hasData = orders.length > 0

  if (!hasData) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
        <BarChart3 className="w-16 h-16 text-green-300 mx-auto mb-4" />
        <p className="text-gray-600">{t('noInsightsYet')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard Icon={Package} label={t('totalOrders')} value={stats.totalOrders.toString()} />
        <KpiCard Icon={Scale} label={t('totalKgSold')} value={`${stats.totalKg} ${t('kg')}`} />
        <KpiCard Icon={Tractor} label={t('activeFarmers')} value={stats.uniqueFarmers.toString()} />
        <KpiCard Icon={Flame} label={t('trendingCrop')} value={stats.trendingCrop} />
      </div>

      {/* Top Selling Produce */}
      <ChartCard title={t('topSellingProduce')} subtitle={t('topSellingSubtitle')}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={stats.topProduce} layout="vertical" margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={110} />
            <Tooltip formatter={(v) => [`${v} ${t('kg')}`, t('totalKgSold')]} />
            <Bar dataKey="kg" fill="#16a34a" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Location */}
        <ChartCard title={t('salesByLocation')} subtitle={t('salesByLocationSubtitle')}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.topLocations}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={80} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip formatter={(v) => [`${v} ${t('orderCount')}`, t('totalOrders')]} />
              <Bar dataKey="count" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Seasonal Trends */}
        <ChartCard title={t('seasonalTrends')} subtitle={t('seasonalTrendsSubtitle')}>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={stats.monthly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip formatter={(v) => [`${v} ${t('orderCount')}`, t('totalOrders')]} />
              <Line type="monotone" dataKey="orders" stroke="#16a34a" strokeWidth={3} dot={{ r: 5, fill: '#16a34a' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Avg Prices */}
      <ChartCard title={t('avgMarketPrices')} subtitle={t('avgMarketPricesSubtitle')}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {stats.avgPrices.map((p) => (
            <div key={p.name} className="bg-green-50 rounded-lg p-3">
              <div className="text-sm text-gray-700 truncate">{p.name}</div>
              <div className="text-xl font-bold text-green-700 mt-1">
                ₹{p.price}
                <span className="text-xs font-normal text-gray-500">/{t('kg')}</span>
              </div>
            </div>
          ))}
        </div>
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
