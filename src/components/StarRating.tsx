'use client'

import { Star } from 'lucide-react'

export function StarRating({
  value,
  onChange,
  size = 'md',
  readOnly = false,
}: {
  value: number
  onChange?: (n: number) => void
  size?: 'sm' | 'md' | 'lg'
  readOnly?: boolean
}) {
  const px = size === 'sm' ? 16 : size === 'lg' ? 32 : 20

  return (
    <div className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onChange?.(star)}
            className={`${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            <Star
              width={px}
              height={px}
              className={filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-transparent'}
            />
          </button>
        )
      })}
    </div>
  )
}

export function RatingSummary({
  average,
  count,
  size = 'sm',
}: {
  average: number | null
  count: number
  size?: 'sm' | 'md'
}) {
  const px = size === 'md' ? 16 : 12
  if (average === null || count === 0) {
    return <span className="text-xs text-gray-400">No ratings yet</span>
  }
  const textClass = size === 'md' ? 'text-base' : 'text-xs'
  return (
    <span className={`inline-flex items-center gap-1 ${textClass} text-gray-700`}>
      <Star width={px} height={px} className="text-yellow-400 fill-yellow-400" />
      <span className="font-semibold">{average.toFixed(1)}</span>
      <span className="text-gray-500">({count})</span>
    </span>
  )
}
