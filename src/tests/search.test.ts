import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { searchAttractions } from '@/services/searchAttractions'
import { ATTRACTIONS } from '@/data/attractions'

/**
 * Property 6: Search results always match the query token
 * Every returned result must contain the query in name, city, state, or district.
 */

describe('searchAttractions — Property 6: results always match query', () => {
  it('every result contains the query token in name/city/state/district', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 15 }), (query) => {
        const results = searchAttractions(ATTRACTIONS, query)
        const q = query.trim().toLowerCase()
        for (const r of results) {
          const matched =
            r.name.toLowerCase().includes(q) ||
            r.city.toLowerCase().includes(q) ||
            r.state.toLowerCase().includes(q) ||
            r.district.toLowerCase().includes(q)
          expect(matched).toBe(true)
        }
      }),
    )
  })

  it('returns at most 10 results', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (query) => {
        expect(searchAttractions(ATTRACTIONS, query).length).toBeLessThanOrEqual(10)
      }),
    )
  })

  it('empty query returns empty array', () => {
    expect(searchAttractions(ATTRACTIONS, '')).toHaveLength(0)
    expect(searchAttractions(ATTRACTIONS, '   ')).toHaveLength(0)
  })

  it('known state name returns at least 3 results', () => {
    const results = searchAttractions(ATTRACTIONS, 'Rajasthan')
    expect(results.length).toBeGreaterThanOrEqual(3)
  })

  it('search is case-insensitive', () => {
    const upper = searchAttractions(ATTRACTIONS, 'KERALA')
    const lower = searchAttractions(ATTRACTIONS, 'kerala')
    expect(upper.map((r) => r.id)).toEqual(lower.map((r) => r.id))
  })
})
