import type { MoodTag } from '@/types/attraction'

// Exactly 10 mood tags — enforced at compile time via `satisfies`
// Adding or removing a tag will cause a TypeScript error
export const MOOD_TAGS = [
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
] as const satisfies readonly MoodTag[]

export type MoodTagTuple = typeof MOOD_TAGS

// Compile-time check: this will error if MOOD_TAGS does not have exactly 10 elements
type AssertExactly10 = MoodTagTuple['length'] extends 10 ? true : never
const _: AssertExactly10 = true

export const MOOD_TAG_LABELS: Record<MoodTag, string> = {
  Relaxing: 'Relaxing',
  Adventure: 'Adventure',
  Cultural: 'Cultural',
  Nature: 'Nature',
  Family: 'Family',
  Romantic: 'Romantic',
  Spiritual: 'Spiritual',
  Food: 'Food & Cuisine',
  Wildlife: 'Wildlife',
  Beach: 'Beach',
}
