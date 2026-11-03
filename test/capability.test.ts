import { completeSnapshotStub } from './stock-stubs.ts'
import { expect, it } from 'vitest'
import { capabilityState, capabilityStates, diffCapability } from '../src/index.ts'
import type { CapabilityState, FeasibilityReport, ProductionReport, ReachReport, StockEntry } from '../src/index.ts'
import { fiction, technique } from './records.ts'

// Declared Reality/Economy port stubs and stock fixtures; all ids and numbers are fiction.
const method = technique()
const society = 'society.a'
const feasibilityStub = (patch: Partial<FeasibilityReport> = {}): FeasibilityReport => ({
  society, recipe: method.methods[0][0].recipe, feasible: true, ...patch,
})
const reachStub = (patch: Partial<ReachReport> = {}): ReachReport => ({
  society, recipe: method.methods[0][0].recipe, reachable: true, ...patch,
})
const productionStub = (patch: Partial<ProductionReport> = {}): ProductionReport => ({
  society, technique: method.id, producersUsing: 1, successes: 1, share: 0.5, ...patch,
})
const stockStub = (patch: Partial<StockEntry> = {}): StockEntry => ({
  society, item: method.id, holders: 1, heardOf: 0, bestSkill: 0.5,
  readableRecords: 0, unreadableRecords: 0, availability: true,
  coverage: 1, tick: 0, partial: false, notApplicable: false, unknowns: [], ...patch,
})
const evaluate = (
  stock: readonly StockEntry[] = [], feasibility: readonly FeasibilityReport[] = [],
  reach: readonly ReachReport[] = [], production: readonly ProductionReport[] = [],
) => capabilityState(method, society, stock, feasibility, reach, production, completeSnapshotStub())

it('DESIGN §1.1 possible requires feasibility and reach for every mandatory recipe in a method', () => {
  const second = 'economy/recipe.second'
  const multi = { ...method, methods: [[...method.methods[0], { recipe: second, version: 'fixture' }]] }
  expect(evaluate([], [feasibilityStub()], [reachStub()]).possible).toBe(true)
  expect(capabilityState(multi, society, [], [feasibilityStub()], [reachStub()], []).possible).toBeNull()
  expect(capabilityState(multi, society, [], [feasibilityStub(), feasibilityStub({ recipe: second })],
    [reachStub(), reachStub({ recipe: second })], []).possible).toBe(true)
})

it('DESIGN §1.1 any false feasibility or reach overrides missing and null reports', () => {
  expect(evaluate([], [feasibilityStub({ feasible: false })]).possible).toBe(false)
  expect(evaluate([], [], [reachStub({ reachable: false })]).possible).toBe(false)
  expect(evaluate([], [feasibilityStub({ feasible: null })], [reachStub({ reachable: false })]).possible).toBe(false)
  const multi = { ...method, methods: [[{ recipe: 'economy/recipe.missing', version: 'fixture' }, ...method.methods[0]]] }
  expect(capabilityState(multi, society, [], [feasibilityStub({ feasible: false })], [], []).possible).toBe(false)
})

it('DESIGN §1.1 missing or null reports and absent recipe links never default possible to true', () => {
  expect(evaluate().possible).toBeNull()
  expect(evaluate([], [feasibilityStub()]).possible).toBeNull()
  expect(evaluate([], [], [reachStub()]).possible).toBeNull()
  expect(evaluate([], [feasibilityStub({ feasible: null })], [reachStub()]).possible).toBeNull()
  expect(evaluate([], [feasibilityStub()], [reachStub({ reachable: null })]).possible).toBeNull()
  expect(capabilityState({ ...method, methods: [] }, society, [], [], [], []).possible).toBeNull()
})

it('DESIGN §1.1 availability accepts the technique own availability stock, including readable records alone', () => {
  expect(evaluate([stockStub()]).availability).toBe(true)
  expect(evaluate([stockStub({ holders: 0, bestSkill: null, readableRecords: 1 })]).availability).toBe(true)
  expect(evaluate([stockStub({ availability: false })]).availability).toBe(false)
})

it('DESIGN §1.1 availability otherwise requires every proposition and a nonempty proposition list', () => {
  const other = 'knowledge/proposition.other'
  const multi = { ...method, propositions: [...method.propositions, other] }
  const principle = stockStub({ item: method.propositions[0], bestSkill: null })
  expect(evaluate([principle]).availability).toBe(true)
  expect(capabilityState(multi, society, [principle], [], [], []).availability).toBeNull()
  expect(capabilityState(multi, society, [principle, stockStub({ item: other, availability: false })], [], [], [], completeSnapshotStub()).availability).toBe(false)
  expect(capabilityState(multi, society, [principle, stockStub({ item: other })], [], [], []).availability).toBe(true)
  expect(capabilityState({ ...method, propositions: [] }, society, [], [], [], []).availability).toBeNull()
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
  )).toEqual({ society, technique: method.id, possible: null, unknowns: [
    { state: 'possible', input: `feasibility of ${method.methods[0][0].recipe}`, producer: 'reality' },
    { state: 'possible', input: `reach of ${method.methods[0][0].recipe}`, producer: 'economy/reality' },
  ], availability: false, invented: false, adopted: false, deployed: null })
  expect(evaluate([], [feasibilityStub(), feasibilityStub({ feasible: false, recipe: 'other' })],
    [reachStub(), reachStub({ reachable: false, society: elsewhere })]).possible).toBe(true)
})

it('DESIGN §0 invariant 6: migrant method skill and success can make invented true while availability is false', () => {
  expect(evaluate([stockStub({ availability: false })], [], [], [productionStub({ producersUsing: 0, share: null })]))
    .toMatchObject({ availability: false, invented: true, adopted: false, deployed: null })
})

it('DESIGN §0 invariant 6: earlier bought stock permits adopted while possible is false', () => {
  expect(evaluate([], [feasibilityStub()], [reachStub({ reachable: false })], [productionStub()]))
    .toMatchObject({ possible: false, adopted: true, invented: false, availability: false })
})

it('DESIGN §1.1 every state can fall and diff reports each field in state order', () => {
  const prev = evaluate([stockStub()], [feasibilityStub()], [reachStub()], [productionStub()])
  const next = evaluate([], [feasibilityStub()], [reachStub({ reachable: false })],
    [productionStub({ producersUsing: 0, successes: 0, share: 0 })])
  expect(diffCapability([prev], [next])).toEqual([
    { society, technique: method.id, state: 'adopted', from: true, to: false },
    { society, technique: method.id, state: 'availability', from: true, to: false },
    { society, technique: method.id, state: 'deployed', from: 0.5, to: 0 },
    { society, technique: method.id, state: 'invented', from: true, to: false },
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
    { society, technique: method.id, state: 'availability', from: null, to: false },
    { society, technique: method.id, state: 'deployed', from: null, to: 0.5 },
    { society, technique: method.id, state: 'possible', from: null, to: true },
  ]
  expect(diffCapability([], [state])).toEqual(expected)
  expect(diffCapability([evaluate()], [state])).toEqual(expected.filter(change => change.state !== 'availability'))
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
  const result = capabilityStates(techniques, societies, stock, feasibility, reach, production, completeSnapshotStub())
  expect(result.map(state => [state.society, state.technique])).toEqual([
    [society, method.id], [society, 'knowledge/technique.z'], ['society.z', method.id], ['society.z', 'knowledge/technique.z'],
  ])
  expect(capabilityStates([...techniques].reverse(), [...societies].reverse(), [...stock].reverse(),
    [...feasibility].reverse(), [...reach].reverse(), [...production].reverse(), completeSnapshotStub())).toEqual(result)
  const empty = capabilityStates(techniques, societies, [], [], [], [])
  const changes = diffCapability(empty, result)
  expect(diffCapability([...empty].reverse(), [...result].reverse())).toEqual(changes)
  const labels = changes.map(change => `${change.society}/${change.technique}/${change.state}`)
  expect(labels).toEqual([...labels].sort())
  const saved: CapabilityState[] = result.map(state => ({ ...state }))
  result[0].availability = false
  expect(capabilityStates(techniques, societies, stock, feasibility, reach, production, completeSnapshotStub())).toEqual(saved)
  expect(capabilityStates([], societies, [], [], [], [])).toEqual([])
  expect(capabilityStates(techniques, [], [], [], [], [])).toEqual([])
})

it('DESIGN rule 8 throws naming minSkill when the required parameter is null, even without holders', () => {
  const unresolved = { ...method, minSkill: { value: null, label: 'open' as const, sources: [] } }
  expect(() => capabilityState(unresolved, society, [], [], [], [])).toThrow(/minSkill/)
  expect(() => capabilityStates([unresolved], [society], [], [], [], [])).toThrow(/minSkill/)
})

const secondRecipe = 'economy/recipe.second'
const alternatives = { ...method, methods: [...method.methods, [{ recipe: secondRecipe, version: 'fixture' }]] }

it('PLAN KN-1: one working alternative beside an infeasible alternative is possible', () => {
  const state = capabilityState(alternatives, society, [],
    [feasibilityStub(), feasibilityStub({ recipe: secondRecipe, feasible: false })], [reachStub()], [])
  expect(state.possible).toBe(true)
  expect(state.unknowns).toEqual([])
})

it('PLAN KN-1: every alternative infeasible is false without unknowns', () => {
  const state = capabilityState(alternatives, society, [],
    [feasibilityStub({ feasible: false }), feasibilityStub({ recipe: secondRecipe, feasible: false })], [], [])
  expect(state.possible).toBe(false)
  expect(state.unknowns).toEqual([])
})

it('PLAN KN-1: an unknown alternative with none true names its missing input and producer', () => {
  const state = capabilityState(alternatives, society, [],
    [feasibilityStub({ feasible: false })], [reachStub({ recipe: secondRecipe })], [])
  expect(state.possible).toBeNull()
  expect(state.unknowns).toEqual([
    { state: 'possible', input: `feasibility of ${secondRecipe}`, producer: 'reality' },
  ])
})

it('PLAN KN-1: two mandatory recipes with one infeasible make the method false', () => {
  const state = capabilityState({ ...method, methods: [alternatives.methods.flat()] }, society, [],
    [feasibilityStub(), feasibilityStub({ recipe: secondRecipe, feasible: false })], [reachStub()], [])
  expect(state.possible).toBe(false)
  expect(state.unknowns).toEqual([])
})

it('PLAN KN-1: an unversioned link stays unknown even with working reports', () => {
  const recipe = method.methods[0][0].recipe
  const state = capabilityState({ ...method, methods: [[{ recipe, version: null }]] }, society, [],
    [feasibilityStub()], [reachStub()], [])
  expect(state.possible).toBeNull()
  expect(state.unknowns).toEqual([
    { state: 'possible', input: `version of ${recipe}`, producer: 'knowledge data (KNT-12)' },
  ])
})

it('PLAN KN-1: no feasibility reports stays unknown, never true', () => {
  const state = evaluate([], [], [reachStub()])
  expect(state.possible).toBeNull()
  expect(state.unknowns).toEqual([
    { state: 'possible', input: `feasibility of ${method.methods[0][0].recipe}`, producer: 'reality' },
  ])
})

it('PLAN KN-1: unknowns sort independently of method order and are ignored by diffCapability', () => {
  const first = capabilityState(alternatives, society, [], [], [], [])
  const reversed = capabilityState({ ...alternatives, methods: [...alternatives.methods].reverse() }, society, [], [], [], [])
  expect(first).toEqual(reversed)
  expect(first.unknowns.map(item => item.input)).toEqual(first.unknowns.map(item => item.input).sort())
  expect(diffCapability([first], [{ ...first, unknowns: [] }])).toEqual([])
  expect(evaluate([], [feasibilityStub()], []).unknowns).toEqual([
    { state: 'possible', input: `reach of ${method.methods[0][0].recipe}`, producer: 'economy/reality' },
  ])
})

it('PLAN card KN-2: availability preserves unknown stock and uses three-valued proposition conjunction', () => {
  expect(evaluate([stockStub({ availability: null })]).availability).toBeNull()
  const multi = { ...method, propositions: ['p', 'q'] }
  const own = stockStub({ availability: false })
  expect(capabilityState(multi, society, [own, stockStub({ item: 'p' })], [], [], []).availability).toBeNull()
  expect(capabilityState(multi, society, [own, stockStub({ item: 'p', availability: false })], [], [], []).availability).toBe(false)
  expect(capabilityState(multi, society, [own, stockStub({ item: 'p' }), stockStub({ item: 'q' })], [], [], []).availability).toBe(true)
  expect(capabilityState(method, society, [], [], [], []).availability).toBeNull()
})
