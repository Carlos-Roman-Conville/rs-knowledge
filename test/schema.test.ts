import { describe, expect, it } from 'vitest'
import { validateRecord } from '../src/schema.ts'
import { proposition, technique } from './records.ts'

describe('record runtime schema', () => {
  it('DESIGN §1.8: rejects a medium descriptor when isMedium is false', () => {
    expect(validateRecord({ ...technique(), isMedium: false, medium: { kind: 'writing' } }))
      .toContain('medium descriptor requires isMedium to be true')
  })
  it('DESIGN §1.8: accepts isMedium true without a descriptor', () => {
    expect(validateRecord({ ...technique(), isMedium: true })).toEqual([])
  })
  it('accepts propositions and techniques with fiction parameters', () => {
    expect(validateRecord(proposition())).toEqual([])
    expect(validateRecord(technique())).toEqual([])
  })
  it('accepts null parameters only when open', () => {
    const record = technique()
    record.minSkill = { value: null, label: 'open', sources: [] }
    expect(validateRecord(record)).toEqual([])
  })
  it.each([null, [], 3, 'record'])('rejects non-object record %j', record => {
    expect(validateRecord(record)).toContain('record must be an object')
  })
  it.each(['id', 'name', 'enables', 'propositions', 'sources', 'minSkill', 'tacitShare', 'copyingLoss', 'isMedium', 'catalogueRef'])('requires technique field %s', field => {
    const record = { ...technique() } as Record<string, unknown>
    delete record[field]
    expect(validateRecord(record).length).toBeGreaterThan(0)
  })
  it.each([
    { kind: 'unknown' }, { statement: 2 }, { notes: 2 }, { sources: [2] },
  ])('rejects malformed proposition fields %j', patch => {
    expect(validateRecord({ ...proposition(), ...patch }).length).toBeGreaterThan(0)
  })
  it.each([{ value: Infinity }, { value: '1' }, { label: 'guess' }, { label: ['fiction'] }, { sources: [1] }, { note: 1 }])('rejects malformed Param %j', patch => {
    const record = technique()
    expect(validateRecord({ ...record, minSkill: { ...record.minSkill, ...patch } }).length).toBeGreaterThan(0)
  })
})
