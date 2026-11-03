import { kd1AccessStub } from './kd1-access-stub.ts'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  capabilityStates, computeStock, diffCapability, diffStock,
} from '../src/index.ts'
import type {
  RosterReport, ReportedMindsReport, StockSnapshot, DepartureReport, FeasibilityReport, HolderReport, ProductionReport,
  ReachReport, ReaderReport, RecordReport, TechniqueRecord,
} from '../src/index.ts'
import { loadRecords } from '../scripts/load.ts'
import { isObject } from '../src/schema.ts'

const repoRoot = fileURLToPath(new URL('../', import.meta.url))
const TECHNIQUE_ID = 'knowledge/technique.fixture-lime-burning'

type WorldFixture = StockSnapshot & {
  rosters: RosterReport[]
  reportedMinds: ReportedMindsReport[]
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

// fixture: complete by construction at each step, with Society departures applied.
const atStep = (world: WorldFixture, tick: number, departures: DepartureReport[] = []) => {
  world.tick = tick
  world.rosters = world.rosters.map(roster => ({ ...roster, tick,
    people: roster.people!.filter(mind => !departures.some(d => d.society === roster.society && d.mind === mind)),
  }))
  world.reportedMinds = world.rosters.map(roster => ({ society: roster.society, minds: [...roster.people!], tick }))
}

const stock = (world: WorldFixture) => computeStock(world.holders, world.records, kd1AccessStub(world), world)

const states = (world: WorldFixture, technique: TechniqueRecord) => capabilityStates(
  [technique],
  world.societies.map(society => society.id),
  stock(world),
  world.feasibility,
  world.reach,
  world.production, world,
)

const stateIn = (world: WorldFixture, technique: TechniqueRecord, society: string) =>
  states(world, technique).find(entry => entry.society === society && entry.technique === technique.id)!

const techniqueHolders = (world: WorldFixture) =>
  world.holders.filter(holder => holder.society === 'A' && holder.item === TECHNIQUE_ID && holder.level === 'holds')

describe('KD-1a no contact', () => {
  it('DESIGN §3 KD-1a: B stock is empty, availability/invented/adopted are false, and deployed is null', () => {
    const world = loadWorld()
    const technique = loadTechnique()
    expect(stock(world).filter(entry => entry.society === 'B')).toEqual([])
    expect(stateIn(world, technique, 'B')).toEqual({
      society: 'B',
      technique: TECHNIQUE_ID,
      possible: true,
      unknowns: [],
      availability: false,
      invented: false,
      adopted: false,
      deployed: null,
    })
  })
})

describe("A's baseline", () => {
  it('DESIGN §3 KD-1 fixture: A has possible, availability, invented, adopted, deployed 0.4', () => {
    const world = loadWorld()
    const technique = loadTechnique()
    expect(stateIn(world, technique, 'A')).toEqual({
      society: 'A',
      technique: TECHNIQUE_ID,
      possible: true,
      unknowns: [],
      availability: true,
      invented: true,
      adopted: true,
      deployed: 0.4,
    })
  })
})

describe('KD-1e not possible in B', () => {
  it('DESIGN §3 KD-1e: reach false keeps B availability and invented but not possible or adopted', () => {
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
      availability: true,
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
      unknowns: [],
      availability: true,
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
    atStep(step1, 1, departures)
    const inputs0 = { ...step0, holders: step0.holders, records: step0.records, access: kd1AccessStub(step0) }
    const inputs1 = { ...step1, holders: step1.holders, records: step1.records, access: kd1AccessStub(step1) }
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
    atStep(step2, 2)
    const inputs2 = { ...step2, holders: step2.holders, records: step2.records, access: kd1AccessStub(step2) }
    expect(diffStock(inputs1, inputs2, [])).toEqual([
      {
        society: 'A',
        item: TECHNIQUE_ID,
        kind: 'lost',
        causes: ['no_access'],
      },
      {
        society: 'A',
        item: TECHNIQUE_ID,
        kind: 'unreadable',
        causes: ['no_access'],
      },
    ])

    const step3 = clone(step2)
    step3.readers = step3.readers.map(reader =>
      reader.society === 'A' && reader.script === 'fixture-script' ? { ...reader, readers: 1 } : reader,
    )
    atStep(step3, 3)
    const inputs3 = { ...step3, holders: step3.holders, records: step3.records, access: kd1AccessStub(step3) }
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
    const inputs = { ...world, holders: world.holders, records: world.records, access: kd1AccessStub(world) }
    const departures: DepartureReport[] = [{ mind: 'A-001', society: 'A', cause: 'death' }]
    const cap = states(world, technique)
    expect(computeStock(world.holders, world.records, kd1AccessStub(world), world))
      .toEqual(computeStock(world.holders, world.records, kd1AccessStub(world), world))
    expect(diffStock(inputs, inputs, departures)).toEqual(diffStock(inputs, inputs, departures))
    expect(capabilityStates(
      [technique],
      world.societies.map(society => society.id),
      stock(world),
      world.feasibility,
      world.reach,
      world.production, world,
    )).toEqual(cap)
    expect(diffCapability(cap, cap)).toEqual(diffCapability(cap, cap))
  })
})
