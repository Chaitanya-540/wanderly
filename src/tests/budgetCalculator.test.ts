import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  validateBudgetInput,
  calculateBudget,
  calculateTransportCost,
  selectTransportMode,
} from '@/services/budgetCalculator'
import type { BudgetInput } from '@/types/budget'
import { ATTRACTIONS } from '@/data/attractions'

/**
 * Property 26: Budget Estimator input validation
 * Property 27: Transport cost varies with distance
 */

const validInput = (): BudgetInput => ({
  attractionId: 'taj-mahal',
  startingCity: 'Delhi',
  days: 3,
  travellers: 2,
  accommodation: 'Mid-range',
  travelStyle: 'Standard',
  currency: 'INR',
})

// ─── Property 26: Budget input validation ─────────────────────────────────────

describe('validateBudgetInput — Property 26: input validation', () => {
  it('valid input produces no errors', () => {
    expect(validateBudgetInput(validInput())).toHaveLength(0)
  })

  it('days < 1 produces an error', () => {
    fc.assert(
      fc.property(fc.integer({ min: -100, max: 0 }), (days) => {
        const errors = validateBudgetInput({ ...validInput(), days })
        expect(errors.some((e) => e.field === 'days')).toBe(true)
      }),
    )
  })

  it('days > 30 produces an error', () => {
    fc.assert(
      fc.property(fc.integer({ min: 31, max: 200 }), (days) => {
        const errors = validateBudgetInput({ ...validInput(), days })
        expect(errors.some((e) => e.field === 'days')).toBe(true)
      }),
    )
  })

  it('travellers < 1 produces an error', () => {
    fc.assert(
      fc.property(fc.integer({ min: -20, max: 0 }), (travellers) => {
        const errors = validateBudgetInput({ ...validInput(), travellers })
        expect(errors.some((e) => e.field === 'travellers')).toBe(true)
      }),
    )
  })

  it('travellers > 20 produces an error', () => {
    fc.assert(
      fc.property(fc.integer({ min: 21, max: 100 }), (travellers) => {
        const errors = validateBudgetInput({ ...validInput(), travellers })
        expect(errors.some((e) => e.field === 'travellers')).toBe(true)
      }),
    )
  })

  it('empty attractionId produces an error', () => {
    const errors = validateBudgetInput({ ...validInput(), attractionId: '' })
    expect(errors.some((e) => e.field === 'attractionId')).toBe(true)
  })

  it('empty startingCity produces an error', () => {
    const errors = validateBudgetInput({ ...validInput(), startingCity: '' })
    expect(errors.some((e) => e.field === 'startingCity')).toBe(true)
  })

  it('valid days 1–30 produce no days error', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 30 }), (days) => {
        const errors = validateBudgetInput({ ...validInput(), days })
        expect(errors.some((e) => e.field === 'days')).toBe(false)
      }),
    )
  })
})

// ─── Property 27: Transport cost varies with distance ─────────────────────────

describe('calculateTransportCost — Property 27: cost varies with distance', () => {
  it('longer distance always costs at least as much as shorter', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 500 }),
        fc.integer({ min: 501, max: 3000 }),
        fc.integer({ min: 1, max: 20 }),
        (shortDist, longDist, travellers) => {
          const cheap = calculateTransportCost(shortDist, travellers)
          const expensive = calculateTransportCost(longDist, travellers)
          expect(expensive).toBeGreaterThanOrEqual(cheap)
        },
      ),
    )
  })

  it('cost is always positive for positive distance and travellers', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5000 }),
        fc.integer({ min: 1, max: 20 }),
        (dist, travellers) => {
          expect(calculateTransportCost(dist, travellers)).toBeGreaterThan(0)
        },
      ),
    )
  })

  it('more travellers always costs at least as much', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 2000 }),
        fc.integer({ min: 1, max: 10 }),
        fc.integer({ min: 11, max: 20 }),
        (dist, fewer, more) => {
          expect(calculateTransportCost(dist, more)).toBeGreaterThanOrEqual(
            calculateTransportCost(dist, fewer),
          )
        },
      ),
    )
  })

  it('selectTransportMode returns local for ≤50 km', () => {
    expect(selectTransportMode(50)).toBe('local')
    expect(selectTransportMode(1)).toBe('local')
  })

  it('selectTransportMode returns flight for >1500 km', () => {
    expect(selectTransportMode(1501)).toBe('flight')
    expect(selectTransportMode(5000)).toBe('flight')
  })
})

// ─── Full budget integration check ───────────────────────────────────────────

describe('calculateBudget — integration', () => {
  it('all components are positive for a valid attraction', () => {
    const attraction = ATTRACTIONS[0]
    const result = calculateBudget({
      input: validInput(),
      attractionState: attraction.state,
      attractionCoordinates: attraction.coordinates,
    })
    expect(result.transport).toBeGreaterThan(0)
    expect(result.accommodation).toBeGreaterThan(0)
    expect(result.food).toBeGreaterThan(0)
    expect(result.activities).toBeGreaterThan(0)
    expect(result.miscellaneous).toBeGreaterThan(0)
    expect(result.totalINR).toBe(
      result.transport + result.accommodation + result.food + result.activities + result.miscellaneous,
    )
  })

  it('total equals sum of all components', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ATTRACTIONS),
        fc.integer({ min: 1, max: 10 }),
        fc.integer({ min: 1, max: 7 }),
        (attraction, travellers, days) => {
          const result = calculateBudget({
            input: { ...validInput(), travellers, days, attractionId: attraction.id },
            attractionState: attraction.state,
            attractionCoordinates: attraction.coordinates,
          })
          expect(result.totalINR).toBe(
            result.transport + result.accommodation + result.food + result.activities + result.miscellaneous,
          )
        },
      ),
    )
  })
})
