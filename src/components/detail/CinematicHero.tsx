'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { Attraction } from '@/types/attraction'
import type { ImageManifest } from '@/types/image'

interface CinematicHeroProps {
  attraction: Attraction
}

const CYCLE_MS   = 7000   // 7 seconds per image
const FADE_MS    = 1600   // 1.6 second crossfade

function useImages(attractionId: string) {
  const [manifest, setManifest] = useState<ImageManifest | null>(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    setLoading(true)
    setManifest(null)
    fetch(`/api/images/${attractionId}`)
      .then(r => r.json())
      .then(d => { setManifest(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [attractionId])

  return { manifest, loading }
}

function useCycler(total: number) {
  const [current, setCurrent] = useState(0)
  const [next,    setNext]    = useState<number | null>(null)
  const [fading,  setFading]  = useState(false)
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prefersReducedMotion = useRef(false)

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const advance = useCallback(() => {
    if (total < 2) return
    const n = (current + 1) % total
    if (prefersReducedMotion.current) {
      setCurrent(n)
      return
    }
    setNext(n)
    setFading(true)
    setTimeout(() => {
      setCurrent(n)
      setNext(null)
      setFading(false)
    }, FADE_MS)
  }, [current, total])

  // Restart cycle timer whenever current changes
  useEffect(() => {
    if (total < 2) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(advance, CYCLE_MS)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [advance, current, total])

  // Pause when tab hidden
  useEffect(() => {
    function onVisibility() {
      if (document.hidden) {
        if (timerRef.current) clearTimeout(timerRef.current)
      } else {
        timerRef.current = setTimeout(advance, CYCLE_MS)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [advance])

  // Cleanup on unmount
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  return { current, next, fading }
}

// Individual image layer
function ImageLayer({
  src,
  alt,
  visible,
  fading,
  position = 'center',
}: {
  src: string
  alt: string
  visible: boolean
  fading: boolean
  position?: string
}) {
  const [loaded, setLoaded] = useState(false)
  const [error,  setError]  = useState(false)

  if (error) return null

  return (
    <div
      aria-hidden={!visible}
      style={{
        position: 'absolute',
        inset: 0,
        opacity: visible ? 1 : fading ? 0 : 0,
        transition: `opacity ${FADE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        zIndex: visible ? 2 : fading ? 3 : 1,
      }}
    >
      {/* Low-quality placeholder while loading */}
      {!loaded && (
        <div style={{ position: 'absolute', inset: 0, background: '#080c14' }} />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: position,
          display: 'block',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}
      />
    </div>
  )
}

export default function CinematicHero({ attraction }: CinematicHeroProps) {
  const { manifest, loading } = useImages(attraction.id)
  const images = manifest?.images ?? []
  const { current, next, fading } = useCycler(images.length)

  return (
    <div
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#080c14' }}
      role="img"
      aria-label={`${attraction.name} hero photography`}
    >
      {/* Image layers */}
      {images.map((img, i) => (
        <ImageLayer
          key={img.sourceUrl}
          src={img.sourceUrl}
          alt={`${attraction.name} — photo ${i + 1}`}
          visible={i === current}
          fading={fading && i === next}
        />
      ))}

      {/* Dark gradient overlay — text legibility */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 4,
          background: [
            'linear-gradient(to bottom,',
            'rgba(0,0,0,0.08) 0%,',
            'rgba(0,0,0,0.06) 30%,',
            'rgba(0,0,0,0.14) 58%,',
            'rgba(5,8,14,0.68) 80%,',
            'rgba(5,8,14,0.88) 100%)',
          ].join(' '),
        }}
      />

      {/* Loading shimmer when no images yet */}
      {loading && images.length === 0 && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            background: 'linear-gradient(135deg, #0d1117 0%, #111923 50%, #0d1117 100%)',
            backgroundSize: '400% 400%',
            animation: 'heroShimmer 2.4s ease infinite',
          }}
        />
      )}

      {/* Dot indicators */}
      {images.length > 1 && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            bottom: 22,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 5,
            display: 'flex',
            gap: 6,
          }}
        >
          {images.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === current ? 20 : 6,
                height: 3,
                borderRadius: 2,
                background: i === current ? '#FFB86B' : 'rgba(255,255,255,0.3)',
                transition: 'width 0.35s ease, background 0.35s ease',
              }}
            />
          ))}
        </div>
      )}

      {/* Image count badge */}
      {images.length > 0 && (
        <div
          aria-label={`Photo ${current + 1} of ${images.length}`}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 5,
            fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)',
            fontSize: 10,
            letterSpacing: '0.14em',
            color: 'rgba(232,224,212,0.5)',
            background: 'rgba(5,8,14,0.6)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 4,
            padding: '3px 8px',
          }}
        >
          {current + 1} / {images.length}
        </div>
      )}

      <style>{`
        @keyframes heroShimmer {
          0%, 100% { background-position: 0% 50%; }
          50%       { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  )
}
