'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useMapStore } from '@/store/mapStore'
import { useFilterStore } from '@/store/filterStore'
import { useUIStore } from '@/store/uiStore'
import type { Attraction } from '@/types/attraction'

// Warm amber palette for all markers — category tint added via emissive
const WARM_AMBER = new THREE.Color('#FFB86B')
const WARM_AMBER_BRIGHT = new THREE.Color('#FF9F43')
const WARM_AMBER_DIM = new THREE.Color('#7a5228')

interface AttractionMarkerProps {
  attraction: Attraction
  position: [number, number, number]
}

export default function AttractionMarker({ attraction, position }: AttractionMarkerProps) {
  const coreRef = useRef<THREE.Mesh>(null)
  const haloRef = useRef<THREE.Mesh>(null)
  const pulseRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  const { activeAttractionId, setActiveAttraction } = useMapStore()
  const { activeMoods } = useFilterStore()
  const { setActiveDestinationCardId } = useUIStore()

  const isActive = activeAttractionId === attraction.id
  const matchesMood = activeMoods.size === 0 || attraction.moodTags.some((t) => activeMoods.has(t))

  // Breathing pulse — very slow and subtle
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    // Each marker pulses at slightly different phase based on position
    const phase = (position[0] + position[2]) * 1.3
    const breathe = 0.5 + 0.5 * Math.sin(t * 0.8 + phase)

    if (coreRef.current) {
      const mat = coreRef.current.material as THREE.MeshBasicMaterial
      if (isActive) {
        mat.color = WARM_AMBER_BRIGHT
        coreRef.current.scale.setScalar(1.8)
      } else if (hovered) {
        mat.color = WARM_AMBER_BRIGHT
        coreRef.current.scale.setScalar(1.4)
      } else {
        mat.color = matchesMood ? WARM_AMBER : WARM_AMBER_DIM
        coreRef.current.scale.setScalar(0.9 + 0.1 * breathe)
      }
      mat.opacity = matchesMood ? (isActive ? 1 : 0.9 + 0.1 * breathe) : 0.15
    }

    if (haloRef.current) {
      const mat = haloRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = matchesMood ? (isActive ? 0.25 : 0.08 + 0.07 * breathe) : 0.03
      haloRef.current.scale.setScalar(isActive ? 2.5 : 1.8)
    }

    if (pulseRef.current) {
      if (isActive) {
        const pulse = (t * 0.7 + phase) % 1
        pulseRef.current.scale.setScalar(1 + pulse * 3)
        const mat = pulseRef.current.material as THREE.MeshBasicMaterial
        mat.opacity = 0.35 * (1 - pulse)
        pulseRef.current.visible = true
      } else {
        pulseRef.current.visible = false
      }
    }
  })

  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation()
        const newId = isActive ? null : attraction.id
        setActiveAttraction(newId)
        if (newId) setActiveDestinationCardId(newId)
      }}
      onPointerEnter={(e) => { e.stopPropagation(); setHovered(true) }}
      onPointerLeave={(e) => { e.stopPropagation(); setHovered(false) }}
    >
      {/* Tiny core — ~0.025 world units ≈ 2–3px at default zoom */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.025, 6, 6]} />
        <meshBasicMaterial
          color={WARM_AMBER}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Soft halo glow */}
      <mesh ref={haloRef}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial
          color={WARM_AMBER}
          transparent
          opacity={0.08}
          depthWrite={false}
        />
      </mesh>

      {/* Active pulse ring — expands outward */}
      <mesh ref={pulseRef} rotation={[Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.03, 0.05, 16]} />
        <meshBasicMaterial
          color={WARM_AMBER_BRIGHT}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Hover tooltip */}
      {(hovered || isActive) && (
        <Html
          distanceFactor={6}
          position={[0, 0.15, 0]}
          center
          zIndexRange={[100, 0]}
        >
          <div
            style={{
              background: 'rgba(11,11,13,0.92)',
              border: '1px solid rgba(255,184,107,0.25)',
              borderRadius: '6px',
              padding: '5px 10px',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '11px', fontWeight: 600, color: '#FFB86B', letterSpacing: '0.04em' }}>
              {attraction.name}
            </div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', color: 'rgba(255,255,255,0.5)', marginTop: '1px' }}>
              {attraction.city}, {attraction.state}
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}
