import { describe, it, expect } from 'vitest'
import { MOOD_TAGS } from '@/data/moodTags'
import type { MoodTag } from '@/types/attraction'

/**
 * Validates: Requirements Property 8
 * MOOD_TAGS must contain exactly 10 unique, valid MoodTag values.
 */

const EXPECTED_MOOD_TAGS: MoodTag[] = [
  'Relaxing',
  'Adventure',
  'Cultural',
  'Nature',
  'Family',
  'Romantic',
  'Spiritual',
  'Food',
  'Wildlife',
  'Beach',
]

describe('MOOD_TAGS — Property 8: Exactly 10 mood tags', () => {
  it('has exactly 10 tags', () => {
    expect(MOOD_TAGS).toHaveLength(10)
  })

  it('has no duplicate tags', () => {
    const unique = new Set(MOOD_TAGS)
    expect(unique.size).toBe(MOOD_TAGS.length)
  })

  it('contains exactly the expected 10 mood values', () => {
    const sorted = [...MOOD_TAGS].sort()
    const expectedSorted = [...EXPECTED_MOOD_TAGS].sort()
    expect(sorted).toEqual(expectedSorted)
  })

  it('every tag is a non-empty string', () => {
    for (const tag of MOOD_TAGS) {
      expect(typeof tag).toBe('string')
      expect(tag.length).toBeGreaterThan(0)
    }
  })
})
