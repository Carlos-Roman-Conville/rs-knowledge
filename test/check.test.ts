import { afterEach, expect, it } from 'vitest'
import { rmSync } from 'node:fs'
import { checkRecords } from '../src/check.ts'
import { loadRecords } from '../scripts/load.ts'
import { proposition, technique, tempRepo, write } from './records.ts'

const roots: string[] = []
afterEach(() => roots.splice(0).forEach(path => rmSync(path, { recursive: true, force: true })))
function check(patch: Record<string, unknown> = {}, path = 'fire.json'): string[] {
  const root = tempRepo(); roots.push(root)
  write(root, 'data/propositions/heat.json', proposition())
  write(root, `data/techniques/${path}`, { ...technique(), ...patch })
  const loaded = loadRecords(root)
  return checkRecords(loaded.records, loaded.files)
}
it('valid records pass and own technique id is exempt from no tech tree', () => expect(check()).toEqual([]))
it('empty repository passes integrity check', () => expect(checkRecords([], [])).toEqual([]))
it('bad JSON is a failure line', () => {
  const root = tempRepo(); roots.push(root)
  write(root, 'data/propositions/heat.json', '{', true)
  const loaded = loadRecords(root)
  expect(checkRecords(loaded.records, loaded.files)[0]).toContain('bad JSON')
})
it('invalid id syntax fails', () => expect(check({ id: 'knowledge/technique.Bad' }).join()).toContain('id must match'))
it('id kind differing from kind fails', () => expect(check({ id: 'knowledge/proposition.fire' }).join()).toContain('id kind differs'))
it('file name must be slug.json', () => expect(check({}, 'wrong.json').join()).toContain('file name'))
it('duplicate ids across data and fixtures fail', () => {
  const root = tempRepo(); roots.push(root)
  write(root, 'data/propositions/heat.json', proposition())
  write(root, 'fixtures/example/propositions/heat.json', proposition())
  const loaded = loadRecords(root)
  expect(checkRecords(loaded.records, loaded.files).join()).toContain('duplicate id')
})
it('unresolved proposition reference fails', () => expect(check({ propositions: ['knowledge/proposition.missing'] }).join()).toContain('resolves to no proposition'))
it.each(['notes', 'sources', 'methods', 'propositions', 'metadata'])('no tech tree checks %s including nested strings', key => {
  const value = key === 'methods' ? [[{ recipe: 'knowledge/technique.other', version: 'fixture' }]] : key === 'metadata' ? { nested: [{ id: 'knowledge/technique.other' }] } : ['knowledge/technique.other']
  expect(check({ [key]: value }).join()).toContain('no tech tree')
})
it('no tech tree forbids a nested repeat of its own id', () => expect(check({ metadata: { id: technique().id } }).join()).toContain('no tech tree'))
it.each(['year', 'date', 'period', 'era', 'century', 'prerequisite', 'prerequisites', 'requires_technique', 'unlocks'])('no dates or prerequisites forbids nested key %s in either kind', key => {
  expect(check({ metadata: [{ [key]: 1 }] }).join()).toContain('no dates or prerequisites')
  expect(checkRecords([{ ...proposition(), metadata: [{ [key]: 1 }] }], ['heat.json']).join()).toContain('no dates or prerequisites')
})
it('null Param with non-open label fails', () => expect(check({ minSkill: { value: null, label: 'fiction', sources: [] } }).join()).toContain('null value requires open'))
it('non-null Param with open label fails', () => expect(check({ minSkill: { value: 0.5, label: 'open', sources: [] } }).join()).toContain('open label requires null'))
it.each(['researched', 'estimate'])('Param labelled %s requires source', label => {
  expect(check({ minSkill: { value: 0.5, label, sources: [] } }).join()).toContain('requires a source')
  expect(check({ minSkill: { value: 0.5, label, sources: ['citation'] } })).toEqual([])
})
it.each(['minSkill', 'tacitShare'])('%s must be within [0, 1]', key => {
  for (const value of [-0.1, 1.1]) expect(check({ [key]: { value, label: 'fiction', sources: [] } }).join()).toContain('in [0, 1]')
  for (const value of [0, 1]) expect(check({ [key]: { value, label: 'fiction', sources: [] } })).toEqual([])
})
it.each(['alpha', 'beta'])('copyingLoss %s must be > 0', key => {
  for (const value of [0, -1]) expect(check({ copyingLoss: { ...technique().copyingLoss, [key]: { value, label: 'fiction', sources: [] } } }).join()).toContain('must be > 0')
})
it('empty methods fails', () => expect(check({ methods: [] }).join()).toContain('methods must be non-empty'))
it('catalogueRef must match approved kinds and slug', () => {
  for (const catalogueRef of ['catalogue/person.fire', 'catalogue/technology.Bad', 'catalogue/practice.fire.x', 'fire']) expect(check({ catalogueRef }).join()).toContain('catalogueRef must be')
  for (const catalogueRef of ['catalogue/technology.fire', 'catalogue/practice.fire-making.2', null]) expect(check({ catalogueRef })).toEqual([])
})
it('KNT-K1 proposition carrying catalogueRef fails even when null', () => {
  expect(checkRecords([{ ...proposition(), catalogueRef: null }], ['heat.json']).join()).toContain('proposition must not carry catalogueRef')
})
it('failure lines are sorted deterministically', () => {
  const failures = check({ methods: [], propositions: ['missing'], metadata: { year: 3 } }, 'wrong.json')
  expect(failures.length).toBeGreaterThan(2)
  expect(failures).toEqual([...failures].sort())
})
