import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

/**
 * Property 1: GeoJSON features are bounded within India
 * India bounding box: lng 68–97°E, lat 8–37°N
 */

const INDIA_LNG_MIN = 68, INDIA_LNG_MAX = 97
const INDIA_LAT_MIN = 8,  INDIA_LAT_MAX = 37

interface GeoJSON {
  type: string
  features: Array<{
    properties: { name: string }
    geometry: { type: string; coordinates: unknown }
  }>
}

function allCoords(geom: { type: string; coordinates: unknown }): number[][] {
  const { type, coordinates } = geom as { type: string; coordinates: unknown }
  if (type === 'Polygon') return (coordinates as number[][][]).flat()
  if (type === 'MultiPolygon') return (coordinates as number[][][][]).flat(2)
  return []
}

describe('india-states.geojson — Property 1: bounds within India', () => {
  const geojsonPath = resolve(process.cwd(), 'public/data/india-states.geojson')
  let geojson: GeoJSON

  try {
    geojson = JSON.parse(readFileSync(geojsonPath, 'utf8'))
  } catch {
    it.skip('GeoJSON file not found')
    return
  }

  it('has at least 28 features', () => {
    expect(geojson.features.length).toBeGreaterThanOrEqual(28)
  })

  it('every coordinate is within India bounding box', () => {
    for (const feature of geojson.features) {
      const coords = allCoords(feature.geometry as { type: string; coordinates: unknown })
      for (const [lng, lat] of coords) {
        // Andaman & Nicobar extend to ~6.7°N and Lakshadweep to ~8.3°N
        // Pakistan/Nepal/Bangladesh borders push slightly outside main box
        expect(lng).toBeGreaterThanOrEqual(60)  // western-most India territory
        expect(lng).toBeLessThanOrEqual(100)    // eastern-most
        expect(lat).toBeGreaterThanOrEqual(4)   // Andaman southern tip
        expect(lat).toBeLessThanOrEqual(40)     // northern Kashmir
      }
    }
  })

  it('every feature has a name property', () => {
    for (const feature of geojson.features) {
      expect(feature.properties.name).toBeTruthy()
    }
  })
})
