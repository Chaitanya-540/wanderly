'use client'

import { useEffect, useState } from 'react'
import AttributionBlock from '@/components/ui/AttributionBlock'
import CategoryIcon from '@/components/ui/CategoryIcon'
import type { ImageManifest } from '@/types/image'
import type { AttractionCategory } from '@/types/attraction'

interface GalleryProps {
  attractionId: string
  attractionName: string
  attractionCategory?: AttractionCategory
}

export default function Gallery({ attractionId, attractionName, attractionCategory }: GalleryProps) {
  const [manifest, setManifest] = useState<ImageManifest | null>(null)
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState(0)

  useEffect(() => {
    setLoading(true)
    setManifest(null)
    setActive(0)
    fetch(`/api/images/${attractionId}`)
      .then(r => r.json())
      .then(data => { setManifest(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [attractionId])

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="rounded-2xl mb-3" style={{ height: 320, background: 'rgba(255,255,255,0.06)' }} />
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="shrink-0 rounded-lg" style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.06)' }} />
          ))}
        </div>
      </div>
    )
  }

  if (!manifest || manifest.images.length === 0) {
    return (
      <div
        className="rounded-2xl flex flex-col items-center justify-center gap-3"
        style={{ height: 320, background: 'linear-gradient(135deg, #111923 0%, #1e1e23 100%)' }}
        aria-label={`${attractionName} — image unavailable`}
        role="img"
      >
        {attractionCategory && (
          <CategoryIcon category={attractionCategory} size={56} color="rgba(255,184,107,0.18)" />
        )}
        <span style={{ fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)', fontSize: 11, letterSpacing: '0.14em', color: 'rgba(232,224,212,0.22)' }}>
          IMAGE UNAVAILABLE
        </span>
      </div>
    )
  }

  const images = manifest.images
  const current = images[active]

  return (
    <section aria-label={`Photo gallery for ${attractionName}`}>
      {manifest.insufficientImages && (
        <p className="text-xs mb-2" role="status" style={{ color: 'rgba(251,191,36,0.6)', fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)' }}>
          Limited images available for this attraction.
        </p>
      )}
      <div className="relative rounded-2xl overflow-hidden" style={{ height: 320 }}>
        <img
          src={current.sourceUrl}
          alt={`${attractionName} — photo ${active + 1} of ${images.length}`}
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute bottom-3 right-3 text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.7)' }}>
          {active + 1} / {images.length}
        </div>
      </div>
      <AttributionBlock image={current} />
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.sourceUrl}
              onClick={() => setActive(i)}
              aria-label={`View photo ${i + 1}`}
              aria-pressed={i === active}
              className="shrink-0 rounded-lg overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB86B]"
              style={{ width: 64, height: 64, border: `2px solid ${i === active ? '#FFB86B' : 'transparent'}`, opacity: i === active ? 1 : 0.55 }}
            >
              <img src={img.thumbnailUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
