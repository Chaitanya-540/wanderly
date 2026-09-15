import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { rankByPopularity } from '@/services/popularityRanker'
import { ATTRACTIONS } from '@/data/attractions'
import type { Attraction } from '@/types/attraction'

/**
 * Property 12: Popular Attractions Panel ordering
 * rankByPopularity must return attractions sorted descending by popularityScore.
 */

// Minimal Attraction stub for property tests
const attractionStub = (id: string, score: number): Attraction => ({
  id,
  name: `Test ${id}`,
  city: 'City',
  state: 'State',
  district: 'District',
  category: 'Temple',
  moodTags: ['Cultural'],
  coordinates: { lat: 20, lng: 78 },
  description: 'Test description',
  highlights: ['h1', 'h2', 'h3'],
  insiderTips: ['t1', 't2'],
  itineraries: [],
  popularityScore: score,
  nearbyRadius: 200,
})

describe('rankByPopularity — Property 12: ordering invariant', () => {
  it('result is sorted descending by popularityScore', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 100 }), { minLength: 1, maxLength: 20 }),
        (scores) => {
          const attractions = scores.map((s, i) => attractionStub(String(i), s))
          const ranked = rankByPopularity(attractions)
          for (let i = 0; i < ranked.length - 1; i++) {
            expect(ranked[i].popularityScore).toBeGreaterThanOrEqual(ranked[i + 1].popularityScore)
          }
        },
      ),
    )
  })

  it('does not mutate the original array', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 100 }), { minLength: 2, maxLength: 10 }),
        (scores) => {
          const attractions = scores.map((s, i) => attractionStub(String(i), s))
          const originalOrder = attractions.map((a) => a.id)
          rankByPopularity(attractions)
          expect(attractions.map((a) => a.id)).toEqual(originalOrder)
        },
      ),
    )
  })

  it('preserves all elements', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 100 }), { maxLength: 15 }),
        (scores) => {
          const attractions = scores.map((s, i) => attractionStub(String(i), s))
          const ranked = rankByPopularity(attractions)
          expect(ranked).toHaveLength(attractions.length)
        },
      ),
    )
  })

  it('real ATTRACTIONS dataset is correctly rankable', () => {
    const ranked = rankByPopularity(ATTRACTIONS)
    expect(ranked).toHaveLength(ATTRACTIONS.length)
    for (let i = 0; i < ranked.length - 1; i++) {
      expect(ranked[i].popularityScore).toBeGreaterThanOrEqual(ranked[i + 1].popularityScore)
    }
  })
})
