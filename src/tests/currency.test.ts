import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { convertFromINR, convertToINR, FALLBACK_RATES, formatCurrency } from '@/utils/currency'
import type { Currency } from '@/types/budget'

/**
 * Validates: Requirements 4.6 — Property 28: currency round-trip invariant
 */
describe('Currency conversion — Property 28: round-trip invariant', () => {
  it('INR → USD → INR round-trip stays within 0.1% tolerance', () => {
    fc.assert(
      fc.property(fc.integer({ min: 100, max: 10_000_000 }), (amountINR) => {
        const usd = convertFromINR(amountINR, 'USD')
        const backToINR = convertToINR(usd, 'USD')
        expect(backToINR).toBeCloseTo(amountINR, 0)
      }),
    )
  })

  it('INR → EUR → INR round-trip stays within 0.1% tolerance', () => {
    fc.assert(
      fc.property(fc.integer({ min: 100, max: 10_000_000 }), (amountINR) => {
        const eur = convertFromINR(amountINR, 'EUR')
        const backToINR = convertToINR(eur, 'EUR')
        expect(backToINR).toBeCloseTo(amountINR, 0)
      }),
    )
  })

  it('INR → INR conversion is identity', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100_000_000 }), (amount) => {
        expect(convertFromINR(amount, 'INR')).toBe(amount)
        expect(convertToINR(amount, 'INR')).toBe(amount)
      }),
    )
  })

  it('custom rates are used when provided', () => {
    const customRates = { USD: 80, EUR: 85, fetchedAt: Date.now() }
    const amount = 8000
    expect(convertFromINR(amount, 'USD', customRates)).toBeCloseTo(100, 1)
    expect(convertFromINR(amount, 'EUR', customRates)).toBeCloseTo(8000 / 85, 1)
  })

  it('formatCurrency: INR uses ₹ symbol', () => {
    expect(formatCurrency(1000, 'INR')).toContain('₹')
  })

  it('formatCurrency: USD uses $ symbol', () => {
    expect(formatCurrency(100, 'USD')).toContain('$')
  })

  it('formatCurrency: EUR uses € symbol', () => {
    expect(formatCurrency(100, 'EUR')).toContain('€')
  })

  it('convertFromINR result is positive for positive inputs', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10_000_000 }),
        fc.constantFrom<Exclude<Currency, 'INR'>>('USD', 'EUR'),
        (amount, currency) => {
          expect(convertFromINR(amount, currency)).toBeGreaterThan(0)
        },
      ),
    )
  })
})
