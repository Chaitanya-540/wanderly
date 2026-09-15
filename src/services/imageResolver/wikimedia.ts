import type { RawImageCandidate } from '@/types/image'

const WIKIMEDIA_API = 'https://commons.wikimedia.org/w/api.php'
const USER_AGENT = process.env.WIKIMEDIA_USER_AGENT ?? 'Bharat3D/1.0 (bharat3d@example.com)'

interface WikiPage {
  title: string
  imageinfo?: Array<{
    url: string
    thumburl?: string
    extmetadata?: {
      Artist?: { value: string }
      LicenseShortName?: { value: string }
      DescriptionURL?: { value: string }
      ImageDescription?: { value: string }
      Categories?: { value: string }
    }
  }>
}

/**
 * Fetch image candidates from Wikimedia Commons for a given search term.
 */
export async function fetchFromWikimedia(
  searchTerm: string,
  limit = 10,
): Promise<RawImageCandidate[]> {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrnamespace: '6', // File namespace
    gsrsearch: searchTerm,
    gsrlimit: String(limit),
    prop: 'imageinfo',
    iiprop: 'url|extmetadata',
    iiurlwidth: '800',
    format: 'json',
    origin: '*',
  })

  const res = await fetch(`${WIKIMEDIA_API}?${params}`, {
    headers: { 'User-Agent': USER_AGENT },
    next: { revalidate: 86400 },
  })

  if (!res.ok) return []

  const data = (await res.json()) as { query?: { pages?: Record<string, WikiPage> } }
  const pages = Object.values(data.query?.pages ?? {})

  return pages.flatMap((page): RawImageCandidate[] => {
    const info = page.imageinfo?.[0]
    if (!info?.url) return []
    const meta = info.extmetadata ?? {}
    const license = meta.LicenseShortName?.value ?? ''
    if (!license) return []

    return [
      {
        sourceUrl: info.url,
        thumbnailUrl: info.thumburl ?? info.url,
        authorName: meta.Artist?.value?.replace(/<[^>]*>/g, '') ?? 'Unknown',
        licenseName: license,
        attributionUrl: meta.DescriptionURL?.value ?? info.url,
        source: 'wikimedia',
        title: page.title.replace('File:', ''),
        description: meta.ImageDescription?.value?.replace(/<[^>]*>/g, '') ?? '',
        tags: meta.Categories?.value?.split('|') ?? [],
      },
    ]
  })
}
