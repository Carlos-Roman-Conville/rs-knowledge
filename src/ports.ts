/** Cognition read boundary: the host has already mapped mind handles to item ids. */
export type HolderReport = {
  mind: string
  society: string
  item: string
  level: 'heard_of' | 'holds'
  skill: number | null
}

/** Economy record objects with Reality's decay status. */
export type RecordReport = {
  record: string
  society: string
  item: string
  intact: boolean
  fidelity: number
  script: string
}

/** Per-snapshot owner assessments; fixture access is the KNT-14 assumption (PLAN §3.2). */
export type AccessReport = {
  reader: string
  record: string
  /** Reality placement/physical access and Economy custody. */
  access: boolean | null
  /** Cognition interpretation; never inferred from a script by the stock. */
  interpret: boolean | null
  source: 'owner' | 'fixture'
}

/** Living members able to read the script. */
export type ReaderReport = { society: string; script: string; readers: number }

/** Society/Economy carrier rates per year, for one technique; null means unreported. */
export type ContactReport = {
  from: string
  to: string
  migrants: number | null
  contacts: number | null
  artefacts: number | null
  records: number | null
}

/** Society's literate share of the receiving population, in [0, 1]. */
export type LiteracyReport = { society: string; share: number }

export type DepartureReport = {
  mind: string
  society: string
  cause: 'death' | 'departure' | 'forgetting'
}

/** Reality's physical feasibility for one recipe in one society. */
export type FeasibilityReport = { society: string; recipe: string; feasible: boolean | null }

/** Economy and Reality's assessment of access to all of a recipe's inputs. */
export type ReachReport = { society: string; recipe: string; reachable: boolean | null }

/** Economy's production snapshot, unique per society and technique. */
export type ProductionReport = {
  society: string
  technique: string
  producersUsing: number
  successes: number
  /** Output from the technique's recipes / the good's output, in [0, 1]; null if unknown. */
  share: number | null
}

/** Cognition: people whose reports belong to this simulation snapshot. */
export type ReportedMindsReport = { society: string; minds: string[]; tick: number }

/** Society: applicable membership, independent of Cognition reports. */
export type RosterReport = { society: string; people: string[] | null; tick: number }
