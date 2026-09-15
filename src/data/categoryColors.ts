import type { AttractionCategory } from '@/types/attraction'

// One distinct emissive hex colour per category — used for 3D marker glow
// Palette follows cinematic nighttime aesthetic: warm for cultural, cool for nature
export const CATEGORY_COLORS: Record<AttractionCategory, string> = {
  Temple: '#c084fc',      // violet — spiritual/religious
  Fort: '#f59e0b',        // amber — heritage/historical
  Beach: '#38bdf8',       // sky blue — coastal
  Wildlife: '#4ade80',    // green — nature
  Mountain: '#34d399',    // emerald — nature/adventure
  Lake: '#22d3ee',        // cyan — water
  Museum: '#fb923c',      // orange — cultural/educational
  City: '#fbbf24',        // gold — urban/culture
  Waterfall: '#67e8f9',   // light cyan — water/nature
  Heritage: '#f97316',    // deep orange — heritage
}

// Three.js-compatible colour as a number (0xRRGGBB)
export function categoryColorHex(category: AttractionCategory): number {
  const hex = CATEGORY_COLORS[category].replace('#', '')
  return parseInt(hex, 16)
}
