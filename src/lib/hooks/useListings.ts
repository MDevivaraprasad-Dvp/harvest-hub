'use client'

import { useCallback, useEffect, useState } from 'react'
import { type Listing } from '@/lib/supabase'
import { getCachedListings, prefetchListings, invalidateListings } from '@/lib/prefetch'

type Args = { farmerPhone?: string }

type Result = {
  listings: Listing[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Reads listings from the shared cache when available (see src/lib/prefetch.ts),
 * otherwise fetches from Supabase. Any hover-prefetch on the way to this page
 * will have already warmed the cache so `loading` is false on first paint.
 */
export function useListings({ farmerPhone }: Args = {}): Result {
  const cached = getCachedListings(farmerPhone)
  const [listings, setListings] = useState<Listing[]>(cached ?? [])
  const [loading, setLoading] = useState(!cached)
  const [error, setError] = useState<string | null>(null)

  const fetchListings = useCallback(async () => {
    invalidateListings(farmerPhone)
    setLoading(true)
    setError(null)
    try {
      const rows = await prefetchListings(farmerPhone)
      setListings(rows)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [farmerPhone])

  useEffect(() => {
    if (cached) return
    prefetchListings(farmerPhone).then((rows) => {
      setListings(rows)
      setLoading(false)
    }).catch((e) => {
      setError(e instanceof Error ? e.message : String(e))
      setLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmerPhone])

  return { listings, loading, error, refetch: fetchListings }
}
