import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { migrationHazard, runCase, runKd1 } from '../src/index.ts'
import type { Kd1Config, Param, TechniqueRecord } from '../src/index.ts'
import type { HolderReport, ReaderReport, RecordReport } from '../src/ports.ts'
import { fiction } from './records.ts'

const world = JSON.parse(readFileSync(new URL('../fixtures/kd-1/world.json', import.meta.url), 'utf8')) as {
  societies: { id: string; population: number }[]
  holders: HolderReport[]; records: RecordReport[]; readers: ReaderReport[]
  feasibility: { society: string; feasible: boolean }[]
  reach: { society: string; reachable: boolean }[]
}
const technique = JSON.parse(readFileSync(new URL('../fixtures/kd-1/techniques/fixture-lime-burning.json', import.meta.url), 'utf8')) as TechniqueRecord
const open: Param = { value: null, label: 'open', sources: [] }

// Every number below is a fiction fixture, not empirical calibration. These are declared port stubs.
function caseStub(): Kd1Config {
  return {
    label: 'fiction', technique: structuredClone(technique), dt: 0.02, steps: 1000,
    contact: { from: 'A', to: 'B', migrants: 100, contacts: 0, artefacts: 0, records: 0 },
    populationA: world.societies.find(s => s.id === 'A')!.population,
    holdersA: world.holders.filter(h => h.society === 'A' && h.item === technique.id).length,
    populationB: world.societies.find(s => s.id === 'B')!.population,
    literacyB: 0,
    possibleB: world.feasibility.find(r => r.society === 'B')!.feasible
      && world.reach.find(r => r.society === 'B')!.reachable,
    methodSkill: fiction(Math.max(...world.holders.map(h => h.skill ?? 0))),
    diffusion: { piPractise: fiction(1 / 3), piTell: open, piInfer: open, piRead: open },
    invention: { on: false, experimentHours: 0, q: open },
    adoption: { producers: 10, costAdvantage: 1, inReach: true, p: fiction(0.2), q: fiction(0.5) },
    mortality: { on: false, rate: open },
    records: structuredClone(world.records), readers: structuredClone(world.readers),
  }
}
const seeds = Array.from({ length: 200 }, (_, i) => i)

describe('DESIGN §3 KD-1 aggregate runner', () => {
  it('KD-1i: byte-identical replay, different stochastic arrival, immutable config and seed order', () => {
    const c = caseStub()
    const before = JSON.stringify(c)
    const first = runKd1(c, 11)
    expect(JSON.stringify(runKd1(c, 11))).toBe(JSON.stringify(first))
    const second = runKd1(c, 12)
    expect(second.firstArrival).not.toBe(first.firstArrival)
    expect(second.statesB.map(s => s.time)).toEqual(first.statesB.map(s => s.time))
    expect(second.statesB.map(s => s.state.possible)).toEqual(first.statesB.map(s => s.state.possible))
    expect(second.stubs).toEqual(first.stubs)
    expect(JSON.stringify(c)).toBe(before)
    expect(runCase({ ...c, steps: 1 }, [12, 11]).seeds).toEqual([12, 11])
  })

  it('KD-1h: every carrier waits for contactStart, including a start between steps', () => {
    for (const channel of ['migrants', 'contacts', 'artefacts', 'records'] as const) {
      const c = caseStub()
      c.dt = 1
      c.steps = 4
      c.contactStart = 2.5
      c.contact = { ...c.contact, migrants: 0, [channel]: 100000 }
      c.literacyB = 1
      c.diffusion = { piPractise: fiction(1), piTell: fiction(1), piInfer: fiction(1), piRead: fiction(1) }
      for (const seed of seeds) {
        const result = runKd1(c, seed)
        expect(result.statesB.filter(s => s.time < c.contactStart!).every(s => !s.state.known && s.holders === 0)).toBe(true)
        expect(result.statesB[3].state.known).toBe(true)
        expect(result.firstArrival).toBe(channel === 'contacts' ? null : 3)
      }
      c.contactStart = 4
      expect(runKd1(c, 0).statesB.every(s => !s.state.known)).toBe(true)
    }
  })

  it('KD-1h: source mortality runs before contact starts', () => {
    const c = caseStub()
    c.steps = 4
    c.contactStart = 2 * c.dt
    c.records = []
    c.mortality = { on: true, rate: fiction(100000) }
    const result = runKd1(c, 0)
    expect(result.lostA).toMatchObject({ time: c.dt, causes: ['death'] })
    expect(result.firstArrival).toBeNull()
  })

  it('KD-1i: explicit contactStart zero preserves the default seeded results', () => {
    const c = caseStub()
    for (const seed of [0, 11, 12]) {
      expect(runKd1({ ...c, contactStart: 0 }, seed)).toEqual(runKd1(c, seed))
    }
  })

  it('KD-1a: zero carrier rates and invention off never give B a holder over 200 seeds', () => {
    const c = caseStub()
    c.contact.migrants = 0
    c.diffusion.piPractise = open
    const batch = runCase(c, seeds)
    expect(batch.arrivals).toEqual(seeds.map(() => null))
    expect(batch.censored).toBe(200)
    expect(batch.meanArrival).toBeNull()
    expect(batch.interval95).toBeNull()
    for (const result of batch.results) {
      expect(result.lostA).toBeNull()
      expect(result.adoptionCurve.every(count => count === 0)).toBe(true)
      expect(result.statesB.every(({ state, holders }) => holders === 0 && state.possible === true
        && !state.known && !state.invented && !state.adopted && state.deployed === null)).toBe(true)
    }
    // Possible remains the fixture's independent port flag (the existing keeper decision).
  })

  it('KD-1b: migration mean over 200 seeds contains 1/h_mig in its normal 95% interval (dt=0.02)', () => {
    const c = caseStub()
    const hazard = migrationHazard(c.contact, c.holdersA, c.populationA, c.diffusion)
    const batch = runCase(c, seeds)
    expect(batch.censored).toBe(0)
    const mean = batch.meanArrival!
    const [lower, upper] = batch.interval95!
    expect(lower).toBeLessThan(1 / hazard)
    expect(upper).toBeGreaterThan(1 / hazard)
    const discretisedMean = c.dt / -Math.expm1(-hazard * c.dt)
    expect(discretisedMean - 1 / hazard).toBeLessThan(upper - mean)
    const arrivals = batch.arrivals as number[]
    const variance = arrivals.reduce((sum, t) => sum + (t - mean) ** 2, 0) / (seeds.length - 1)
    expect(upper - mean).toBeCloseTo(1.959963984540054 * Math.sqrt(variance / seeds.length))
    expect(mean).toBe(arrivals.reduce((sum, t) => sum + t, 0) / seeds.length)
    expect(batch.adoptionCurves).toEqual(batch.results.map(result => result.adoptionCurve))
    for (const result of batch.results) {
      const first = result.statesB.find(s => s.holders > 0)!
      expect(result.firstArrival).toBe(first.time)
      expect(first.state.invented).toBe(true)
      expect(result.statesB.every(s => s.state.deployed === null)).toBe(true)
    }
  })

  it('§1.2: the Life mortality stub reports A loss with death cause, or preserves a readable record', () => {
    const c = caseStub()
    c.steps = 1
    c.contact.migrants = 0
    c.mortality = { on: true, rate: fiction(100000) }
    c.records = []
    expect(runKd1(c, 0).lostA).toEqual({ society: 'A', item: technique.id, kind: 'lost',
      causes: ['death'], step: 1, time: c.dt })
    c.populationA = c.holdersA
    expect(runKd1(c, 0).firstArrival).toBeNull() // An empty source never divides by zero.
    c.records = world.records
    expect(runKd1(c, 0).lostA).toBeNull()
  })

  it('§1.3–1.6: reading supplies explicit skill; trial supplies success; adoption does not invent output', () => {
    const c = caseStub()
    c.steps = 2
    c.contact.migrants = 0
    c.contact.records = 100000
    c.literacyB = 1
    c.diffusion.piRead = fiction(1)
    const read = runKd1(c, 0)
    expect(read.firstArrival).toBe(c.dt)
    expect(read.statesB[1].state).toMatchObject({ known: true, invented: false, adopted: false, deployed: null })
    c.invention = { on: true, experimentHours: 100000, q: fiction(1) }
    const trial = runKd1(c, 0)
    expect(trial.statesB[1].state).toMatchObject({ known: true, invented: true, adopted: true, deployed: null })
    expect(trial.adoptionCurve[2]).toBeGreaterThan(trial.adoptionCurve[1])
    c.literacyB = 0
    c.invention.on = false
    expect(runKd1(c, 0).firstArrival).toBeNull()
  })

  it('§1.4: talk carries propositions, artefact inference supplies a working method', () => {
    const c = caseStub()
    c.steps = 1
    c.contact.migrants = 0
    c.contact.contacts = 100000
    c.diffusion.piTell = fiction(1)
    expect(runKd1(c, 0).statesB[1].state).toMatchObject({ known: true, invented: false })
    c.contact.artefacts = 100000
    c.diffusion.piInfer = fiction(1)
    expect(runKd1(c, 0).statesB[1].state.invented).toBe(true)
  })

  it('rule 8: active null Params throw with names; inactive copying/invention/mortality stay unresolved', () => {
    const c = caseStub()
    expect(() => runKd1(c, 0)).not.toThrow()
    c.diffusion.piPractise = open
    expect(() => runKd1(c, 0)).toThrow('diffusion.piPractise')
    c.contact.migrants = 0
    c.mortality.on = true
    expect(() => runKd1(c, 0)).toThrow('mortality.rate')
    c.mortality.on = false
    c.invention = { on: true, experimentHours: 1, q: open }
    expect(() => runKd1(c, 0)).toThrow('invention.q')
    c.invention.q = fiction(1)
    c.invention.experimentHours = 100000
    c.adoption.p = open
    expect(() => runKd1(c, 0)).toThrow('adoption.p')
    c.adoption.p = fiction(0.2)
    c.adoption.q = open
    expect(() => runKd1(c, 0)).toThrow('adoption.q')
    c.invention.on = false
    c.contact.records = 1
    c.literacyB = 1
    c.diffusion.piRead = fiction(1)
    c.technique.tacitShare = open
    expect(() => runKd1(c, 0)).toThrow('tacitShare')
  })

  it('§3: empty/single/censored seed lists have honest statistics; time/count inputs are validated', () => {
    const c = caseStub()
    expect(runCase(c, []).meanArrival).toBeNull()
    expect(runCase(c, [0]).interval95).toBeNull()
    expect(runCase({ ...c, steps: 0 }, [0]).arrivals).toEqual([null])
    for (const dt of [0, -1, Infinity, NaN]) expect(() => runKd1({ ...c, dt }, 0)).toThrow('dt')
    expect(() => runKd1({ ...c, holdersA: c.populationA + 1 }, 0)).toThrow('holdersA')
    expect(() => runKd1({ ...c, steps: 1.5 }, 0)).toThrow('steps')
    for (const contactStart of [-1, Infinity, NaN]) {
      expect(() => runKd1({ ...c, contactStart }, 0)).toThrow('contactStart')
    }
  })
})
