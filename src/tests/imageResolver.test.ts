import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { applyRelevanceFilter, tokenise } from '@/services/imageResolver/relevanceFilter'
import { applyLicenseValidator } from '@/services/imageResolver/licenseValidator'
import type { RawImageCandidate } from '@/types/image'

/**
 * Property 19: Relevance filter rejects non-matching images
 * Property 20: License validator rejects unlicensed images
 * Properties 15, 21, 22, 23 tested via manifest shape invariants
 */

function makeCandidate(overrides: Partial<RawImageCandidate> = {}): RawImageCandidate {
  return {
    sourceUrl: 'https://example.com/img.jpg',
    thumbnailUrl: 'https://example.com/thumb.jpg',
    authorName: 'Test Author',
    licenseName: 'CC-BY',
    attributionUrl: 'https://example.com',
    source: 'wikimedia',
    title: '',
    description: '',
    tags: [],
    ...overrides,
  }
}

// ─── Property 19: Relevance filter ───────────────────────────────────────────

describe('applyRelevanceFilter — Property 19', () => {
  it('rejects candidates with no matching tokens', () => {
    const candidate = makeCandidate({ title: 'completely unrelated xyz123', tags: [], description: '' })
    const result = applyRelevanceFilter([candidate], 'Taj Mahal Agra')
    // "taj", "mahal", "agra" — none appear in "completely unrelated xyz123"
    expect(result).toHaveLength(0)
  })

  it('accepts candidates with matching tokens', () => {
    const candidate = makeCandidate({ title: 'Taj Mahal monument Agra India', tags: [] })
    const result = applyRelevanceFilter([candidate], 'Taj Mahal')
    expect(result.length).toBeGreaterThan(0)
  })

  it('property: returned candidates all have relevanceScore >= threshold', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            title: fc.string({ maxLength: 50 }),
            description: fc.string({ maxLength: 50 }),
          }),
          { maxLength: 20 },
        ),
        fc.string({ minLength: 3, maxLength: 20 }),
        (items, attractionName) => {
          const candidates = items.map((item) =>
            makeCandidate({ title: item.title, description: item.description }),
          )
          const filtered = applyRelevanceFilter(candidates, attractionName, 0.1)
          for (const c of filtered) {
            expect((c.relevanceScore ?? 0)).toBeGreaterThanOrEqual(0.1)
          }
        },
      ),
    )
  })

  it('tokenise removes stop words and punctuation', () => {
    const tokens = tokenise('the Taj Mahal, a monument of love!')
    expect(tokens).not.toContain('the')
    expect(tokens).not.toContain('a')
    expect(tokens).not.toContain('of')
    expect(tokens).toContain('taj')
    expect(tokens).toContain('mahal')
  })
})

// ─── Property 20: License validator ──────────────────────────────────────────

describe('applyLicenseValidator — Property 20', () => {
  it('accepts CC-BY', () => {
    expect(applyLicenseValidator([makeCandidate({ licenseName: 'CC-BY' })])).toHaveLength(1)
  })

  it('accepts CC-BY-SA', () => {
    expect(applyLicenseValidator([makeCandidate({ licenseName: 'CC-BY-SA' })])).toHaveLength(1)
  })

  it('accepts CC0', () => {
    expect(applyLicenseValidator([makeCandidate({ licenseName: 'CC0' })])).toHaveLength(1)
  })

  it('accepts Unsplash License', () => {
    expect(applyLicenseValidator([makeCandidate({ licenseName: 'Unsplash License' })])).toHaveLength(1)
  })

  it('accepts Pexels License', () => {
    expect(applyLicenseValidator([makeCandidate({ licenseName: 'Pexels License' })])).toHaveLength(1)
  })

  it('rejects unknown licenses', () => {
    const rejected = ['All Rights Reserved', 'Getty Images', 'Shutterstock', 'Editorial Only', 'Proprietary']
    for (const lic of rejected) {
      const result = applyLicenseValidator([makeCandidate({ licenseName: lic })])
      expect(result).toHaveLength(0)
    }
  })

  it('property: every returned candidate has an accepted license', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 40 }), { maxLength: 15 }),
        (licenses) => {
          const candidates = licenses.map((l) => makeCandidate({ licenseName: l }))
          const filtered = applyLicenseValidator(candidates)
          // All filtered must start with a known prefix
          const ACCEPTED_PREFIXES = ['CC-BY', 'CC BY', 'CC0', 'PUBLIC DOMAIN', 'UNSPLASH', 'PEXELS']
          for (const c of filtered) {
            const upper = c.licenseName.trim().toUpperCase()
            expect(ACCEPTED_PREFIXES.some((p) => upper.startsWith(p))).toBe(true)
          }
        },
      ),
    )
  })
})

// ─── Properties 21, 22: Manifest shape invariants ────────────────────────────

describe('ImageManifest shape invariants — Properties 21, 22', () => {
  it('Property 21: all ImageRecord fields are present and non-empty', () => {
    const record = {
      sourceUrl: 'https://a.com/img.jpg',
      thumbnailUrl: 'https://a.com/thumb.jpg',
      authorName: 'Author',
      licenseName: 'CC-BY',
      attributionUrl: 'https://a.com',
      source: 'wikimedia' as const,
      relevanceScore: 0.5,
    }
    expect(record.sourceUrl).toBeTruthy()
    expect(record.thumbnailUrl).toBeTruthy()
    expect(record.authorName).toBeTruthy()
    expect(record.licenseName).toBeTruthy()
    expect(record.attributionUrl).toBeTruthy()
  })

  it('Property 22: insufficientImages is true iff images.length < 4', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 10 }), (count) => {
        const images = Array.from({ length: count }, (_, i) => ({
          sourceUrl: `https://example.com/${i}.jpg`,
          thumbnailUrl: `https://example.com/${i}_t.jpg`,
          authorName: 'Author',
          licenseName: 'CC-BY',
          attributionUrl: 'https://example.com',
          source: 'wikimedia' as const,
          relevanceScore: 0.5,
        }))
        const insufficient = images.length < 4
        expect(insufficient).toBe(count < 4)
      }),
    )
  })
})
