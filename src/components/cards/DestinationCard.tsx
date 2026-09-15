'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useFavorites } from '@/hooks/useFavorites'
import { useUIStore } from '@/store/uiStore'
import SkeletonCard from '@/components/ui/SkeletonCard'
import CategoryIcon from '@/components/ui/CategoryIcon'
import HeartIcon from '@/components/ui/HeartIcon'
import type { Attraction } from '@/types/attraction'
import type { ImageManifest } from '@/types/image'

interface DestinationCardProps {
  attraction: Attraction
  loading?: boolean
  compact?: boolean
}

// Module-level image cache — shared across all card instances
// Key: attractionId, Value: first image URL
const imageCache = new Map<string, string | null>()

function useCardImage(attractionId: string) {
  const cached = imageCache.get(attractionId)
  const [imgUrl, setImgUrl] = useState<string | null>(cached !== undefined ? cached : null)
  const [imgLoading, setImgLoading] = useState(cached === undefined)

  useEffect(() => {
    if (imageCache.has(attractionId)) {
      setImgUrl(imageCache.get(attractionId) ?? null)
      setImgLoading(false)
      return
    }
    setImgLoading(true)
    fetch(`/api/images/${attractionId}`)
      .then(r => r.json())
      .then((d: ImageManifest) => {
        const url = d?.images?.[0]?.sourceUrl ?? null
        imageCache.set(attractionId, url)
        setImgUrl(url)
        setImgLoading(false)
      })
      .catch(() => {
        imageCache.set(attractionId, null)
        setImgUrl(null)
        setImgLoading(false)
      })
  }, [attractionId])

  return { imgUrl, imgLoading }
}

export default function DestinationCard({ attraction, loading, compact }: DestinationCardProps) {
  const { isFavorite, toggle } = useFavorites()
  const { setActiveDestinationCardId } = useUIStore()
  const { imgUrl, imgLoading } = useCardImage(attraction.id)

  if (loading) return <SkeletonCard />

  const fav = isFavorite(attraction.id)
  const imgH = compact ? 100 : 200

  return (
    <motion.article
      whileHover={compact ? {} : { y: -3 }}
      transition={{ type: 'spring', stiffness: 350, damping: 26 }}
      className="group overflow-hidden rounded-xl"
      style={{
        background: '#17171b',
        border: '1px solid rgba(255,255,255,0.06)',
        transition: 'border-color 0.25s ease',
      }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,184,107,0.25)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'}
      aria-label={`${attraction.name}, ${attraction.state}`}
    >
      {/* ── Image area ── */}
      <div
        style={{
          position: 'relative',
          height: imgH,
          background: '#111923',
          overflow: 'hidden',
        }}
      >
        {imgLoading && (
          <div
            style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, #111923 25%, #17171b 50%, #111923 75%)',
              backgroundSize: '400% 400%',
              animation: 'cardShimmer 1.8s ease infinite',
            }}
          />
        )}

        {!imgLoading && imgUrl && (
          <img
            src={imgUrl}
            alt={`${attraction.name}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 35%',
              display: 'block',
              transition: 'transform 0.45s ease',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.transform = 'scale(1.04)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = 'scale(1)')}
          />
        )}

        {!imgLoading && !imgUrl && (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CategoryIcon category={attraction.category} size={compact ? 24 : 36} color="rgba(255,184,107,0.18)" />
          </div>
        )}

        {/* Bottom gradient for text contrast if needed */}
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, transparent 50%, rgba(17,25,35,0.55) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Favorite button */}
        <button
          onClick={e => { e.preventDefault(); toggle(attraction.id) }}
          aria-label={fav ? `Remove ${attraction.name} from saved` : `Save ${attraction.name}`}
          aria-pressed={fav}
          className="absolute top-2.5 right-2.5 w-7 h-7 flex items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB86B]"
          style={{
            position: 'absolute', top: 10, right: 10,
            width: 28, height: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 99,
            background: 'rgba(11,11,13,0.72)',
            border: `1px solid ${fav ? 'rgba(255,184,107,0.4)' : 'rgba(255,255,255,0.1)'}`,
            cursor: 'pointer',
          }}
        >
          <HeartIcon filled={fav} size={12} />
        </button>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: compact ? '10px 12px' : '14px 14px 12px' }}>
        <h3
          className="font-serif leading-tight"
          style={{ fontSize: compact ? '13px' : '15px', fontWeight: 600, color: '#e8e0d4', margin: 0 }}
        >
          {attraction.name}
        </h3>
        <p
          className="font-ui"
          style={{ fontSize: '10px', letterSpacing: '0.06em', color: 'rgba(232,224,212,0.38)', marginTop: 3 }}
        >
          {attraction.city.toUpperCase()} · {attraction.state.toUpperCase()}
        </p>

        {!compact && (
          <p
            className="font-ui line-clamp-2"
            style={{ fontSize: '12px', lineHeight: '1.6', color: 'rgba(232,224,212,0.5)', marginTop: 8 }}
          >
            {attraction.description}
          </p>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
          {attraction.moodTags.slice(0, compact ? 1 : 2).map(t => (
            <span
              key={t}
              className="font-ui"
              style={{
                fontSize: '9px', letterSpacing: '0.06em',
                padding: '3px 7px', borderRadius: 99,
                background: 'rgba(255,184,107,0.08)',
                border: '1px solid rgba(255,184,107,0.18)',
                color: 'rgba(255,184,107,0.7)',
              }}
            >
              {t}
            </span>
          ))}
        </div>

        {!compact && (
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <Link
              href={`/attraction/${attraction.id}`}
              className="font-sans focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB86B]"
              style={{
                flex: 1, textAlign: 'center', padding: '8px 0',
                borderRadius: 8, fontSize: '10px', fontWeight: 600,
                letterSpacing: '0.1em', textDecoration: 'none',
                background: 'linear-gradient(135deg, rgba(255,184,107,0.18), rgba(255,159,67,0.12))',
                border: '1px solid rgba(255,184,107,0.25)',
                color: '#FFB86B',
              }}
            >
              EXPLORE
            </Link>
            <button
              onClick={() => setActiveDestinationCardId(attraction.id)}
              className="font-ui focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB86B]"
              style={{
                flex: 1, padding: '8px 0',
                borderRadius: 8, fontSize: '10px',
                letterSpacing: '0.1em', cursor: 'pointer',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                color: 'rgba(232,224,212,0.45)',
              }}
            >
              PLAN
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes cardShimmer {
          0%, 100% { background-position: 0% 50%; }
          50%       { background-position: 100% 50%; }
        }
      `}</style>
    </motion.article>
  )
}