'use client'

import { useMemo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { rankByPopularity } from '@/services/popularityRanker'
import { ATTRACTIONS } from '@/data/attractions'
import { useMapStore } from '@/store/mapStore'
import { useUIStore } from '@/store/uiStore'
import { projectToXZ } from '@/utils/geo'
import CategoryIcon from '@/components/ui/CategoryIcon'
import type { Attraction } from '@/types/attraction'
import type { ImageManifest } from '@/types/image'

const TOP_N = 7
const PANEL_W = '268px'

// Shared thumbnail cache
const thumbCache = new Map<string, string | null>()

function Thumbnail({ attraction }: { attraction: Attraction }) {
  const cached = thumbCache.get(attraction.id)
  const [url, setUrl] = useState<string | null>(cached !== undefined ? cached : null)
  const [loading, setLoading] = useState(cached === undefined)

  useEffect(() => {
    if (thumbCache.has(attraction.id)) {
      setUrl(thumbCache.get(attraction.id) ?? null)
      setLoading(false)
      return
    }
    fetch(`/api/images/${attraction.id}`)
      .then(r => r.json())
      .then((d: ImageManifest) => {
        const u = d?.images?.[0]?.thumbnailUrl ?? d?.images?.[0]?.sourceUrl ?? null
        thumbCache.set(attraction.id, u)
        setUrl(u)
        setLoading(false)
      })
      .catch(() => {
        thumbCache.set(attraction.id, null)
        setLoading(false)
      })
  }, [attraction.id])

  return (
    <div
      style={{
        width: 44, height: 44, borderRadius: 7, overflow: 'hidden', flexShrink: 0,
        background: '#111923', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {loading && (
        <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.06)' }} />
      )}
      {!loading && url && (
        <img
          src={url}
          alt={attraction.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }}
        />
      )}
      {!loading && !url && (
        <CategoryIcon category={attraction.category} size={18} color="rgba(255,184,107,0.22)" />
      )}
    </div>
  )
}

export default function PopularAttractions() {
  const { isPopularAttractionsPanelOpen, setPopularAttractionsPanelOpen } = useUIStore()
  const { setCameraTarget, setActiveAttraction, setIsAnimating } = useMapStore()
  const { setActiveDestinationCardId } = useUIStore()

  const top = useMemo(() => rankByPopularity(ATTRACTIONS).slice(0, TOP_N), [])

  function select(id: string, lat: number, lng: number) {
    const [x, z] = projectToXZ(lng, lat)
    setCameraTarget([x, 0, z])
    setIsAnimating(true)
    setActiveAttraction(id)
    setTimeout(() => setActiveDestinationCardId(id), 1700)
  }

  const toggleBtn = (
    <button
      onClick={() => setPopularAttractionsPanelOpen(!isPopularAttractionsPanelOpen)}
      aria-label={isPopularAttractionsPanelOpen ? 'Hide popular attractions' : 'Show popular attractions'}
      aria-expanded={isPopularAttractionsPanelOpen}
      style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '8px 14px', borderRadius: 10, cursor: 'pointer',
        fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)',
        fontSize: 11, letterSpacing: '0.12em',
        background: 'rgba(11,11,13,0.82)',
        border: `1px solid ${isPopularAttractionsPanelOpen ? 'rgba(255,184,107,0.35)' : 'rgba(255,184,107,0.2)'}`,
        color: isPopularAttractionsPanelOpen ? '#FFB86B' : 'rgba(232,224,212,0.6)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        outline: 'none',
      }}
    >
      <span aria-hidden style={{ fontSize: 9, opacity: 0.7 }}>★</span>
      POPULAR
      <span aria-hidden style={{ fontSize: 8, opacity: 0.45, display: 'inline-block', transform: isPopularAttractionsPanelOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
    </button>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
      {toggleBtn}

      <AnimatePresence>
        {isPopularAttractionsPanelOpen && (
          <motion.aside
            aria-label="Popular attractions"
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            style={{
              width: PANEL_W,
              background: 'rgba(11,11,13,0.92)',
              border: '1px solid rgba(255,184,107,0.14)',
              borderRadius: 14,
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <h2 style={{ fontFamily: 'var(--font-playfair, Playfair Display, serif)', fontSize: 13, color: '#FFB86B', letterSpacing: '0.04em', margin: 0 }}>
                Popular Attractions
              </h2>
              <button
                onClick={() => setPopularAttractionsPanelOpen(false)}
                aria-label="Close panel"
                style={{ color: 'rgba(232,224,212,0.3)', fontSize: 16, lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }}
              >
                ✕
              </button>
            </div>

            {/* List */}
            <ul role="list" style={{ maxHeight: 400, overflowY: 'auto', margin: 0, padding: 0, listStyle: 'none' }}>
              {top.map((a, i) => (
                <li key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <button
                    onClick={() => select(a.id, a.coordinates.lat, a.coordinates.lng)}
                    style={{
                      width: '100%', textAlign: 'left',
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', background: 'transparent',
                      border: 'none', cursor: 'pointer', outline: 'none',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,184,107,0.05)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    {/* Rank */}
                    <span style={{
                      fontFamily: 'var(--font-playfair, Playfair Display, serif)',
                      fontSize: 14, fontWeight: 600, flexShrink: 0, width: 16, textAlign: 'right',
                      color: i < 3 ? '#FFB86B' : 'rgba(232,224,212,0.2)',
                    }}>
                      {i + 1}
                    </span>

                    {/* Thumbnail */}
                    <Thumbnail attraction={a} />

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)',
                        fontSize: 12.5, fontWeight: 500, color: 'rgba(232,224,212,0.88)',
                        margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {a.name}
                      </p>
                      <p style={{
                        fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)',
                        fontSize: 9, letterSpacing: '0.07em', color: 'rgba(232,224,212,0.32)',
                        margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {a.state.toUpperCase()}
                      </p>
                    </div>

                    {/* Go */}
                    <span style={{
                      fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)',
                      fontSize: 9, letterSpacing: '0.1em', flexShrink: 0,
                      padding: '3px 7px', borderRadius: 4,
                      border: '1px solid rgba(255,184,107,0.25)',
                      color: 'rgba(255,184,107,0.6)',
                    }}>
                      GO
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  )
}