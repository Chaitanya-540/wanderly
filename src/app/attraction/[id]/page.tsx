import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ATTRACTIONS } from '@/data/attractions'
import { findNearby } from '@/utils/geo'
import type { Metadata } from 'next'
import CinematicHero from '@/components/detail/CinematicHero'
import ItineraryTabs from '@/components/planning/Itinerary'
import BudgetEstimator from '@/components/planning/BudgetEstimator'
import NearbyDestinations from '@/components/detail/NearbyDestinations'

interface Props { params: { id: string } }

export async function generateStaticParams() {
  return ATTRACTIONS.map(a => ({ id: a.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = ATTRACTIONS.find(x => x.id === params.id)
  if (!a) return { title: 'Not Found' }
  return {
    title: `${a.name}`,
    description: a.description,
  }
}

// Tiny inline styles kept as objects for the server component (no 'use client' needed)
const S = {
  page: {
    minHeight: '100vh',
    background: '#080c14',
    color: '#e8e0d4',
  } as React.CSSProperties,

  hero: {
    position: 'relative' as const,
    width: '100%',
    height: 'clamp(520px, 82vh, 900px)',
    overflow: 'hidden',
  } as React.CSSProperties,

  heroOverlay: {
    position: 'absolute' as const,
    inset: 0,
    zIndex: 5,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.06) 35%, rgba(0,0,0,0.18) 62%, rgba(5,8,14,0.72) 83%, rgba(5,8,14,0.90) 100%)',
    pointerEvents: 'none' as const,
  } as React.CSSProperties,

  heroContent: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 6,
    padding: 'clamp(28px, 5vw, 56px)',
    maxWidth: '900px',
  } as React.CSSProperties,

  eyebrow: {
    fontSize: '10px',
    letterSpacing: '0.22em',
    color: 'rgba(255,184,107,0.65)',
    fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)',
    marginBottom: 10,
    textTransform: 'uppercase' as const,
  } as React.CSSProperties,

  h1: {
    fontFamily: 'var(--font-playfair, Playfair Display, serif)',
    fontSize: 'clamp(32px, 5vw, 56px)',
    fontWeight: 700,
    lineHeight: 1.08,
    color: '#e8e0d4',
    marginBottom: 10,
    textShadow: '0 2px 20px rgba(0,0,0,0.5)',
  } as React.CSSProperties,

  subtitle: {
    fontSize: 'clamp(13px, 1.5vw, 15px)',
    color: 'rgba(232,224,212,0.55)',
    fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)',
    marginBottom: 18,
    lineHeight: 1.55,
    maxWidth: 560,
  } as React.CSSProperties,

  tagRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 7,
    alignItems: 'center',
  } as React.CSSProperties,

  tag: {
    fontSize: 10,
    letterSpacing: '0.06em',
    padding: '4px 10px',
    borderRadius: 99,
    background: 'rgba(255,184,107,0.1)',
    border: '1px solid rgba(255,184,107,0.22)',
    color: 'rgba(255,184,107,0.8)',
    fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)',
  } as React.CSSProperties,

  catTag: {
    fontSize: 10,
    letterSpacing: '0.08em',
    padding: '4px 10px',
    borderRadius: 99,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'rgba(232,224,212,0.45)',
    fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)',
  } as React.CSSProperties,

  planBtn: {
    display: 'inline-block',
    padding: '10px 22px',
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.1em',
    background: 'linear-gradient(135deg, #FFB86B, #FF9F43)',
    color: '#0b0b0d',
    textDecoration: 'none',
    fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)',
  } as React.CSSProperties,

  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 11,
    color: 'rgba(232,224,212,0.35)',
    padding: '14px clamp(16px, 5vw, 56px)',
    fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)',
    letterSpacing: '0.04em',
  } as React.CSSProperties,

  body: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '60px clamp(16px, 5vw, 56px) 100px',
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 72,
  } as React.CSSProperties,
}

function SectionDivider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '8px 0' }} aria-hidden>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
      <div style={{ width: 4, height: 4, borderRadius: 99, background: 'rgba(255,184,107,0.3)' }} />
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
    </div>
  )
}

function HighlightsList({ highlights }: { highlights: string[] }) {
  return (
    <section aria-labelledby="highlights-h">
      <p style={{ fontSize: '10px', letterSpacing: '0.22em', color: 'rgba(255,184,107,0.55)', marginBottom: 8, fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)' }}>
        WHY VISIT
      </p>
      <h2 id="highlights-h" style={{ fontFamily: 'var(--font-playfair, Playfair Display, serif)', fontSize: 22, fontWeight: 600, color: '#e8e0d4', marginBottom: 20 }}>
        Highlights
      </h2>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {highlights.map((h, i) => (
          <li key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <span
              aria-hidden
              style={{
                flexShrink: 0,
                width: 22,
                height: 22,
                borderRadius: 99,
                background: 'rgba(255,184,107,0.1)',
                border: '1px solid rgba(255,184,107,0.22)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 9,
                color: '#FFB86B',
                fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)',
                fontWeight: 600,
                marginTop: 2,
              }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(232,224,212,0.72)', fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)', flex: 1 }}>
              {h}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}

function InsiderTips({ tips }: { tips: string[] }) {
  return (
    <section aria-labelledby="tips-h">
      <p style={{ fontSize: '10px', letterSpacing: '0.22em', color: 'rgba(255,184,107,0.55)', marginBottom: 8, fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)' }}>
        LOCAL KNOWLEDGE
      </p>
      <h2 id="tips-h" style={{ fontFamily: 'var(--font-playfair, Playfair Display, serif)', fontSize: 22, fontWeight: 600, color: '#e8e0d4', marginBottom: 20 }}>
        Insider Notes
      </h2>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tips.map((tip, i) => (
          <li
            key={i}
            style={{
              padding: '13px 16px',
              borderRadius: 10,
              background: 'rgba(255,184,107,0.05)',
              border: '1px solid rgba(255,184,107,0.13)',
              borderLeft: '3px solid rgba(255,184,107,0.4)',
              fontSize: 13,
              lineHeight: 1.6,
              color: 'rgba(232,224,212,0.68)',
              fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)',
            }}
          >
            {tip}
          </li>
        ))}
      </ul>
    </section>
  )
}

function QuickFacts({ attraction }: { attraction: ReturnType<typeof ATTRACTIONS['find']> & {} }) {
  const facts = [
    { label: 'State',      value: attraction.state },
    { label: 'District',   value: attraction.district },
    { label: 'Category',   value: attraction.category },
    { label: 'Popularity', value: `${attraction.popularityScore} / 100` },
    { label: 'Lat / Lng',  value: `${attraction.coordinates.lat.toFixed(3)}°N, ${attraction.coordinates.lng.toFixed(3)}°E` },
  ]
  return (
    <div
      style={{
        background: 'rgba(17,25,35,0.6)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      <p
        style={{
          padding: '12px 16px',
          fontSize: 9,
          letterSpacing: '0.18em',
          color: 'rgba(255,184,107,0.5)',
          fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          margin: 0,
        }}
      >
        QUICK FACTS
      </p>
      <dl style={{ margin: 0, padding: 0 }}>
        {facts.map(({ label, value }) => (
          <div
            key={label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              padding: '9px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              gap: 12,
            }}
          >
            <dt style={{ fontSize: 11, color: 'rgba(232,224,212,0.35)', fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)', flexShrink: 0 }}>
              {label}
            </dt>
            <dd style={{ fontSize: 11, color: 'rgba(232,224,212,0.75)', fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)', textAlign: 'right', margin: 0 }}>
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export default function AttractionPage({ params }: Props) {
  const attraction = ATTRACTIONS.find(a => a.id === params.id)
  if (!attraction) notFound()

  const nearby = findNearby(attraction, ATTRACTIONS, 200, 5)

  return (
    <div style={S.page}>
      {/* ── Breadcrumb ── */}
      <nav aria-label="Breadcrumb" style={S.breadcrumb}>
        <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
        <span aria-hidden style={{ opacity: 0.4 }}>›</span>
        <Link href="/quick-list" style={{ color: 'inherit', textDecoration: 'none' }}>Attractions</Link>
        <span aria-hidden style={{ opacity: 0.4 }}>›</span>
        <span style={{ color: 'rgba(232,224,212,0.6)' }}>{attraction.name}</span>
      </nav>

      {/* ── Cinematic hero — full width, cycling images ── */}
      <header style={S.hero}>
        {/* CinematicHero fills the entire hero area */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          <CinematicHero attraction={attraction} />
        </div>

        {/* Gradient overlay */}
        <div style={S.heroOverlay} />

        {/* Hero text content */}
        <div style={S.heroContent}>
          <p style={S.eyebrow}>{attraction.state} · {attraction.category}</p>
          <h1 style={S.h1}>{attraction.name}</h1>
          <p style={S.subtitle}>{attraction.description}</p>

          <div style={{ ...S.tagRow, marginBottom: 20 }}>
            {attraction.moodTags.map(t => (
              <span key={t} style={S.tag}>{t}</span>
            ))}
            <span style={S.catTag}>{attraction.category}</span>
          </div>

          <Link href="/trip-planner" style={S.planBtn}>
            PLAN YOUR TRIP
          </Link>
        </div>
      </header>

      {/* ── Body — two-column on desktop ── */}
      <div style={S.body}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 340px)', gap: 64, alignItems: 'start' }}
          className="attraction-grid"
        >
          {/* Left column — main content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
            <HighlightsList highlights={attraction.highlights} />
            <SectionDivider />
            <InsiderTips tips={attraction.insiderTips} />
            <SectionDivider />
            <ItineraryTabs itineraries={attraction.itineraries} />
            <SectionDivider />
            <BudgetEstimator
              attractionId={attraction.id}
              attractionState={attraction.state}
              attractionCoordinates={attraction.coordinates}
            />
          </div>

          {/* Right sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32, position: 'sticky', top: 80 }}>
            <QuickFacts attraction={attraction} />
            {nearby.length > 0 && (
              <div>
                <p style={{ fontSize: 9, letterSpacing: '0.18em', color: 'rgba(255,184,107,0.5)', marginBottom: 12, fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)' }}>
                  NEARBY
                </p>
                <NearbyDestinations nearby={nearby} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Responsive: stack on mobile */}
      <style>{`
        @media (max-width: 860px) {
          .attraction-grid {
            grid-template-columns: 1fr !important;
          }
          .attraction-grid > div:last-child {
            position: static !important;
          }
        }
      `}</style>
    </div>
  )
}
