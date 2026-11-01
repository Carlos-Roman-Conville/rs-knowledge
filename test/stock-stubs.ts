import type { HolderReport, ReaderReport, RecordReport, StockInputs } from '../src/index.ts'

// Declared port stubs; all ids, skill, fidelity and reader counts are fiction, not integration data.
export const holderStub = (patch: Partial<HolderReport> = {}): HolderReport => ({
  mind: 'mind.a', society: 'society.a', item: 'item.a', level: 'holds', skill: 0.5, ...patch,
})
export const recordStub = (patch: Partial<RecordReport> = {}): RecordReport => ({
  record: 'record.a', society: 'society.a', item: 'item.a', intact: true, fidelity: 0.5, script: 'script.a', ...patch,
})
export const readerStub = (patch: Partial<ReaderReport> = {}): ReaderReport => ({
  society: 'society.a', script: 'script.a', readers: 1, ...patch,
})
export const inputsStub = (patch: Partial<StockInputs> = {}): StockInputs => ({
  holders: [], records: [], readers: [], ...patch,
})
