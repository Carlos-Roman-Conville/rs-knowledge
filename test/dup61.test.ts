import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, it } from 'vitest'
import { computeStock, diffStock } from '../src/index.ts'
import { holderStub, inputsStub, readerStub, recordStub } from './stock-stubs.ts'

it('DUP-61 (1): reports alone determine the stock; nothing persists between calls', () => {
  expect(computeStock([], [], [])).toEqual([])
  expect(computeStock([holderStub()], [], [])[0].known).toBe(true)
  expect(computeStock([], [], [])).toEqual([])
  expect(computeStock([], [recordStub()], [readerStub()])[0].known).toBe(true)
  expect(computeStock([], [], [])).toEqual([])
})

it('DUP-61 (2): the last holder dies without a surviving record, so knowledge is lost', () => {
  const prev = inputsStub({ holders: [holderStub()] })
  expect(diffStock(prev, inputsStub(), [{ mind: 'mind.a', society: 'society.a', cause: 'death' }])).toEqual([
    { society: 'society.a', item: 'item.a', kind: 'lost', causes: ['death'] },
  ])
})

it('DUP-61 (2a): a readable record keeps knowledge after the last holder dies', () => {
  const next = inputsStub({ records: [recordStub()], readers: [readerStub()] })
  const prev = { ...next, holders: [holderStub()] }
  expect(computeStock(next.holders, next.records, next.readers)[0]).toMatchObject({ holders: 0, known: true })
  expect(diffStock(prev, next, [{ mind: 'mind.a', society: 'society.a', cause: 'death' }])).toEqual([
    { society: 'society.a', item: 'item.a', kind: 'holders_gone_record_survives', causes: ['death'] },
  ])
})

it('DUP-61 (2b): an intact unreadable record becomes known again when a reader appears', () => {
  const prev = inputsStub({ records: [recordStub()] })
  const next = { ...prev, readers: [readerStub()] }
  expect(computeStock(prev.holders, prev.records, prev.readers)[0]).toMatchObject({ known: false, unreadableRecords: 1 })
  expect(computeStock(next.holders, next.records, next.readers)[0]).toMatchObject({ known: true, unreadableRecords: 0 })
  expect(diffStock(prev, next, [])).toEqual([
    { society: 'society.a', item: 'item.a', kind: 'regained', causes: [] },
  ])
})

it('DUP-61 (5), DESIGN §0 invariant 4: no Cognition process in any sibling kernel reads the stock', () => {
  const parent = fileURLToPath(new URL('../../', import.meta.url))
  const violations: string[] = []
  for (const directory of readdirSync(parent, { withFileTypes: true }).filter(entry => entry.isDirectory())) {
    const path = join(parent, directory.name, 'kernel.json')
    if (!existsSync(path)) continue
    const manifest = JSON.parse(readFileSync(path, 'utf8')) as { processes?: { id: string; reads?: string[] }[] }
    for (const process of manifest.processes ?? []) {
      if (process.id.startsWith('cognition.') && process.reads?.includes('society.knowledge_stock')) {
        violations.push(`${directory.name}/kernel.json: ${process.id}`)
      }
    }
  }
  expect(violations.sort()).toEqual([])
})
