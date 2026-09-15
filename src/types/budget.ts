export type AccommodationTier = 'Budget' | 'Mid-range' | 'Luxury'
export type TravelStyle = 'Backpacker' | 'Standard' | 'Premium'
export type Currency = 'INR' | 'USD' | 'EUR'

export interface BudgetInput {
  attractionId: string
  startingCity: string
  days: number          // 1-30
  travellers: number    // 1-20
  accommodation: AccommodationTier
  travelStyle: TravelStyle
  currency: Currency
}

export interface BudgetBreakdown {
  transport: number
  accommodation: number
  food: number
  activities: number
  miscellaneous: number
  totalINR: number
  totalConverted?: number
  currency: Currency
  exchangeRate?: number
  estimatedLabel: string  // e.g. "Estimated" | "Updated YYYY-MM-DD"
}

export interface BudgetValidationError {
  field: string
  message: string
}
