const STORAGE_KEY = 'farmeasy_favorites'

export function readFavorites(): number[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'number') : []
  } catch {
    return []
  }
}

export function writeFavorites(ids: number[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  window.dispatchEvent(new CustomEvent('farmeasy:favorites-changed'))
}

export function toggleFavorite(id: number): number[] {
  const current = readFavorites()
  const next = current.includes(id) ? current.filter((n) => n !== id) : [...current, id]
  writeFavorites(next)
  return next
}
