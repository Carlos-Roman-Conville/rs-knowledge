import { expect, it } from 'vitest'
import { criticalSize, EULER_GAMMA, expectedSkillChange } from '../src/index.ts'
import type { Param } from '../src/index.ts'
import { fiction } from './records.ts'

it('DESIGN §1.2 Henrich change crosses zero at the analytic critical size', () => {
  const alpha = fiction(2), beta = fiction(0.5)
  const critical = criticalSize(alpha, beta)
  expect(Math.abs(expectedSkillChange(alpha, beta, critical))).toBeLessThan(1e-12)
  expect(expectedSkillChange(alpha, beta, critical / 2)).toBeLessThan(0)
  expect(expectedSkillChange(alpha, beta, critical * 2)).toBeGreaterThan(0)
  expect(critical).toBe(Math.exp(4 - EULER_GAMMA))
  expect(expectedSkillChange(alpha, beta, 1)).toBe(-2 + 0.5 * EULER_GAMMA)
})

it.each([expectedSkillChange, criticalSize])('rule 8: %s names unresolved copying-loss parameters', mechanism => {
  const open: Param = { value: null, label: 'open', sources: [] }
  expect(() => mechanism(open, fiction(1), 2)).toThrow('copyingLoss.alpha')
  expect(() => mechanism(fiction(1), open, 2)).toThrow('copyingLoss.beta')
})

it.each([0, -1, 0.999, NaN, Infinity])('DESIGN §1.2 rejects invalid effective population %s', nEff => {
  expect(() => expectedSkillChange(fiction(1), fiction(1), nEff)).toThrow(/nEff/)
})
