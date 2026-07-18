'use client'

import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { readFavorites, toggleFavorite } from '@/lib/favorites'

export function FavoriteHeart({ listingId, className = '' }: { listingId: number; className?: string }) {
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSaved(readFavorites().includes(listingId))
    const handler = () => setSaved(readFavorites().includes(listingId))
    window.addEventListener('farmeasy:favorites-changed', handler)
    return () => window.removeEventListener('farmeasy:favorites-changed', handler)
  }, [listingId])

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(listingId)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from favorites' : 'Add to favorites'}
      className={`inline-flex items-center justify-center rounded-full transition-all ${
        saved
          ? 'bg-red-50 text-red-500 hover:bg-red-100'
          : 'bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white'
      } ${className}`}
    >
      <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
    </button>
  )
}
