'use client'

import { useCallback, useEffect, useState } from 'react'

/**
 * Persists the active tab in the URL (?tab=...) so refresh + share links work.
 * Uses history.replaceState (no re-render). Reads the initial value once on mount.
 *
 * We deliberately avoid `useSearchParams` here — a route that uses it becomes
 * dynamic and forces client-side rendering. Direct window access is fine because
 * every consumer is already a client component.
 */
export function useUrlTab<T extends string>(fallback: T, allowed: readonly T[]): [T, (t: T) => void] {
  const [tab, setTabState] = useState<T>(fallback)

  useEffect(() => {
    const url = new URL(window.location.href)
    const found = url.searchParams.get('tab') as T | null
    if (found && (allowed as readonly string[]).includes(found)) {
      setTabState(found)
    }
    // read once on mount; deps intentionally empty
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setTab = useCallback((next: T) => {
    setTabState(next)
    const url = new URL(window.location.href)
    if (next === fallback) url.searchParams.delete('tab')
    else url.searchParams.set('tab', next)
    window.history.replaceState({}, '', url.toString())
  }, [fallback])

  return [tab, setTab]
}
