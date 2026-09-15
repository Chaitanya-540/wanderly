'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useUIStore } from '@/store/uiStore'
import { useFavorites } from '@/hooks/useFavorites'
import { ATTRACTIONS } from '@/data/attractions'
import CategoryIcon from '@/components/ui/CategoryIcon'
import HeartIcon from '@/components/ui/HeartIcon'
import type { ImageManifest } from '@/types/image'

function useAttractionImage(attractionId: string | null) {
  const [manifest, setManifest] = useState<ImageManifest | null>(null)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    if (!attractionId) { setManifest(null); setImgError(false); return }
    setManifest(null)
    setImgError(false)
    fetch(`/api/images/${attractionId}`)
      .then(r => r.json())
      .then(d => setManifest(d))
      .catch(() => setImgError(true))
  }, [attractionId])

  const heroUrl = manifest?.images?.[0]?.sourceUrl ?? null
  return { heroUrl, manifest, imgError }
}

export default function DestinationCardOverlay() {
  const { activeDestinationCardId, setActiveDestinationCardId } = useUIStore()
  const { isFavorite, toggle } = useFavorites()
  const closeRef = useRef<HTMLButtonElement>(null)
  const { heroUrl, imgError } = useAttractionImage(activeDestinationCardId)

  const attraction = activeDestinationCardId
    ? ATTRACTIONS.find(a => a.id === activeDestinationCardId) ?? null
    : null

  useEffect(() => { if (attraction) closeRef.current?.focus() }, [attraction])
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') setActiveDestinationCardId(null) }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [setActiveDestinationCardId])

  return (
    <AnimatePresence>
      {attraction && (
        <>
          {/* Invisible backdrop — click outside to close */}
          <motion.div
            key="bd"
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            aria-hidden
            onClick={() => setActiveDestinationCardId(null)}
          />

          {/* Card */}
          <motion.div
            key="card"
            role="dialog"
            aria-modal="true"
            aria-label={`${attraction.name} destination`}
            className="fixed z-50 bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)] max-w-[340px] overflow-hidden rounded-2xl shadow-2xl"
            style={{
              background: 'rgba(11,11,13,0.96)',
              border: '1px solid rgba(255,184,107,0.2)',
              backdropFilter: 'blur(20px)',
            }}
            initial={{ opacity: 0, y: 50, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          >
            {/* Hero image */}
            <div className="relative h-44 overflow-hidden">
              {heroUrl && !imgError ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={heroUrl}
                  alt={attraction.name}
                  className="w-full h-full object-cover"
                  style={{ filter: 'brightness(0.82)' }}
                  onError={() => {/* handled by imgError state */}}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #111923 0%, #1e1e23 100%)' }}
                >
                  <CategoryIcon
                    category={attraction.category}
                    size={52}
                    color="rgba(255,184,107,0.18)"
                  />
                </div>
              )}

              {/* Image overlay gradient */}
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(11,11,13,0.9) 0%, rgba(11,11,13,0.1) 60%)' }}
              />

              {/* Top-right: close + favorite */}
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={() => toggle(attraction.id)}
                  aria-label={isFavorite(attraction.id) ? 'Remove from saved' : 'Save destination'}
                  aria-pressed={isFavorite(attraction.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB86B]"
                  style={{ background: 'rgba(11,11,13,0.75)', border: `1px solid ${isFavorite(attraction.id) ? 'rgba(255,184,107,0.35)' : 'rgba(255,255,255,0.1)'}` }}
                >
                  <HeartIcon filled={isFavorite(attraction.id)} size={13} />
                </button>
                <button
                  ref={closeRef}
                  onClick={() => setActiveDestinationCardId(null)}
                  aria-label="Close"
                  className="w-8 h-8 flex items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB86B]"
                  style={{ background: 'rgba(11,11,13,0.75)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(232,224,212,0.6)', fontSize: '14px' }}
                >
                  ✕
                </button>
              </div>

              {/* Name over image */}
              <div className="absolute bottom-3 left-4 right-4">
                <p
                  className="font-serif font-semibold leading-tight text-gold-gradient"
                  style={{ fontSize: '20px' }}
                >
                  {attraction.name}
                </p>
                <p
                  className="font-ui mt-0.5"
                  style={{ fontSize: '11px', letterSpacing: '0.12em', color: 'rgba(232,224,212,0.55)' }}
                >
                  {attraction.city.toUpperCase()} · {attraction.state.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 pt-3">
              {/* Mood tags */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {attraction.moodTags.slice(0, 3).map(t => (
                  <span
                    key={t}
                    className="font-ui"
                    style={{
                      fontSize: '10px',
                      letterSpacing: '0.06em',
                      padding: '3px 8px',
                      borderRadius: '99px',
                      background: 'rgba(255,184,107,0.1)',
                      border: '1px solid rgba(255,184,107,0.2)',
                      color: '#FFB86B',
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p
                className="font-ui line-clamp-2"
                style={{ fontSize: '12.5px', lineHeight: '1.6', color: 'rgba(232,224,212,0.55)' }}
              >
                {attraction.description}
              </p>

              {/* Divider */}
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '12px 0' }} />

              {/* Actions */}
              <div className="flex gap-2.5">
                <Link
                  href={`/attraction/${attraction.id}`}
                  onClick={() => setActiveDestinationCardId(null)}
                  className="flex-1 text-center py-2.5 rounded-xl font-sans font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB86B] transition-all"
                  style={{
                    fontSize: '12px',
                    letterSpacing: '0.08em',
                    background: 'linear-gradient(135deg, #FFB86B, #FF9F43)',
                    color: '#0b0b0d',
                  }}
                >
                  EXPLORE
                </Link>
                <Link
                  href="/trip-planner"
                  onClick={() => setActiveDestinationCardId(null)}
                  className="flex-1 text-center py-2.5 rounded-xl font-ui font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB86B] transition-all"
                  style={{
                    fontSize: '12px',
                    letterSpacing: '0.08em',
                    background: 'rgba(255,184,107,0.08)',
                    border: '1px solid rgba(255,184,107,0.2)',
                    color: 'rgba(255,184,107,0.8)',
                  }}
                >
                  PLAN TRIP
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
