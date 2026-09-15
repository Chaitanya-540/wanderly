import type { RawImageCandidate } from '@/types/image'

const PEXELS_API = 'https://api.pexels.com/v1'

interface PexelsPhoto {
  id: number
  src: { large: string; medium: string }
  photographer: string
  photographer_url: string
  alt: string | null
  url: string
}

interface PexelsResponse {
  photos: PexelsPhoto[]
}

/**
 * Server-only: Fetch image candidates from Pexels.
 * Requires PEXELS_API_KEY in process.env.
 */
export async function fetchFromPexels(
  searchTerm: string,
  limit = 10,
): Promise<RawImageCandidate[]> {
  const key = process.env.PEXELS_API_KEY
  if (!key) return []

  const params = new URLSearchParams({
    query: searchTerm,
    per_page: String(limit),
    orientation: 'landscape',
  })

  const res = await fetch(`${PEXELS_API}/search?${params}`, {
    headers: { Authorization: key },
    next: { revalidate: 86400 },
  })

  if (!res.ok) return []

  const data = (await res.json()) as PexelsResponse

  return data.photos.map((photo): RawImageCandidate => ({
    sourceUrl: photo.src.large,
    thumbnailUrl: photo.src.medium,
    authorName: photo.photographer,
    licenseName: 'Pexels License',
    attributionUrl: photo.url,
    source: 'pexels',
    title: photo.alt ?? searchTerm,
    description: photo.alt ?? '',
    tags: [],
  }))
}
