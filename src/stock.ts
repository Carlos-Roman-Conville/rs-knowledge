import type { DepartureReport, HolderReport, ReaderReport, RecordReport } from './ports.ts'

export type StockEntry = {
  society: string
  item: string
  holders: number
  heardOf: number
  bestSkill: number | null
  readableRecords: number
  unreadableRecords: number
  known: boolean
}

export type StockInputs = {
  holders: readonly HolderReport[]
  records: readonly RecordReport[]
  readers: readonly ReaderReport[]
}

export type StockEvent = {
  society: string
  item: string
  kind: 'lost' | 'holders_gone_record_survives' | 'unreadable' | 'regained'
  causes: string[]
}

const key = (...ids: string[]) => JSON.stringify(ids)
const compare = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0
const byItem = (a: StockEntry, b: StockEntry) => compare(a.society, b.society) || compare(a.item, b.item)
const readableScripts = (readers: readonly ReaderReport[]) => new Set(
  readers.filter(report => report.readers > 0).map(report => key(report.society, report.script)),
)

function unitInterval(value: number, name: string): void {
  if (!Number.isFinite(value) || value < 0 || value > 1) throw new Error(`${name} must be in [0, 1]`)
}

/** DESIGN §1.2: all state is local to this computation, never retained between calls. */
export function computeStock(
  holders: readonly HolderReport[], records: readonly RecordReport[], readers: readonly ReaderReport[],
): StockEntry[] {
  const groups = new Map<string, { entry: StockEntry; held: Set<string>; heard: Set<string> }>()
  const societies = new Map<string, string>()
  const scripts = readableScripts(readers)
  const group = (society: string, item: string) => {
    const id = key(society, item)
    let result = groups.get(id)
    if (!result) {
      result = {
        entry: { society, item, holders: 0, heardOf: 0, bestSkill: null, readableRecords: 0, unreadableRecords: 0, known: false },
        held: new Set(), heard: new Set(),
      }
      groups.set(id, result)
    }
    return result
  }
  for (const report of holders) {
    if (societies.has(report.mind) && societies.get(report.mind) !== report.society) {
      throw new Error(`mind ${report.mind} reported in two societies (conservation)`)
    }
    societies.set(report.mind, report.society)
    if (report.skill !== null) unitInterval(report.skill, 'skill')
    const { entry, held, heard } = group(report.society, report.item)
    if (report.level === 'holds') {
      held.add(report.mind)
      if (report.skill !== null) entry.bestSkill = Math.max(entry.bestSkill ?? report.skill, report.skill)
    } else heard.add(report.mind)
  }
  for (const report of records) {
    unitInterval(report.fidelity, 'fidelity')
    const { entry } = group(report.society, report.item)
    if (!report.intact) continue
    if (scripts.has(key(report.society, report.script))) entry.readableRecords++
    else entry.unreadableRecords++
  }
  return [...groups.values()].map(({ entry, held, heard }) => ({
    ...entry,
    holders: held.size,
    heardOf: [...heard].filter(mind => !held.has(mind)).length,
    known: held.size > 0 || entry.readableRecords > 0,
  })).sort(byItem)
}

/** Loss causes come from port reports; absent pairs are treated as an unknown, empty stock. */
export function diffStock(prev: StockInputs, next: StockInputs, departures: readonly DepartureReport[]): StockEvent[] {
  const before = new Map(computeStock(prev.holders, prev.records, prev.readers).map(entry => [key(entry.society, entry.item), entry]))
  const after = new Map(computeStock(next.holders, next.records, next.readers).map(entry => [key(entry.society, entry.item), entry]))
  const prevScripts = readableScripts(prev.readers)
  const nextScripts = readableScripts(next.readers)
  const nextRecords = new Map(next.records.map(report => [key(report.society, report.item, report.record), report]))
  const events: StockEvent[] = []
  for (const id of new Set([...before.keys(), ...after.keys()])) {
    const old = before.get(id)
    const current = after.get(id)
    const { society, item } = (current ?? old)!
    const kinds: StockEvent['kind'][] = []
    if (old?.known && !current?.known) kinds.push('lost')
    if ((old?.holders ?? 0) > 0 && current?.holders === 0 && current.known) kinds.push('holders_gone_record_survives')
    if ((old?.readableRecords ?? 0) > 0 && current?.readableRecords === 0 && current.unreadableRecords > 0) kinds.push('unreadable')
    if (!old?.known && current?.known) kinds.push('regained')
    if (kinds.length === 0) continue

    const causes = new Set<string>()
    const formerHolders = new Set(prev.holders.filter(report => report.society === society && report.item === item && report.level === 'holds').map(report => report.mind))
    for (const departure of departures) {
      if (departure.society === society && formerHolders.has(departure.mind)) causes.add(departure.cause)
    }
    for (const record of prev.records) {
      if (record.society !== society || record.item !== item || !record.intact) continue
      const survivor = nextRecords.get(key(society, item, record.record))
      if (!survivor?.intact) causes.add('record_decay')
      else if (prevScripts.has(key(society, record.script)) && !nextScripts.has(key(society, survivor.script))) causes.add('no_reader')
    }
    for (const kind of kinds) events.push({ society, item, kind, causes: [...causes].sort() })
  }
  return events.sort((a, b) => compare(a.society, b.society) || compare(a.item, b.item) || compare(a.kind, b.kind))
}
