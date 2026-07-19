'use client'

import { useCallback, useEffect, useState } from 'react'
import { type Contract } from '@/lib/supabase'
import { getCachedContracts, prefetchContracts, invalidateContracts } from '@/lib/prefetch'

type Result = {
  contracts: Contract[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useContracts(): Result {
  const cached = getCachedContracts()
  const [contracts, setContracts] = useState<Contract[]>(cached ?? [])
  const [loading, setLoading] = useState(!cached)
  const [error, setError] = useState<string | null>(null)

  const fetchContracts = useCallback(async () => {
    invalidateContracts()
    setLoading(true)
    setError(null)
    try {
      const rows = await prefetchContracts()
      setContracts(rows)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (cached) return
    prefetchContracts().then((rows) => {
      setContracts(rows)
      setLoading(false)
    }).catch((e) => {
      setError(e instanceof Error ? e.message : String(e))
      setLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { contracts, loading, error, refetch: fetchContracts }
}
