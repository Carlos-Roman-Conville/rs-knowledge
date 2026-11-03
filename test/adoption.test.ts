import { expect, it } from 'vitest'
import { adopters, bassCurve, bassStep } from '../src/index.ts'
import type { AdopterInputs, Param } from '../src/index.ts'
import { fiction } from './records.ts'

// Declared Economy/reach input stub; all numbers and states are fiction, not calibration.
const inputsStub: AdopterInputs = {
  state: {
    society: 'fiction-society', technique: 'fiction-technique', possible: true, unknowns: [],
    availability: false, invented: true, adopted: false, deployed: null,
  },
  producers: 10, costAdvantage: 2, inReach: true,
}
const p = fiction(0.03), q = fiction(0.38)
const open: Param = { value: null, label: 'open', sources: [] }

it('DESIGN §1.6: one Bass step uses both supplied rates and the current adopter share', () => {
  expect(bassStep(2, 10, fiction(0.1), fiction(0.5), 0.25)).toBeCloseTo(2.4)
  expect(bassStep(2, 10, fiction(0.2), fiction(0.5), 0.25)).toBeCloseTo(2.6)
  expect(bassStep(2, 10, fiction(0.1), fiction(1), 0.25)).toBeCloseTo(2.6)
  expect(bassStep(2, 10, fiction(0), fiction(0), 1)).toBe(2)
  expect(bassStep(0, 10, fiction(2), fiction(3), 0.01)).toBeCloseTo(0.2)
})

it.each([0, 2])('DESIGN §4: Bass curve from fictional A0=%s matches closed form within 1e-3', A0 => {
  const M = 10, external = 0.03, imitation = 0.38, dt = 0.0001
  const curve = bassCurve(A0, M, p, q, dt, 400000)
  // Integration of dF/((p+qF)(1-F)) gives (p+qF)/(1-F) = C*exp((p+q)t).
  const C = (external + imitation * A0 / M) / (1 - A0 / M)
  let maxError = 0
  for (let i = 0; i < curve.length; i++) {
    const decay = Math.exp(-(external + imitation) * i * dt)
    const exact = M * (C - external * decay) / (C + imitation * decay)
    maxError = Math.max(maxError, Math.abs(curve[i] - exact))
  }
  expect(maxError).toBeLessThan(1e-3)
})

it('DESIGN §1.6: fictional imitation-dominated adoption has increments rising then falling', () => {
  const curve = bassCurve(0, 10, p, q, 0.05, 800)
  const increments = curve.slice(1).map((value, i) => value - curve[i])
  const peak = increments.indexOf(Math.max(...increments))
  expect(peak).toBeGreaterThan(0)
  expect(peak).toBeLessThan(increments.length - 1)
  for (let i = 1; i < increments.length; i++) {
    expect(increments[i]).toBeGreaterThanOrEqual(0)
    if (i <= peak) expect(increments[i]).toBeGreaterThan(increments[i - 1])
    else expect(increments[i]).toBeLessThan(increments[i - 1])
  }
})

it('DESIGN §1.6 and §0 invariant 6: M requires positive advantage, possibility, invention and reach', () => {
  expect(adopters(inputsStub)).toBe(10)
  expect(adopters({ ...inputsStub, producers: 0.5 })).toBe(0.5)
  expect(adopters({ ...inputsStub, producers: 0 })).toBe(0)
  for (const costAdvantage of [0, -1]) expect(adopters({ ...inputsStub, costAdvantage })).toBe(0)
  for (const inReach of [false, null]) expect(adopters({ ...inputsStub, inReach })).toBe(0)
  for (const possible of [false, null]) {
    expect(adopters({ ...inputsStub, state: { ...inputsStub.state, possible } })).toBe(0)
  }
  expect(adopters({ ...inputsStub, state: { ...inputsStub.state, availability: true, invented: false } })).toBe(0)
})

it('DESIGN §1.6: shrinking M clamps adoption, including abandonment when advantage reverses', () => {
  const A = bassStep(2, adopters(inputsStub), p, q, 1)
  expect(A).toBeGreaterThan(2)
  expect(bassStep(A, adopters({ ...inputsStub, producers: 1 }), open, open, 1)).toBe(1)
  const M = adopters({ ...inputsStub, costAdvantage: -1 })
  expect(bassStep(A, M, open, open, 1)).toBe(0)
  expect(bassCurve(A, M, open, open, 1, 2)).toEqual([0, 0, 0])
})

it('DESIGN §1.6: finite initial counts and Euler overshoot are clamped to [0, M]', () => {
  expect(bassStep(-2, 10, p, open, 0)).toBe(0)
  expect(bassStep(12, 10, open, open, 0)).toBe(10)
  expect(bassStep(-2, 10, fiction(0.1), open, 1)).toBe(1)
  expect(bassStep(2, 10, p, q, 1000)).toBe(10)
})

it('rule 8: unresolved active Bass terms name adoption.p and adoption.q', () => {
  expect(() => bassStep(0, 10, open, q, 1)).toThrow('adoption.p')
  expect(() => bassStep(2, 10, p, open, 1)).toThrow('adoption.q')
  expect(() => bassCurve(0, 10, p, open, 1, 2)).toThrow('adoption.q')
  expect(bassStep(0, 10, p, open, 1)).toBeCloseTo(0.3)
  expect(bassStep(0, 10, fiction(0), open, 1)).toBe(0)
  expect(bassStep(2, 10, open, open, 0)).toBe(2)
  expect(bassStep(10, 10, open, open, 1)).toBe(10)
  expect(bassCurve(2, 10, open, open, 1, 0)).toEqual([2])
})

it.each([-1, NaN, Infinity, -Infinity])('DESIGN §1.6: invalid nonnegative input %s throws by name', bad => {
  expect(() => bassStep(2, bad, p, q, 1)).toThrow('M')
  expect(() => bassStep(2, 10, p, q, bad)).toThrow('dt')
  expect(() => bassCurve(2, bad, open, open, 1, 0)).toThrow('M')
  expect(() => bassCurve(2, 10, open, open, bad, 0)).toThrow('dt')
  expect(() => bassStep(2, 10, fiction(bad), q, 1)).toThrow('adoption.p')
  expect(() => bassStep(2, 10, p, fiction(bad), 1)).toThrow('adoption.q')
  expect(() => adopters({ ...inputsStub, producers: bad })).toThrow('producers')
})

it.each([NaN, Infinity, -Infinity])('DESIGN §1.6: nonfinite count or advantage %s throws', bad => {
  expect(() => bassStep(bad, 10, p, q, 1)).toThrow('A')
  expect(() => bassCurve(bad, 10, p, q, 1, 0)).toThrow('A')
  expect(() => adopters({ ...inputsStub, costAdvantage: bad })).toThrow('costAdvantage')
})

it.each([-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])('DESIGN §1.6: invalid step count %s throws', steps => {
  expect(() => bassCurve(0, 10, p, q, 1, steps)).toThrow('steps')
})

it('DESIGN §0 and rule 7: curve includes the initial count, replays deterministically and is pure', () => {
  const inputs = Object.freeze({ ...inputsStub, state: Object.freeze({ ...inputsStub.state }) })
  const external = Object.freeze({ ...p }), imitation = Object.freeze({ ...q })
  const before = JSON.stringify({ inputs, external, imitation })
  const M = adopters(inputs)
  const curve = bassCurve(2, M, external, imitation, 0.1, 20)
  expect(curve).toHaveLength(21)
  expect(curve[0]).toBe(2)
  expect(curve[1]).toBe(bassStep(2, M, external, imitation, 0.1))
  expect(bassCurve(2, M, external, imitation, 0.1, 20)).toEqual(curve)
  curve[0] = -1
  expect(bassCurve(2, M, external, imitation, 0.1, 20)[0]).toBe(2)
  expect(JSON.stringify({ inputs, external, imitation })).toBe(before)
})
