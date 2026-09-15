import type { RawImageCandidate } from '@/types/image'

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'of', 'in', 'at', 'on', 'and', 'or', 'for', 'to', 'is',
])

/**
 * Tokenise a string into lowercase alpha-only tokens, removing stop words.
 */
export function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t))
}

/**
 * Score a candidate image against a set of query tokens.
 * Returns a value in [0, 1] — higher means more relevant.
 */
function scoreCandidate(candidate: RawImageCandidate, queryTokens: string[]): number {
  if (queryTokens.length === 0) return 1

  const haystack = [
    candidate.title ?? '',
    candidate.description ?? '',
    ...(candidate.tags ?? []),
  ]
    .join(' ')
    .toLowerCase()

  let hits = 0
  for (const token of queryTokens) {
    if (haystack.includes(token)) hits++
  }
  return hits / queryTokens.length
}

/**
 * Filter candidates to those with relevanceScore >= 0.1.
 * Attaches the computed score to each passing candidate.
 */
export function applyRelevanceFilter(
  candidates: RawImageCandidate[],
  attractionName: string,
  threshold = 0.1,
): RawImageCandidate[] {
  const queryTokens = tokenise(attractionName)
  return candidates
    .map((c) => ({ ...c, relevanceScore: scoreCandidate(c, queryTokens) }))
    .filter((c) => (c.relevanceScore ?? 0) >= threshold)
}
