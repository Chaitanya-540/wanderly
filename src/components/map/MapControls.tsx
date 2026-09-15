'use client'

import { useRef, useEffect, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useMapStore } from '@/store/mapStore'
import { projectToXZ } from '@/utils/geo'
import { ATTRACTIONS } from '@/data/attractions'

// Default camera position — top-down slight tilt looking at India
export const DEFAULT_CAMERA_POS = new THREE.Vector3(0, 14, 4)
export const DEFAULT_CAMERA_TARGET = new THREE.Vector3(0, 0, 0)

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

const ANIM_DURATION = 1600

export function useCameraAnimation() {
  const { camera } = useThree()
  const { activeAttractionId, isAnimating, setIsAnimating, setCameraTarget } = useMapStore()

  const animRef = useRef<{
    startPos: THREE.Vector3
    targetPos: THREE.Vector3
    startTime: number
  } | null>(null)

  useEffect(() => {
    if (!activeAttractionId) return
    const attraction = ATTRACTIONS.find((a) => a.id === activeAttractionId)
    if (!attraction) return

    const [x, z] = projectToXZ(attraction.coordinates.lng, attraction.coordinates.lat)
    // Zoom in to the attraction, keeping slight top-down angle
    const targetPos = new THREE.Vector3(x, 5, z + 2)

    animRef.current = {
      startPos: camera.position.clone(),
      targetPos,
      startTime: performance.now(),
    }
    setIsAnimating(true)
    setCameraTarget([x, 0, z])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAttractionId])

  useFrame(() => {
    if (!animRef.current || !isAnimating) return
    const elapsed = performance.now() - animRef.current.startTime
    const t = Math.min(elapsed / ANIM_DURATION, 1)
    const eased = easeInOutCubic(t)
    camera.position.lerpVectors(animRef.current.startPos, animRef.current.targetPos, eased)
    if (t >= 1) { animRef.current = null; setIsAnimating(false) }
  })
}

/**
 * Pure zoom control — no rotation, no pan, no orbit.
 * Camera stays at fixed angle. Only Z distance changes.
 */
export function useZoomControl() {
  const { camera, gl } = useThree()

  const zoomBy = useCallback((factor: number) => {
    const newY = THREE.MathUtils.clamp(camera.position.y * factor, 3, 22)
    const ratio = newY / camera.position.y
    camera.position.y = newY
    camera.position.z = THREE.MathUtils.clamp(camera.position.z * ratio, -2, 20)
  }, [camera])

  useEffect(() => {
    const canvas = gl.domElement

    function onWheel(e: WheelEvent) {
      const rect = canvas.getBoundingClientRect()
      const inside =
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom
      if (!inside) return
      // Only prevent default when we actually zoom (not at boundary)
      const factor = e.deltaY > 0 ? 1.12 : 0.89
      const nextY = camera.position.y * factor
      if (nextY >= 3 && nextY <= 22) {
        e.preventDefault()
        zoomBy(factor)
      }
    }

    // Button events
    const zoomIn  = () => zoomBy(0.85)
    const zoomOut = () => zoomBy(1.18)

    canvas.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('map:zoom-in',  zoomIn)
    window.addEventListener('map:zoom-out', zoomOut)
    return () => {
      canvas.removeEventListener('wheel', onWheel)
      window.removeEventListener('map:zoom-in',  zoomIn)
      window.removeEventListener('map:zoom-out', zoomOut)
    }
  }, [camera, gl, zoomBy])
}

export function useResetCamera() {
  const { camera } = useThree()
  const { setActiveAttraction, setCameraTarget } = useMapStore()

  const reset = useCallback(() => {
    camera.position.copy(DEFAULT_CAMERA_POS)
    camera.lookAt(DEFAULT_CAMERA_TARGET)
    setActiveAttraction(null)
    setCameraTarget([0, 0, 0])
  }, [camera, setActiveAttraction, setCameraTarget])

  useEffect(() => {
    window.addEventListener('map:reset', reset)
    return () => window.removeEventListener('map:reset', reset)
  }, [reset])

  return reset
}

export default function MapControls() {
  useCameraAnimation()
  useZoomControl()
  useResetCamera()
  return null
}
