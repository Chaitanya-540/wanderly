/**
 * Screen-space bounding rectangle for a state label.
 * Coordinates are in normalised device coordinates (NDC) or pixel space.
 */
export interface LabelRect {
  id: string      // State identifier
  priority: number // Higher = more important, kept first on collision
  x: number       // Left edge
  y: number       // Top edge
  w: number       // Width
  h: number       // Height
}

/**
 * Check if two rectangles overlap.
 */
function rectsOverlap(a: LabelRect, b: LabelRect): boolean {
  // No overlap if one is entirely to the left, right, above, or below the other
  return !(
    a.x + a.w < b.x ||
    b.x + b.w < a.x ||
    a.y + a.h < b.y ||
    b.y + b.h < a.y
  )
}

/**
 * Resolve label collisions using a priority-ordered greedy algorithm.
 *
 * Approach:
 * 1. Sort all labels by priority descending (higher priority preserved first).
 * 2. Iterate through sorted labels.
 * 3. For each label, check if it overlaps any already-placed label.
 * 4. If no overlap: add to visible set and placed list.
 * 5. If overlap: skip (hide this label).
 *
 * This is O(n²) in the worst case, but state count is bounded (~36 states),
 * so this is entirely acceptable — no sweep-line optimisation needed.
 *
 * @param labels Array of label rectangles with priorities
 * @returns Set of IDs that should be visible (non-overlapping)
 */
export function resolveCollisions(labels: LabelRect[]): Set<string> {
  // Sort by priority descending — higher priority labels are placed first
  const sorted = [...labels].sort((a, b) => b.priority - a.priority)
  const visible = new Set<string>()
  const placed: LabelRect[] = []

  for (const label of sorted) {
    const overlapsExisting = placed.some((p) => rectsOverlap(label, p))
    if (!overlapsExisting) {
      visible.add(label.id)
      placed.push(label)
    }
  }

  return visible
}

/**
 * Add padding around a label rect (used to create visual breathing room).
 */
export function padRect(rect: LabelRect, padding: number): LabelRect {
  return {
    ...rect,
    x: rect.x - padding,
    y: rect.y - padding,
    w: rect.w + padding * 2,
    h: rect.h + padding * 2,
  }
}

/**
 * Compute the screen-space bounding rect of a label given its 3D projected
 * screen position and the estimated character-based dimensions.
 */
export function labelToRect(
  id: string,
  screenX: number,
  screenY: number,
  textLength: number,
  priority: number,
  charWidth = 7,
  lineHeight = 14,
): LabelRect {
  const w = textLength * charWidth
  const h = lineHeight
  return {
    id,
    priority,
    x: screenX - w / 2, // centre the label on the projected point
    y: screenY - h / 2,
    w,
    h,
  }
}
