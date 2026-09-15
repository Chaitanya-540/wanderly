import type { Attraction } from '@/types/attraction'

/**
 * Case-insensitive substring search across name, city, state, and district.
 * Returns up to 10 results. Pure function — no side effects, no debounce.
 * Debouncing is the responsibility of the calling component.
 */
export function searchAttractions(attractions: Attraction[], query: string): Attraction[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const results: Attraction[] = []
  for (const a of attractions) {
    if (results.length >= 10) break
    if (
      a.name.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.state.toLowerCase().includes(q) ||
      a.district.toLowerCase().includes(q)
    ) {
      results.push(a)
    }
  }
  return results
}
