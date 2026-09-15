import type { Attraction, Itinerary } from '@/types/attraction'
import { findNearby } from '@/utils/geo'

type DayCount = 2 | 3 | 4
type Profile = 'Solo' | 'Family'

/**
 * Return the authored itinerary for the requested days + profile combination,
 * falling back to a synthesised itinerary built from named nearby attractions.
 *
 * The fallback never uses generic placeholder text — it uses real attraction
 * names returned by `findNearby`.
 */
export function getItinerary(
  attraction: Attraction,
  days: DayCount,
  profile: Profile,
  allAttractions: Attraction[],
): Itinerary {
  // 1. Look up authored itinerary first
  const authored = attraction.itineraries.find(
    (it) => it.days === days && it.profile === profile,
  )
  if (authored) return authored

  // 2. Fallback: build from nearby named places
  const nearby = findNearby(attraction, allAttractions, attraction.nearbyRadius, days * 2)
  const nearbyNames = nearby.map((n) => n.name)

  const schedule = Array.from({ length: days }, (_, i) => {
    const morningPlace = nearbyNames[i * 2] ?? attraction.name
    const afternoonPlace = nearbyNames[i * 2 + 1] ?? attraction.name
    return {
      day: i + 1,
      morning:
        i === 0
          ? `Arrive and explore ${attraction.name}`
          : `Visit ${morningPlace}`,
      afternoon:
        i === days - 1
          ? `Return journey from ${attraction.city}`
          : `Explore ${afternoonPlace}`,
      evening:
        i === 0
          ? `Evening walk around ${attraction.city}`
          : `Dinner and rest in ${attraction.city}`,
    }
  })

  return { days, profile, schedule }
}
