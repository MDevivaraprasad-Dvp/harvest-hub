import type { OrderStatus } from '@/lib/supabase'
import type { TranslationKey } from '@/lib/i18n'

/**
 * Presentation metadata for a given order status.
 * `labelKey` is looked up via t(); UI never inlines status label strings.
 */
export const ORDER_STATUS_META: Record<OrderStatus, { cls: string; labelKey: TranslationKey }> = {
  pending:          { cls: 'bg-yellow-100 text-yellow-800',   labelKey: 'orderStatusPending' },
  completed:        { cls: 'bg-green-100 text-green-800',     labelKey: 'orderStatusCompleted' },
  cancelled:        { cls: 'bg-gray-100 text-gray-600',       labelKey: 'orderStatusCancelled' },
  negotiating:      { cls: 'bg-blue-100 text-blue-800',       labelKey: 'orderStatusNegotiating' },
  counter_offered:  { cls: 'bg-purple-100 text-purple-800',   labelKey: 'orderStatusCounterOffered' },
}

export const ORDER_STATUS_UNKNOWN = { cls: 'bg-gray-100 text-gray-600', labelKey: 'orderStatusPending' as TranslationKey }
