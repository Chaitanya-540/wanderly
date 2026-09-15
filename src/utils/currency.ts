import type { Currency } from '@/types/budget'

// Fallback exchange rates (used when live rates are unavailable)
// Approximate as of mid-2024
export const FALLBACK_RATES: Record<Exclude<Currency, 'INR'>, number> = {
  USD: 83.5,  // 1 USD = 83.5 INR
  EUR: 90.2,  // 1 EUR = 90.2 INR
}

export interface ExchangeRates {
  USD: number  // INR per 1 USD
  EUR: number  // INR per 1 EUR
  fetchedAt: number
}

/**
 * Convert an amount from INR to the target currency.
 * @param amountINR Amount in Indian Rupees
 * @param targetCurrency Target currency
 * @param rates Exchange rates (INR per 1 foreign unit); uses fallback if not provided
 * @returns Converted amount in target currency
 */
export function convertFromINR(
  amountINR: number,
  targetCurrency: Currency,
  rates?: Partial<ExchangeRates>,
): number {
  if (targetCurrency === 'INR') return amountINR

  const rate = rates?.[targetCurrency] ?? FALLBACK_RATES[targetCurrency]
  return amountINR / rate
}

/**
 * Convert an amount from a foreign currency to INR.
 * @param amount Amount in foreign currency
 * @param fromCurrency Source currency
 * @param rates Exchange rates (INR per 1 foreign unit); uses fallback if not provided
 * @returns Amount in INR
 */
export function convertToINR(
  amount: number,
  fromCurrency: Currency,
  rates?: Partial<ExchangeRates>,
): number {
  if (fromCurrency === 'INR') return amount

  const rate = rates?.[fromCurrency] ?? FALLBACK_RATES[fromCurrency]
  return amount * rate
}

/**
 * Format a currency amount for display.
 * @param amount The amount to format
 * @param currency The currency code
 * @returns Formatted string e.g. "₹1,23,456" or "$1,480"
 */
export function formatCurrency(amount: number, currency: Currency): string {
  const rounded = Math.round(amount)
  
  if (currency === 'INR') {
    // Indian numbering system: 1,23,456
    return '₹' + formatIndianNumber(rounded)
  }
  
  const symbol = currency === 'USD' ? '$' : '€'
  return symbol + rounded.toLocaleString('en-US')
}

/**
 * Format number in Indian numbering system (lakhs/crores).
 */
function formatIndianNumber(n: number): string {
  const s = n.toString()
  if (s.length <= 3) return s
  
  const last3 = s.slice(-3)
  const remaining = s.slice(0, -3)
  const groups: string[] = []
  
  for (let i = remaining.length; i > 0; i -= 2) {
    groups.unshift(remaining.slice(Math.max(0, i - 2), i))
  }
  
  return groups.join(',') + ',' + last3
}

/**
 * Get the currency symbol for display.
 */
export function getCurrencySymbol(currency: Currency): string {
  switch (currency) {
    case 'INR': return '₹'
    case 'USD': return '$'
    case 'EUR': return '€'
  }
}
