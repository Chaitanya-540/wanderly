import type { RawImageCandidate } from '@/types/image'

const ACCEPTED_LICENSES = new Set([
  'CC-BY',
  'CC BY',
  'CC-BY-SA',
  'CC BY-SA',
  'CC0',
  'CC0 1.0',
  'Public Domain',
  'Unsplash License',
  'Pexels License',
])

function isAccepted(licenseName: string): boolean {
  const normalised = licenseName.trim().toUpperCase()
  for (const accepted of ACCEPTED_LICENSES) {
    if (normalised.startsWith(accepted.toUpperCase())) return true
  }
  return false
}

/**
 * Filter candidates to those with an accepted open/free license.
 */
export function applyLicenseValidator(
  candidates: RawImageCandidate[],
): RawImageCandidate[] {
  return candidates.filter((c) => isAccepted(c.licenseName))
}
