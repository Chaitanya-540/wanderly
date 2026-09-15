import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { getItinerary } from '@/services/itineraryGenerator'
import { ATTRACTIONS } from '@/data/attractions'

/**
 * Property 24: Trip Planner itinerary day count matches requested duration
 * The schedule array length must always equal the requested days value.
 */

describe('getItinerary — Property 24: day count invariant', () => {
  it('authored itinerary schedule length always equals days', () => {
    for (const attraction of ATTRACTIONS) {
      for (const it of attraction.itineraries) {
        expect(it.schedule).toHaveLength(it.days)
      }
    }
  })

  it('returned itinerary schedule length equals requested days for every attraction', () => {
    for (const attraction of ATTRACTIONS) {
      for (const days of [2, 3, 4] as const) {
        for (const profile of ['Solo', 'Family'] as const) {
          const result = getItinerary(attraction, days, profile, ATTRACTIONS)
          expect(result.days).toBe(days)
          expect(result.profile).toBe(profile)
          expect(result.schedule).toHaveLength(days)
        }
      }
    }
  })

  it('property-based: schedule length always equals requested days', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ATTRACTIONS),
        fc.constantFrom<2 | 3 | 4>(2, 3, 4),
        fc.constantFrom<'Solo' | 'Family'>('Solo', 'Family'),
        (attraction, days, profile) => {
          const result = getItinerary(attraction, days, profile, ATTRACTIONS)
          expect(result.schedule.length).toBe(days)
        },
      ),
    )
  })

  it('each schedule day has non-empty morning, afternoon, and evening', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ATTRACTIONS),
        fc.constantFrom<2 | 3 | 4>(2, 3, 4),
        fc.constantFrom<'Solo' | 'Family'>('Solo', 'Family'),
        (attraction, days, profile) => {
          const result = getItinerary(attraction, days, profile, ATTRACTIONS)
          for (const daySlot of result.schedule) {
            expect(daySlot.morning.length).toBeGreaterThan(0)
            expect(daySlot.afternoon.length).toBeGreaterThan(0)
            expect(daySlot.evening.length).toBeGreaterThan(0)
          }
        },
      ),
    )
  })
})
