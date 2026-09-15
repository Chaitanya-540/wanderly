import type { MoodTag } from './attraction'

export interface LocalProfile {
  displayName: string
  defaultMoods: MoodTag[]
}
