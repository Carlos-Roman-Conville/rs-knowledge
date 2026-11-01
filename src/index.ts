// @rex/knowledge: the public surface grows unit by unit (DESIGN §2).
import { qualify } from '@rex/kernel'
export type { Param, PropositionRecord, TechniqueRecord, KnowledgeRecord } from './schema.ts'
export { validateRecord } from './schema.ts'
export type { RecordFile } from './check.ts'
export { checkRecords } from './check.ts'
export type { HolderReport, RecordReport, ReaderReport, DepartureReport } from './ports.ts'
export type { StockEntry, StockInputs, StockEvent } from './stock.ts'
export { computeStock, diffStock } from './stock.ts'
export type { FeasibilityReport, ReachReport, ProductionReport } from './ports.ts'
export type { CapabilityState, CapabilityChange } from './capability.ts'
export { capabilityState, capabilityStates, diffCapability } from './capability.ts'
export { EULER_GAMMA, expectedSkillChange, criticalSize } from './copying.ts'
export type { ContactReport, LiteracyReport } from './ports.ts'
export type { DiffusionParams } from './diffusion.ts'
export { migrationHazard, tradeHazard, recordHazard, totalHazard, arrivalTimeMean } from './diffusion.ts'
export { inventionHazard } from './invention.ts'
export type { AdopterInputs } from './adoption.ts'
export { adopters, bassStep, bassCurve } from './adoption.ts'
export type { AvailableMedium, SocietyMedia } from './media.ts'
export { availableMedia } from './media.ts'

/** The engine prefix every knowledge id carries. */
export const ENGINE = 'knowledge'

/** Qualify a local id `<kind>.<slug>` (kind `technique` or `proposition`) as `knowledge/<kind>.<slug>`. */
export function knowledgeId(local: string): string {
  return qualify(ENGINE, local)
}
