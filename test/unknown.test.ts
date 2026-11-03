import { expect, it } from 'vitest'
import { and, or } from '../src/unknown.ts'

const cases: [boolean | null, boolean | null, boolean | null, boolean | null][] = [
  [true, true, true, true], [true, false, false, true], [true, null, null, true],
  [false, true, false, true], [false, false, false, false], [false, null, false, null],
  [null, true, null, true], [null, false, false, null], [null, null, null, null],
]
it.each(cases)('PLAN KN-1: Kleene truth tables for %s and %s', (a, b, conjunction, disjunction) => {
  expect(and([a, b])).toBe(conjunction)
  expect(or([a, b])).toBe(disjunction)
})
it('PLAN KN-1: fold identities and dominant values across multiple inputs', () => {
  expect(and([])).toBe(true)
  expect(or([])).toBe(false)
  expect(and([true, null, false])).toBe(false)
  expect(or([false, null, true])).toBe(true)
})
