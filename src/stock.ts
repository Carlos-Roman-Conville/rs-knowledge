import { and, or, type Unknown } from './unknown.ts'
import type { DepartureReport, HolderReport, AccessReport, RecordReport, ReportedMindsReport, RosterReport } from './ports.ts'

export type StockEntry = {
  society: string
  item: string
  holders: number
  heardOf: number
  bestSkill: number | null
  readableRecords: number
  unreadableRecords: number
  unknownRecords: number
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
  access: readonly AccessReport[]
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
/** PLAN §3.2 / KN-3: only eligible readers with both owner assessments qualify. */
function recordAccess(record: RecordReport, access: readonly AccessReport[], snapshot: StockSnapshot) {
  const members = snapshot.rosters?.find(r => r.society === record.society && r.tick === snapshot.tick)?.people
  const reports = access.filter(r => r.record === record.record)
  const unknowns: Unknown[] = []
  const values = reports.map(report => {
    const eligible = members == null ? null : members.includes(report.reader)
    const value = and([eligible, report.access, report.interpret])
    if (value === null) {
      if (eligible === null) unknowns.push({ state: 'availability', input: `eligible reader ${report.reader}`, producer: 'society' })
      if (report.access === null) unknowns.push({ state: 'availability', input: `access to ${record.record} for ${report.reader}`, producer: 'reality/economy' })
      if (report.interpret === null) unknowns.push({ state: 'availability', input: `interpret ${record.record} for ${report.reader}`, producer: 'cognition' })
    }
    return value
  })
  if (reports.length === 0) {
    unknowns.push({ state: 'availability', input: `access to ${record.record}`, producer: 'reality/economy' },
      { state: 'availability', input: `interpret ${record.record}`, producer: 'cognition' })
  }
  const value = reports.length === 0 ? null : or(values)
  return { value, unknowns: value === null ? unknowns : [] }
}

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

/**
 * PLAN §3.2 / KN-3: R(s,k) counts distinct intact records with an eligible reader
 * whose owner-reported access AND interpretation is true (Kleene logic).
 * Counts are per snapshot; records never create holders, heard-of minds or skill.
 * Implemented with labelled fixture access; live connection validation is pending.
 * All state is local to this computation, never retained between calls.
 */
export function computeStock(
  holders: readonly HolderReport[], records: readonly RecordReport[], access: readonly AccessReport[], snapshot: StockSnapshot,
): StockEntry[] {
  const groups = new Map<string, { entry: StockEntry; held: Set<string>; heard: Set<string> }>()
  const societies = new Map<string, string>()
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
        entry: { society, item, holders: 0, heardOf: 0, bestSkill: null, readableRecords: 0, unreadableRecords: 0, unknownRecords: 0, ...status, unknowns: [...status.unknowns], availability: null },
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
  const seenRecords = new Map<string, RecordReport>()
  for (const report of records) {
    unitInterval(report.fidelity, 'fidelity')
    const previous = seenRecords.get(report.record)
    if (previous) {
      if (previous.society !== report.society || previous.item !== report.item || previous.intact !== report.intact) {
        throw new Error(`conflicting record ${report.record} (conservation)`)
      }
      continue
    }
    seenRecords.set(report.record, report)
    const { entry } = group(report.society, report.item)
    if (!report.intact) continue
    const assessment = recordAccess(report, access, snapshot)
    if (assessment.value === true) entry.readableRecords++
    else if (assessment.value === false) entry.unreadableRecords++
    else {
      entry.unknownRecords++
      entry.unknowns.push(...assessment.unknowns)
    }
  }
  return [...groups.values()].map(({ entry, held, heard }) => ({
    ...entry,
    unknowns: [...new Map(entry.unknowns.map(unknown => [key(unknown.state, unknown.producer, unknown.input), unknown])).values()]
      .sort((a, b) => a.state === 'coverage' && b.state === 'coverage' ? 0
        : a.state === 'coverage' ? -1 : b.state === 'coverage' ? 1
          : compare(a.input, b.input) || compare(a.producer, b.producer)),
    holders: held.size,
    heardOf: [...heard].filter(mind => !held.has(mind)).length,
    availability: held.size > 0 || entry.readableRecords > 0 ? true : entry.coverage === 1 && entry.unknownRecords === 0 ? false : null,
  })).sort(byItem)
}

/** Loss causes come from port reports; absent pairs are treated as an unknown, empty stock. */
export function diffStock(prev: StockInputs, next: StockInputs, departures: readonly DepartureReport[]): StockEvent[] {
  const before = new Map(computeStock(prev.holders, prev.records, prev.access, prev).map(entry => [key(entry.society, entry.item), entry]))
  const after = new Map(computeStock(next.holders, next.records, next.access, next).map(entry => [key(entry.society, entry.item), entry]))
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
      else if (recordAccess(record, prev.access, prev).value === true && recordAccess(survivor, next.access, next).value === false) causes.add('no_access')
    }
    for (const kind of kinds) events.push({ society, item, kind, causes: [...causes].sort() })
  }
  return events.sort((a, b) => compare(a.society, b.society) || compare(a.item, b.item) || compare(a.kind, b.kind))
}
