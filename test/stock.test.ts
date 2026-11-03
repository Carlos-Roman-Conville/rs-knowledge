import { computeStock } from './stock-stubs.ts'
import { expect, it } from 'vitest'
import { diffStock } from '../src/index.ts'
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
    readableRecords: 0, unreadableRecords: 0, availability: true,
    coverage: 1, tick: 0, partial: false, notApplicable: false, unknowns: [],
  }])
  expect(computeStock([...holders].reverse(), [], [])).toEqual(computeStock(holders, [], []))
})

it('DESIGN §1.2 keeps null skill when all holders have null skill; zero is a skill', () => {
  expect(computeStock([holderStub({ skill: null })], [], [])[0].bestSkill).toBeNull()
  expect(computeStock([holderStub({ skill: 0 })], [], [])[0].bestSkill).toBe(0)
  expect(computeStock([holderStub({ skill: 1 })], [], [])[0].bestSkill).toBe(1)
})

it('KNT-C1 heard-of minds contribute neither skill nor availability', () => {
  expect(computeStock([holderStub({ level: 'heard_of', skill: 1 })], [], [])[0]).toMatchObject({
    holders: 0, heardOf: 1, bestSkill: null, availability: false,
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
    readableRecords: 2, unreadableRecords: 2, availability: true,
    coverage: 1, tick: 0, partial: false, notApplicable: false, unknowns: [],
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
  expect(result[0]).toMatchObject({ availability: false, readableRecords: 0, unreadableRecords: 0 })
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
  ])).toEqual([{ society: 'society.a', item: 'item.a', kind: 'became_unknown', causes: [] }])
})

it('DESIGN §1.2 record decay covers absence and destruction without implying no_reader', () => {
  const prev = inputsStub({ records: [recordStub()], readers: [readerStub()] })
  for (const records of [[], [recordStub({ intact: false })]]) {
    expect(diffStock(prev, inputsStub({ records }), [])).toEqual([
      { society: 'society.a', item: 'item.a', kind: records.length ? 'lost' : 'became_unknown', causes: ['record_decay'] },
    ])
  }
})

it('DESIGN §1.2 unreadable is emitted even when a holder preserves knowledge', () => {
  const next = inputsStub({ holders: [holderStub()], records: [recordStub()] })
  expect(diffStock({ ...next, readers: [readerStub()] }, next, [])).toEqual([
    { society: 'society.a', item: 'item.a', kind: 'unreadable', causes: ['no_reader'] },
  ])
})

it('DESIGN §1.2 unchanged snapshots and never-availability pairs emit no events', () => {
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
    { society: 'society.z', item: 'item.a', kind: 'became_unknown', causes: ['departure'] },
  ])
})

it('DESIGN §1.2 diff validates both snapshots using computeStock', () => {
  const bad = inputsStub({ records: [recordStub({ fidelity: 2 })] })
  expect(() => diffStock(bad, inputsStub(), [])).toThrow(/fidelity/)
  expect(() => diffStock(inputsStub(), bad, [])).toThrow(/fidelity/)
})

// PLAN card KN-2 fixtures: roster and reporting coverage are independent port inputs.
const kn2Snapshot = (minds = ['a', 'b', 'c'], people: string[] | null = ['a', 'b', 'c', 'd', 'e'], tick = 7) => ({
  tick,
  rosters: [{ society: 's', people, tick }],
  reportedMinds: [{ society: 's', minds, tick }],
  pairs: [{ society: 's', item: 'k' }],
})
const kn2Holder = (mind = 'a') => holderStub({ mind, society: 's', item: 'k', skill: 0.731 })

it('PLAN card KN-2: duplicate holder reports count once; partial 3/5 coverage stays attached to counts and tick', () => {
  const holders = ['a', 'b', 'c'].map(kn2Holder)
  expect(computeStock([...holders, holders[0], { ...holders[0], level: 'heard_of' }], [], [], kn2Snapshot())[0])
    .toMatchObject({ holders: 3, heardOf: 0, coverage: 0.6, tick: 7, partial: true, availability: true })
})

it('PLAN card KN-2: no holders at coverage 0.6 is unknown; complete absence is false', () => {
  expect(computeStock([], [], [], kn2Snapshot())[0]).toMatchObject({ holders: 0, coverage: 0.6, availability: null })
  expect(computeStock([], [], [], kn2Snapshot(['a', 'b', 'c', 'd', 'e']))[0])
    .toMatchObject({ holders: 0, coverage: 1, partial: false, availability: false })
})

it('PLAN card KN-2: coverage intersects distinct reported minds with the independent roster', () => {
  expect(computeStock([kn2Holder('outsider')], [], [], kn2Snapshot(['a', 'a', 'b', 'outsider']))[0])
    .toMatchObject({ holders: 0, coverage: 0.4, availability: null })
})

it('PLAN card KN-2: empty roster is not applicable without division by zero', () => {
  expect(computeStock([], [], [], kn2Snapshot([], []))[0])
    .toMatchObject({ coverage: null, partial: false, notApplicable: true, availability: null, unknowns: [] })
})

it('PLAN card KN-2: absent or null roster names Society; absent reports name Cognition', () => {
  const snapshot = kn2Snapshot()
  for (const rosters of [[], [{ society: 's', people: null, tick: 7 }]]) {
    expect(computeStock([], [], [], { ...snapshot, rosters })[0]).toMatchObject({
      coverage: null, partial: true, unknowns: [{ state: 'coverage', input: 'roster of s', producer: 'society' }],
    })
  }
  expect(computeStock([], [], [], { ...snapshot, reportedMinds: [] })[0]).toMatchObject({
    coverage: null, unknowns: [{ state: 'coverage', input: 'reported minds of s', producer: 'cognition' }],
  })
})

it('PLAN card KN-2: reports from a different simulation tick cannot establish complete coverage', () => {
  const snapshot = kn2Snapshot(['a', 'b', 'c', 'd', 'e'])
  expect(computeStock([], [], [], { ...snapshot, tick: 8 })[0]).toMatchObject({
    coverage: null, tick: 8, availability: null,
    unknowns: [
      { state: 'coverage', input: 'roster of s', producer: 'society' },
      { state: 'coverage', input: 'reported minds of s', producer: 'cognition' },
    ],
  })
})

it('PLAN card KN-2: a readable record confirms availability even with missing coverage', () => {
  expect(computeStock([], [recordStub()], [readerStub()], { tick: 7 })[0])
    .toMatchObject({ coverage: null, partial: true, availability: true })
})

it('PLAN card KN-2: dropped holder report without departure becomes unknown, never lost', () => {
  const prev = { ...kn2Snapshot(['a', 'b', 'c', 'd', 'e']), holders: [kn2Holder()], records: [], readers: [] }
  const next = { ...kn2Snapshot(['b', 'c', 'd', 'e']), holders: [], records: [], readers: [] }
  expect(computeStock(next.holders, next.records, next.readers, next)[0])
    .toMatchObject({ coverage: 0.8, availability: null, partial: true })
  expect(diffStock(prev, next, [])).toEqual([{ society: 's', item: 'k', kind: 'became_unknown', causes: [] }])
})

it('PLAN card KN-2: missing snapshot between full ones becomes unknown and regains, never lost', () => {
  const full = { ...kn2Snapshot(['a', 'b', 'c', 'd', 'e']), holders: [kn2Holder()], records: [], readers: [] }
  const missing = { tick: 8, holders: [], records: [], readers: [] }
  expect(diffStock(full, missing, [])).toEqual([{ society: 's', item: 'k', kind: 'became_unknown', causes: [] }])
  expect(diffStock(missing, full, [])).toEqual([{ society: 's', item: 'k', kind: 'regained', causes: [] }])
})

it('PLAN card KN-2: one mind in two societies throws even across different items', () => {
  expect(() => computeStock([kn2Holder(), { ...kn2Holder(), society: 't', item: 'other' }], [], [], { tick: 7 }))
    .toThrow(/two societies/)
})

it('PLAN card KN-2: Society departure moves a holder from A to B with reported skill unchanged', () => {
  const snapshot = (moved: boolean) => {
    const tick = moved ? 8 : 7
    const rosters = [
      { society: 'A', people: moved ? ['remaining'] : ['a', 'remaining'], tick },
      { society: 'B', people: moved ? ['a', 'resident'] : ['resident'], tick },
    ]
    return { tick, rosters, reportedMinds: rosters.map(r => ({ society: r.society, minds: [...r.people], tick })),
      pairs: ['A', 'B'].map(society => ({ society, item: 'k' })),
      holders: [{ ...kn2Holder(), society: moved ? 'B' : 'A' }], records: [], readers: [] }
  }
  const prev = snapshot(false), next = snapshot(true)
  const stock = computeStock(next.holders, [], [], next)
  expect(stock[0]).toMatchObject({ society: 'A', holders: 0, coverage: 1, availability: false })
  expect(stock[1]).toMatchObject({ society: 'B', holders: 1, coverage: 1, bestSkill: 0.731 })
  expect(diffStock(prev, next, [{ mind: 'a', society: 'A', cause: 'departure' }])).toEqual([
    { society: 'A', item: 'k', kind: 'lost', causes: ['departure'] },
    { society: 'B', item: 'k', kind: 'regained', causes: [] },
  ])
})
