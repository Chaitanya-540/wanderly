import { useState, useCallback, useEffect } from 'react'
import type { Trip } from '@/types/trip'

const STORAGE_KEY = 'bharat3d:trips'

function loadTrips(): Trip[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Trip[]
  } catch {
    return []
  }
}

function persistTrips(trips: Trip[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips))
}

export interface UseTripPlannerReturn {
  trips: Trip[]
  saveTrip: (trip: Trip) => void
  deleteTrip: (id: string) => void
  storageAvailable: boolean
}

export function useTripPlanner(): UseTripPlannerReturn {
  const [storageAvailable, setStorageAvailable] = useState(false)
  const [trips, setTrips] = useState<Trip[]>([])

  useEffect(() => {
    try {
      localStorage.setItem('__test__', '1')
      localStorage.removeItem('__test__')
      setStorageAvailable(true)
      setTrips(loadTrips())
    } catch {
      setStorageAvailable(false)
    }
  }, [])

  const saveTrip = useCallback(
    (trip: Trip) => {
      setTrips((prev) => {
        // Replace if same id exists, otherwise append
        const existing = prev.findIndex((t) => t.id === trip.id)
        const updated =
          existing >= 0
            ? prev.map((t) => (t.id === trip.id ? { ...trip, updatedAt: Date.now() } : t))
            : [...prev, trip]
        if (storageAvailable) persistTrips(updated)
        return updated
      })
    },
    [storageAvailable],
  )

  const deleteTrip = useCallback(
    (id: string) => {
      setTrips((prev) => {
        const updated = prev.filter((t) => t.id !== id)
        if (storageAvailable) persistTrips(updated)
        return updated
      })
    },
    [storageAvailable],
  )

  return { trips, saveTrip, deleteTrip, storageAvailable }
}
