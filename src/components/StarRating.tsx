'use client'

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
  const sizeClass = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-3xl' : 'text-xl'

  return (
    <div className={`inline-flex ${sizeClass}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value
        const half = !filled && star - 0.5 <= value
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onChange?.(star)}
            className={`${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform leading-none px-0.5`}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            <span className={filled || half ? 'text-yellow-400' : 'text-gray-300'}>★</span>
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
  if (average === null || count === 0) {
    return <span className="text-xs text-gray-400">No ratings yet</span>
  }
  const textClass = size === 'md' ? 'text-base' : 'text-xs'
  return (
    <span className={`inline-flex items-center gap-1 ${textClass} text-gray-700`}>
      <span className="text-yellow-400">★</span>
      <span className="font-semibold">{average.toFixed(1)}</span>
      <span className="text-gray-500">({count})</span>
    </span>
  )
}
