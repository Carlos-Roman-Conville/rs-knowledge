import { expect, it } from 'vitest'
import { availableMedia, validateRecord } from '../src/index.ts'
import type { CapabilityState, LiteracyReport, TechniqueRecord } from '../src/index.ts'
import { technique } from './records.ts'

// All identifiers and numeric values below are fiction; these are port stubs.
const writing: TechniqueRecord = { ...technique(), id: 'knowledge/technique.marks', isMedium: true, medium: { kind: 'writing' } }
const signal: TechniqueRecord = { ...technique(), id: 'knowledge/technique.beacons', isMedium: true, medium: { kind: 'signal' } }
const literacyStub: LiteracyReport[] = [{ society: 'A', share: 0.25 }, { society: 'B', share: 0.75 }]
const stateStub = (record = writing, society = 'A', deployed: number | null = 0.5): CapabilityState => ({
  society, technique: record.id, possible: false, unknowns: [], known: false, invented: false, adopted: false, deployed,
})

it('DESIGN §1.8: a flagged deployed technique without a descriptor remains available with unknown kind and share', () => {
  const record = { ...technique(), isMedium: true }
  expect(availableMedia([record], [stateStub(record)], literacyStub)[0]?.media)
    .toEqual([{ technique: record.id, kind: null, userShare: null }])
})

it('DESIGN §1.8: a descriptor cannot make an unflagged technique available', () => {
  const record = { ...writing, isMedium: false }
  expect(availableMedia([record], [stateStub(record)], literacyStub)[0]?.media).toEqual([])
})

it('DESIGN §1.8: only flagged techniques are media; speech and gesture are not synthesized', () => {
  expect(availableMedia([writing, technique()], [stateStub(), stateStub(technique())], literacyStub)[0]?.media)
    .toEqual([{ technique: writing.id, kind: 'writing', userShare: 0.25 }])
})

it.each([0, null, -0.1])('DESIGN §1.8: deployment must be above zero (%s)', deployed => {
  expect(availableMedia([writing], [{ ...stateStub(writing, 'A', deployed), known: true, invented: true, adopted: true }], []))
    .toEqual([{ society: 'A', media: [] }])
})

it('DESIGN §1.8: writing uses the society literate share, independent of other predicates', () => {
  expect(availableMedia([writing], [stateStub()], literacyStub)[0]?.media[0]?.userShare).toBe(0.25)
})

it('DESIGN §1.8: other media have user share one without literacy', () => {
  expect(availableMedia([signal], [stateStub(signal)], [])[0]?.media[0]?.userShare).toBe(1)
})

it('DESIGN §1.8: a missing literacy report preserves writing with null share', () => {
  expect(availableMedia([writing], [stateStub()], [])).toEqual([
    { society: 'A', media: [{ technique: writing.id, kind: 'writing', userShare: null }] },
  ])
})

it('DESIGN §1.8: zero literacy preserves writing with zero share', () => {
  expect(availableMedia([writing], [stateStub()], [{ society: 'A', share: 0 }])[0]?.media[0]?.userShare).toBe(0)
})

it('DESIGN §1.8: societies without deployed media have empty lists', () => {
  expect(availableMedia([], [stateStub()], literacyStub)).toEqual([{ society: 'A', media: [] }, { society: 'B', media: [] }])
  expect(availableMedia([], [], [])).toEqual([])
})

it('rule 7: output is sorted by society then technique id', () => {
  const result = availableMedia([writing, signal], [stateStub(writing, 'B'), stateStub(), stateStub(signal)], [])
  expect(result.map(row => [row.society, row.media.map(medium => medium.technique)]))
    .toEqual([['A', [signal.id, writing.id]], ['B', [writing.id]]])
})

it('DESIGN §1.8: identical techniques in two societies get their distinct literacy shares', () => {
  expect(availableMedia([writing], [stateStub(), stateStub(writing, 'B')], literacyStub)
    .map(row => row.media[0]?.userShare)).toEqual([0.25, 0.75])
})

it('rule 7: deterministic, order independent, and does not mutate port snapshots', () => {
  const records = [writing, signal]
  const states = [stateStub(writing, 'B'), stateStub(), stateStub(signal)]
  const before = JSON.stringify({ records, states, literacyStub })
  const result = availableMedia(records, states, literacyStub)
  expect(availableMedia(records, states, literacyStub)).toEqual(result)
  expect(availableMedia([...records].reverse(), [...states].reverse(), [...literacyStub].reverse())).toEqual(result)
  expect(JSON.stringify({ records, states, literacyStub })).toBe(before)
})

it('DESIGN §1.8: recomputes availability and shares on each call', () => {
  const states = [stateStub()]
  const literacy = [{ society: 'A', share: 0.25 }]
  const previous = availableMedia([writing], states, literacy)
  literacy[0]!.share = 0.75
  expect(availableMedia([writing], states, literacy)[0]?.media[0]?.userShare).toBe(0.75)
  states[0]!.deployed = 0
  expect(availableMedia([writing], states, literacy)[0]?.media).toEqual([])
  expect(previous[0]?.media[0]?.userShare).toBe(0.25)
})

it('DESIGN §1.8: the optional medium descriptor preserves older record validation', () => {
  expect(validateRecord(technique())).toEqual([])
  expect(validateRecord(writing)).toEqual([])
})

it.each([null, [], {}, { kind: 3 }])('DESIGN §1.8: rejects malformed medium descriptor %j', medium => {
  expect(validateRecord({ ...writing, medium })).toContain('medium must be an object with a string kind')
})
