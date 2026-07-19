'use client'

import { useEffect, useState } from 'react'

const CACHE_KEY = 'farmeasy_produce_images'
const OPENVERSE_ENDPOINT = 'https://api.openverse.org/v1/images/'

type Cache = Record<string, string | null>

function readCache(): Cache {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as Cache) : {}
  } catch {
    return {}
  }
}

function writeCache(cache: Cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // quota exceeded etc — silently drop
  }
}

function normaliseKey(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, ' ')
}

async function fetchProduceImage(name: string): Promise<string | null> {
  try {
    const q = encodeURIComponent(`${name} produce`)
    const res = await fetch(
      `${OPENVERSE_ENDPOINT}?q=${q}&page_size=1&mature=false`,
      { headers: { Accept: 'application/json' } }
    )
    if (!res.ok) return null
    const data = await res.json()
    const first = data?.results?.[0]
    return first?.thumbnail || first?.url || null
  } catch {
    return null
  }
}

// In-flight promise map so simultaneous callers for the same produce share one fetch.
const inFlight = new Map<string, Promise<string | null>>()

/**
 * Returns a photo URL for the given produce name.
 * - If `explicitUrl` is truthy, returns it immediately.
 * - Otherwise checks localStorage cache; if missing, fetches from Openverse.
 * - Returns null if the fetch fails; callers should render a placeholder.
 */
export function useProduceImage(produceName: string, explicitUrl?: string | null): string | null {
  const [url, setUrl] = useState<string | null>(explicitUrl ?? null)

  useEffect(() => {
    if (explicitUrl) {
      setUrl(explicitUrl)
      return
    }
    const key = normaliseKey(produceName)
    if (!key) return

    const cache = readCache()
    if (key in cache) {
      setUrl(cache[key])
      return
    }

    let cancelled = false
    const promise = inFlight.get(key) ?? (() => {
      const p = fetchProduceImage(key).finally(() => inFlight.delete(key))
      inFlight.set(key, p)
      return p
    })()

    promise.then((result) => {
      if (cancelled) return
      const current = readCache()
      current[key] = result
      writeCache(current)
      setUrl(result)
    })

    return () => {
      cancelled = true
    }
  }, [produceName, explicitUrl])

  return url
}
