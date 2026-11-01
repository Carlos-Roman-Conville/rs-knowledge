import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  capabilityStates, computeStock, diffCapability, diffStock, loadRecords,
} from '../src/index.ts'
import type {
  DepartureReport, FeasibilityReport, HolderReport, ProductionReport,
  ReachReport, ReaderReport, RecordReport, TechniqueRecord,
} from '../src/index.ts'
import { isObject } from '../src/schema.ts'

const repoRoot = fileURLToPath(new URL('../', import.meta.url))
const TECHNIQUE_ID = 'knowledge/technique.fixture-lime-burning'

type WorldFixture = {
  societies: { id: string; population: number }[]
  holders: HolderReport[]
  records: RecordReport[]
  readers: ReaderReport[]
  feasibility: FeasibilityReport[]
  reach: ReachReport[]
  production: ProductionReport[]
}

const loadWorld = (): WorldFixture =>
  JSON.parse(readFileSync(join(repoRoot, 'fixtures/kd-1/world.json'), 'utf8')) as WorldFixture

const loadTechnique = (): TechniqueRecord => {
  const record = loadRecords(repoRoot).records.find(
    (entry): entry is TechniqueRecord => isObject(entry) && entry.kind === 'technique' && entry.id === TECHNIQUE_ID,
  )
  if (!record) throw new Error(`missing fixture technique ${TECHNIQUE_ID}`)
  return record
}

const clone = <T>(value: T): T => structuredClone(value)

const stock = (world: WorldFixture) => computeStock(world.holders, world.records, world.readers)

const states = (world: WorldFixture, technique: TechniqueRecord) => capabilityStates(
  [technique],
  world.societies.map(society => society.id),
  stock(world),
  world.feasibility,
  world.reach,
  world.production,
)

const stateIn = (world: WorldFixture, technique: TechniqueRecord, society: string) =>
  states(world, technique).find(entry => entry.society === society && entry.technique === technique.id)!

const techniqueHolders = (world: WorldFixture) =>
  world.holders.filter(holder => holder.society === 'A' && holder.item === TECHNIQUE_ID && holder.level === 'holds')

describe('KD-1a no contact', () => {
  it('DESIGN §3 KD-1a: B stock is empty and every capability state is false with deployed null', () => {
    const world = loadWorld()
    const technique = loadTechnique()
    expect(stock(world).filter(entry => entry.society === 'B')).toEqual([])
    expect(stateIn(world, technique, 'B')).toEqual({
      society: 'B',
      technique: TECHNIQUE_ID,
      possible: true,
      known: false,
      invented: false,
      adopted: false,
      deployed: null,
    })
  })
})

describe("A's baseline", () => {
  it('DESIGN §3 KD-1 fixture: A has possible, known, invented, adopted, deployed 0.4', () => {
    const world = loadWorld()
    const technique = loadTechnique()
    expect(stateIn(world, technique, 'A')).toEqual({
      society: 'A',
      technique: TECHNIQUE_ID,
      possible: true,
      known: true,
      invented: true,
      adopted: true,
      deployed: 0.4,
    })
  })
})

describe('KD-1e not possible in B', () => {
  it('DESIGN §3 KD-1e: reach false keeps B known and invented but not possible or adopted', () => {
    const technique = loadTechnique()
    const world = clone(loadWorld())
    world.holders.push(
      { mind: 'B-001', society: 'B', item: TECHNIQUE_ID, level: 'holds', skill: 0.8 },
      { mind: 'B-002', society: 'B', item: TECHNIQUE_ID, level: 'holds', skill: 0.8 },
    )
    world.reach = world.reach.map(report =>
      report.society === 'B' ? { ...report, reachable: false } : report,
    )
    world.production.push({
      society: 'B',
      technique: TECHNIQUE_ID,
      producersUsing: 0,
      successes: 1,
      share: null,
    })
    expect(stateIn(world, technique, 'B')).toMatchObject({
      possible: false,
      known: true,
      invented: true,
      adopted: false,
      deployed: null,
    })
    world.production = world.production.map(report =>
      report.society === 'B' && report.technique === TECHNIQUE_ID
        ? { ...report, producersUsing: 0 }
        : report,
    )
    expect(stateIn(world, technique, 'B').adopted).toBe(false)
  })
})

describe('KD-1f no incentive', () => {
  it('DESIGN §3 KD-1f: possible and invented in B without production use, never adopted', () => {
    const technique = loadTechnique()
    const world = clone(loadWorld())
    world.holders.push(
      { mind: 'B-001', society: 'B', item: TECHNIQUE_ID, level: 'holds', skill: 0.8 },
      { mind: 'B-002', society: 'B', item: TECHNIQUE_ID, level: 'holds', skill: 0.8 },
    )
    world.production.push({
      society: 'B',
      technique: TECHNIQUE_ID,
      producersUsing: 0,
      successes: 1,
      share: null,
    })
    expect(stateIn(world, technique, 'B')).toEqual({
      society: 'B',
      technique: TECHNIQUE_ID,
      possible: true,
      known: true,
      invented: true,
      adopted: false,
      deployed: null,
    })
  })
})

describe('KD-1h loss, static part', () => {
  it('DESIGN §3 KD-1h: holder deaths, literacy loss, and recovery through diffStock', () => {
    const technique = loadTechnique()
    const base = loadWorld()
    const step0 = clone(base)
    const departures: DepartureReport[] = techniqueHolders(step0).map(holder => ({
      mind: holder.mind,
      society: 'A',
      cause: 'death',
    }))
    const step1 = clone(step0)
    step1.holders = step1.holders.filter(holder =>
      !(holder.society === 'A' && holder.item === TECHNIQUE_ID && holder.level === 'holds'),
    )
    const inputs0 = { holders: step0.holders, records: step0.records, readers: step0.readers }
    const inputs1 = { holders: step1.holders, records: step1.records, readers: step1.readers }
    expect(diffStock(inputs0, inputs1, departures)).toEqual([
      {
        society: 'A',
        item: TECHNIQUE_ID,
        kind: 'holders_gone_record_survives',
        causes: ['death'],
      },
    ])
    const cap0 = stateIn(step0, technique, 'A')
    const cap1 = stateIn(step1, technique, 'A')
    expect(diffCapability([cap0], [cap1])).toEqual([
      {
        society: 'A',
        technique: TECHNIQUE_ID,
        state: 'invented',
        from: true,
        to: false,
      },
    ])

    const step2 = clone(step1)
    step2.readers = step2.readers.map(reader =>
      reader.society === 'A' && reader.script === 'fixture-script' ? { ...reader, readers: 0 } : reader,
    )
    const inputs2 = { holders: step2.holders, records: step2.records, readers: step2.readers }
    expect(diffStock(inputs1, inputs2, [])).toEqual([
      {
        society: 'A',
        item: TECHNIQUE_ID,
        kind: 'lost',
        causes: ['no_reader'],
      },
      {
        society: 'A',
        item: TECHNIQUE_ID,
        kind: 'unreadable',
        causes: ['no_reader'],
      },
    ])

    const step3 = clone(step2)
    step3.readers = step3.readers.map(reader =>
      reader.society === 'A' && reader.script === 'fixture-script' ? { ...reader, readers: 1 } : reader,
    )
    const inputs3 = { holders: step3.holders, records: step3.records, readers: step3.readers }
    expect(diffStock(inputs2, inputs3, [])).toEqual([
      {
        society: 'A',
        item: TECHNIQUE_ID,
        kind: 'regained',
        causes: [],
      },
    ])
  })
})

describe('Determinism (KD-1i, static part)', () => {
  it('DESIGN §3 KD-1i: repeated calls on the same inputs are deep-equal', () => {
    const world = loadWorld()
    const technique = loadTechnique()
    const inputs = { holders: world.holders, records: world.records, readers: world.readers }
    const departures: DepartureReport[] = [{ mind: 'A-001', society: 'A', cause: 'death' }]
    const cap = states(world, technique)
    expect(computeStock(world.holders, world.records, world.readers))
      .toEqual(computeStock(world.holders, world.records, world.readers))
    expect(diffStock(inputs, inputs, departures)).toEqual(diffStock(inputs, inputs, departures))
    expect(capabilityStates(
      [technique],
      world.societies.map(society => society.id),
      stock(world),
      world.feasibility,
      world.reach,
      world.production,
    )).toEqual(cap)
    expect(diffCapability(cap, cap)).toEqual(diffCapability(cap, cap))
  })
})
