'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import WebGLFallback from '@/components/ui/WebGLFallback'
import StateLayer from './StateLayer'
import StateLabelLayer from './StateLabelLayer'
import AttractionLayer from './AttractionLayer'
import MapControls, { DEFAULT_CAMERA_POS } from './MapControls'

let cachedGeoJSON: { features: unknown[] } | null = null

function CameraInit() {
  const { camera } = useThree()
  useEffect(() => {
    camera.position.copy(DEFAULT_CAMERA_POS)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
  }, [camera])
  return null
}

function Scene({ geojson }: { geojson: { features: unknown[] } }) {
  return (
    <>
      {/* Deep space background */}
      <color attach="background" args={['#050508']} />
      <fog attach="fog" args={['#050508', 30, 60]} />

      {/* Dramatic side lighting — gives depth without rotating */}
      <ambientLight intensity={0.08} />
      {/* Top-left cool key light — illuminates northern India */}
      <directionalLight position={[-8, 12, -4]} intensity={0.6} color="#b4c8ff" />
      {/* Warm fill from south — subtle atmosphere */}
      <directionalLight position={[4, 6, 8]} intensity={0.25} color="#ffd4a0" />
      {/* Point light simulating city glow over India centre */}
      <pointLight position={[0, 8, 0]} intensity={0.4} color="#FFB86B" distance={20} decay={2} />

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <StateLayer geojson={geojson as any} />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <StateLabelLayer geojson={geojson as any} />
      <AttractionLayer />
      <MapControls />
      <CameraInit />

      {/* Bloom — warm glow on the tiny marker lights */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.1}
          luminanceSmoothing={0.6}
          intensity={1.2}
          height={512}
        />
      </EffectComposer>
    </>
  )
}

function LoadingMap() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050508]">
      <div className="w-1.5 h-1.5 rounded-full bg-[#FFB86B] animate-ping mb-4" />
      <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '11px', letterSpacing: '0.15em', color: 'rgba(255,184,107,0.5)' }}>
        LOADING MAP
      </p>
    </div>
  )
}

export default function IndiaMap() {
  const [geojson, setGeojson] = useState<{ features: unknown[] } | null>(cachedGeoJSON)
  const [webglOk, setWebglOk] = useState(true)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    try {
      const c = document.createElement('canvas')
      if (!c.getContext('webgl') && !c.getContext('experimental-webgl')) setWebglOk(false)
    } catch { setWebglOk(false) }
  }, [])

  useEffect(() => {
    if (cachedGeoJSON) { setGeojson(cachedGeoJSON); setMapReady(true); return }
    fetch('/data/india-states.geojson')
      .then((r) => r.json())
      .then((data) => {
        cachedGeoJSON = data
        setGeojson(data)
        setMapReady(true)
      })
      .catch(() => console.error('GeoJSON load failed'))
  }, [])

  if (!webglOk) return <WebGLFallback />

  return (
    <div className="relative w-full h-full bg-[#050508]">
      {!mapReady && <LoadingMap />}

      <Canvas
        camera={{ position: [0, 14, 4], fov: 38, near: 0.1, far: 100 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          alpha: false,
        }}
        onCreated={({ camera }) => {
          camera.position.set(0, 14, 4)
          camera.lookAt(0, 0, 0)
        }}
        style={{ display: 'block', width: '100%', height: '100%' }}
        aria-label="Cinematic fixed map of India with 84 attraction markers"
      >
        <Suspense fallback={null}>
          {geojson && <Scene geojson={geojson} />}
        </Suspense>
      </Canvas>
    </div>
  )
}
