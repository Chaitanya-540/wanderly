import type { RawImageCandidate } from '@/types/image'

const UNSPLASH_API = 'https://api.unsplash.com'

interface UnsplashPhoto {
  id: string
  urls: { regular: string; thumb: string }
  user: { name: string; links: { html: string } }
  description: string | null
  alt_description: string | null
  tags?: Array<{ title: string }>
  links: { html: string }
}

/**
 * Server-only: Fetch image candidates from Unsplash.
 * Requires UNSPLASH_ACCESS_KEY in process.env.
 */
export async function fetchFromUnsplash(
  searchTerm: string,
  limit = 10,
): Promise<RawImageCandidate[]> {
  const key = process.env.UNSPLASH_ACCESS_KEY
  if (!key) return []

  const params = new URLSearchParams({
    query: searchTerm,
    per_page: String(limit),
    orientation: 'landscape',
  })

  const res = await fetch(`${UNSPLASH_API}/search/photos?${params}`, {
    headers: { Authorization: `Client-ID ${key}` },
    next: { revalidate: 86400 },
  })

  if (!res.ok) return []

  const data = (await res.json()) as { results: UnsplashPhoto[] }

  return data.results.map((photo): RawImageCandidate => ({
    sourceUrl: photo.urls.regular,
    thumbnailUrl: photo.urls.thumb,
    authorName: photo.user.name,
    licenseName: 'Unsplash License',
    attributionUrl: `${photo.links.html}?utm_source=bharat3d&utm_medium=referral`,
    source: 'unsplash',
    title: photo.alt_description ?? photo.description ?? searchTerm,
    description: photo.description ?? '',
    tags: photo.tags?.map((t) => t.title) ?? [],
  }))
}
