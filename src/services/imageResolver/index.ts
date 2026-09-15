import type { ImageManifest, ImageRecord, RawImageCandidate } from '@/types/image'
import { fetchFromWikimedia } from './wikimedia'
import { fetchFromUnsplash } from './unsplash'
import { fetchFromPexels } from './pexels'
import { applyRelevanceFilter } from './relevanceFilter'
import { applyLicenseValidator } from './licenseValidator'

const MIN_IMAGES = 4

// ─── In-process 24h cache ─────────────────────────────────────────────────────

const cache = new Map<string, { manifest: ImageManifest; expiresAt: number }>()
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

// Global deduplication — no URL may appear in two different attractions' manifests
const assignedUrls = new Set<string>()

// ─── Pipeline ────────────────────────────────────────────────────────────────

/**
 * Resolve images for an attraction. Returns a cached manifest when fresh.
 */
export async function resolveImages(
  attractionId: string,
  attractionName: string,
): Promise<ImageManifest> {
  // Cache hit
  const cached = cache.get(attractionId)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.manifest
  }

  // Parallel fetch from all three sources
  const searchTerm = `${attractionName} India`
  const results = await Promise.allSettled([
    fetchFromWikimedia(searchTerm, 12),
    fetchFromUnsplash(searchTerm, 8),
    fetchFromPexels(searchTerm, 8),
  ])

  const allCandidates: RawImageCandidate[] = results.flatMap((r) =>
    r.status === 'fulfilled' ? r.value : [],
  )

  // Relevance filter
  const relevant = applyRelevanceFilter(allCandidates, attractionName)

  // License filter
  const licensed = applyLicenseValidator(relevant)

  // Cross-contamination deduplication
  const deduped = licensed.filter((c) => !assignedUrls.has(c.sourceUrl))

  // Convert to ImageRecord
  const images: ImageRecord[] = deduped.map((c) => ({
    sourceUrl: c.sourceUrl,
    thumbnailUrl: c.thumbnailUrl,
    authorName: c.authorName,
    licenseName: c.licenseName,
    attributionUrl: c.attributionUrl,
    source: c.source,
    relevanceScore: c.relevanceScore ?? 0,
  }))

  // Register URLs as assigned to prevent cross-contamination
  for (const img of images) {
    assignedUrls.add(img.sourceUrl)
  }

  const manifest: ImageManifest = {
    attractionId,
    images,
    insufficientImages: images.length < MIN_IMAGES,
    cachedAt: Date.now(),
  }

  // Store in cache
  cache.set(attractionId, { manifest, expiresAt: Date.now() + CACHE_TTL_MS })

  return manifest
}
