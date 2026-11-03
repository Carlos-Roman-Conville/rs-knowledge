import { computeStock as compute } from '../src/stock.ts'
import type { StockSnapshot } from '../src/stock.ts'
import type { HolderReport, AccessReport, RecordReport, StockInputs } from '../src/index.ts'

// Declared port stubs; all ids, skill, fidelity and access assessments are fiction, not integration data.
export const holderStub = (patch: Partial<HolderReport> = {}): HolderReport => ({
  mind: 'mind.a', society: 'society.a', item: 'item.a', level: 'holds', skill: 0.5, ...patch,
})
export const recordStub = (patch: Partial<RecordReport> = {}): RecordReport => ({
  record: 'record.a', society: 'society.a', item: 'item.a', intact: true, fidelity: 0.5, script: 'script.a', ...patch,
})
export const accessStub = (patch: Partial<AccessReport> = {}): AccessReport => ({
  reader: 'mind.a', record: 'record.a', access: true, interpret: true, source: 'fixture', ...patch,
})
export const inputsStub = (patch: Partial<StockInputs> = {}): StockInputs => ({
  holders: [], records: [], access: [], ...completeSnapshotStub(), ...patch,
})

// fixture: complete by construction; membership is independent of the holder list.
export function completeSnapshotStub(tick = 0): StockSnapshot {
  const people = ['mind.a', 'mind.b', 'mind.c', 'mind.d', 'mind.heard', 'heard', 'other']
  return { tick, rosters: [{ society: 'society.a', people, tick }],
    reportedMinds: [{ society: 'society.a', minds: [...people], tick }] }
}
export const computeStock = (holders: readonly HolderReport[], records: readonly RecordReport[], access: readonly AccessReport[], snapshot: StockSnapshot = completeSnapshotStub()) =>
  compute(holders, records, access, snapshot)
