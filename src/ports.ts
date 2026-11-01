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

/** Living members able to read the script. */
export type ReaderReport = { society: string; script: string; readers: number }

export type DepartureReport = {
  mind: string
  society: string
  cause: 'death' | 'departure' | 'forgetting'
}
