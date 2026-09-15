'use client'

import dynamic from 'next/dynamic'
import MoodFilter from '@/components/discovery/MoodFilter'
import Search from '@/components/discovery/Search'
import SurpriseMe from '@/components/discovery/SurpriseMe'
import PopularAttractions from '@/components/cards/PopularAttractions'
import DestinationCardOverlay from '@/components/ui/DestinationCardOverlay'
import MapZoomControls from '@/components/map/MapZoomControls'

// Load the 2D SVG map — no WebGL, no Three.js, always renders
const IndiaMap2D = dynamic(() => import('@/components/map/IndiaMap2D'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#080c14',
        gap: 12,
      }}
    >
      <div style={{ width: 6, height: 6, borderRadius: 99, background: '#FFB86B', animation: 'ping 1s ease-in-out infinite' }} />
      <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, letterSpacing: '0.18em', color: 'rgba(255,184,107,0.45)' }}>
        LOADING MAP
      </p>
    </div>
  ),
})

export default function MapHero() {
  return (
    <section
      style={{ position: 'relative', width: '100%', height: 'calc(100dvh - 56px)' }}
      aria-label="Interactive India map with attraction markers"
    >
      {/* 2D SVG India map — fills the full hero area */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <IndiaMap2D />
      </div>

      {/* Top overlay: Search + Surprise Me (left) + Popular (right) */}
      <div
        style={{
          position: 'absolute', inset: '0 0 auto 0',
          zIndex: 10,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          gap: 12, padding: '12px 16px',
          pointerEvents: 'none',
        }}
      >
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', pointerEvents: 'auto' }}>
          <Search />
          <SurpriseMe />
        </div>
        <div style={{ pointerEvents: 'auto' }} className="hidden sm:block">
          <PopularAttractions />
        </div>
      </div>

      {/* Left: Zoom controls */}
      <div
        style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          zIndex: 10, pointerEvents: 'auto',
        }}
        className="sm:left-4"
      >
        <MapZoomControls />
      </div>

      {/* Bottom: Mood filter with gradient */}
      <div
        style={{
          position: 'absolute', inset: 'auto 0 0 0',
          zIndex: 10,
          padding: '12px 16px',
          background: 'linear-gradient(to top, rgba(8,12,20,0.88) 0%, transparent 100%)',
          pointerEvents: 'auto',
        }}
      >
        <MoodFilter />
      </div>

      {/* Mobile: Popular at bottom-right above mood bar */}
      <div
        style={{ position: 'absolute', bottom: 56, right: 12, zIndex: 10, pointerEvents: 'auto' }}
        className="sm:hidden"
      >
        <PopularAttractions />
      </div>

      {/* Destination card overlay — appears when marker is clicked */}
      <DestinationCardOverlay />
    </section>
  )
}
