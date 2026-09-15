import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { resolveCollisions } from '@/utils/collision'
import type { LabelRect } from '@/utils/collision'

/**
 * Property 3: State label collision invariant
 * No two visible labels may overlap.
 */

function rectsOverlap(a: LabelRect, b: LabelRect): boolean {
  return !(a.x + a.w < b.x || b.x + b.w < a.x || a.y + a.h < b.y || b.y + b.h < a.y)
}

const rectArb = fc.record<LabelRect>({
  id: fc.uuid(),
  x: fc.float({ min: 0, max: 100 }),
  y: fc.float({ min: 0, max: 100 }),
  w: fc.float({ min: 1, max: 20 }),
  h: fc.float({ min: 1, max: 10 }),
  priority: fc.integer({ min: 1, max: 10 }),
})

describe('resolveCollisions — Property 3: no two visible labels overlap', () => {
  it('no two visible label rects overlap', () => {
    fc.assert(
      fc.property(fc.array(rectArb, { minLength: 1, maxLength: 40 }), (labels) => {
        const visible = resolveCollisions(labels)
        const visibleLabels = labels.filter((l) => visible.has(l.id))
        for (let i = 0; i < visibleLabels.length; i++) {
          for (let j = i + 1; j < visibleLabels.length; j++) {
            expect(rectsOverlap(visibleLabels[i], visibleLabels[j])).toBe(false)
          }
        }
      }),
    )
  })

  it('visible set is a subset of the input', () => {
    fc.assert(
      fc.property(fc.array(rectArb, { maxLength: 20 }), (labels) => {
        const ids = new Set(labels.map((l) => l.id))
        const visible = resolveCollisions(labels)
        for (const id of visible) {
          expect(ids.has(id)).toBe(true)
        }
      }),
    )
  })

  it('higher priority labels are preferred over lower priority on collision', () => {
    // Two heavily overlapping rects: one high priority, one low
    const high: LabelRect = { id: 'high', x: 0, y: 0, w: 10, h: 5, priority: 10 }
    const low: LabelRect = { id: 'low', x: 1, y: 1, w: 10, h: 5, priority: 1 }
    const visible = resolveCollisions([low, high])
    expect(visible.has('high')).toBe(true)
    expect(visible.has('low')).toBe(false)
  })

  it('non-overlapping rects are all visible', () => {
    const rects: LabelRect[] = [
      { id: 'a', x: 0, y: 0, w: 5, h: 5, priority: 1 },
      { id: 'b', x: 10, y: 0, w: 5, h: 5, priority: 1 },
      { id: 'c', x: 20, y: 0, w: 5, h: 5, priority: 1 },
    ]
    const visible = resolveCollisions(rects)
    expect(visible.size).toBe(3)
  })
})
