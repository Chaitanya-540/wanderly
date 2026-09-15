export type MoodTag =
  | 'Relaxing'
  | 'Adventure'
  | 'Cultural'
  | 'Nature'
  | 'Family'
  | 'Romantic'
  | 'Spiritual'
  | 'Food'
  | 'Wildlife'
  | 'Beach'

export type AttractionCategory =
  | 'Temple'
  | 'Fort'
  | 'Beach'
  | 'Wildlife'
  | 'Mountain'
  | 'Lake'
  | 'Museum'
  | 'City'
  | 'Waterfall'
  | 'Heritage'

export interface ItineraryDay {
  day: number
  morning: string
  afternoon: string
  evening: string
  tips?: string
}

export interface Itinerary {
  days: 2 | 3 | 4
  profile: 'Solo' | 'Family'
  schedule: ItineraryDay[] // length === days
}

export interface Attraction {
  id: string                 // kebab-case unique ID
  name: string
  city: string
  state: string
  district: string
  category: AttractionCategory
  moodTags: MoodTag[]        // 1-4 tags
  coordinates: {
    lat: number              // WGS-84
    lng: number
  }
  description: string        // one sentence
  highlights: string[]       // >= 3 items
  insiderTips: string[]      // >= 2 items
  itineraries: Itinerary[]   // all 8 combos: days(2|3|4) x profile(Solo|Family)
  popularityScore: number    // 0-100
  nearbyRadius: number       // km, default 200
}
