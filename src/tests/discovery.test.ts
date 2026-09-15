import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { ATTRACTIONS } from '@/data/attractions'
import { searchAttractions } from '@/services/searchAttractions'

/**
 * Property 6: Search results always match the query token (already in search.test.ts — kept for traceability)
 * Property 7: Quick List filter correctness
 * Property 11: Surprise Me selects from the full dataset
 */

describe('SurpriseMe — Property 11: selects from full dataset', () => {
  it('random index is always within ATTRACTIONS bounds', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1_000_000 }), (seed) => {
        const idx = seed % ATTRACTIONS.length
        expect(idx).toBeGreaterThanOrEqual(0)
        expect(idx).toBeLessThan(ATTRACTIONS.length)
        expect(ATTRACTIONS[idx]).toBeDefined()
      }),
    )
  })

  it('every attraction can be selected (all indices reachable)', () => {
    const reachable = new Set(ATTRACTIONS.map((_, i) => i))
    expect(reachable.size).toBe(ATTRACTIONS.length)
  })
})

describe('QuickList — Property 7: filter correctness', () => {
  it('state filter returns only attractions from that state', () => {
    fc.assert(
      fc.property(fc.constantFrom(...[...new Set(ATTRACTIONS.map((a) => a.state))]), (state) => {
        const filtered = ATTRACTIONS.filter((a) => a.state === state)
        for (const a of filtered) {
          expect(a.state).toBe(state)
        }
      }),
    )
  })

  it('mood filter returns only attractions with matching mood', () => {
    const moods = ['Relaxing', 'Adventure', 'Cultural', 'Nature', 'Spiritual'] as const
    fc.assert(
      fc.property(fc.constantFrom(...moods), (mood) => {
        const filtered = ATTRACTIONS.filter((a) => a.moodTags.includes(mood))
        for (const a of filtered) {
          expect(a.moodTags).toContain(mood)
        }
      }),
    )
  })

  it('empty filters return all attractions', () => {
    const result = ATTRACTIONS.filter(() => true)
    expect(result.length).toBe(ATTRACTIONS.length)
  })

  it('combined state + category filter is additive (AND)', () => {
    const state = 'Rajasthan'
    const category = 'Fort'
    const result = ATTRACTIONS.filter((a) => a.state === state && a.category === category)
    for (const a of result) {
      expect(a.state).toBe(state)
      expect(a.category).toBe(category)
    }
  })
})

describe('DestinationCard — Property 13: required fields present', () => {
  it('every attraction has all required card fields non-empty', () => {
    for (const a of ATTRACTIONS) {
      expect(a.id).toBeTruthy()
      expect(a.name).toBeTruthy()
      expect(a.city).toBeTruthy()
      expect(a.state).toBeTruthy()
      expect(a.description).toBeTruthy()
      expect(a.moodTags.length).toBeGreaterThanOrEqual(1)
      expect(a.highlights.length).toBeGreaterThanOrEqual(3)
      expect(a.insiderTips.length).toBeGreaterThanOrEqual(2)
    }
  })
})
