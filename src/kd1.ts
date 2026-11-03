import { streams, type RandomStream } from '@rex/kernel'
import { adopters, bassStep } from './adoption.ts'
import { capabilityState, type CapabilityState } from './capability.ts'
import { migrationHazard, recordHazard, tradeHazard, type DiffusionParams } from './diffusion.ts'
import { inventionHazard } from './invention.ts'
import type { ContactReport, DepartureReport, HolderReport, ReaderReport, RecordReport } from './ports.ts'
import type { Param, TechniqueRecord } from './schema.ts'
import { computeStock, diffStock, type StockEvent, type StockInputs } from './stock.ts'

/** All case numbers are fiction. Ports below are aggregate demonstration stubs, not live engines. */
export type Kd1Config = {
  label: 'fiction'
  technique: TechniqueRecord
  dt: number
  steps: number
  /** Elapsed years before carrier contact begins; defaults to 0. */
  contactStart?: number
  contact: ContactReport
  populationA: number
  holdersA: number
  populationB: number
  literacyB: number
  possibleB: boolean | null
  /** Skill of a demonstrated method, supplied by the Cognition stub. */
  methodSkill: Param
  diffusion: DiffusionParams
  invention: { on: boolean; experimentHours: number; q: Param }
  adoption: { producers: number; costAdvantage: number; inReach: boolean | null; p: Param; q: Param }
  /** Life stub: independent source-holder mortality hazard per unit time. */
  mortality: { on: boolean; rate: Param }
  /** Surviving objects/readers reported by the Economy/Cognition stubs; held fixed in this runner. */
  records: readonly RecordReport[]
  readers: readonly ReaderReport[]
}

export type Kd1Step = { step: number; time: number; state: CapabilityState; holders: number }
export type Kd1Loss = StockEvent & { step: number; time: number }
export type Kd1Result = {
  seed: number
  stubs: readonly string[]
  statesB: Kd1Step[]
  /** First step with a method holder in B, including an incomplete explicit method. Null means censored. */
  firstArrival: number | null
  lostA: Kd1Loss | null
  /** Expected producer counts, aligned with statesB, including time zero. */
  adoptionCurve: number[]
}
export type Kd1CaseResult = {
  seeds: number[]
  results: Kd1Result[]
  arrivals: (number | null)[]
  adoptionCurves: number[][]
  censored: number
  /** Unconditional mean/interval are unavailable if any run is censored (or seeds is empty). */
  meanArrival: number | null
  interval95: [number, number] | null
}

function nonnegative(value: number, name: string): number {
  if (!Number.isFinite(value) || value < 0) throw new Error(`${name} must be finite and >= 0`)
  return value
}
function count(value: number, name: string): void {
  nonnegative(value, name)
  if (!Number.isSafeInteger(value)) throw new Error(`${name} must be a safe integer`)
}
function parameter(param: Param, name: string, unit = false): number {
  if (param.value === null) throw new Error(`${name} is null; a case parameter is required`)
  const value = nonnegative(param.value, name)
  if (unit && value > 1) throw new Error(`${name} must be in [0, 1]`)
  return value
}
function occurs(hazard: number, dt: number, draw: RandomStream): boolean {
  nonnegative(hazard, 'hazard')
  return hazard > 0 && draw() < -Math.expm1(-hazard * dt)
}

/**
 * Fixed-step aggregate hazards, with p(event) = 1-exp(-h*dt), observed at step ends.
 * Migration uses §1.4's apprenticeship branch: a B learner gains the method without
 * moving/counting an A mind twice. Source prevalence is constant unless mortality is on.
 * Mortality precedes transmission; diffusion precedes trial and Bass adoption. At most
 * one B representative holds each item; this runner models first acquisition, not headcount growth.
 * Records transfer explicit skill; at or above minSkill that counts as a local success (§3 KD-1c). Trial,
 * inference, and apprenticeship also report a local success.
 * No output production is inferred from adoption, and no generation/copying window is assumed.
 */
export function runKd1(config: Kd1Config, seed: number): Kd1Result {
  const c = config
  if (c.label !== 'fiction') throw new Error('KD-1 case must be labelled fiction')
  if (!Number.isSafeInteger(seed)) throw new Error('seed must be a safe integer')
  if (nonnegative(c.dt, 'dt') === 0) throw new Error('dt must be > 0')
  const contactStart = nonnegative(c.contactStart ?? 0, 'contactStart')
  count(c.steps, 'steps')
  if (!Number.isFinite(c.dt * c.steps)) throw new Error('duration must be finite')
  count(c.holdersA, 'holdersA')
  count(c.populationA, 'populationA')
  count(c.populationB, 'populationB')
  if (c.populationA === 0 || c.populationB === 0 || c.holdersA > c.populationA) {
    throw new Error('populations must be positive and holdersA <= populationA')
  }
  if (c.contact.from === c.contact.to) throw new Error('KD-1 requires two distinct settlements')
  if (nonnegative(c.literacyB, 'literacyB') > 1) throw new Error('literacyB must be in [0, 1]')
  const minimum = parameter(c.technique.minSkill, 'minSkill', true)
  const skill = parameter(c.methodSkill, 'methodSkill', true)
  if (skill < minimum) throw new Error('methodSkill must be >= minSkill for a demonstrated method')
  const mortality = c.mortality.on ? parameter(c.mortality.rate, 'mortality.rate') : 0
  const a = c.contact.from, b = c.contact.to, k = c.technique.id
  const random = streams(seed)
  const migration = random.get('knowledge.technology.diffusion', 'apprenticeship')
  const talk = random.get('knowledge.technology.diffusion', 'talk')
  const inference = random.get('knowledge.technology.diffusion', 'inference')
  const reading = random.get('knowledge.technology.diffusion', 'reading')
  const trial = random.get('knowledge.invention.hazard', b)
  let source: HolderReport[] = Array.from({ length: c.holdersA }, (_, i) => ({
    mind: `${a}/kd1-holder/${i}`, society: a, item: k, level: 'holds', skill,
  }))
  const target = new Map<string, HolderReport>()
  const records = c.records.map(report => ({ ...report }))
  const readers = c.readers.map(report => ({ ...report }))
  const feasibility = c.technique.methods.flat().map(({ recipe }) => ({ society: b, recipe, feasible: c.possibleB }))
  const reach = c.technique.methods.flat().map(({ recipe }) => ({ society: b, recipe, reachable: c.possibleB }))
  let populationA = c.populationA
  let successes = 0, adopted = 0
  let tick = 0
  // fixture: complete by construction, including nonholders and the B learner.
  const othersA = Array.from({ length: c.populationA - c.holdersA }, (_, i) => `${a}/kd1-other/${i}`)
  const peopleA = new Set([...source.map(holder => holder.mind), ...othersA])
  const peopleB = [`${b}/kd1-learner`, ...Array.from({ length: c.populationB - 1 }, (_, i) => `${b}/kd1-other/${i}`)]
  const snapshot = (): StockInputs => {
    const rosters = [{ society: a, people: [...peopleA], tick },
      { society: b, people: [...peopleB], tick }]
    return { holders: [...source, ...target.values()], records, readers, tick, rosters,
      reportedMinds: rosters.map(({ society, people }) => ({ society, minds: [...people], tick })),
      pairs: [a, b].flatMap(society => [k, ...c.technique.propositions].map(item => ({ society, item }))) }
  }
  const state = (): CapabilityState => {
    const inputs = snapshot()
    return capabilityState(c.technique, b,
      computeStock(inputs.holders, records, readers, inputs), feasibility, reach,
      [{ society: b, technique: k, successes, producersUsing: adopted, share: null }])
  }
  const learn = (item: string, learnedSkill: number | null) => {
    const old = target.get(item)
    target.set(item, { mind: `${b}/kd1-learner`, society: b, item, level: 'holds',
      skill: old?.skill == null ? learnedSkill : Math.max(old.skill, learnedSkill ?? old.skill) })
  }
  const principles = () => [...c.technique.propositions].sort().forEach(item => learn(item, null))
  const demonstrate = () => { principles(); learn(k, skill); successes++ }
  const result: Kd1Result = {
    seed, stubs: ['Cognition aggregate holders/readers', 'Economy incentive/records/production',
      'Life source-holder mortality', 'Reality feasibility/reach', 'Society contact/literacy', 'fixture: complete by construction'],
    statesB: [{ step: 0, time: 0, state: state(), holders: 0 }],
    firstArrival: null, lostA: null, adoptionCurve: [0],
  }
  for (let step = 1; step <= c.steps; step++) {
    tick = step
    const time = step * c.dt
    if (mortality > 0 && source.length > 0) {
      const before = snapshot()
      const departures: DepartureReport[] = []
      source = source.filter(holder => {
        if (!occurs(mortality, c.dt, random.get('knowledge.collective.stock', holder.mind))) return true
        departures.push({ mind: holder.mind, society: a, cause: 'death' })
        peopleA.delete(holder.mind)
        return false
      })
      populationA -= departures.length
      const lost = diffStock(before, snapshot(), departures).find(event =>
        event.society === a && event.item === k && event.kind === 'lost')
      if (lost && result.lostA === null) result.lostA = { ...lost, step, time }
    }
    // Only the portion of this step after contact starts exposes B to carriers.
    const contactDt = contactStart === 0 ? c.dt : Math.min(c.dt, Math.max(0, time - contactStart))
    const h = source.length
    const hm = contactDt === 0 || populationA === 0 ? 0 : migrationHazard(c.contact, h, populationA, c.diffusion)
    const ht = contactDt === 0 || populationA === 0 ? 0 : tradeHazard({ ...c.contact, artefacts: 0 }, h, populationA, c.diffusion)
    const hi = contactDt === 0 || populationA === 0 ? 0 : tradeHazard({ ...c.contact, contacts: 0 }, h, populationA, c.diffusion)
    const hr = contactDt === 0 || populationA === 0 ? 0 : recordHazard(c.contact, h, populationA, { society: b, share: c.literacyB }, c.diffusion)
    // Resolve the explicit-content parameter whenever the active channel needs it, independently of draws.
    const explicitSkill = hr > 0 ? skill * (1 - parameter(c.technique.tacitShare, 'tacitShare', true)) : null
    if (occurs(hm, contactDt, migration)) demonstrate()
    if (occurs(ht, contactDt, talk)) principles()
    if (occurs(hi, contactDt, inference)) demonstrate()
    if (occurs(hr, contactDt, reading)) {
      principles()
      learn(k, explicitSkill!)
      if (explicitSkill! >= minimum) successes++
    }
    let current = state()
    if (occurs(inventionHazard(current, c.invention.experimentHours, c.invention.q, !c.invention.on), c.dt, trial)) {
      demonstrate()
      current = state()
    }
    const eligible = adopters({ state: current, ...c.adoption })
    adopted = bassStep(adopted, eligible, c.adoption.p, c.adoption.q, c.dt)
    current = { ...current, adopted: adopted > 0 }
    const holders = target.has(k) ? 1 : 0
    if (holders > 0 && result.firstArrival === null) result.firstArrival = time
    result.statesB.push({ step, time, state: current, holders })
    result.adoptionCurve.push(adopted)
  }
  return result
}

/** Sample-mean normal interval (1.959963984540054 is the standard-normal 97.5% quantile). */
export function runCase(config: Kd1Config, seeds: readonly number[]): Kd1CaseResult {
  const results = seeds.map(seed => runKd1(config, seed))
  const arrivals = results.map(result => result.firstArrival)
  const complete = arrivals.filter((time): time is number => time !== null)
  const censored = arrivals.length - complete.length
  const meanArrival = censored === 0 && complete.length > 0
    ? complete.reduce((sum, time) => sum + time, 0) / complete.length : null
  let interval95: [number, number] | null = null
  if (meanArrival !== null && complete.length > 1) {
    const variance = complete.reduce((sum, time) => sum + (time - meanArrival) ** 2, 0) / (complete.length - 1)
    const margin = 1.959963984540054 * Math.sqrt(variance / complete.length)
    interval95 = [meanArrival - margin, meanArrival + margin]
  }
  return { seeds: [...seeds], results, arrivals, adoptionCurves: results.map(result => result.adoptionCurve),
    censored, meanArrival, interval95 }
}
