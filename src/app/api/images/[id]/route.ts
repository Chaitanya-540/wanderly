import { NextRequest, NextResponse } from 'next/server'
import { resolveImages } from '@/services/imageResolver'
import { ATTRACTIONS } from '@/data/attractions'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const attraction = ATTRACTIONS.find((a) => a.id === params.id)
  if (!attraction) {
    return NextResponse.json({ error: 'Attraction not found' }, { status: 404 })
  }
  const manifest = await resolveImages(attraction.id, attraction.name)
  return NextResponse.json(manifest, {
    headers: { 'Cache-Control': 's-maxage=86400, stale-while-revalidate' },
  })
}
