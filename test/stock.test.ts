import { expect, it } from 'vitest'
import { computeStock, diffStock } from '../src/index.ts'
import { holderStub, inputsStub, readerStub, recordStub } from './stock-stubs.ts'

it('KNT-C1 counts distinct minds per item, with holds taking precedence over heard_of', () => {
  const holders = [
    holderStub(), holderStub(), holderStub({ level: 'heard_of', skill: 1 }),
    holderStub({ mind: 'mind.b', skill: 0.8 }),
    holderStub({ mind: 'mind.c', level: 'heard_of', skill: 1 }),
    holderStub({ mind: 'mind.c', level: 'heard_of', skill: 1 }),
    holderStub({ mind: 'mind.d', skill: null }),
  ]
  expect(computeStock(holders, [], [])).toEqual([{
    society: 'society.a', item: 'item.a', holders: 3, heardOf: 1, bestSkill: 0.8,
    readableRecords: 0, unreadableRecords: 0, known: true,
  }])
  expect(computeStock([...holders].reverse(), [], [])).toEqual(computeStock(holders, [], []))
})

it('DESIGN §1.2 keeps null skill when all holders have null skill; zero is a skill', () => {
  expect(computeStock([holderStub({ skill: null })], [], [])[0].bestSkill).toBeNull()
  expect(computeStock([holderStub({ skill: 0 })], [], [])[0].bestSkill).toBe(0)
  expect(computeStock([holderStub({ skill: 1 })], [], [])[0].bestSkill).toBe(1)
})

it('KNT-C1 heard-of minds contribute neither skill nor known', () => {
  expect(computeStock([holderStub({ level: 'heard_of', skill: 1 })], [], [])[0]).toMatchObject({
    holders: 0, heardOf: 1, bestSkill: null, known: false,
  })
})

it('DESIGN §1.2 counts intact records only, matching readers by society and script', () => {
  const records = [
    recordStub({ fidelity: 0 }), recordStub({ record: 'record.b', fidelity: 1 }),
    recordStub({ record: 'record.c', intact: false }),
    recordStub({ record: 'record.d', script: 'script.b' }),
    recordStub({ record: 'record.e', script: 'script.c' }),
  ]
  const readers = [readerStub(), readerStub(), readerStub({ readers: 0 }),
    readerStub({ script: 'script.b', readers: 0 }), readerStub({ society: 'society.b', script: 'script.c' })]
  expect(computeStock([], records, readers)).toEqual([{
    society: 'society.a', item: 'item.a', holders: 0, heardOf: 0, bestSkill: null,
    readableRecords: 2, unreadableRecords: 2, known: true,
  }])
})

it('DESIGN §1.2 includes every reported pair, even decayed-only records; readers create no pair', () => {
  const result = computeStock([
    holderStub({ society: 'society.b', item: 'item.z' }),
    holderStub({ society: 'society.b', item: 'item.a' }),
  ], [recordStub({ intact: false })], [readerStub({ society: 'society.c' })])
  expect(result.map(({ society, item }) => [society, item])).toEqual([
    ['society.a', 'item.a'], ['society.b', 'item.a'], ['society.b', 'item.z'],
  ])
  expect(result[0]).toMatchObject({ known: false, readableRecords: 0, unreadableRecords: 0 })
})

it('DESIGN §0 conservation rejects one mind in two societies even for different heard-of items', () => {
  expect(() => computeStock([holderStub(), holderStub({ society: 'society.b', item: 'item.b', level: 'heard_of' })], [], [])).toThrow(/two societies/)
})

it.each([-0.01, 1.01, NaN, Infinity, -Infinity])('DESIGN §2 rejects skill or fidelity outside [0,1]: %s', value => {
  expect(() => computeStock([holderStub({ skill: value })], [], [])).toThrow(/skill/)
  expect(() => computeStock([holderStub({ level: 'heard_of', skill: value })], [], [])).toThrow(/skill/)
  expect(() => computeStock([], [recordStub({ fidelity: value, intact: false })], [])).toThrow(/fidelity/)
})

it('DESIGN §0 invariant 3 is deterministic without mutating or retaining input/output state', () => {
  const holders = Object.freeze([Object.freeze(holderStub())])
  const records = Object.freeze([Object.freeze(recordStub())])
  const readers = Object.freeze([Object.freeze(readerStub())])
  const first = computeStock(holders, records, readers)
  expect(computeStock(holders, records, readers)).toEqual(first)
  first[0].holders = 99
  expect(computeStock(holders, records, readers)[0].holders).toBe(1)
})

it('DESIGN §1.2 diff reports concurrent lost and unreadable events with sorted unique relevant causes', () => {
  const prev = inputsStub({
    holders: [holderStub(), holderStub({ mind: 'mind.b' }), holderStub({ mind: 'mind.c' }),
      holderStub({ mind: 'mind.heard', level: 'heard_of' })],
    records: [recordStub(), recordStub({ record: 'record.b' }), recordStub({ record: 'record.c' })],
    readers: [readerStub()],
  })
  const next = inputsStub({ records: [recordStub(), recordStub({ record: 'record.b', intact: false })] })
  const departures = [
    { mind: 'mind.a', society: 'society.a', cause: 'death' as const },
    { mind: 'mind.a', society: 'society.a', cause: 'death' as const },
    { mind: 'mind.b', society: 'society.a', cause: 'departure' as const },
    { mind: 'mind.c', society: 'society.a', cause: 'forgetting' as const },
  ]
  const expected = ['lost', 'unreadable'].map(kind => ({
    society: 'society.a', item: 'item.a', kind,
    causes: ['death', 'departure', 'forgetting', 'no_reader', 'record_decay'],
  }))
  expect(diffStock(prev, next, departures)).toEqual(expected)
  expect(diffStock(prev, next, departures)).toEqual(expected)
})

it('DESIGN §1.2 departure causes require a previous holder of that item in that society', () => {
  const prev = inputsStub({ holders: [holderStub(), holderStub({ mind: 'heard', level: 'heard_of' }),
    holderStub({ mind: 'other', item: 'item.b' })] })
  expect(diffStock(prev, inputsStub({ holders: [holderStub({ mind: 'other', item: 'item.b' })] }), [
    { mind: 'mind.a', society: 'society.b', cause: 'death' },
    { mind: 'heard', society: 'society.a', cause: 'forgetting' },
    { mind: 'other', society: 'society.a', cause: 'departure' },
  ])).toEqual([{ society: 'society.a', item: 'item.a', kind: 'lost', causes: [] }])
})

it('DESIGN §1.2 record decay covers absence and destruction without implying no_reader', () => {
  const prev = inputsStub({ records: [recordStub()], readers: [readerStub()] })
  for (const records of [[], [recordStub({ intact: false })]]) {
    expect(diffStock(prev, inputsStub({ records }), [])).toEqual([
      { society: 'society.a', item: 'item.a', kind: 'lost', causes: ['record_decay'] },
    ])
  }
})

it('DESIGN §1.2 unreadable is emitted even when a holder preserves knowledge', () => {
  const next = inputsStub({ holders: [holderStub()], records: [recordStub()] })
  expect(diffStock({ ...next, readers: [readerStub()] }, next, [])).toEqual([
    { society: 'society.a', item: 'item.a', kind: 'unreadable', causes: ['no_reader'] },
  ])
})

it('DESIGN §1.2 unchanged snapshots and never-known pairs emit no events', () => {
  const stock = inputsStub({ holders: [holderStub()], records: [recordStub()], readers: [readerStub()] })
  expect(diffStock(stock, stock, [])).toEqual([])
  expect(diffStock(inputsStub({ holders: [holderStub({ level: 'heard_of' })] }), inputsStub(), [])).toEqual([])
})

it('DESIGN §1.2 diff sorts by society, item, kind and permits migration between snapshots', () => {
  const prev = inputsStub({ holders: [holderStub({ society: 'society.z' })] })
  const next = inputsStub({ holders: [holderStub({ item: 'item.z' }), holderStub()] })
  expect(diffStock(prev, next, [{ mind: 'mind.a', society: 'society.z', cause: 'departure' }])).toEqual([
    { society: 'society.a', item: 'item.a', kind: 'regained', causes: [] },
    { society: 'society.a', item: 'item.z', kind: 'regained', causes: [] },
    { society: 'society.z', item: 'item.a', kind: 'lost', causes: ['departure'] },
  ])
})

it('DESIGN §1.2 diff validates both snapshots using computeStock', () => {
  const bad = inputsStub({ records: [recordStub({ fidelity: 2 })] })
  expect(() => diffStock(bad, inputsStub(), [])).toThrow(/fidelity/)
  expect(() => diffStock(inputsStub(), bad, [])).toThrow(/fidelity/)
})
