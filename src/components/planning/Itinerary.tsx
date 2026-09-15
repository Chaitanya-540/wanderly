'use client'

import { useState } from 'react'
import type { Itinerary } from '@/types/attraction'

interface ItineraryTabsProps {
  itineraries: Itinerary[]
}

const btn = (active: boolean) => ({
  padding: '7px 18px',
  borderRadius: '8px',
  fontSize: '11px',
  fontWeight: active ? 600 : 400,
  letterSpacing: '0.08em',
  fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)',
  cursor: 'pointer',
  border: `1px solid ${active ? 'rgba(255,184,107,0.5)' : 'rgba(255,255,255,0.08)'}`,
  background: active ? 'rgba(255,184,107,0.12)' : 'rgba(255,255,255,0.03)',
  color: active ? '#FFB86B' : 'rgba(232,224,212,0.5)',
  transition: 'all 0.18s ease',
} as React.CSSProperties)

const SLOT_LABELS = ['Morning', 'Afternoon', 'Evening']

export default function ItineraryTabs({ itineraries }: ItineraryTabsProps) {
  const [days, setDays]       = useState<2 | 3 | 4>(3)
  const [profile, setProfile] = useState<'Solo' | 'Family'>('Solo')

  const current = itineraries.find(it => it.days === days && it.profile === profile)
    ?? itineraries[0]

  const availDays = ([2, 3, 4] as const).filter(d =>
    itineraries.some(it => it.days === d)
  )

  return (
    <section
      aria-labelledby="itinerary-heading"
      style={{ paddingTop: 8 }}
    >
      {/* Section label */}
      <p style={{ fontSize: '10px', letterSpacing: '0.22em', color: 'rgba(255,184,107,0.55)', marginBottom: 8, fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)' }}>
        SAMPLE ITINERARY
      </p>

      <h2
        id="itinerary-heading"
        style={{ fontFamily: 'var(--font-playfair, Playfair Display, serif)', fontSize: '22px', fontWeight: 600, color: '#e8e0d4', marginBottom: 20 }}
      >
        Plan Your Days
      </h2>

      {/* Controls row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24, alignItems: 'center' }}>
        {/* Duration */}
        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend className="sr-only">Duration</legend>
          <div style={{ display: 'flex', gap: 6 }}>
            {availDays.map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                aria-pressed={days === d}
                style={btn(days === d)}
              >
                {d} DAYS
              </button>
            ))}
          </div>
        </fieldset>

        {/* Separator */}
        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.08)' }} aria-hidden />

        {/* Profile */}
        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend className="sr-only">Travel profile</legend>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['Solo', 'Family'] as const).map(p => (
              <button
                key={p}
                onClick={() => setProfile(p)}
                aria-pressed={profile === p}
                style={btn(profile === p)}
              >
                {p === 'Solo' ? 'SOLO' : 'FAMILY'}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      {/* Schedule */}
      {current ? (
        <ol
          style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}
          aria-label={`${current.days}-day ${current.profile} itinerary`}
        >
          {current.schedule.map(day => (
            <li
              key={day.day}
              style={{
                background: 'rgba(17,25,35,0.7)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              {/* Day header */}
              <div
                style={{
                  padding: '10px 16px',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  background: 'rgba(255,184,107,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-playfair, Playfair Display, serif)',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#FFB86B',
                    letterSpacing: '0.04em',
                  }}
                >
                  DAY {String(day.day).padStart(2, '0')}
                </span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,184,107,0.12)' }} aria-hidden />
              </div>

              {/* Slots */}
              <dl style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[day.morning, day.afternoon, day.evening].map((text, si) => (
                  <div key={si} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <dt
                      style={{
                        fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)',
                        fontSize: 9,
                        letterSpacing: '0.14em',
                        color: 'rgba(232,224,212,0.28)',
                        paddingTop: 2,
                        flexShrink: 0,
                        width: 64,
                        textTransform: 'uppercase',
                      }}
                    >
                      {SLOT_LABELS[si]}
                    </dt>
                    <dd
                      style={{
                        fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)',
                        fontSize: 12,
                        lineHeight: 1.55,
                        color: 'rgba(232,224,212,0.72)',
                        flex: 1,
                      }}
                    >
                      {text}
                    </dd>
                  </div>
                ))}
                {day.tips && (
                  <div
                    style={{
                      marginTop: 4,
                      padding: '8px 12px',
                      borderRadius: 7,
                      background: 'rgba(255,184,107,0.06)',
                      border: '1px solid rgba(255,184,107,0.14)',
                      fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)',
                      fontSize: 11,
                      color: 'rgba(255,184,107,0.7)',
                      fontStyle: 'italic',
                    }}
                  >
                    {day.tips}
                  </div>
                )}
              </dl>
            </li>
          ))}
        </ol>
      ) : (
        <p style={{ fontSize: 12, color: 'rgba(232,224,212,0.3)', fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)' }}>
          No itinerary available for this combination.
        </p>
      )}

      <a
        href="/trip-planner"
        style={{
          display: 'inline-block',
          marginTop: 16,
          fontSize: 11,
          letterSpacing: '0.1em',
          color: 'rgba(255,184,107,0.6)',
          fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)',
          textDecoration: 'none',
        }}
        className="focus:outline-none focus-visible:underline"
      >
        CUSTOMISE IN TRIP PLANNER →
      </a>
    </section>
  )
}
