import { expect, it } from 'vitest'
import { bassCurve } from '../src/index.ts'
import type { Param } from '../src/index.ts'

/** fixture: pooled averages attributed to Sultan, Farley & Lehmann 1990 / Mahajan, Muller & Bass 1995 via secondary pages (research/ADOPTION-INVENTION.md lines 64-79); numerical verification only, not a calibration */
const fixtureP: Param = {
  value: 0.03,
  label: 'fiction',
  sources: ['research/ADOPTION-INVENTION.md:64-79'],
  note: 'fixture p per year; secondary pooled averages, not calibration',
}
/** fixture: same attribution as fixtureP */
const fixtureQ: Param = {
  value: 0.38,
  label: 'fiction',
  sources: ['research/ADOPTION-INVENTION.md:64-79'],
  note: 'fixture q per year; secondary pooled averages, not calibration',
}

/** fixture: M = 1000 producers (counts), constant ceiling for CP-1 */
const fixtureM = 1000

/** Bass 1969 closed form for A(0) = 0, constant M; p, q per year; t in years */
function bassClosedAtZero(M: number, p: number, q: number, t: number): number {
  if (t === 0) return 0
  const decay = Math.exp(-(p + q) * t)
  return (M * (1 - decay)) / (1 + (q / p) * decay)
}

function eulerAt(M: number, p: Param, q: Param, dt: number, tYears: number): number {
  const steps = Math.round(tYears / dt)
  expect(steps * dt).toBeCloseTo(tYears, 10)
  const curve = bassCurve(0, M, p, q, dt, steps)
  return curve[steps]
}

it('PLAN §3.6: at t = 10 years Euler error vs closed form shrinks when dt is halved (0.6 is numerical-test tolerance, not a model constant)', () => {
  const p = fixtureP.value!, q = fixtureQ.value!
  const tYears = 10
  const exact = bassClosedAtZero(fixtureM, p, q, tYears)
  const dts = [0.1, 0.05, 0.025, 0.0125]
  let previousError = Infinity
  for (const dt of dts) {
    const euler = eulerAt(fixtureM, fixtureP, fixtureQ, dt, tYears)
    const error = Math.abs(euler - exact)
    if (Number.isFinite(previousError)) {
      expect(error).toBeLessThanOrEqual(0.6 * previousError)
    }
    previousError = error
  }
})

it('PLAN §3.6: forward Euler Bass curve never exceeds M and never decreases at constant M', () => {
  const dt = 0.05
  const curve = bassCurve(0, fixtureM, fixtureP, fixtureQ, dt, Math.round(40 / dt))
  for (let i = 0; i < curve.length; i++) {
    expect(curve[i]).toBeLessThanOrEqual(fixtureM)
    if (i > 0) expect(curve[i]).toBeGreaterThanOrEqual(curve[i - 1])
  }
})

it('PLAN §3.6: with p = 0 and A(0) = 0 the curve stays 0 (Bass alone cannot start)', () => {
  const zeroP: Param = { value: 0, label: 'fiction', sources: [] }
  const curve = bassCurve(0, fixtureM, zeroP, fixtureQ, 0.1, 100)
  expect(curve.every(a => a === 0)).toBe(true)
})

it('PLAN §3.6: with p = 0 and A(0) = 1 adoption rises by imitation only', () => {
  const zeroP: Param = { value: 0, label: 'fiction', sources: [] }
  const curve = bassCurve(1, fixtureM, zeroP, fixtureQ, 0.1, 50)
  expect(curve[0]).toBe(1)
  expect(curve[curve.length - 1]).toBeGreaterThan(1)
})
