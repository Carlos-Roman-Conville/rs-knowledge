import { and, or } from './unknown.ts'
import type { Unknown } from './unknown.ts'
import type { FeasibilityReport, ProductionReport, ReachReport } from './ports.ts'
import type { TechniqueRecord } from './schema.ts'
import type { StockEntry } from './stock.ts'

export type CapabilityState = {
  society: string
  technique: string
  possible: boolean | null
  unknowns: Unknown[]
  known: boolean
  invented: boolean
  adopted: boolean
  deployed: number | null
}

type State = Exclude<keyof CapabilityState, 'society' | 'technique' | 'unknowns'>
export type CapabilityChange = {
  [K in State]: { society: string; technique: string; state: K; from: CapabilityState[K]; to: CapabilityState[K] }
}[State]

const fields = ['adopted', 'deployed', 'invented', 'known', 'possible'] as const
const compare = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0
const byPair = (a: CapabilityState, b: CapabilityState) => compare(a.society, b.society) || compare(a.technique, b.technique)
const key = (state: CapabilityState) => JSON.stringify([state.society, state.technique])

/** PLAN ?3.1 / KN-1 (keeper ruling 2026-11-02): OR of methods, AND of recipe feasibility and reach. */
function possible(
  technique: TechniqueRecord, society: string,
  feasibility: readonly FeasibilityReport[], reach: readonly ReachReport[],
): Pick<CapabilityState, 'possible' | 'unknowns'> {
  const missing = (input: string, producer: string): Unknown => ({ state: 'possible', input, producer })
  const alternatives = technique.methods.map(links => {
    const unknowns: Unknown[] = []
    const assessments = links.map(({ recipe, version }) => {
      if (version === null) {
        unknowns.push(missing(`version of ${recipe}`, 'knowledge data (KNT-12)'))
        return null
      }
      const feasible = feasibility.find(report => report.society === society && report.recipe === recipe)?.feasible ?? null
      const reachable = reach.find(report => report.society === society && report.recipe === recipe)?.reachable ?? null
      if (feasible === null) unknowns.push(missing(`feasibility of ${recipe}`, 'reality'))
      if (reachable === null) unknowns.push(missing(`reach of ${recipe}`, 'economy/reality'))
      return and([feasible, reachable])
    })
    return { value: assessments.length ? and(assessments) : null, unknowns }
  })
  const value = alternatives.length ? or(alternatives.map(alt => alt.value)) : null
  const unknowns = value === null ? alternatives.filter(alt => alt.value === null).flatMap(alt => alt.unknowns) : []
  return {
    possible: value,
    unknowns: [...new Map(unknowns.map(item => [JSON.stringify(item), item])).values()]
      .sort((a, b) => compare(a.state, b.state) || compare(a.input, b.input) || compare(a.producer, b.producer)),
  }
}

/** DESIGN §1.1: independent predicates, recomputed solely from the current port snapshots. */
export function capabilityState(
  technique: TechniqueRecord, society: string, stock: readonly StockEntry[],
  feasibility: readonly FeasibilityReport[], reach: readonly ReachReport[], production: readonly ProductionReport[],
): CapabilityState {
  const minSkill = technique.minSkill.value
  if (minSkill === null) throw new Error(`minSkill is null for ${technique.id}; a researched parameter is required`)
  const entry = stock.find(entry => entry.society === society && entry.item === technique.id)
  const report = production.find(report => report.society === society && report.technique === technique.id)
  if (report?.share != null && (!Number.isFinite(report.share) || report.share < 0 || report.share > 1)) {
    throw new Error('share must be in [0, 1]')
  }
  return {
    society, technique: technique.id,
    ...possible(technique, society, feasibility, reach),
    known: entry?.known === true || (technique.propositions.length > 0 && technique.propositions.every(item =>
      stock.some(entry => entry.society === society && entry.item === item && entry.known))),
    invented: entry?.bestSkill != null && entry.bestSkill >= minSkill && (report?.successes ?? 0) > 0,
    adopted: (report?.producersUsing ?? 0) > 0,
    deployed: report?.share ?? null,
  }
}

export function capabilityStates(
  techniques: readonly TechniqueRecord[], societies: readonly string[], stock: readonly StockEntry[],
  feasibility: readonly FeasibilityReport[], reach: readonly ReachReport[], production: readonly ProductionReport[],
): CapabilityState[] {
  return societies.flatMap(society => techniques.map(technique =>
    capabilityState(technique, society, stock, feasibility, reach, production))).sort(byPair)
}

/** Missing pairs have no reported knowledge/use and unknown possibility/deployment. */
export function diffCapability(prev: readonly CapabilityState[], next: readonly CapabilityState[]): CapabilityChange[] {
  const before = new Map(prev.map(state => [key(state), state]))
  const after = new Map(next.map(state => [key(state), state]))
  const changes: CapabilityChange[] = []
  for (const id of new Set([...before.keys(), ...after.keys()])) {
    const { society, technique } = (after.get(id) ?? before.get(id))!
    const empty: CapabilityState = { society, technique, possible: null, unknowns: [], known: false, invented: false, adopted: false, deployed: null }
    const old = before.get(id) ?? empty
    const current = after.get(id) ?? empty
    for (const state of fields) {
      if (old[state] !== current[state]) {
        changes.push({ society, technique, state, from: old[state], to: current[state] } as CapabilityChange)
      }
    }
  }
  return changes.sort((a, b) => compare(a.society, b.society) || compare(a.technique, b.technique) || compare(a.state, b.state))
}
