import type { Unknown } from './unknown.ts'
import type { DepartureReport, HolderReport, ReaderReport, RecordReport, ReportedMindsReport, RosterReport } from './ports.ts'

export type StockEntry = {
  society: string
  item: string
  holders: number
  heardOf: number
  bestSkill: number | null
  readableRecords: number
  unreadableRecords: number
  coverage: number | null
  tick: number
  partial: boolean
  notApplicable: boolean
  unknowns: Unknown[]
  availability: boolean | null
}

export type StockSnapshot = {
  /** Simulation time, never a calendar date. */
  tick: number
  reportedMinds?: readonly ReportedMindsReport[]
  rosters?: readonly RosterReport[]
  /** Explicit pairs to assess even when no holder or record reports an item. */
  pairs?: readonly { society: string; item: string }[]
}

export type StockInputs = StockSnapshot & {
  holders: readonly HolderReport[]
  records: readonly RecordReport[]
  readers: readonly ReaderReport[]
}

export type StockEvent = {
  society: string
  item: string
  kind: 'became_unknown' | 'lost' | 'holders_gone_record_survives' | 'unreadable' | 'regained'
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

/** PLAN KN-2: roster membership is the independent denominator at this tick. */
export function stockCoverage(society: string, snapshot: StockSnapshot): Pick<StockEntry,
  'coverage' | 'tick' | 'partial' | 'notApplicable' | 'unknowns'> {
  const { tick } = snapshot
  if (!Number.isFinite(tick)) throw new Error('snapshot tick must be finite simulation time')
  const roster = snapshot.rosters?.find(report => report.society === society && report.tick === tick)
  const reported = snapshot.reportedMinds?.find(report => report.society === society && report.tick === tick)
  const unknowns: Unknown[] = []
  if (!roster || roster.people === null) unknowns.push({ state: 'coverage', input: `roster of ${society}`, producer: 'society' })
  const people = roster?.people == null ? null : new Set(roster.people)
  if (people?.size === 0) return { coverage: null, tick, partial: false, notApplicable: true, unknowns: [] }
  if (!reported) unknowns.push({ state: 'coverage', input: `reported minds of ${society}`, producer: 'cognition' })
  const coverage = people && reported ? [...new Set(reported.minds)].filter(mind => people.has(mind)).length / people.size : null
  return { coverage, tick, partial: coverage === null || coverage < 1, notApplicable: false, unknowns }
}

/** DESIGN §1.2: all state is local to this computation, never retained between calls. */
export function computeStock(
  holders: readonly HolderReport[], records: readonly RecordReport[], readers: readonly ReaderReport[], snapshot: StockSnapshot,
): StockEntry[] {
  const groups = new Map<string, { entry: StockEntry; held: Set<string>; heard: Set<string> }>()
  const societies = new Map<string, string>()
  const scripts = readableScripts(readers)
  const coverage = new Map<string, ReturnType<typeof stockCoverage>>()
  const memberships = new Map((snapshot.rosters ?? []).filter(report => report.tick === snapshot.tick)
    .map(report => [report.society, report.people === null ? null : new Set(report.people)]))
  const group = (society: string, item: string) => {
    const id = key(society, item)
    let result = groups.get(id)
    if (!result) {
      if (!coverage.has(society)) coverage.set(society, stockCoverage(society, snapshot))
      const status = coverage.get(society)!
      result = {
        entry: { society, item, holders: 0, heardOf: 0, bestSkill: null, readableRecords: 0, unreadableRecords: 0, ...status, unknowns: [...status.unknowns], availability: null },
        held: new Set(), heard: new Set(),
      }
      groups.set(id, result)
    }
    return result
  }
  for (const pair of snapshot.pairs ?? []) group(pair.society, pair.item)
  for (const report of holders) {
    if (societies.has(report.mind) && societies.get(report.mind) !== report.society) {
      throw new Error(`mind ${report.mind} reported in two societies (conservation)`)
    }
    societies.set(report.mind, report.society)
    if (report.skill !== null) unitInterval(report.skill, 'skill')
    const { entry, held, heard } = group(report.society, report.item)
    const members = memberships.get(report.society)
    if (members && !members.has(report.mind)) continue
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
    availability: held.size > 0 || entry.readableRecords > 0 ? true : entry.coverage === 1 ? false : null,
  })).sort(byItem)
}

/** Loss causes come from port reports; absent pairs are treated as an unknown, empty stock. */
export function diffStock(prev: StockInputs, next: StockInputs, departures: readonly DepartureReport[]): StockEvent[] {
  const before = new Map(computeStock(prev.holders, prev.records, prev.readers, prev).map(entry => [key(entry.society, entry.item), entry]))
  const after = new Map(computeStock(next.holders, next.records, next.readers, next).map(entry => [key(entry.society, entry.item), entry]))
  const prevScripts = readableScripts(prev.readers)
  const nextScripts = readableScripts(next.readers)
  const nextRecords = new Map(next.records.map(report => [key(report.society, report.item, report.record), report]))
  const events: StockEvent[] = []
  for (const id of new Set([...before.keys(), ...after.keys()])) {
    const old = before.get(id)
    const current = after.get(id)
    const { society, item } = (current ?? old)!
    const kinds: StockEvent['kind'][] = []
    if (old?.availability === true && current?.availability === false) kinds.push('lost')
    if (old?.availability === true && current?.availability == null) kinds.push('became_unknown')
    if ((old?.holders ?? 0) > 0 && current?.holders === 0 && current.availability) kinds.push('holders_gone_record_survives')
    if ((old?.readableRecords ?? 0) > 0 && current?.readableRecords === 0 && current.unreadableRecords > 0) kinds.push('unreadable')
    if (!old?.availability && current?.availability) kinds.push('regained')
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
