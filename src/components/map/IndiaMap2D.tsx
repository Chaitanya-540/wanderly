'use client'

import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import * as d3geo from 'd3-geo'
import { useMapStore } from '@/store/mapStore'
import { useFilterStore } from '@/store/filterStore'
import { useUIStore } from '@/store/uiStore'
import { resolveCollisions } from '@/utils/collision'
import type { LabelRect } from '@/utils/collision'
import { ATTRACTIONS } from '@/data/attractions'
import type { Attraction } from '@/types/attraction'

// ─── Types ────────────────────────────────────────────────────────────────────

interface GeoFeature {
  type: 'Feature'
  properties: { name: string; id: number }
  geometry: { type: string; coordinates: unknown }
}

interface GeoJSON {
  type: 'FeatureCollection'
  features: GeoFeature[]
}

// ─── Constants ───────────────────────────────────────────────────────────────

const COLORS = {
  ocean:        '#080c12',
  land:         '#111923',
  landHover:    '#162130',
  border:       'rgba(99,180,255,0.28)',
  borderOuter:  'rgba(99,180,255,0.55)',
  markerCore:   '#FFB86B',
  markerHalo:   'rgba(255,184,107,0.22)',
  markerActive: '#FFC987',
  markerDim:    'rgba(255,184,107,0.18)',
  labelText:    'rgba(148,163,184,0.72)',
  labelShadow:  'rgba(8,12,18,0.9)',
}

// State centroid nudges — manual overrides to avoid overlap in dense areas
const CENTROID_NUDGE: Record<string, [number, number]> = {
  'Goa':                    [ 0,  14],
  'Delhi':                  [-8, -14],
  'Sikkim':                 [ 8,  0],
  'Tripura':                [ 8,  6],
  'Nagaland':               [ 6,  0],
  'Manipur':                [ 6,  8],
  'Mizoram':                [ 8,  8],
  'Meghalaya':              [-6,  0],
  'Arunachal Pradesh':      [ 0, -10],
  'Himachal Pradesh':       [-6,  0],
  'Uttarakhand':            [ 6,  0],
  'Haryana':                [-10, 0],
  'Punjab':                 [-10, 0],
  'Telangana':              [-4,  0],
  'Andhra Pradesh':         [ 0,  6],
  'Ladakh':                 [ 0, -10],
  'Odisha':                 [ 0,  0],
  'Dadra and Nagar Haveli and Daman and Diu': [16, 8],
  'Lakshadweep':            [-24, 16],
  'Andaman and Nicobar Islands': [18, 8],
}

// ─── Marker component ─────────────────────────────────────────────────────────

interface MarkerDotProps {
  attraction: Attraction
  cx: number
  cy: number
  isActive: boolean
  isHovered: boolean
  isDimmed: boolean
  onClick: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}

function MarkerDot({ attraction, cx, cy, isActive, isHovered, isDimmed, onClick, onMouseEnter, onMouseLeave }: MarkerDotProps) {
  const coreR = isActive ? 5 : isHovered ? 4 : 3
  const haloR = isActive ? 12 : isHovered ? 10 : 7
  const opacity = isDimmed ? 0.2 : 1

  return (
    <g
      style={{ cursor: 'pointer', opacity }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-label={`${attraction.name}, ${attraction.state}`}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      {/* Halo */}
      <circle
        cx={cx}
        cy={cy}
        r={haloR}
        fill={isActive ? 'rgba(255,184,107,0.18)' : COLORS.markerHalo}
        style={{ transition: 'r 0.25s ease, fill 0.25s ease' }}
      />
      {/* Core */}
      <circle
        cx={cx}
        cy={cy}
        r={coreR}
        fill={isActive || isHovered ? COLORS.markerActive : COLORS.markerCore}
        style={{ transition: 'r 0.2s ease, fill 0.2s ease' }}
      />
      {/* Active pulse ring — CSS animation */}
      {isActive && (
        <circle
          cx={cx}
          cy={cy}
          r={coreR + 2}
          fill="none"
          stroke={COLORS.markerActive}
          strokeWidth={1.5}
          strokeOpacity={0.7}
          style={{ animation: 'markerPulse 1.4s ease-out infinite' }}
        />
      )}
    </g>
  )
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

interface TooltipProps {
  attraction: Attraction
  cx: number
  cy: number
  svgWidth: number
}

function Tooltip({ attraction, cx, cy, svgWidth }: TooltipProps) {
  const PAD = 8
  const W = 140
  const H = 36
  // Flip to left side if too close to right edge
  const x = cx + 12 + W > svgWidth - PAD ? cx - W - 12 : cx + 12
  const y = cy - H / 2

  return (
    <g pointerEvents="none" style={{ zIndex: 100 }}>
      <rect
        x={x - 2}
        y={y - 2}
        width={W + 4}
        height={H + 4}
        rx={6}
        fill="rgba(8,12,18,0.96)"
        stroke="rgba(255,184,107,0.25)"
        strokeWidth={1}
      />
      <text
        x={x + 8}
        y={y + 13}
        fontFamily="var(--font-montserrat, Montserrat, sans-serif)"
        fontSize={11}
        fontWeight={600}
        fill="#e8e0d4"
        dominantBaseline="auto"
      >
        {attraction.name.length > 18 ? attraction.name.slice(0, 17) + '…' : attraction.name}
      </text>
      <text
        x={x + 8}
        y={y + 27}
        fontFamily="var(--font-montserrat, Montserrat, sans-serif)"
        fontSize={9}
        fill="rgba(232,224,212,0.45)"
        letterSpacing={0.5}
      >
        {attraction.state.toUpperCase()}
      </text>
    </g>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

let cachedGeoJSON: GeoJSON | null = null

export default function IndiaMap2D() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [geojson, setGeojson] = useState<GeoJSON | null>(cachedGeoJSON)
  const [dims, setDims] = useState({ w: 800, h: 700 })
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [hoveredState, setHoveredState] = useState<string | null>(null)
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null)
  const isPanning = useRef(false)
  const panStart = useRef({ x: 0, y: 0, px: 0, py: 0 })

  const { activeAttractionId, setActiveAttraction } = useMapStore()
  const { activeMoods } = useFilterStore()
  const { setActiveDestinationCardId } = useUIStore()

  // Load GeoJSON
  useEffect(() => {
    if (cachedGeoJSON) return
    fetch('/data/india-states.geojson')
      .then(r => r.json())
      .then(data => { cachedGeoJSON = data; setGeojson(data) })
      .catch(e => console.error('GeoJSON load failed', e))
  }, [])

  // Track container size
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      if (width > 0 && height > 0) setDims({ w: width, h: height })
    })
    ro.observe(el)
    // Initial size
    const r = el.getBoundingClientRect()
    if (r.width > 0) setDims({ w: r.width, h: r.height })
    return () => ro.disconnect()
  }, [])

  // d3 projection — fit India into the available space with padding
  const projection = useMemo(() => {
    if (!geojson || dims.w === 0) return null
    const proj = d3geo.geoMercator()
    // fitExtent gives us proper padding
    proj.fitExtent(
      [[24, 16], [dims.w - 24, dims.h - 16]],
      geojson as d3geo.ExtendedFeatureCollection
    )
    return proj
  }, [geojson, dims])

  const pathGen = useMemo(() => {
    if (!projection) return null
    return d3geo.geoPath().projection(projection)
  }, [projection])

  // Compute state centroids for labels
  const stateCentroids = useMemo(() => {
    if (!projection || !geojson) return []
    return geojson.features.map(f => {
      // Use d3 centroid
      let cx: number | undefined, cy: number | undefined
      try {
        const c = d3geo.geoCentroid(f as d3geo.ExtendedFeature)
        const pt = projection(c)
        if (pt) { cx = pt[0]; cy = pt[1] }
      } catch { /* skip */ }
      if (cx === undefined || cy === undefined) return null

      // Apply nudge if defined
      const nudge = CENTROID_NUDGE[f.properties.name] ?? [0, 0]
      return {
        name: f.properties.name,
        shortName: f.properties.name
          .replace('Andaman and Nicobar Islands', 'A & N Islands')
          .replace('Dadra and Nagar Haveli and Daman and Diu', 'D.N.H & D.D')
          .replace('Jammu and Kashmir', 'J & K')
          .replace(' and Kashmir', ' & K')
          .replace(' and ', ' & ')
          .replace(' Pradesh', ' P.')
          .replace('Andaman & Nicobar', 'A&N')
          .replace('Lakshadweep', 'Lakshadweep'),
        cx: cx + nudge[0],
        cy: cy + nudge[1],
      }
    }).filter(Boolean) as Array<{ name: string; shortName: string; cx: number; cy: number }>
  }, [projection, geojson])

  // Collision detection for labels
  const visibleLabels = useMemo(() => {
    if (stateCentroids.length === 0) return new Set<string>()
    const charW = 5.5
    const rects: LabelRect[] = stateCentroids.map((s, i) => ({
      id: String(i),
      x: s.cx - (s.shortName.length * charW) / 2,
      y: s.cy - 6,
      w: s.shortName.length * charW,
      h: 12,
      priority: 1,
    }))
    return resolveCollisions(rects)
  }, [stateCentroids])

  // Project all 84 attraction markers
  const markers = useMemo(() => {
    if (!projection) return []
    return ATTRACTIONS.map(a => {
      const pt = projection([a.coordinates.lng, a.coordinates.lat])
      if (!pt) return null
      return { attraction: a, cx: pt[0], cy: pt[1] }
    }).filter(Boolean) as Array<{ attraction: Attraction; cx: number; cy: number }>
  }, [projection])

  // Zoom controls
  const zoomIn  = useCallback(() => setZoom(z => Math.min(z * 1.35, 6)), [])
  const zoomOut = useCallback(() => setZoom(z => Math.max(z / 1.35, 1)), [])
  const reset   = useCallback(() => { setZoom(1); setPan({ x: 0, y: 0 }); setActiveAttraction(null) }, [setActiveAttraction])

  // Button events
  useEffect(() => {
    const zi = () => zoomIn()
    const zo = () => zoomOut()
    const r  = () => reset()
    window.addEventListener('map:zoom-in',  zi)
    window.addEventListener('map:zoom-out', zo)
    window.addEventListener('map:reset',    r)
    return () => {
      window.removeEventListener('map:zoom-in',  zi)
      window.removeEventListener('map:zoom-out', zo)
      window.removeEventListener('map:reset',    r)
    }
  }, [zoomIn, zoomOut, reset])

  // Pan via mouse drag
  function onMouseDown(e: React.MouseEvent) {
    isPanning.current = true
    panStart.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y }
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!isPanning.current) return
    setPan({
      x: panStart.current.px + (e.clientX - panStart.current.x),
      y: panStart.current.py + (e.clientY - panStart.current.y),
    })
  }
  function onMouseUp() { isPanning.current = false }

  // Wheel zoom — only when pointer is inside map
  function onWheel(e: React.WheelEvent) {
    e.stopPropagation()
    // Only prevent default if we're not at zoom boundary (to allow page scroll through)
    const newZoom = e.deltaY < 0
      ? Math.min(zoom * 1.12, 6)
      : Math.max(zoom / 1.12, 1)
    if (newZoom !== zoom) {
      e.preventDefault()
      setZoom(newZoom)
    }
  }

  function selectAttraction(a: Attraction) {
    const newId = activeAttractionId === a.id ? null : a.id
    setActiveAttraction(newId)
    if (newId) {
      // Pan map to centre on selected marker
      if (projection) {
        const pt = projection([a.coordinates.lng, a.coordinates.lat])
        if (pt) {
          setPan({ x: dims.w / 2 - pt[0] * zoom, y: dims.h / 2 - pt[1] * zoom })
        }
      }
      setActiveDestinationCardId(newId)
    }
  }

  const transformStr = `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none"
      style={{ background: COLORS.ocean, overflow: 'hidden', cursor: isPanning.current ? 'grabbing' : 'grab' }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onWheel={onWheel}
      aria-label="India map with 92 attraction markers"
      role="img"
    >
      {/* Pulse animation keyframes */}
      <style>{`
        @keyframes markerPulse {
          0%   { r: 7;  opacity: 0.7; }
          100% { r: 18; opacity: 0; }
        }
        @keyframes markerBreath {
          0%, 100% { opacity: 0.85; }
          50%       { opacity: 1; }
        }
      `}</style>

      {/* Loading state */}
      {!geojson && (
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: COLORS.ocean }}>
          <div className="w-1.5 h-1.5 rounded-full animate-ping mb-4" style={{ background: COLORS.markerCore }} />
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '10px', letterSpacing: '0.18em', color: 'rgba(255,184,107,0.45)' }}>
            LOADING MAP
          </p>
        </div>
      )}

      {geojson && pathGen && projection && (
        <svg
          width={dims.w}
          height={dims.h}
          viewBox={`0 0 ${dims.w} ${dims.h}`}
          style={{ display: 'block' }}
        >
          <defs>
            {/* Outer India glow filter */}
            <filter id="india-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            {/* Marker glow */}
            <filter id="marker-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            {/* Atmospheric vignette */}
            <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="100%" stopColor="rgba(5,8,14,0.45)" />
            </radialGradient>
          </defs>

          {/* Ocean background */}
          <rect width={dims.w} height={dims.h} fill={COLORS.ocean} />

          {/* Subtle ocean texture lines */}
          {Array.from({ length: 8 }, (_, i) => (
            <line
              key={i}
              x1={0} y1={(i + 1) * (dims.h / 9)}
              x2={dims.w} y2={(i + 1) * (dims.h / 9)}
              stroke="rgba(99,180,255,0.04)"
              strokeWidth={1}
            />
          ))}

          {/* Transformed group — zoom + pan */}
          <g style={{ transformOrigin: `${dims.w / 2}px ${dims.h / 2}px`, transform: transformStr, transition: zoom === 1 ? 'transform 0.4s ease' : 'none' }}>

            {/* ── State fills ── */}
            {geojson.features.map(f => {
              const d = pathGen(f as d3geo.ExtendedFeature)
              if (!d) return null
              const isHov = hoveredState === f.properties.name
              return (
                <path
                  key={f.properties.id}
                  d={d}
                  fill={isHov ? COLORS.landHover : COLORS.land}
                  stroke={COLORS.border}
                  strokeWidth={0.8 / zoom}
                  strokeLinejoin="round"
                  style={{ transition: 'fill 0.2s ease', cursor: 'default' }}
                  onMouseEnter={() => setHoveredState(f.properties.name)}
                  onMouseLeave={() => setHoveredState(null)}
                />
              )
            })}

            {/* ── Outer India boundary (all features merged visual) ── */}
            {geojson.features.map(f => {
              const d = pathGen(f as d3geo.ExtendedFeature)
              if (!d) return null
              return (
                <path
                  key={`outer-${f.properties.id}`}
                  d={d}
                  fill="none"
                  stroke={COLORS.borderOuter}
                  strokeWidth={1.4 / zoom}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  pointerEvents="none"
                  opacity={0.6}
                  filter="url(#india-glow)"
                />
              )
            })}

            {/* ── State labels ── */}
            {stateCentroids.map((s, i) => {
              if (!visibleLabels.has(String(i))) return null
              return (
                <text
                  key={s.name}
                  x={s.cx}
                  y={s.cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="var(--font-montserrat, Montserrat, sans-serif)"
                  fontSize={Math.max(6.5, 8.5 / zoom)}
                  fontWeight={500}
                  letterSpacing={0.6}
                  fill={COLORS.labelText}
                  style={{ pointerEvents: 'none', userSelect: 'none', textTransform: 'uppercase' }}
                  paintOrder="stroke"
                  stroke={COLORS.labelShadow}
                  strokeWidth={2.5 / zoom}
                  strokeLinejoin="round"
                >
                  {s.shortName}
                </text>
              )
            })}

            {/* ── Attraction markers — all 84 ── */}
            <g filter="url(#marker-glow)">
              {markers.map(({ attraction, cx, cy }) => {
                const isDimmed = activeMoods.size > 0 && !attraction.moodTags.some(t => activeMoods.has(t))
                const isActive = activeAttractionId === attraction.id
                const isHovered = hoveredMarker === attraction.id
                return (
                  <MarkerDot
                    key={attraction.id}
                    attraction={attraction}
                    cx={cx}
                    cy={cy}
                    isActive={isActive}
                    isHovered={isHovered}
                    isDimmed={isDimmed}
                    onClick={() => selectAttraction(attraction)}
                    onMouseEnter={() => setHoveredMarker(attraction.id)}
                    onMouseLeave={() => setHoveredMarker(null)}
                  />
                )
              })}
            </g>

            {/* ── Active tooltip ── */}
            {hoveredMarker && (() => {
              const m = markers.find(m => m.attraction.id === hoveredMarker)
              if (!m) return null
              return <Tooltip key={hoveredMarker} attraction={m.attraction} cx={m.cx} cy={m.cy} svgWidth={dims.w} />
            })()}

          </g>

          {/* Vignette overlay */}
          <rect width={dims.w} height={dims.h} fill="url(#vignette)" pointerEvents="none" />
        </svg>
      )}
    </div>
  )
}
