export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded ${className}`}
      aria-hidden="true"
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <Skeleton className="w-full h-48 rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3.5 w-1/2" />
        <div className="pt-2 space-y-2">
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
      <Skeleton className="w-20 h-20 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-3 pt-1">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
