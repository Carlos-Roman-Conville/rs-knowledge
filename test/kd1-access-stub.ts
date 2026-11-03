import type { AccessReport, ReaderReport, RecordReport, StockSnapshot } from '../src/index.ts'

/** KNT-14 fiction: matching script competence implies access only in this KD-1 stub. */
export function kd1AccessStub(world: StockSnapshot & { records: RecordReport[]; readers: ReaderReport[] }): AccessReport[] {
  return world.records.map(record => ({
    record: record.record,
    reader: world.rosters?.find(r => r.society === record.society)?.people?.at(-1) ?? 'fixture/no-reader',
    access: world.readers.some(r => r.society === record.society && r.script === record.script && r.readers > 0),
    interpret: true, source: 'fixture',
  }))
}
