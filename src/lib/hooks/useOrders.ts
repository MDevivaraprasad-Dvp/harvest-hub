'use client'

import { useCallback, useEffect, useState } from 'react'
import { type Order } from '@/lib/supabase'
import { getCachedOrders, prefetchOrders, invalidateOrders } from '@/lib/prefetch'

type Args = { farmerPhone?: string; buyerPhone?: string }

type Result = {
  orders: Order[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useOrders({ farmerPhone, buyerPhone }: Args = {}): Result {
  const cached = getCachedOrders({ farmerPhone, buyerPhone })
  const [orders, setOrders] = useState<Order[]>(cached ?? [])
  const [loading, setLoading] = useState(!cached && (!!farmerPhone || !!buyerPhone))
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    if (!farmerPhone && !buyerPhone) return
    invalidateOrders()
    setLoading(true)
    setError(null)
    try {
      const rows = await prefetchOrders({ farmerPhone, buyerPhone })
      setOrders(rows)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [farmerPhone, buyerPhone])

  useEffect(() => {
    if (cached) return
    if (!farmerPhone && !buyerPhone) return
    prefetchOrders({ farmerPhone, buyerPhone }).then((rows) => {
      setOrders(rows)
      setLoading(false)
    }).catch((e) => {
      setError(e instanceof Error ? e.message : String(e))
      setLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmerPhone, buyerPhone])

  return { orders, loading, error, refetch: fetchOrders }
}
