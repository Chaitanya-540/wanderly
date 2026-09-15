'use client'

import { useMemo } from 'react'
import { Text } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { projectToXZ } from '@/utils/geo'
import { resolveCollisions } from '@/utils/collision'
import type { LabelRect } from '@/utils/collision'

interface GeoFeature {
  properties: { name: string; id: number }
  geometry: { type: string; coordinates: unknown }
}

interface StateLabelLayerProps {
  geojson: { features: GeoFeature[] }
}

function computeCentroid(feature: GeoFeature): [number, number] | null {
  const geom = feature.geometry as { type: string; coordinates: unknown }
  let ring: number[][]

  if (geom.type === 'Polygon') {
    ring = (geom.coordinates as number[][][])[0]
  } else if (geom.type === 'MultiPolygon') {
    const polys = geom.coordinates as number[][][][]
    ring = polys.reduce((a, b) => (a[0].length > b[0].length ? a : b))[0]
  } else {
    return null
  }

  if (!ring || ring.length < 3) return null

  // Weighted centroid of the ring (GeoJSON: [lng, lat])
  let lngSum = 0, latSum = 0
  for (const coord of ring) {
    lngSum += coord[0]
    latSum += coord[1]
  }
  const avgLng = lngSum / ring.length
  const avgLat = latSum / ring.length
  return projectToXZ(avgLng, avgLat)
}

export default function StateLabelLayer({ geojson }: StateLabelLayerProps) {
  const { camera } = useThree()
  const camDist = camera.position.length()

  // Show labels when not zoomed in too far
  const showLabels = camDist > 5

  const centroids = useMemo(
    () =>
      geojson.features
        .map((f) => ({ name: f.properties.name?.toUpperCase() ?? '', pos: computeCentroid(f) }))
        .filter((l): l is { name: string; pos: [number, number] } => l.pos !== null && l.name !== ''),
    [geojson],
  )

  // Build collision rects using world-space coords
  const rects: LabelRect[] = centroids.map((c, i) => ({
    id: String(i),
    x: c.pos[0] - (c.name.length * 0.07) / 2,
    y: c.pos[1] - 0.1,
    w: c.name.length * 0.07,
    h: 0.2,
    priority: 1,
  }))

  const visible = useMemo(() => resolveCollisions(rects), [rects])  // eslint-disable-line

  if (!showLabels) return null

  // Font size scales with camera distance — smaller when zoomed out
  const fontSize = Math.min(0.14, Math.max(0.08, camDist * 0.006))

  return (
    <group>
      {centroids.map((label, i) => {
        if (!visible.has(String(i))) return null
        return (
          <Text
            key={label.name}
            position={[label.pos[0], 0.08, label.pos[1]]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={fontSize}
            font="/fonts/Montserrat-Medium.ttf"
            color="#94a3b8"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.08}
            maxWidth={3}
            outlineWidth={0.008}
            outlineColor="#0b0b0d"
            fillOpacity={0.7}
          >
            {label.name}
          </Text>
        )
      })}
    </group>
  )
}
