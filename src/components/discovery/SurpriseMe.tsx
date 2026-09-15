'use client'

import { ATTRACTIONS } from '@/data/attractions'
import { useMapStore } from '@/store/mapStore'
import { useUIStore } from '@/store/uiStore'
import { projectToXZ } from '@/utils/geo'

export default function SurpriseMe() {
  const { setCameraTarget, setActiveAttraction, setIsAnimating } = useMapStore()
  const { setActiveDestinationCardId } = useUIStore()

  function handleClick() {
    const idx = Math.floor(Math.random() * ATTRACTIONS.length)
    const a = ATTRACTIONS[idx]
    const [x, z] = projectToXZ(a.coordinates.lng, a.coordinates.lat)
    setCameraTarget([x, 0, z])
    setIsAnimating(true)
    setActiveAttraction(a.id)
    setTimeout(() => setActiveDestinationCardId(a.id), 1700)
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 rounded-xl font-ui font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB86B] transition-all"
      style={{
        fontSize: '11px',
        letterSpacing: '0.08em',
        padding: '10px 16px',
        background: 'rgba(255,184,107,0.1)',
        border: '1px solid rgba(255,184,107,0.28)',
        color: 'rgba(255,184,107,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = 'rgba(255,184,107,0.18)'
        ;(e.currentTarget as HTMLElement).style.color = '#FFB86B'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = 'rgba(255,184,107,0.1)'
        ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,184,107,0.85)'
      }}
    >
      <span aria-hidden style={{ fontSize: '12px' }}>✦</span>
      SURPRISE ME
    </button>
  )
}
