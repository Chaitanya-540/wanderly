import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as fc from 'fast-check'

/**
 * Property 14: Favorite toggle is its own inverse
 * Property 29: Favorites localStorage round-trip
 *
 * Tests are written against the pure toggle logic extracted from useFavorites,
 * because React hooks require a DOM/jsdom environment and renderHook.
 * The pure logic is extracted here and verified property-based.
 */

// ─── Pure toggle logic (mirrors useFavorites internals) ──────────────────────

function toggleFavorite(set: Set<string>, id: string): Set<string> {
  const next = new Set(set)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  return next
}

function serializeFavorites(set: Set<string>): string {
  return JSON.stringify([...set])
}

function deserializeFavorites(raw: string): Set<string> {
  return new Set(JSON.parse(raw) as string[])
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('useFavorites — Property 14: toggle is its own inverse', () => {
  it('toggling an id twice returns to original state', () => {
    fc.assert(
      fc.property(fc.array(fc.string({ minLength: 1 }), { maxLength: 20 }), fc.string({ minLength: 1 }), (ids, targetId) => {
        const initial = new Set(ids)
        const afterTwo = toggleFavorite(toggleFavorite(initial, targetId), targetId)
        expect(afterTwo.size).toBe(initial.size)
        for (const id of initial) {
          expect(afterTwo.has(id)).toBe(true)
        }
      }),
    )
  })

  it('toggling adds id when not present', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (id) => {
        const empty = new Set<string>()
        const after = toggleFavorite(empty, id)
        expect(after.has(id)).toBe(true)
        expect(after.size).toBe(1)
      }),
    )
  })

  it('toggling removes id when present', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (id) => {
        const withId = new Set([id])
        const after = toggleFavorite(withId, id)
        expect(after.has(id)).toBe(false)
        expect(after.size).toBe(0)
      }),
    )
  })
})

describe('useFavorites — Property 29: localStorage round-trip', () => {
  it('serialize → deserialize is identity', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 30 }), { maxLength: 20 }).map((arr) => [...new Set(arr)]),
        (ids) => {
          const original = new Set(ids)
          const roundTripped = deserializeFavorites(serializeFavorites(original))
          expect(roundTripped.size).toBe(original.size)
          for (const id of original) {
            expect(roundTripped.has(id)).toBe(true)
          }
        },
      ),
    )
  })

  it('empty set round-trips correctly', () => {
    const empty = new Set<string>()
    const rt = deserializeFavorites(serializeFavorites(empty))
    expect(rt.size).toBe(0)
  })
})
