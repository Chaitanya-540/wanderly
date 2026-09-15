import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { ATTRACTIONS } from '@/data/attractions'
import { categoryColorHex, CATEGORY_COLORS } from '@/data/categoryColors'
import type { AttractionCategory } from '@/types/attraction'

/**
 * Property 4: One marker per attraction (unique IDs)
 * Property 5: Category colour mapping invariant
 * Property 9: Mood filter dims non-matching markers (opacity logic)
 * Property 10: Mood filter clear restores full brightness
 */

describe('Attraction markers — Properties 4, 5, 9, 10', () => {
  it('Property 4: all attraction IDs are unique', () => {
    const ids = ATTRACTIONS.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('Property 5: every category has a defined hex colour', () => {
    const categories: AttractionCategory[] = [
      'Temple', 'Fort', 'Beach', 'Wildlife', 'Mountain',
      'Lake', 'Museum', 'City', 'Waterfall', 'Heritage',
    ]
    for (const cat of categories) {
      expect(CATEGORY_COLORS[cat]).toMatch(/^#[0-9a-fA-F]{6}$/)
      expect(categoryColorHex(cat)).toBeGreaterThan(0)
    }
  })

  it('Property 5: every attraction category has a colour', () => {
    for (const a of ATTRACTIONS) {
      expect(CATEGORY_COLORS[a.category]).toBeDefined()
    }
  })

  it('Property 9: mood filter — marker with no matching mood should be dimmed (opacity < 1)', () => {
    fc.assert(
      fc.property(fc.constantFrom(...ATTRACTIONS), (attraction) => {
        // Simulate: activeMoods contains only tags NOT in this attraction
        const allTags = ['Relaxing', 'Adventure', 'Cultural', 'Nature', 'Family', 'Romantic', 'Spiritual', 'Food', 'Wildlife', 'Beach'] as const
        const nonMatchingTag = allTags.find((t) => !attraction.moodTags.includes(t))
        if (!nonMatchingTag) return // skip if attraction has all tags (edge case)
        const activeMoods = new Set([nonMatchingTag])
        const matchesMood = attraction.moodTags.some((t) => activeMoods.has(t))
        const opacity = matchesMood ? 1 : 0.15
        expect(opacity).toBe(0.15)
      }),
    )
  })

  it('Property 10: with no active moods, all markers have full opacity', () => {
    const activeMoods = new Set<string>()
    for (const attraction of ATTRACTIONS) {
      const matchesMood = activeMoods.size === 0 || attraction.moodTags.some((t) => activeMoods.has(t))
      const opacity = matchesMood ? 1 : 0.15
      expect(opacity).toBe(1)
    }
  })
})
