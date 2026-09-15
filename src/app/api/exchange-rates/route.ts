import { NextResponse } from 'next/server'

interface ExchangeRatesResponse {
  USD: number
  EUR: number
  fetchedAt: number
  available: boolean
}

const FALLBACK: ExchangeRatesResponse = {
  USD: 83.5,
  EUR: 90.2,
  fetchedAt: 0,
  available: false,
}

export async function GET() {
  try {
    // Using Open Exchange Rates free endpoint (no key needed for USD base)
    const res = await fetch(
      'https://open.er-api.com/v6/latest/INR',
      { next: { revalidate: 3600 } }, // revalidate hourly
    )

    if (!res.ok) {
      return NextResponse.json({ ...FALLBACK, available: false })
    }

    const data = (await res.json()) as { rates?: { USD?: number; EUR?: number } }
    const rates = data.rates

    if (!rates?.USD || !rates?.EUR) {
      return NextResponse.json({ ...FALLBACK, available: false })
    }

    const payload: ExchangeRatesResponse = {
      // Convert: 1 INR = rates.USD USD, so 1 USD = 1/rates.USD INR
      USD: Math.round((1 / rates.USD) * 100) / 100,
      EUR: Math.round((1 / rates.EUR) * 100) / 100,
      fetchedAt: Date.now(),
      available: true,
    }

    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate' },
    })
  } catch {
    return NextResponse.json({ ...FALLBACK, available: false })
  }
}
