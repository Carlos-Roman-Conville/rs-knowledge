import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import type { Param, PropositionRecord, TechniqueRecord } from '../src/schema.ts'

export const fiction = (value: number): Param => ({ value, label: 'fiction', sources: [] })
export const proposition = (): PropositionRecord => ({ id: 'knowledge/proposition.heat', kind: 'proposition', statement: 'Fixture principle', sources: [] })
export const technique = (): TechniqueRecord => ({
  id: 'knowledge/technique.fire', kind: 'technique', name: 'Fixture method', methods: [[{ recipe: 'economy/recipe.fixture', version: 'fixture' }]],
  propositions: ['knowledge/proposition.heat'], minSkill: fiction(0.5), tacitShare: fiction(0.5),
  copyingLoss: { alpha: fiction(1), beta: fiction(1) }, isMedium: false, catalogueRef: null, sources: [],
})
export const tempRepo = () => mkdtempSync(join(tmpdir(), 'knowledge-test-'))
export function write(root: string, path: string, value: unknown, raw = false): void {
  const target = join(root, path)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, raw ? String(value) : JSON.stringify(value))
}
