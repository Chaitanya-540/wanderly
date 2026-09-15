'use client'

import { useState } from 'react'
import { useTripPlanner } from '@/hooks/useTripPlanner'
import { ATTRACTIONS } from '@/data/attractions'
import { getItinerary } from '@/services/itineraryGenerator'
import type { Trip } from '@/types/trip'

interface PlannerProps {
  defaultAttractionId?: string
}

export default function Planner({ defaultAttractionId }: PlannerProps) {
  const { saveTrip } = useTripPlanner()
  const [attractionId, setAttractionId] = useState(defaultAttractionId ?? ATTRACTIONS[0].id)
  const [days, setDays] = useState<2 | 3 | 4>(3)
  const [profile, setProfile] = useState<'Solo' | 'Family'>('Solo')
  const [saved, setSaved] = useState(false)

  const attraction = ATTRACTIONS.find((a) => a.id === attractionId) ?? ATTRACTIONS[0]
  const itinerary = getItinerary(attraction, days, profile, ATTRACTIONS)

  function handleSave() {
    const trip: Trip = {
      id: `${attractionId}-${Date.now()}`,
      attractionId,
      attractionName: attraction.name,
      itinerary,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    saveTrip(trip)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const btnBase = 'flex-1 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500'
  const btnActive = 'bg-purple-600 text-white'
  const btnInactive = 'bg-white/10 text-white/60 hover:bg-white/20'

  return (
    <section aria-labelledby="planner-heading" className="space-y-5">
      <h2 id="planner-heading" className="text-lg font-semibold text-white">Configure Trip</h2>

      {/* Destination */}
      <div>
        <label htmlFor="planner-attraction" className="block text-sm text-white/60 mb-1">Destination</label>
        <select id="planner-attraction" value={attractionId} onChange={(e) => setAttractionId(e.target.value)}
          className="w-full bg-slate-800 text-white px-3 py-2.5 rounded-xl text-sm border border-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500">
          {ATTRACTIONS.map((a) => (
            <option key={a.id} value={a.id}>{a.name} — {a.state}</option>
          ))}
        </select>
      </div>

      {/* Duration */}
      <fieldset>
        <legend className="block text-sm text-white/60 mb-2">Duration</legend>
        <div className="flex gap-2">
          {([2, 3, 4] as const).map((d) => (
            <button key={d} onClick={() => setDays(d)} aria-pressed={days === d}
              className={`${btnBase} ${days === d ? btnActive : btnInactive}`}>{d} Days</button>
          ))}
        </div>
      </fieldset>

      {/* Profile */}
      <fieldset>
        <legend className="block text-sm text-white/60 mb-2">Travel Profile</legend>
        <div className="flex gap-2">
          {(['Solo', 'Family'] as const).map((p) => (
            <button key={p} onClick={() => setProfile(p)} aria-pressed={profile === p}
              className={`${btnBase} ${profile === p ? btnActive : btnInactive}`}>
              {p === 'Solo' ? 'SOLO' : 'FAMILY'}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Preview */}
      <ol className="space-y-2" aria-label="Itinerary preview">
        {itinerary.schedule.map((day) => (
          <li key={day.day} className="bg-white/5 border border-white/10 rounded-xl p-3">
            <p className="text-xs font-semibold text-purple-300 mb-1">Day {day.day}</p>
            <div className="space-y-1 text-xs text-white/60">
              <p><span className="text-white/30">Morning · </span>{day.morning}</p>
              <p><span className="text-white/30">Afternoon · </span>{day.afternoon}</p>
              <p><span className="text-white/30">Evening · </span>{day.evening}</p>
            </div>
          </li>
        ))}
      </ol>

      <button onClick={handleSave}
        className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400">
        {saved ? '✓ Trip Saved!' : 'Save This Trip'}
      </button>
    </section>
  )
}
