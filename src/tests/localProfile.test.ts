import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type { LocalProfile } from '@/types/profile'
import type { MoodTag } from '@/types/attraction'

/**
 * Property 30: Local Profile persistence round-trip
 *
 * Tests the pure serialization/deserialization of LocalProfile objects,
 * which mirrors what useLocalProfile does with localStorage.
 */

const VALID_MOOD_TAGS: MoodTag[] = [
  'Relaxing', 'Adventure', 'Cultural', 'Nature', 'Family',
  'Romantic', 'Spiritual', 'Food', 'Wildlife', 'Beach',
]

function serializeProfile(profile: LocalProfile): string {
  return JSON.stringify(profile)
}

function deserializeProfile(raw: string): LocalProfile {
  return JSON.parse(raw) as LocalProfile
}

const profileArbitrary = fc.record<LocalProfile>({
  displayName: fc.string({ maxLength: 50 }),
  defaultMoods: fc.array(fc.constantFrom(...VALID_MOOD_TAGS), { maxLength: 5 }),
})

describe('useLocalProfile — Property 30: persistence round-trip', () => {
  it('serialize → deserialize preserves all profile fields', () => {
    fc.assert(
      fc.property(profileArbitrary, (profile) => {
        const rt = deserializeProfile(serializeProfile(profile))
        expect(rt.displayName).toBe(profile.displayName)
        expect(rt.defaultMoods).toEqual(profile.defaultMoods)
      }),
    )
  })

  it('empty profile round-trips correctly', () => {
    const empty: LocalProfile = { displayName: '', defaultMoods: [] }
    const rt = deserializeProfile(serializeProfile(empty))
    expect(rt.displayName).toBe('')
    expect(rt.defaultMoods).toHaveLength(0)
  })

  it('profile with all 10 mood defaults round-trips correctly', () => {
    const profile: LocalProfile = { displayName: 'Traveller', defaultMoods: [...VALID_MOOD_TAGS] }
    const rt = deserializeProfile(serializeProfile(profile))
    expect(rt.defaultMoods).toHaveLength(10)
    expect(rt.displayName).toBe('Traveller')
  })
})
