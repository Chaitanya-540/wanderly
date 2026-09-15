import MapHero from '@/components/ui/MapHero'
import DestinationCard from '@/components/cards/DestinationCard'
import StateChips from '@/components/ui/StateChips'
import FooterLinks from '@/components/ui/FooterLinks'
import Link from 'next/link'
import { rankByPopularity } from '@/services/popularityRanker'
import { ATTRACTIONS } from '@/data/attractions'

const FEATURED = rankByPopularity(ATTRACTIONS).slice(0, 6)
const ALL_STATES = [...new Set(ATTRACTIONS.map(a => a.state))].sort()

export default function HomePage() {
  return (
    /*
     * SCROLL: position:relative, no overflow:hidden, no fixed height.
     * The MapHero section has a viewport-height but does NOT trap scroll.
     */
    <div style={{ position: 'relative' }}>

      {/* ── 1. Hero map — fills first viewport ── */}
      <MapHero />

      {/* ── 2. Featured Destinations ── */}
      <section
        className="px-4 sm:px-8 py-20 max-w-[1400px] mx-auto"
        aria-labelledby="featured-heading"
      >
        {/* Section label */}
        <p
          className="font-ui mb-3"
          style={{ fontSize: '10px', letterSpacing: '0.22em', color: 'rgba(255,184,107,0.55)' }}
        >
          FEATURED DESTINATIONS
        </p>
        <h2
          id="featured-heading"
          className="font-serif"
          style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 600, color: '#e8e0d4', lineHeight: 1.15, marginBottom: '40px' }}
        >
          Discover India's<br />
          <span className="text-gold-gradient">finest places</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
          {FEATURED.map(a => (
            <div key={a.id} className="animate-fade-up">
              <DestinationCard attraction={a} />
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/quick-list"
            className="inline-flex items-center gap-3 px-8 py-3.5 rounded-xl font-sans font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB86B]"
            style={{
              fontSize: '12px',
              letterSpacing: '0.1em',
              background: 'rgba(255,184,107,0.07)',
              border: '1px solid rgba(255,184,107,0.22)',
              color: 'rgba(255,184,107,0.85)',
            }}
          >
            View all 92 destinations
            <span aria-hidden style={{ fontSize: '10px', opacity: 0.5 }}>→</span>
          </Link>
        </div>
      </section>

      {/* ── 3. Explore by State ── */}
      <section
        className="px-4 sm:px-8 py-20"
        style={{ background: 'rgba(17,17,20,0.6)', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        aria-labelledby="states-heading"
      >
        <div className="max-w-[1400px] mx-auto">
          <p
            className="font-ui mb-3"
            style={{ fontSize: '10px', letterSpacing: '0.22em', color: 'rgba(255,184,107,0.55)' }}
          >
            STATES &amp; TERRITORIES
          </p>
          <h2
            id="states-heading"
            className="font-serif"
            style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 600, color: '#e8e0d4', marginBottom: '36px' }}
          >
            Explore by State
          </h2>

          <StateChips states={ALL_STATES.map(state => ({
            name: state,
            count: ATTRACTIONS.filter(a => a.state === state).length,
          }))} />
        </div>
      </section>

      {/* ── 4. CTA strip ── */}
      <section className="px-4 sm:px-8 py-20 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Trip Planner */}
          <div
            className="rounded-2xl p-8"
            style={{
              background: 'linear-gradient(135deg, rgba(255,184,107,0.07) 0%, rgba(255,159,67,0.04) 100%)',
              border: '1px solid rgba(255,184,107,0.15)',
            }}
          >
            <p
              className="font-ui mb-4"
              style={{ fontSize: '28px', lineHeight: 1 }}
              aria-hidden
            >✈️</p>
            <h3
              className="font-serif"
              style={{ fontSize: '22px', fontWeight: 600, color: '#e8e0d4', marginBottom: '10px' }}
            >
              Plan Your Trip
            </h3>
            <p
              className="font-ui mb-7"
              style={{ fontSize: '13px', lineHeight: 1.65, color: 'rgba(232,224,212,0.5)' }}
            >
              Build a personalised 2, 3 or 4-day itinerary for Solo or Family travel across India.
            </p>
            <Link
              href="/trip-planner"
              className="inline-block px-6 py-3 rounded-xl font-sans font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB86B]"
              style={{
                fontSize: '11px',
                letterSpacing: '0.1em',
                background: 'linear-gradient(135deg, #FFB86B, #FF9F43)',
                color: '#0b0b0d',
              }}
            >
              OPEN PLANNER
            </Link>
          </div>

          {/* Budget Estimator */}
          <div
            className="rounded-2xl p-8"
            style={{
              background: 'linear-gradient(135deg, rgba(34,211,238,0.05) 0%, rgba(6,182,212,0.03) 100%)',
              border: '1px solid rgba(34,211,238,0.12)',
            }}
          >
            <p className="font-ui mb-4" style={{ fontSize: '28px', lineHeight: 1 }} aria-hidden>💰</p>
            <h3
              className="font-serif"
              style={{ fontSize: '22px', fontWeight: 600, color: '#e8e0d4', marginBottom: '10px' }}
            >
              Estimate Budget
            </h3>
            <p
              className="font-ui mb-7"
              style={{ fontSize: '13px', lineHeight: 1.65, color: 'rgba(232,224,212,0.5)' }}
            >
              Real-cost breakdown — transport, accommodation, food, activities — in INR, USD or EUR.
            </p>
            <Link
              href="/trip-planner"
              className="inline-block px-6 py-3 rounded-xl font-sans font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              style={{
                fontSize: '11px',
                letterSpacing: '0.1em',
                background: 'rgba(34,211,238,0.12)',
                border: '1px solid rgba(34,211,238,0.25)',
                color: '#22d3ee',
              }}
            >
              CALCULATE
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="px-4 sm:px-8 py-12"
        role="contentinfo"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div>
            <p
              style={{
                fontFamily: 'var(--font-cormorant, Cormorant Garamond, serif)',
                fontSize: '22px',
                fontWeight: 600,
                letterSpacing: '0.12em',
                color: '#e8d9c4',
              }}
            >
              WANDERLY
            </p>
            <p className="font-ui mt-1" style={{ fontSize: '10px', letterSpacing: '0.14em', color: 'rgba(255,184,107,0.35)' }}>
              DISCOVER INDIA. ONE GLOW AT A TIME.
            </p>
          </div>

          <nav aria-label="Footer links">
            <FooterLinks />
          </nav>

          <p className="font-ui text-center sm:text-right" style={{ fontSize: '10px', color: 'rgba(232,224,212,0.2)' }}>
            Photos from Wikimedia Commons, Unsplash &amp; Pexels<br />
            under their respective open licences.
          </p>
        </div>
      </footer>
    </div>
  )
}
