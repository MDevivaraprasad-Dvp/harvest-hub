'use client'

import { supabase, type Listing } from './supabase'
import { invalidateListings } from './prefetch'

const SESSION_FLAG = 'farmeasy_image_backfill_ran'
const FAILED_KEY = 'farmeasy_image_backfill_failed_names'

/**
 * Ask Wikipedia which article best matches `name`. Returns the canonical title
 * (e.g. "Bitter melon" for "Bitter Gourd") or null when nothing plausible exists.
 */
async function findWikiTitle(name: string): Promise<string | null> {
  const url = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(
    name,
  )}&limit=1&namespace=0&format=json&origin=*`
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const data = (await res.json()) as [string, string[], string[], string[]]
    return data?.[1]?.[0] ?? null
  } catch {
    return null
  }
}

/**
 * Given a Wikipedia article title, fetch the article summary and return the
 * thumbnail URL (Commons-hosted https). Prefers the smaller thumbnail so the
 * card doesn't ship a 5MB PNG.
 */
async function fetchWikiThumb(title: string): Promise<string | null> {
  const slug = encodeURIComponent(title.replace(/ /g, '_'))
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`, {
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data?.thumbnail?.source || data?.originalimage?.source || null
  } catch {
    return null
  }
}

async function resolveImage(name: string): Promise<string | null> {
  const title = await findWikiTitle(name)
  if (!title) return null
  return fetchWikiThumb(title)
}

function readFailed(): Set<string> {
  try {
    const raw = localStorage.getItem(FAILED_KEY)
    return new Set<string>(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

function writeFailed(s: Set<string>) {
  try {
    localStorage.setItem(FAILED_KEY, JSON.stringify([...s]))
  } catch {}
}

/**
 * Populates image_url in Supabase for every listing that doesn't have one.
 * Runs at most once per browser session and skips names that already failed
 * a previous lookup. Fires-and-forgets — call without awaiting from a useEffect.
 */
export async function backfillListingImages(listings: Listing[]): Promise<number> {
  if (typeof window === 'undefined') return 0
  if (sessionStorage.getItem(SESSION_FLAG)) return 0
  sessionStorage.setItem(SESSION_FLAG, '1')

  const failed = readFailed()
  const needsImage = listings.filter((l) => !l.image_url && !failed.has(l.produce_name.toLowerCase()))
  if (needsImage.length === 0) return 0

  let updated = 0
  for (const listing of needsImage) {
    const url = await resolveImage(listing.produce_name)
    if (!url) {
      failed.add(listing.produce_name.toLowerCase())
      writeFailed(failed)
      continue
    }
    const { error } = await supabase.from('listings').update({ image_url: url }).eq('id', listing.id)
    if (!error) updated += 1
  }

  if (updated > 0) {
    invalidateListings()
    // Give downstream consumers a chance to refetch.
    window.dispatchEvent(new CustomEvent('farmeasy:listings-changed'))
  }
  return updated
}
