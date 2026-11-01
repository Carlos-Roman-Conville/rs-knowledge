import { expect, it } from 'vitest'
import { inventionHazard } from '../src/index.ts'
import type { CapabilityState, Param } from '../src/index.ts'
import { fiction } from './records.ts'

// All ids, states, hours and parameter values are fictional aggregate fixtures.
const state: CapabilityState = {
  society: 'fiction-society', technique: 'fiction-technique', possible: true,
  known: false, invented: false, adopted: false, deployed: null,
}
const open: Param = { value: null, label: 'open', sources: [] }

it('DESIGN §1.5: invention is E*q per year without requiring known or deriving capability', () => {
  expect(inventionHazard(state, 80, fiction(0.025))).toBe(2)
  expect(inventionHazard({ ...state, known: true, adopted: true, deployed: 1 }, 80, fiction(0.025))).toBe(2)
  expect(inventionHazard(state, 80, fiction(0))).toBe(0)
  expect(inventionHazard(state, 0.5, fiction(1))).toBe(0.5)
})

it('DESIGN §1.5: impossible, unknown possibility, invented, off and no trial hours skip q', () => {
  for (const possible of [false, null]) {
    expect(inventionHazard({ ...state, possible }, 80, open)).toBe(0)
  }
  expect(inventionHazard({ ...state, invented: true }, 80, open)).toBe(0)
  expect(inventionHazard(state, 80, open, true)).toBe(0)
  expect(inventionHazard(state, 0, open)).toBe(0)
})

it('rule 8: active invention refuses an unresolved invention.q', () => {
  expect(() => inventionHazard(state, 80, open)).toThrow('invention.q')
})

it.each([-1, NaN, Infinity, -Infinity])('DESIGN §1.5: rejects invalid trial hours %s even when off', bad => {
  expect(() => inventionHazard(state, bad, fiction(0.1))).toThrow('experimentHours')
  expect(() => inventionHazard(state, bad, open, true)).toThrow('experimentHours')
})

it.each([-0.1, 1.1, NaN, Infinity, -Infinity])('DESIGN §1.5: rejects invalid active probability %s', bad => {
  expect(() => inventionHazard(state, 80, fiction(bad))).toThrow('invention.q')
})

it('DESIGN §0 and rule 7: invention is deterministic and leaves its inputs untouched', () => {
  const snapshot = Object.freeze({ ...state })
  const q = Object.freeze(fiction(0.025))
  const before = JSON.stringify({ snapshot, q })
  expect(inventionHazard(snapshot, 80, q)).toBe(inventionHazard(snapshot, 80, q))
  expect(JSON.stringify({ snapshot, q })).toBe(before)
})
