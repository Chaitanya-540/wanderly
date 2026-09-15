export interface ImageRecord {
  sourceUrl: string
  thumbnailUrl: string
  authorName: string
  licenseName: string
  attributionUrl: string
  source: 'wikimedia' | 'unsplash' | 'pexels'
  relevanceScore: number
}

export interface ImageManifest {
  attractionId: string
  images: ImageRecord[]
  insufficientImages: boolean
  cachedAt: number
}

// Raw candidate from API adapters (before scoring/validation)
export interface RawImageCandidate {
  sourceUrl: string
  thumbnailUrl: string
  authorName: string
  licenseName: string
  attributionUrl: string
  source: 'wikimedia' | 'unsplash' | 'pexels'
  title?: string
  description?: string
  tags?: string[]
  relevanceScore?: number
}
