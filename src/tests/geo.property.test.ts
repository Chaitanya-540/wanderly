import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { haversineDistance, findNearby } from '@/utils/geo'
import { ATTRACTIONS } from '@/data/attractions'

/**
 * Property 17: Nearby destinations satisfies radius and count constraints
 */
describe('geo — Property 17: findNearby radius and count constraints', () => {
  it('all returned attractions are within the requested radius', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ATTRACTIONS),
        fc.integer({ min: 50, max: 500 }),
        fc.integer({ min: 1, max: 10 }),
        (origin, radius, limit) => {
          const results = findNearby(origin, ATTRACTIONS, radius, limit)
          for (const r of results) {
            const dist = haversineDistance(origin.coordinates, r.coordinates)
            expect(dist).toBeLessThanOrEqual(radius + 0.01) // float tolerance
          }
        },
      ),
    )
  })

  it('returns at most `limit` results', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ATTRACTIONS),
        fc.integer({ min: 1, max: 10 }),
        (origin, limit) => {
          const results = findNearby(origin, ATTRACTIONS, 500, limit)
          expect(results.length).toBeLessThanOrEqual(limit)
        },
      ),
    )
  })

  it('never includes the origin attraction itself', () => {
    fc.assert(
      fc.property(fc.constantFrom(...ATTRACTIONS), (origin) => {
        const results = findNearby(origin, ATTRACTIONS, 500, 10)
        expect(results.find((r) => r.id === origin.id)).toBeUndefined()
      }),
    )
  })

  it('haversineDistance is symmetric', () => {
    fc.assert(
      fc.property(
        fc.record({ lat: fc.double({ min: 8, max: 37, noNaN: true }), lng: fc.double({ min: 68, max: 97, noNaN: true }) }),
        fc.record({ lat: fc.double({ min: 8, max: 37, noNaN: true }), lng: fc.double({ min: 68, max: 97, noNaN: true }) }),
        (a, b) => {
          expect(haversineDistance(a, b)).toBeCloseTo(haversineDistance(b, a), 5)
        },
      ),
    )
  })

  it('haversineDistance is zero for identical points', () => {
    fc.assert(
      fc.property(
        fc.record({ lat: fc.double({ min: 8, max: 37, noNaN: true }), lng: fc.double({ min: 68, max: 97, noNaN: true }) }),
        (point) => {
          expect(haversineDistance(point, point)).toBeCloseTo(0, 5)
        },
      ),
    )
  })
})
