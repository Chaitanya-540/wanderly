'use client'

import { useMemo } from 'react'
import AttractionMarker from './AttractionMarker'
import { projectToXZ } from '@/utils/geo'
import { ATTRACTIONS } from '@/data/attractions'

export default function AttractionLayer() {
  // projectToXZ(lng, lat) — GeoJSON/WGS-84 order
  const markers = useMemo(
    () =>
      ATTRACTIONS.map((a) => {
        const [x, z] = projectToXZ(a.coordinates.lng, a.coordinates.lat)
        return { attraction: a, position: [x, 0.05, z] as [number, number, number] }
      }),
    [],
  )

  return (
    <group>
      {markers.map(({ attraction, position }) => (
        <AttractionMarker
          key={attraction.id}
          attraction={attraction}
          position={position}
        />
      ))}
    </group>
  )
}
