import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { capabilityState, computeStock, runCase, runKd1 } from '../src/index.ts'
import type { Kd1Config, Kd1CaseResult, Param, TechniqueRecord } from '../src/index.ts'
import type { HolderReport, ReaderReport, RecordReport } from '../src/ports.ts'
import { fiction } from './records.ts'

const world = JSON.parse(readFileSync(new URL('../fixtures/kd-1/world.json', import.meta.url), 'utf8')) as {
  societies: { id: string; population: number }[]
  holders: HolderReport[]
  records: RecordReport[]
  readers: ReaderReport[]
  feasibility: { society: string; feasible: boolean }[]
  reach: { society: string; reachable: boolean }[]
  production: { society: string; technique: string; producersUsing: number; successes: number; share: number | null }[]
}
const technique = JSON.parse(
  readFileSync(new URL('../fixtures/kd-1/techniques/fixture-lime-burning.json', import.meta.url), 'utf8'),
) as TechniqueRecord
const open: Param = { value: null, label: 'open', sources: [] }
const seeds = Array.from({ length: 200 }, (_, i) => i)
const k = technique.id

function caseStub(): Kd1Config {
  return {
    label: 'fiction',
    technique: structuredClone(technique),
    dt: 0.02,
    steps: 1000,
    contact: { from: 'A', to: 'B', migrants: 100, contacts: 0, artefacts: 0, records: 0 },
    populationA: world.societies.find(s => s.id === 'A')!.population,
    holdersA: world.holders.filter(h => h.society === 'A' && h.item === k).length,
    populationB: world.societies.find(s => s.id === 'B')!.population,
    literacyB: 0,
    possibleB:
      world.feasibility.find(r => r.society === 'B')!.feasible
      && world.reach.find(r => r.society === 'B')!.reachable,
    methodSkill: fiction(Math.max(...world.holders.map(h => h.skill ?? 0))),
    diffusion: { piPractise: fiction(1 / 3), piTell: open, piInfer: open, piRead: open },
    invention: { on: false, experimentHours: 0, q: open },
    adoption: { producers: 10, costAdvantage: 1, inReach: true, p: fiction(0.2), q: fiction(0.5) },
    mortality: { on: false, rate: open },
    records: structuredClone(world.records),
    readers: structuredClone(world.readers),
  }
}

function recordsOnlyBase(): Kd1Config {
  const c = caseStub()
  c.contact.migrants = 0
  c.contact.contacts = 0
  c.contact.artefacts = 0
  c.contact.records = 400
  c.literacyB = 0.4
  c.diffusion.piRead = fiction(1)
  c.invention = { on: true, experimentHours: 200, q: fiction(0.002) }
  c.records = []
  c.readers = structuredClone(world.readers)
  return c
}

function adoptionIncrements(curve: readonly number[]): number[] {
  return curve.slice(1).map((value, index) => value - curve[index])
}

function incrementsRiseThenFall(curve: readonly number[]): boolean {
  const d = adoptionIncrements(curve)
  if (d.length < 4) return false
  const peak = d.reduce((best, value, index) => (value > d[best] ? index : best), 0)
  return peak > 0 && peak < d.length - 1 && d[0] < d[peak] && d[d.length - 1] < d[peak]
}

function span10to90(curve: readonly number[], m: number, dt: number): number | null {
  const target10 = 0.1 * m
  const target90 = 0.9 * m
  let i10 = -1
  let i90 = -1
  for (let i = 0; i < curve.length; i++) {
    if (i10 < 0 && curve[i] >= target10) i10 = i
    if (curve[i] >= target90) {
      i90 = i
      break
    }
  }
  if (i10 < 0 || i90 < 0) return null
  return (i90 - i10) * dt
}

function meanSpan10to90(batch: Kd1CaseResult, m: number, dt: number): number | null {
  const spans = batch.results
    .map(r => span10to90(r.adoptionCurve, m, dt))
    .filter((t): t is number => t !== null)
  if (spans.length !== batch.results.length) return null
  return spans.reduce((sum, t) => sum + t, 0) / spans.length
}

describe('KD-1c records only, low tacit share', () => {
  it(
    'DESIGN §3 KD-1c: B becomes known then invented after trial',
    () => {
    const c = recordsOnlyBase()
    c.technique.tacitShare = fiction(0.1)
    const batch = runCase(c, seeds)
    expect(batch.censored).toBe(0)
    for (const result of batch.results) {
      const inventedIndex = result.statesB.findIndex(s => s.state.invented)
      expect(inventedIndex).toBeGreaterThan(0)
      const previous = result.statesB[inventedIndex - 1].state
      const current = result.statesB[inventedIndex].state
      expect(current.known && current.invented).toBe(true)
      expect(previous.invented).toBe(false)
      if (inventedIndex > 1) {
        expect(previous.known).toBe(true)
      }
    }
    },
    60_000,
  )
})

describe('KD-1c literacy zero', () => {
  it.skip('DESIGN §3 KD-1c: never invented when L_B = 0; conflicts with DESIGN §1.5 (trial invention needs only P and not-I, and B still invents with invention on)', () => {})
})

describe('KD-1d records only, high tacit share', () => {
  it.skip('DESIGN §3 KD-1d: runner invention hazard does not scale with tacitShare (DESIGN §1.5)', () => {})
})

function meanAdoptionCurve(batch: Kd1CaseResult): number[] {
  const length = batch.adoptionCurves[0]?.length ?? 0
  return Array.from({ length }, (_, index) =>
    batch.adoptionCurves.reduce((sum, curve) => sum + curve[index], 0) / batch.adoptionCurves.length,
  )
}

describe('KD-1g adoption speed', () => {
  it(
    'DESIGN §3 KD-1g: S-curve increments and faster 10–90 % span with contact (q only)',
    () => {
    const base = caseStub()
    base.contact.migrants = 120
    base.diffusion.piPractise = fiction(1)
    base.invention.on = false
    base.steps = 2500
    base.adoption.producers = 10
    base.adoption.inReach = true
    base.adoption.costAdvantage = 1

    // Contact is the Bass imitation rate q; p (external influence) is identical in every run.
    base.adoption.p = fiction(0.04)
    function adoptionCase(q: Param): Kd1CaseResult {
      const c = structuredClone(base)
      c.adoption.q = q
      return runCase(c, seeds)
    }

    const lowBatch = adoptionCase(fiction(0.15))
    const highBatch = adoptionCase(fiction(0.55))

    for (const batch of [lowBatch, highBatch]) {
      expect(batch.censored).toBe(0)
      expect(incrementsRiseThenFall(meanAdoptionCurve(batch))).toBe(true)
      for (const result of batch.results) {
        expect(result.statesB.some(s => s.state.invented)).toBe(true)
      }
    }

    const m = base.adoption.producers
    const dt = base.dt
    const low = meanSpan10to90(lowBatch, m, dt)!
    const high = meanSpan10to90(highBatch, m, dt)!
    expect(high).toBeLessThan(low)
    },
    120_000,
  )
})

describe('KD-1g cost advantage', () => {
  it.skip('DESIGN §3 KD-1g: span falls with advantage; runner has no knob mapping cost advantage to adoption speed (adopters only gates on > 0)', () => {})
})

describe('KD-1h loss before contact', () => {
  it.skip('DESIGN §3 KD-1h: A loses k before contact reaches B; runner has no contact start time knob', () => {})
  it(
    'DESIGN §3 KD-1h: loss share falls as N_A grows at a fixed 4 % holder share; record survival keeps A known not invented',
    () => {
    // Holder share is fixed at 4 % of N_A, so a larger society has more holders.
    function lossCase(populationA: number, holdersA: number): Kd1CaseResult {
      const c = caseStub()
      c.populationA = populationA
      c.holdersA = holdersA
      c.contact.migrants = 1
      c.diffusion.piPractise = fiction(0.06)
      c.mortality = { on: true, rate: fiction(0.08) }
      c.invention.on = false
      c.steps = 1200
      c.records = []
      return runCase(c, seeds)
    }

    const small = lossCase(25, 1)
    const large = lossCase(100, 4)
    const smallLoss = small.results.filter(r => r.lostA !== null).length / seeds.length
    const largeLoss = large.results.filter(r => r.lostA !== null).length / seeds.length
    expect(smallLoss).toBeGreaterThan(0)
    expect(largeLoss).toBeLessThan(smallLoss)
    for (const result of small.results) {
      if (result.lostA === null) continue
      expect(result.lostA.causes).toContain('death')
      expect(result.lostA.item).toBe(k)
      expect(result.lostA.society).toBe('A')
    }

    const withRecord = caseStub()
    withRecord.populationA = 8
    withRecord.holdersA = 2
    withRecord.contact.migrants = 0
    withRecord.mortality = { on: true, rate: fiction(100000) }
    withRecord.invention.on = false
    withRecord.steps = 2
    withRecord.records = structuredClone(world.records)
    expect(runKd1(withRecord, 0).lostA).toBeNull()

    const holdersAfterDeath = world.holders.filter(
      h => !(h.society === 'A' && h.item === k && h.level === 'holds'),
    )
    const feasibility = technique.enables.map(recipe => ({
      society: 'A',
      recipe,
      feasible: true,
    }))
    const reach = technique.enables.map(recipe => ({
      society: 'A',
      recipe,
      reachable: true,
    }))
    const production = world.production.filter(p => p.society === 'A')
    const stock = computeStock(holdersAfterDeath, world.records, world.readers)
    expect(
      capabilityState(technique, 'A', stock, feasibility, reach, production),
    ).toMatchObject({ known: true, invented: false })
    },
    120_000,
  )
})
