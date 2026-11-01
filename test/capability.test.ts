import { expect, it } from 'vitest'
import { capabilityState, capabilityStates, diffCapability } from '../src/index.ts'
import type { CapabilityState, FeasibilityReport, ProductionReport, ReachReport, StockEntry } from '../src/index.ts'
import { fiction, technique } from './records.ts'

// Declared Reality/Economy port stubs and stock fixtures; all ids and numbers are fiction.
const method = technique()
const society = 'society.a'
const feasibilityStub = (patch: Partial<FeasibilityReport> = {}): FeasibilityReport => ({
  society, recipe: method.enables[0], feasible: true, ...patch,
})
const reachStub = (patch: Partial<ReachReport> = {}): ReachReport => ({
  society, recipe: method.enables[0], reachable: true, ...patch,
})
const productionStub = (patch: Partial<ProductionReport> = {}): ProductionReport => ({
  society, technique: method.id, producersUsing: 1, successes: 1, share: 0.5, ...patch,
})
const stockStub = (patch: Partial<StockEntry> = {}): StockEntry => ({
  society, item: method.id, holders: 1, heardOf: 0, bestSkill: 0.5,
  readableRecords: 0, unreadableRecords: 0, known: true, ...patch,
})
const evaluate = (
  stock: readonly StockEntry[] = [], feasibility: readonly FeasibilityReport[] = [],
  reach: readonly ReachReport[] = [], production: readonly ProductionReport[] = [],
) => capabilityState(method, society, stock, feasibility, reach, production)

it('DESIGN §1.1 possible requires feasibility and reach for every enabled recipe', () => {
  const second = 'economy/recipe.second'
  const multi = { ...method, enables: [...method.enables, second] }
  expect(evaluate([], [feasibilityStub()], [reachStub()]).possible).toBe(true)
  expect(capabilityState(multi, society, [], [feasibilityStub()], [reachStub()], []).possible).toBeNull()
  expect(capabilityState(multi, society, [], [feasibilityStub(), feasibilityStub({ recipe: second })],
    [reachStub(), reachStub({ recipe: second })], []).possible).toBe(true)
})

it('DESIGN §1.1 any false feasibility or reach overrides missing and null reports', () => {
  expect(evaluate([], [feasibilityStub({ feasible: false })]).possible).toBe(false)
  expect(evaluate([], [], [reachStub({ reachable: false })]).possible).toBe(false)
  expect(evaluate([], [feasibilityStub({ feasible: null })], [reachStub({ reachable: false })]).possible).toBe(false)
  const multi = { ...method, enables: ['economy/recipe.missing', ...method.enables] }
  expect(capabilityState(multi, society, [], [feasibilityStub({ feasible: false })], [], []).possible).toBe(false)
})

it('DESIGN §1.1 missing or null reports and absent recipe links never default possible to true', () => {
  expect(evaluate().possible).toBeNull()
  expect(evaluate([], [feasibilityStub()]).possible).toBeNull()
  expect(evaluate([], [], [reachStub()]).possible).toBeNull()
  expect(evaluate([], [feasibilityStub({ feasible: null })], [reachStub()]).possible).toBeNull()
  expect(evaluate([], [feasibilityStub()], [reachStub({ reachable: null })]).possible).toBeNull()
  expect(capabilityState({ ...method, enables: [] }, society, [], [], [], []).possible).toBeNull()
})

it('DESIGN §1.1 known accepts the technique own known stock, including readable records alone', () => {
  expect(evaluate([stockStub()]).known).toBe(true)
  expect(evaluate([stockStub({ holders: 0, bestSkill: null, readableRecords: 1 })]).known).toBe(true)
  expect(evaluate([stockStub({ known: false })]).known).toBe(false)
})

it('DESIGN §1.1 known otherwise requires every proposition and a nonempty proposition list', () => {
  const other = 'knowledge/proposition.other'
  const multi = { ...method, propositions: [...method.propositions, other] }
  const principle = stockStub({ item: method.propositions[0], bestSkill: null })
  expect(evaluate([principle]).known).toBe(true)
  expect(capabilityState(multi, society, [principle], [], [], []).known).toBe(false)
  expect(capabilityState(multi, society, [principle, stockStub({ item: other, known: false })], [], [], []).known).toBe(false)
  expect(capabilityState(multi, society, [principle, stockStub({ item: other })], [], [], []).known).toBe(true)
  expect(capabilityState({ ...method, propositions: [] }, society, [], [], [], []).known).toBe(false)
})

it('KNT-Q1 invented requires own method skill at or above minSkill and a local success', () => {
  expect(evaluate([stockStub()], [], [], [productionStub()]).invented).toBe(true)
  expect(evaluate([stockStub({ bestSkill: 0.8 })], [], [], [productionStub()]).invented).toBe(true)
  for (const bestSkill of [null, 0.4]) {
    expect(evaluate([stockStub({ bestSkill })], [], [], [productionStub()]).invented).toBe(false)
  }
  expect(evaluate([], [], [], [productionStub()]).invented).toBe(false)
  expect(evaluate([stockStub({ item: method.propositions[0] })], [], [], [productionStub()]).invented).toBe(false)
  expect(evaluate([stockStub()]).invented).toBe(false)
  expect(evaluate([stockStub()], [], [], [productionStub({ successes: 0 })]).invented).toBe(false)
  expect(capabilityState({ ...method, minSkill: fiction(0) }, society,
    [stockStub({ bestSkill: 0 })], [], [], [productionStub()]).invented).toBe(true)
  expect(capabilityState({ ...method, minSkill: fiction(0) }, society,
    [stockStub({ bestSkill: null })], [], [], [productionStub()]).invented).toBe(false)
})

it('DESIGN §1.1 adopted reads producersUsing alone', () => {
  expect(evaluate([], [], [], [productionStub({ successes: 0, share: null })]).adopted).toBe(true)
  expect(evaluate([], [], [], [productionStub({ producersUsing: 0 })]).adopted).toBe(false)
  expect(evaluate().adopted).toBe(false)
})

it('DESIGN §1.1 deployed is the reported share, including zero and null, independently of adoption', () => {
  for (const share of [0, 0.5, 1, null]) {
    expect(evaluate([], [], [], [productionStub({ producersUsing: 0, share })]).deployed).toBe(share)
  }
  expect(evaluate().deployed).toBeNull()
})

it.each([-0.01, 1.01, NaN, Infinity, -Infinity])('DESIGN §1.1 rejects deployed share outside [0,1]: %s', share => {
  expect(() => evaluate([], [], [], [productionStub({ share })])).toThrow(/share/)
})

it('DESIGN §1.1 scopes every port and stock lookup to its society and item', () => {
  const elsewhere = 'society.b'
  expect(evaluate([stockStub({ society: elsewhere }), stockStub({ item: method.propositions[0], society: elsewhere })],
    [feasibilityStub({ society: elsewhere }), feasibilityStub({ recipe: 'other' })],
    [reachStub({ society: elsewhere }), reachStub({ recipe: 'other' })],
    [productionStub({ society: elsewhere }), productionStub({ technique: 'other' })],
  )).toEqual({ society, technique: method.id, possible: null, known: false, invented: false, adopted: false, deployed: null })
  expect(evaluate([], [feasibilityStub(), feasibilityStub({ feasible: false, recipe: 'other' })],
    [reachStub(), reachStub({ reachable: false, society: elsewhere })]).possible).toBe(true)
})

it('DESIGN §0 invariant 6: migrant method skill and success can make invented true while known is false', () => {
  expect(evaluate([stockStub({ known: false })], [], [], [productionStub({ producersUsing: 0, share: null })]))
    .toMatchObject({ known: false, invented: true, adopted: false, deployed: null })
})

it('DESIGN §0 invariant 6: earlier bought stock permits adopted while possible is false', () => {
  expect(evaluate([], [feasibilityStub()], [reachStub({ reachable: false })], [productionStub()]))
    .toMatchObject({ possible: false, adopted: true, invented: false, known: false })
})

it('DESIGN §1.1 every state can fall and diff reports each field in state order', () => {
  const prev = evaluate([stockStub()], [feasibilityStub()], [reachStub()], [productionStub()])
  const next = evaluate([], [feasibilityStub()], [reachStub({ reachable: false })],
    [productionStub({ producersUsing: 0, successes: 0, share: 0 })])
  expect(diffCapability([prev], [next])).toEqual([
    { society, technique: method.id, state: 'adopted', from: true, to: false },
    { society, technique: method.id, state: 'deployed', from: 0.5, to: 0 },
    { society, technique: method.id, state: 'invented', from: true, to: false },
    { society, technique: method.id, state: 'known', from: true, to: false },
    { society, technique: method.id, state: 'possible', from: true, to: false },
  ])
  expect(diffCapability([next], [prev])).toEqual(diffCapability([prev], [next]).map(change => ({
    ...change, from: change.to, to: change.from,
  })))
  expect(diffCapability([prev], [prev])).toEqual([])
})

it('DESIGN §1.1 diff retains null transitions and treats missing pairs as unreported', () => {
  const state = evaluate([], [feasibilityStub()], [reachStub()], [productionStub({ producersUsing: 0 })])
  const expected = [
    { society, technique: method.id, state: 'deployed', from: null, to: 0.5 },
    { society, technique: method.id, state: 'possible', from: null, to: true },
  ]
  expect(diffCapability([], [state])).toEqual(expected)
  expect(diffCapability([evaluate()], [state])).toEqual(expected)
  expect(diffCapability([state], [])).toEqual(expected.map(change => ({ ...change, from: change.to, to: change.from })))
  expect(diffCapability([], [])).toEqual([])
})

it('DESIGN §0 deterministic batch and diff sort by society, technique, state without mutating inputs', () => {
  const techniques = Object.freeze([Object.freeze({ ...method, id: 'knowledge/technique.z' }), Object.freeze(method)])
  const societies = Object.freeze(['society.z', society])
  const stock = Object.freeze([Object.freeze(stockStub({ society: 'society.z' })), Object.freeze(stockStub())])
  const feasibility = Object.freeze([feasibilityStub({ society: 'society.z' }), feasibilityStub()])
  const reach = Object.freeze([reachStub({ society: 'society.z' }), reachStub()])
  const production = Object.freeze([productionStub({ society: 'society.z' }), productionStub()])
  const result = capabilityStates(techniques, societies, stock, feasibility, reach, production)
  expect(result.map(state => [state.society, state.technique])).toEqual([
    [society, method.id], [society, 'knowledge/technique.z'], ['society.z', method.id], ['society.z', 'knowledge/technique.z'],
  ])
  expect(capabilityStates([...techniques].reverse(), [...societies].reverse(), [...stock].reverse(),
    [...feasibility].reverse(), [...reach].reverse(), [...production].reverse())).toEqual(result)
  const empty = capabilityStates(techniques, societies, [], [], [], [])
  const changes = diffCapability(empty, result)
  expect(diffCapability([...empty].reverse(), [...result].reverse())).toEqual(changes)
  const labels = changes.map(change => `${change.society}/${change.technique}/${change.state}`)
  expect(labels).toEqual([...labels].sort())
  const saved: CapabilityState[] = result.map(state => ({ ...state }))
  result[0].known = false
  expect(capabilityStates(techniques, societies, stock, feasibility, reach, production)).toEqual(saved)
  expect(capabilityStates([], societies, [], [], [], [])).toEqual([])
  expect(capabilityStates(techniques, [], [], [], [], [])).toEqual([])
})

it('DESIGN rule 8 throws naming minSkill when the required parameter is null, even without holders', () => {
  const unresolved = { ...method, minSkill: { value: null, label: 'open' as const, sources: [] } }
  expect(() => capabilityState(unresolved, society, [], [], [], [])).toThrow(/minSkill/)
  expect(() => capabilityStates([unresolved], [society], [], [], [], [])).toThrow(/minSkill/)
})
