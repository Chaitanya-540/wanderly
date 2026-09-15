/**
 * Clean SVG icons for each AttractionCategory.
 * Used everywhere a category emoji placeholder used to appear.
 * All icons are single-color, take currentColor from their parent.
 */

import type { AttractionCategory } from '@/types/attraction'

interface CategoryIconProps {
  category: AttractionCategory
  size?: number
  color?: string
  className?: string
}

// Each icon is a minimal SVG path at 24×24 viewBox
const PATHS: Record<AttractionCategory, JSX.Element> = {
  Temple: (
    <g fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3L6 8h12L12 3z" />
      <rect x="7" y="8" width="10" height="12" />
      <line x1="12" y1="8" x2="12" y2="20" />
      <line x1="7" y1="14" x2="17" y2="14" />
    </g>
  ),
  Fort: (
    <g fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" />
      <path d="M3 11V7h3V4h2v3h4V4h2v3h3v4" />
    </g>
  ),
  Beach: (
    <g fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 20c3-4 6-6 9-6s6 2 9 6" />
      <circle cx="17" cy="7" r="3" />
      <line x1="12" y1="20" x2="12" y2="14" />
      <line x1="7" y1="10" x2="17" y2="7" />
    </g>
  ),
  Wildlife: (
    <g fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M7 7C5 5 3 4 2 5s0 3 2 5M17 7c2-2 4-3 5-2s0 3-2 5M7 17c-2 2-4 3-5 2s0-3 2-5M17 17c2 2 4 3 5 2s0-3-2-5" />
    </g>
  ),
  Mountain: (
    <g fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3,20 9,8 13,14 16,10 21,20" />
      <line x1="3" y1="20" x2="21" y2="20" />
    </g>
  ),
  Lake: (
    <g fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="14" rx="8" ry="4" />
      <path d="M8 14c0-4 2-8 4-10 2 2 4 6 4 10" />
      <path d="M4 18c1-1 2-1 3 0s2 1 3 0 2-1 3 0 2 1 3 0" />
    </g>
  ),
  Museum: (
    <g fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="10" width="18" height="11" />
      <polyline points="3,10 12,4 21,10" />
      <line x1="3" y1="21" x2="21" y2="21" />
      <line x1="9" y1="10" x2="9" y2="21" />
      <line x1="15" y1="10" x2="15" y2="21" />
    </g>
  ),
  City: (
    <g fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="9" width="7" height="12" />
      <rect x="10" y="5" width="8" height="16" />
      <line x1="3" y1="21" x2="21" y2="21" />
      <rect x="12" y="13" width="2" height="4" />
      <rect x="16" y="13" width="2" height="4" />
      <rect x="12" y="8" width="2" height="3" />
      <rect x="16" y="8" width="2" height="3" />
    </g>
  ),
  Waterfall: (
    <g fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3v6c0 2 2 4 4 4s4-2 4-4V3" />
      <path d="M8 9c0 4-3 7-3 10" />
      <path d="M16 9c0 4 3 7 3 10" />
      <path d="M5 19c2-1 4-1 7 0 3-1 5-1 7 0" />
    </g>
  ),
  Heritage: (
    <g fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18" />
      <path d="M5 21V10l7-7 7 7v11" />
      <rect x="9" y="14" width="6" height="7" />
      <path d="M9 10h6" />
    </g>
  ),
}

export default function CategoryIcon({ category, size = 24, color, className }: CategoryIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ color: color ?? 'currentColor', display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
    >
      {PATHS[category]}
    </svg>
  )
}
