'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { projectToXZ } from '@/utils/geo'

interface GeoFeature {
  type: 'Feature'
  properties: { name: string; id: number }
  geometry: {
    type: 'Polygon' | 'MultiPolygon'
    coordinates: number[][][] | number[][][][]
  }
}

interface StateLayerProps {
  geojson: { features: GeoFeature[] }
}

// Nighttime India land colour — dark charcoal with slight warm tint
const LAND_COLOR = new THREE.Color('#1a1a20')
const LAND_EMISSIVE = new THREE.Color('#0d0d10')
// Subtle cyan border — like satellite imagery state lines
const BORDER_COLOR = new THREE.Color('#2dd4bf')

function buildShapeFromRing(ring: number[][]): THREE.Shape {
  const shape = new THREE.Shape()
  // GeoJSON ring: [lng, lat] → projectToXZ(lng, lat)
  const [x0, z0] = projectToXZ(ring[0][0], ring[0][1])
  shape.moveTo(x0, z0)
  for (let i = 1; i < ring.length; i++) {
    const [x, z] = projectToXZ(ring[i][0], ring[i][1])
    shape.lineTo(x, z)
  }
  shape.closePath()
  return shape
}

function StateShape({ feature }: { feature: GeoFeature }) {
  const { extruded, edges } = useMemo(() => {
    const geom = feature.geometry
    const rings: number[][][] =
      geom.type === 'Polygon'
        ? (geom.coordinates as number[][][])
        : (geom.coordinates as number[][][][]).flat()

    const shapes = rings
      .filter((r) => r.length > 3)
      .map((ring) => buildShapeFromRing(ring))

    if (shapes.length === 0) return { extruded: null, edges: null }

    const extruded = new THREE.ExtrudeGeometry(shapes, {
      depth: 0.04,
      bevelEnabled: false,
    })

    const edges = new THREE.EdgesGeometry(extruded, 15)
    return { extruded, edges }
  }, [feature])

  if (!extruded || !edges) return null

  return (
    <group>
      {/* Land surface */}
      <mesh geometry={extruded}>
        <meshStandardMaterial
          color={LAND_COLOR}
          emissive={LAND_EMISSIVE}
          emissiveIntensity={1}
          roughness={0.95}
          metalness={0}
        />
      </mesh>
      {/* Subtle cyan border lines */}
      <lineSegments geometry={edges}>
        <lineBasicMaterial
          color={BORDER_COLOR}
          transparent
          opacity={0.35}
        />
      </lineSegments>
    </group>
  )
}

export default function StateLayer({ geojson }: StateLayerProps) {
  return (
    <group>
      {geojson.features.map((feature) => (
        <StateShape key={`${feature.properties.id}-${feature.properties.name}`} feature={feature} />
      ))}
    </group>
  )
}
