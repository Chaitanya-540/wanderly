import type { Attraction } from '@/types/attraction'

const EARTH_RADIUS_KM = 6371

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

/**
 * Calculate the great-circle distance between two geographic points.
 * @returns distance in kilometres
 */
export function haversineDistance(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}

/**
 * Find attractions within a given radius of an origin attraction.
 * Returns up to `limit` results sorted by distance ascending.
 */
export function findNearby(
  origin: Attraction,
  all: Attraction[],
  radiusKm = 200,
  limit = 5,
): Attraction[] {
  return all
    .filter((a) => a.id !== origin.id)
    .map((a) => ({
      attraction: a,
      dist: haversineDistance(origin.coordinates, a.coordinates),
    }))
    .filter((x) => x.dist <= radiusKm)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, limit)
    .map((x) => x.attraction)
}

// India bounding box (WGS-84)
const INDIA_LNG_MIN = 68
const INDIA_LNG_MAX = 97
const INDIA_LAT_MIN = 8
const INDIA_LAT_MAX = 37
const MAP_SCALE = 10 // Three.js world units across longest dimension

/**
 * Project WGS-84 longitude/latitude to Three.js X/Z coordinates.
 * India's bounding box is mapped to [-MAP_SCALE/2, MAP_SCALE/2] on both axes.
 * Returns [x, z] — Y axis is used for elevation (0 = sea level).
 */
export function projectToXZ(lng: number, lat: number): [number, number] {
  const x =
    ((lng - INDIA_LNG_MIN) / (INDIA_LNG_MAX - INDIA_LNG_MIN) - 0.5) * MAP_SCALE
  const z =
    -(((lat - INDIA_LAT_MIN) / (INDIA_LAT_MAX - INDIA_LAT_MIN) - 0.5) * MAP_SCALE)
  return [x, z]
}

/**
 * Project GeoJSON coordinate pair [longitude, latitude] to Three.js [x, z].
 */
export function projectGeoCoord(coord: [number, number]): [number, number] {
  return projectToXZ(coord[0], coord[1])
}

/**
 * Compute the geographic centroid of a polygon ring.
 * @param coords Array of [lng, lat] pairs
 */
export function computeCentroid(coords: [number, number][]): { lat: number; lng: number } {
  const n = coords.length
  if (n === 0) return { lat: 20.5937, lng: 78.9629 } // fallback: India centre

  let lngSum = 0
  let latSum = 0
  for (const [lng, lat] of coords) {
    lngSum += lng
    latSum += lat
  }
  return { lat: latSum / n, lng: lngSum / n }
}
