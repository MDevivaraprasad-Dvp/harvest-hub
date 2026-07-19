import type { ContractStatus } from '@/lib/supabase'
import type { TranslationKey } from '@/lib/i18n'

export const CONTRACT_STATUS_META: Record<ContractStatus, { cls: string; labelKey: TranslationKey }> = {
  open:       { cls: 'bg-blue-100 text-blue-800',     labelKey: 'contractStatusOpen' },
  accepted:   { cls: 'bg-amber-100 text-amber-800',   labelKey: 'contractStatusAccepted' },
  harvested:  { cls: 'bg-purple-100 text-purple-800', labelKey: 'contractStatusHarvested' },
  completed:  { cls: 'bg-green-100 text-green-800',   labelKey: 'contractStatusCompleted' },
  cancelled:  { cls: 'bg-gray-100 text-gray-600',     labelKey: 'contractStatusCancelled' },
}
