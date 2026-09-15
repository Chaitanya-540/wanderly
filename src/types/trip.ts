import type { Itinerary } from './attraction'
import type { BudgetBreakdown } from './budget'

export interface Trip {
  id: string
  attractionId: string
  attractionName: string
  itinerary: Itinerary
  budget?: BudgetBreakdown
  createdAt: number
  updatedAt: number
}
