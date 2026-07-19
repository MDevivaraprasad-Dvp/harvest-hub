'use client'

import { supabase, type Listing, type Order, type Contract } from '@/lib/supabase'

/**
 * Module-level cache for pre-fetched Supabase data. Data lives for the lifetime
 * of the tab (or until `invalidate*` is called).
 *
 * Design goals:
 * - Consumers still fetch on mount via hooks. Prefetch just warms the cache so
 *   the hook's initial read returns instantly.
 * - Same-key concurrent callers share a single in-flight promise (no dupes).
 * - Cache is opaque — call the typed getters, don't touch it directly.
 */

type CacheEntry<T> = { data: T; ts: number }
const STALE_AFTER_MS = 60_000 // 60s — good enough for a hackathon session

const listingsCache: Record<string, CacheEntry<Listing[]>> = {}
const ordersCache: Record<string, CacheEntry<Order[]>> = {}
let contractsCache: CacheEntry<Contract[]> | null = null

const inFlight = new Map<string, Promise<unknown>>()

function fresh<T>(entry: CacheEntry<T> | null | undefined): T | null {
  if (!entry) return null
  if (Date.now() - entry.ts > STALE_AFTER_MS) return null
  return entry.data
}

function share<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const existing = inFlight.get(key)
  if (existing) return existing as Promise<T>
  const p = fn().finally(() => inFlight.delete(key))
  inFlight.set(key, p)
  return p
}

// ---------- Listings ----------

const listingsKey = (farmerPhone?: string) => `listings:${farmerPhone ?? '*'}`

export function getCachedListings(farmerPhone?: string): Listing[] | null {
  return fresh(listingsCache[listingsKey(farmerPhone)])
}

export function prefetchListings(farmerPhone?: string): Promise<Listing[]> {
  const key = listingsKey(farmerPhone)
  const cached = fresh(listingsCache[key])
  if (cached) return Promise.resolve(cached)
  return share(key, async () => {
    let query = supabase.from('listings').select('*').order('created_at', { ascending: false })
    if (farmerPhone) query = query.eq('farmer_phone', farmerPhone)
    const { data } = await query
    const rows = (data ?? []) as Listing[]
    listingsCache[key] = { data: rows, ts: Date.now() }
    return rows
  })
}

// ---------- Orders ----------

const ordersKey = (opts: { farmerPhone?: string; buyerPhone?: string }) =>
  `orders:${opts.farmerPhone ?? ''}:${opts.buyerPhone ?? ''}`

export function getCachedOrders(opts: { farmerPhone?: string; buyerPhone?: string }): Order[] | null {
  return fresh(ordersCache[ordersKey(opts)])
}

export function prefetchOrders(opts: { farmerPhone?: string; buyerPhone?: string }): Promise<Order[]> {
  const key = ordersKey(opts)
  const cached = fresh(ordersCache[key])
  if (cached) return Promise.resolve(cached)
  return share(key, async () => {
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (opts.farmerPhone) query = query.eq('farmer_phone', opts.farmerPhone)
    if (opts.buyerPhone) query = query.eq('buyer_phone', opts.buyerPhone)
    const { data } = await query
    const rows = (data ?? []) as Order[]
    ordersCache[key] = { data: rows, ts: Date.now() }
    return rows
  })
}

// ---------- Contracts ----------

export function getCachedContracts(): Contract[] | null {
  return fresh(contractsCache)
}

export function prefetchContracts(): Promise<Contract[]> {
  const cached = fresh(contractsCache)
  if (cached) return Promise.resolve(cached)
  return share('contracts', async () => {
    const { data } = await supabase
      .from('contracts')
      .select('*')
      .order('created_at', { ascending: false })
    const rows = (data ?? []) as Contract[]
    contractsCache = { data: rows, ts: Date.now() }
    return rows
  })
}

// ---------- Invalidation ----------
// Call after writes so subsequent reads pull fresh data.

export function invalidateListings(farmerPhone?: string) {
  if (farmerPhone) delete listingsCache[listingsKey(farmerPhone)]
  else Object.keys(listingsCache).forEach((k) => delete listingsCache[k])
}
export function invalidateOrders() {
  Object.keys(ordersCache).forEach((k) => delete ordersCache[k])
}
export function invalidateContracts() {
  contractsCache = null
}
