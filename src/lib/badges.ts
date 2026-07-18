import type { Listing, Review } from './supabase'

export type BadgeKind = 'verified' | 'top_rated' | 'active' | 'trusted'

export type Badge = {
  kind: BadgeKind
  emoji: string
  labelKey: 'badgeVerified' | 'badgeTopRated' | 'badgeActive' | 'badgeTrusted'
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

export function computeBadges(listings: Listing[], reviews: Review[]): Badge[] {
  const badges: Badge[] = []

  // Verified: has any listings (has completed profile setup)
  if (listings.length > 0) {
    badges.push({ kind: 'verified', emoji: '✅', labelKey: 'badgeVerified' })
  }

  // Top Rated: avg rating >= 4.5 with >= 3 reviews
  if (reviews.length >= 3) {
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    if (avg >= 4.5) {
      badges.push({ kind: 'top_rated', emoji: '⭐', labelKey: 'badgeTopRated' })
    }
  }

  // Active: posted a listing in the last 7 days
  const now = Date.now()
  const recentlyActive = listings.some(
    (l) => now - new Date(l.created_at).getTime() < SEVEN_DAYS_MS
  )
  if (recentlyActive) {
    badges.push({ kind: 'active', emoji: '🟢', labelKey: 'badgeActive' })
  }

  // Trusted: 5+ listings ever
  if (listings.length >= 5) {
    badges.push({ kind: 'trusted', emoji: '🛡️', labelKey: 'badgeTrusted' })
  }

  return badges
}

export function averageRating(reviews: Review[]): number | null {
  if (reviews.length === 0) return null
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
}
