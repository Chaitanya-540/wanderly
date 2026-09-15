import type { Attraction } from '@/types/attraction'

/**
 * Rank attractions by popularityScore descending.
 * Returns a new sorted array — does not mutate the input.
 */
export function rankByPopularity(attractions: Attraction[]): Attraction[] {
  return [...attractions].sort((a, b) => b.popularityScore - a.popularityScore)
}
