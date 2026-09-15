'use client'

import { useState } from 'react'
import { validateBudgetInput, calculateBudget } from '@/services/budgetCalculator'
import { MAJOR_CITY_NAMES } from '@/data/cities'
import type { BudgetInput, BudgetBreakdown, AccommodationTier, TravelStyle, Currency } from '@/types/budget'

interface Props {
  attractionId: string
  attractionState: string
  attractionCoordinates: { lat: number; lng: number }
}

const INR_RATES = { USD: 83.5, EUR: 90.2 }

function fmt(n: number, currency: Currency, rate?: number) {
  if (currency === 'INR') return `₹${n.toLocaleString('en-IN')}`
  const sym = currency === 'USD' ? '$' : '€'
  const converted = rate ? Math.round(n / rate) : 0
  return `${sym}${converted.toLocaleString()}`
}

const ROWS = [
  { key: 'transport',     label: 'Transport'      },
  { key: 'accommodation', label: 'Accommodation'  },
  { key: 'food',          label: 'Food'           },
  { key: 'activities',    label: 'Activities'     },
  { key: 'miscellaneous', label: 'Miscellaneous'  },
] as const

const sel: React.CSSProperties = {
  width: '100%',
  background: 'rgba(17,25,35,0.8)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  padding: '8px 12px',
  fontSize: 12,
  color: '#e8e0d4',
  fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)',
  outline: 'none',
  cursor: 'pointer',
}

const inp: React.CSSProperties = { ...sel, cursor: 'text' }

const lbl: React.CSSProperties = {
  display: 'block',
  fontSize: 9,
  letterSpacing: '0.16em',
  color: 'rgba(232,224,212,0.38)',
  marginBottom: 5,
  fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)',
  textTransform: 'uppercase',
}

export default function BudgetEstimator({ attractionId, attractionState, attractionCoordinates }: Props) {
  const [input, setInput] = useState<BudgetInput>({
    attractionId,
    startingCity: 'Delhi',
    days: 3,
    travellers: 2,
    accommodation: 'Mid-range',
    travelStyle: 'Standard',
    currency: 'INR',
  })
  const [result, setResult] = useState<BudgetBreakdown | null>(null)
  const [errors, setErrors] = useState<{ field: string; message: string }[]>([])

  function handleCalculate() {
    const errs = validateBudgetInput(input)
    setErrors(errs)
    if (errs.length > 0) return
    const breakdown = calculateBudget({ input, attractionState, attractionCoordinates })
    const rate = input.currency === 'USD' ? INR_RATES.USD : input.currency === 'EUR' ? INR_RATES.EUR : undefined
    setResult({ ...breakdown, totalConverted: rate ? Math.round(breakdown.totalINR / rate) : undefined, exchangeRate: rate })
  }

  const rate = input.currency === 'USD' ? INR_RATES.USD : input.currency === 'EUR' ? INR_RATES.EUR : undefined
  const errFor = (f: string) => errors.find(e => e.field === f)?.message

  // Compute allocation percentages from actual values
  const allocation = result ? {
    transport:     Math.round(result.transport     / result.totalINR * 100),
    accommodation: Math.round(result.accommodation / result.totalINR * 100),
    food:          Math.round(result.food          / result.totalINR * 100),
    activities:    Math.round(result.activities    / result.totalINR * 100),
    miscellaneous: Math.round(result.miscellaneous / result.totalINR * 100),
  } : null

  return (
    <section aria-labelledby="budget-heading">
      <p style={{ fontSize: 10, letterSpacing: '0.22em', color: 'rgba(255,184,107,0.55)', marginBottom: 8, fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)' }}>
        BUDGET ESTIMATOR
      </p>
      <h2
        id="budget-heading"
        style={{ fontFamily: 'var(--font-playfair, Playfair Display, serif)', fontSize: 22, fontWeight: 600, color: '#e8e0d4', marginBottom: 24 }}
      >
        Estimate Your Trip Cost
      </h2>

      <div
        style={{
          background: 'rgba(17,25,35,0.6)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 14,
          padding: '24px',
        }}
      >
        {/* Form grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16, marginBottom: 20 }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label htmlFor="b-city" style={lbl}>Starting City</label>
            <select id="b-city" value={input.startingCity} onChange={e => setInput({ ...input, startingCity: e.target.value })} style={sel}>
              {MAJOR_CITY_NAMES.map(c => <option key={c}>{c}</option>)}
            </select>
            {errFor('startingCity') && <p role="alert" style={{ color: '#f87171', fontSize: 10, marginTop: 3 }}>{errFor('startingCity')}</p>}
          </div>
          <div>
            <label htmlFor="b-days" style={lbl}>Days (1–30)</label>
            <input id="b-days" type="number" min={1} max={30} value={input.days} onChange={e => setInput({ ...input, days: +e.target.value })} style={inp} />
            {errFor('days') && <p role="alert" style={{ color: '#f87171', fontSize: 10, marginTop: 3 }}>{errFor('days')}</p>}
          </div>
          <div>
            <label htmlFor="b-travellers" style={lbl}>Travellers</label>
            <input id="b-travellers" type="number" min={1} max={20} value={input.travellers} onChange={e => setInput({ ...input, travellers: +e.target.value })} style={inp} />
            {errFor('travellers') && <p role="alert" style={{ color: '#f87171', fontSize: 10, marginTop: 3 }}>{errFor('travellers')}</p>}
          </div>
          <div>
            <label htmlFor="b-accom" style={lbl}>Stay</label>
            <select id="b-accom" value={input.accommodation} onChange={e => setInput({ ...input, accommodation: e.target.value as AccommodationTier })} style={sel}>
              <option>Budget</option><option>Mid-range</option><option>Luxury</option>
            </select>
          </div>
          <div>
            <label htmlFor="b-style" style={lbl}>Style</label>
            <select id="b-style" value={input.travelStyle} onChange={e => setInput({ ...input, travelStyle: e.target.value as TravelStyle })} style={sel}>
              <option>Backpacker</option><option>Standard</option><option>Premium</option>
            </select>
          </div>
          <div>
            <label htmlFor="b-currency" style={lbl}>Currency</label>
            <select id="b-currency" value={input.currency} onChange={e => setInput({ ...input, currency: e.target.value as Currency })} style={sel}>
              <option>INR</option><option>USD</option><option>EUR</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleCalculate}
          style={{
            width: '100%',
            padding: '11px 0',
            borderRadius: 10,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.1em',
            fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)',
            background: 'linear-gradient(135deg, rgba(34,211,238,0.18), rgba(6,182,212,0.12))',
            border: '1px solid rgba(34,211,238,0.3)',
            color: '#22d3ee',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          CALCULATE BUDGET
        </button>

        {/* Results */}
        {result && (
          <div style={{ marginTop: 24 }} aria-live="polite">
            <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', marginBottom: 20 }} />

            {/* Total highlight */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <p style={{ fontSize: 10, letterSpacing: '0.18em', color: 'rgba(232,224,212,0.35)', fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)', marginBottom: 4 }}>
                ESTIMATED TOTAL
              </p>
              <p style={{ fontFamily: 'var(--font-playfair, Playfair Display, serif)', fontSize: 32, fontWeight: 700, color: '#FFB86B', lineHeight: 1 }}>
                {fmt(result.totalINR, input.currency, rate)}
              </p>
              <p style={{ fontSize: 10, color: 'rgba(232,224,212,0.3)', marginTop: 4, fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)' }}>
                {result.estimatedLabel} · for {input.travellers} traveller{input.travellers > 1 ? 's' : ''} · {input.days} days
              </p>
            </div>

            {/* Breakdown rows */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }} aria-label="Budget breakdown">
              <tbody>
                {ROWS.map(({ key, label }) => {
                  const val = result[key]
                  const pct = allocation?.[key] ?? 0
                  return (
                    <tr key={key} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '9px 0', fontSize: 12, color: 'rgba(232,224,212,0.6)', fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)' }}>
                        {label}
                      </td>
                      <td style={{ padding: '9px 0', width: 80 }}>
                        {/* Mini bar */}
                        <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: '#FFB86B', borderRadius: 2, opacity: 0.7 }} />
                        </div>
                      </td>
                      <td style={{ padding: '9px 0 9px 12px', textAlign: 'right', fontSize: 12, color: '#e8e0d4', fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)', whiteSpace: 'nowrap' }}>
                        {fmt(val, input.currency, rate)}
                      </td>
                      <td style={{ padding: '9px 0 9px 8px', textAlign: 'right', fontSize: 9, color: 'rgba(232,224,212,0.3)', fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)', width: 28 }}>
                        {pct}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
