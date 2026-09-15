import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { haversineDistance, findNearby } from '@/utils/geo'
import type { Attraction } from '@/types/attraction'

// Helper to create a minimal attraction stub
function makeAttraction(id: string, lat: number, lng: number): Attraction {
  return {
    id,
    name: id,
    city: 'TestCity',
    state: 'TestState',
    district: 'TestDistrict',
    category: 'Heritage',
    moodTags: ['Cultural'],
    coordinates: { lat, lng },
    description: 'Test',
    highlights: ['h1', 'h2', 'h3'],
    insiderTips: ['t1', 't2'],
    itineraries: [],
    popularityScore: 50,
    nearbyRadius: 200,
  }
}

describe('haversineDistance — Property 17', () => {
  it('distance from a point to itself is 0', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -90, max: 90, noNaN: true }),
        fc.float({ min: -180, max: 180, noNaN: true }),
        (lat, lng) => {
          const d = haversineDistance({ lat, lng }, { lat, lng })
          expect(d).toBeCloseTo(0, 5)
        },
      ),
    )
  })

  it('distance is symmetric: d(A,B) === d(B,A)', () => {
    fc.assert(
      fc.property(
        fc.record({
          lat: fc.float({ min: 8, max: 37, noNaN: true }),
          lng: fc.float({ min: 68, max: 97, noNaN: true }),
        }),
        fc.record({
          lat: fc.float({ min: 8, max: 37, noNaN: true }),
          lng: fc.float({ min: 68, max: 97, noNaN: true }),
        }),
        (a, b) => {
          const d1 = haversineDistance(a, b)
          const d2 = haversineDistance(b, a)
          expect(d1).toBeCloseTo(d2, 4)
        },
      ),
    )
  })

  it('distance is non-negative', () => {
    fc.assert(
      fc.property(
        fc.record({ lat: fc.float({ min: 8, max: 37, noNaN: true }), lng: fc.float({ min: 68, max: 97, noNaN: true }) }),
        fc.record({ lat: fc.float({ min: 8, max: 37, noNaN: true }), lng: fc.float({ min: 68, max: 97, noNaN: true }) }),
        (a, b) => {
          expect(haversineDistance(a, b)).toBeGreaterThanOrEqual(0)
        },
      ),
    )
  })

  it('known distance: Delhi to Mumbai is ~1150km', () => {
    const delhi = { lat: 28.6139, lng: 77.2090 }
    const mumbai = { lat: 19.0760, lng: 72.8777 }
    const d = haversineDistance(delhi, mumbai)
    expect(d).toBeGreaterThan(1100)
    expect(d).toBeLessThan(1250)
  })
})

describe('findNearby — Property 17: radius and count constraints', () => {
  it('never returns the origin attraction itself', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            lat: fc.float({ min: 8, max: 37, noNaN: true }),
            lng: fc.float({ min: 68, max: 97, noNaN: true }),
          }),
          { minLength: 1, maxLength: 20 },
        ),
        (coords) => {
          const attractions = coords.map((c, i) =>
            makeAttraction(`att-${i}`, c.lat, c.lng),
          )
          const origin = attractions[0]
          const nearby = findNearby(origin, attractions, 10000, 100)
          expect(nearby.every((a) => a.id !== origin.id)).toBe(true)
        },
      ),
    )
  })

  it('all returned attractions are within the specified radius', () => {
    const radiusKm = 200
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            lat: fc.float({ min: 8, max: 37, noNaN: true }),
            lng: fc.float({ min: 68, max: 97, noNaN: true }),
          }),
          { minLength: 2, maxLength: 20 },
        ),
        (coords) => {
          const attractions = coords.map((c, i) =>
            makeAttraction(`att-${i}`, c.lat, c.lng),
          )
          const origin = attractions[0]
          const nearby = findNearby(origin, attractions, radiusKm, 100)
          for (const a of nearby) {
            const dist = haversineDistance(origin.coordinates, a.coordinates)
            expect(dist).toBeLessThanOrEqual(radiusKm + 0.001) // float tolerance
          }
        },
      ),
    )
  })

  it('returns at most `limit` results', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        fc.array(
          fc.record({
            lat: fc.float({ min: 8, max: 37, noNaN: true }),
            lng: fc.float({ min: 68, max: 97, noNaN: true }),
          }),
          { minLength: 2, maxLength: 50 },
        ),
        (limit, coords) => {
          const attractions = coords.map((c, i) =>
            makeAttraction(`att-${i}`, c.lat, c.lng),
          )
          const nearby = findNearby(attractions[0], attractions, 10000, limit)
          expect(nearby.length).toBeLessThanOrEqual(limit)
        },
      ),
    )
  })
})
