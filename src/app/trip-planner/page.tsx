'use client'

import { useTripPlanner } from '@/hooks/useTripPlanner'
import Planner from '@/components/planning/Planner'
import BudgetEstimator from '@/components/planning/BudgetEstimator'
import { ATTRACTIONS } from '@/data/attractions'
import { useState } from 'react'

export default function TripPlannerPage() {
  const { trips, deleteTrip } = useTripPlanner()
  const defaultAttraction = ATTRACTIONS[0]

  return (
    <div className="min-h-screen bg-[#09090f] px-4 sm:px-6 py-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Trip Planner</h1>
      <p className="text-white/50 text-sm mb-8">Build your India itinerary and estimate costs</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: planner */}
        <div className="space-y-8">
          <Planner defaultAttractionId={defaultAttraction.id} />
          <BudgetEstimator
            attractionId={defaultAttraction.id}
            attractionState={defaultAttraction.state}
            attractionCoordinates={defaultAttraction.coordinates}
          />
        </div>

        {/* Right: saved trips */}
        <section aria-labelledby="saved-heading">
          <h2 id="saved-heading" className="text-lg font-semibold text-white mb-4">
            Saved Trips ({trips.length})
          </h2>
          {trips.length === 0 ? (
            <div className="text-white/30 text-sm text-center py-12 border border-white/10 rounded-xl">
              No trips saved yet.
            </div>
          ) : (
            <ul className="space-y-3" role="list">
              {trips.map((trip) => (
                <li key={trip.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-white">{trip.attractionName}</p>
                    <p className="text-xs text-white/40 mt-0.5">
                      {trip.itinerary.days} days · {trip.itinerary.profile}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteTrip(trip.id)}
                    aria-label={`Delete trip to ${trip.attractionName}`}
                    className="text-white/30 hover:text-red-400 transition-colors text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded"
                  >
                    🗑️
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
