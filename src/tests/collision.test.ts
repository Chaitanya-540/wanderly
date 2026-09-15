import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { resolveCollisions, type LabelRect } from '@/utils/collision'

// Arbitrary label rect generator (non-overlapping is not guaranteed)
const labelRectArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  priority: fc.integer({ min: 0, max: 100 }),
  x: fc.float({ min: 0, max: 900 }),
  y: fc.float({ min: 0, max: 600 }),
  w: fc.float({ min: 20, max: 120 }),
  h: fc.float({ min: 10, max: 30 }),
})

function rectsOverlap(a: LabelRect, b: LabelRect): boolean {
  return !(
    a.x + a.w < b.x ||
    b.x + b.w < a.x ||
    a.y + a.h < b.y ||
    b.y + b.h < a.y
  )
}

describe('resolveCollisions — Property 3: State label collision invariant', () => {
  it('visible labels never overlap each other', () => {
    fc.assert(
      fc.property(
        fc.array(labelRectArb, { minLength: 0, maxLength: 40 }),
        (labels) => {
          // Ensure unique IDs
          const uniqueLabels = labels.map((l, i) => ({ ...l, id: `label-${i}` }))
          const visible = resolveCollisions(uniqueLabels)
          const visibleLabels = uniqueLabels.filter((l) => visible.has(l.id))

          // Check no two visible labels overlap
          for (let i = 0; i < visibleLabels.length; i++) {
            for (let j = i + 1; j < visibleLabels.length; j++) {
              const overlaps = rectsOverlap(visibleLabels[i], visibleLabels[j])
              expect(overlaps).toBe(false)
            }
          }
        },
      ),
    )
  })

  it('visible set is a subset of input labels', () => {
    fc.assert(
      fc.property(
        fc.array(labelRectArb, { minLength: 0, maxLength: 40 }),
        (labels) => {
          const uniqueLabels = labels.map((l, i) => ({ ...l, id: `label-${i}` }))
          const visible = resolveCollisions(uniqueLabels)
          const inputIds = new Set(uniqueLabels.map((l) => l.id))
          for (const id of visible) {
            expect(inputIds.has(id)).toBe(true)
          }
        },
      ),
    )
  })

  it('higher-priority label wins when two labels overlap', () => {
    // Two overlapping labels: high priority should always win
    const highPriority: LabelRect = { id: 'high', priority: 100, x: 100, y: 100, w: 80, h: 20 }
    const lowPriority: LabelRect = { id: 'low', priority: 10, x: 110, y: 105, w: 80, h: 20 }

    const visible = resolveCollisions([lowPriority, highPriority])
    expect(visible.has('high')).toBe(true)
    expect(visible.has('low')).toBe(false)
  })

  it('single label is always visible', () => {
    fc.assert(
      fc.property(labelRectArb, (label) => {
        const visible = resolveCollisions([label])
        expect(visible.has(label.id)).toBe(true)
      }),
    )
  })

  it('empty input returns empty visible set', () => {
    expect(resolveCollisions([])).toEqual(new Set())
  })
})
