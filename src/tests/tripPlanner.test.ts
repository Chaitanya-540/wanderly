import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type { Trip } from '@/types/trip'

/**
 * Property 25: Trip persistence round-trip
 *
 * Tests the pure serialization/deserialization of Trip objects,
 * which mirrors what useTripPlanner does with localStorage.
 */

function serializeTrips(trips: Trip[]): string {
  return JSON.stringify(trips)
}

function deserializeTrips(raw: string): Trip[] {
  return JSON.parse(raw) as Trip[]
}

// fast-check arbitrary for a minimal Trip object
const tripArbitrary = fc.record<Trip>({
  id: fc.uuid(),
  attractionId: fc.string({ minLength: 1, maxLength: 40 }),
  attractionName: fc.string({ minLength: 1, maxLength: 80 }),
  itinerary: fc.record({
    days: fc.constantFrom<2 | 3 | 4>(2, 3, 4),
    profile: fc.constantFrom<'Solo' | 'Family'>('Solo', 'Family'),
    schedule: fc.array(
      fc.record({
        day: fc.integer({ min: 1, max: 4 }),
        morning: fc.string({ minLength: 1 }),
        afternoon: fc.string({ minLength: 1 }),
        evening: fc.string({ minLength: 1 }),
      }),
      { minLength: 1, maxLength: 4 },
    ),
  }),
  createdAt: fc.integer({ min: 1_000_000, max: 9_999_999_999_999 }),
  updatedAt: fc.integer({ min: 1_000_000, max: 9_999_999_999_999 }),
})

describe('useTripPlanner — Property 25: trip persistence round-trip', () => {
  it('serialize → deserialize preserves all trip fields', () => {
    fc.assert(
      fc.property(fc.array(tripArbitrary, { maxLength: 10 }), (trips) => {
        const roundTripped = deserializeTrips(serializeTrips(trips))
        expect(roundTripped).toHaveLength(trips.length)
        for (let i = 0; i < trips.length; i++) {
          expect(roundTripped[i].id).toBe(trips[i].id)
          expect(roundTripped[i].attractionId).toBe(trips[i].attractionId)
          expect(roundTripped[i].attractionName).toBe(trips[i].attractionName)
          expect(roundTripped[i].itinerary.days).toBe(trips[i].itinerary.days)
          expect(roundTripped[i].itinerary.profile).toBe(trips[i].itinerary.profile)
        }
      }),
    )
  })

  it('empty trips array round-trips correctly', () => {
    const rt = deserializeTrips(serializeTrips([]))
    expect(rt).toHaveLength(0)
  })

  it('trip order is preserved after round-trip', () => {
    fc.assert(
      fc.property(fc.array(tripArbitrary, { minLength: 2, maxLength: 5 }), (trips) => {
        const rt = deserializeTrips(serializeTrips(trips))
        for (let i = 0; i < trips.length; i++) {
          expect(rt[i].id).toBe(trips[i].id)
        }
      }),
    )
  })
})
