// @rex/knowledge: the public surface grows unit by unit (DESIGN §2).
import { qualify } from '@rex/kernel'
export type { Param, PropositionRecord, TechniqueRecord, KnowledgeRecord } from './schema.ts'
export { validateRecord } from './schema.ts'
export type { RecordFile, LoadedRecords } from './load.ts'
export { loadRecords } from './load.ts'
export { checkRecords } from './check.ts'
export type { HolderReport, RecordReport, ReaderReport, DepartureReport } from './ports.ts'
export type { StockEntry, StockInputs, StockEvent } from './stock.ts'
export { computeStock, diffStock } from './stock.ts'
export { EULER_GAMMA, expectedSkillChange, criticalSize } from './copying.ts'

/** The engine prefix every knowledge id carries. */
export const ENGINE = 'knowledge'

/** Qualify a local id `<kind>.<slug>` (kind `technique` or `proposition`) as `knowledge/<kind>.<slug>`. */
export function knowledgeId(local: string): string {
  return qualify(ENGINE, local)
}
