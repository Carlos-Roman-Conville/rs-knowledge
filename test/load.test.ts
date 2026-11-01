import { afterEach, expect, it } from 'vitest'
import { rmSync } from 'node:fs'
import { loadRecords } from '../scripts/load.ts'
import { proposition, technique, tempRepo, write } from './records.ts'

const roots: string[] = []
const root = () => { const path = tempRepo(); roots.push(path); return path }
afterEach(() => roots.splice(0).forEach(path => rmSync(path, { recursive: true, force: true })))

it('loads every data and fixture JSON recursively, sorted by id with file provenance', () => {
  const repo = root()
  write(repo, 'data/techniques/fire.json', technique())
  write(repo, 'data/propositions/nested/heat.json', proposition())
  write(repo, 'fixtures/example/propositions/air.json', { ...proposition(), id: 'knowledge/proposition.air' })
  write(repo, 'fixtures/example/techniques/writing.json', { ...technique(), id: 'knowledge/technique.writing' })
  write(repo, 'data/ignored.json', {})
  write(repo, 'data/propositions/ignored.txt', {})
  const loaded = loadRecords(repo)
  expect(loaded.records.map(record => (record as { id: string }).id)).toEqual([
    'knowledge/proposition.air', 'knowledge/proposition.heat', 'knowledge/technique.fire', 'knowledge/technique.writing',
  ])
  expect(loaded.files.map(file => file.path.split(/[\\/]/).pop())).toEqual(['air.json', 'heat.json', 'fire.json', 'writing.json'])
})
it('empty repository passes loading', () => expect(loadRecords(root())).toEqual({ records: [], files: [] }))
it('bad JSON retains provenance while other records still load', () => {
  const repo = root()
  write(repo, 'data/propositions/broken.json', '{', true)
  write(repo, 'data/propositions/heat.json', proposition())
  const loaded = loadRecords(repo)
  expect(loaded.records).toEqual([null, proposition()])
  expect(loaded.files[0].error).toBe('bad JSON')
})
