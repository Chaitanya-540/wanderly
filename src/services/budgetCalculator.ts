import type { BudgetInput, BudgetBreakdown, BudgetValidationError } from '@/types/budget'
import { STATE_COST_DATA } from '@/data/costOfLiving'
import { MAJOR_CITIES } from '@/data/cities'
import { haversineDistance } from '@/utils/geo'

// ─── Transport mode thresholds ────────────────────────────────────────────────

const TRANSPORT_MODES = {
  local: { maxKm: 50, ratePerKmPerPerson: 2 },   // auto/cab
  bus: { maxKm: 500, ratePerKmPerPerson: 0.8 },  // AC bus
  train: { maxKm: 1500, ratePerKmPerPerson: 1.2 }, // sleeper/AC train
  flight: { maxKm: Infinity, ratePerKmPerPerson: 4 }, // economy flight estimate
} as const

export type TransportMode = keyof typeof TRANSPORT_MODES

// ─── Fallback cost data for unknown states ────────────────────────────────────

const FALLBACK_COST = Object.values(STATE_COST_DATA)[0]

// ─── Validation ───────────────────────────────────────────────────────────────

export function validateBudgetInput(input: BudgetInput): BudgetValidationError[] {
  const errors: BudgetValidationError[] = []

  if (!input.startingCity || input.startingCity.trim() === '') {
    errors.push({ field: 'startingCity', message: 'Starting city is required.' })
  }

  if (!Number.isInteger(input.days) || input.days < 1 || input.days > 30) {
    errors.push({ field: 'days', message: 'Days must be between 1 and 30.' })
  }

  if (!Number.isInteger(input.travellers) || input.travellers < 1 || input.travellers > 20) {
    errors.push({ field: 'travellers', message: 'Travellers must be between 1 and 20.' })
  }

  if (!input.attractionId || input.attractionId.trim() === '') {
    errors.push({ field: 'attractionId', message: 'Destination attraction is required.' })
  }

  return errors
}

// ─── Transport mode selection ─────────────────────────────────────────────────

export function selectTransportMode(distanceKm: number): TransportMode {
  if (distanceKm <= TRANSPORT_MODES.local.maxKm) return 'local'
  if (distanceKm <= TRANSPORT_MODES.bus.maxKm) return 'bus'
  if (distanceKm <= TRANSPORT_MODES.train.maxKm) return 'train'
  return 'flight'
}

// ─── Transport cost calculation ───────────────────────────────────────────────

export function calculateTransportCost(
  distanceKm: number,
  travellers: number,
  mode?: TransportMode,
): number {
  const resolvedMode = mode ?? selectTransportMode(distanceKm)
  const { ratePerKmPerPerson } = TRANSPORT_MODES[resolvedMode]
  // Round-trip factor of 2
  return Math.round(distanceKm * ratePerKmPerPerson * travellers * 2)
}

// ─── Full budget calculation ──────────────────────────────────────────────────

export interface CalculateBudgetParams {
  input: BudgetInput
  attractionState: string
  attractionCoordinates: { lat: number; lng: number }
}

export function calculateBudget({
  input,
  attractionState,
  attractionCoordinates,
}: CalculateBudgetParams): BudgetBreakdown {
  const costData = STATE_COST_DATA[attractionState] ?? FALLBACK_COST

  // --- 1. Accommodation ---
  const hotelCostPerNight =
    input.accommodation === 'Budget'
      ? costData.budgetHotel
      : input.accommodation === 'Mid-range'
        ? costData.midrangeHotel
        : costData.luxuryHotel

  // Rooms needed: 1 per 2 travellers (round up), with at least 1
  const rooms = Math.max(1, Math.ceil(input.travellers / 2))
  const accommodation = Math.round(hotelCostPerNight * rooms * input.days)

  // --- 2. Food ---
  const mealCostPerPersonPerDay =
    input.travelStyle === 'Backpacker'
      ? costData.budgetMealPerPerson
      : input.travelStyle === 'Standard'
        ? costData.midrangeMealPerPerson
        : costData.premiumMealPerPerson

  const food = Math.round(mealCostPerPersonPerDay * input.travellers * input.days)

  // --- 3. Activities ---
  const activities = Math.round(
    costData.activitiesPerDayPerPerson * input.travellers * input.days,
  )

  // --- 4. Miscellaneous ---
  const miscellaneous = Math.round(
    costData.miscPerDayPerPerson * input.travellers * input.days,
  )

  // --- 5. Transport (Haversine-driven) ---
  const originCity = MAJOR_CITIES[input.startingCity]
  const origin = originCity
    ? { lat: originCity.lat, lng: originCity.lng }
    : { lat: 20.5937, lng: 78.9629 } // geographic centre of India as fallback

  const distanceKm = haversineDistance(origin, attractionCoordinates)
  const transport = calculateTransportCost(distanceKm, input.travellers)

  const totalINR = transport + accommodation + food + activities + miscellaneous

  return {
    transport,
    accommodation,
    food,
    activities,
    miscellaneous,
    totalINR,
    currency: input.currency,
    estimatedLabel: 'Estimated',
  }
}
