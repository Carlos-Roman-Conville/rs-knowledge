import type { CapabilityState } from './capability.ts'
import type { LiteracyReport } from './ports.ts'
import type { TechniqueRecord } from './schema.ts'

export type AvailableMedium = { technique: string; kind: string; userShare: number | null }
export type SocietyMedia = { society: string; media: AvailableMedium[] }

const compare = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0

/** DESIGN §1.8, knowledge.media: current deployment only, never a stored media stock.
 * Societies come from the state and literacy snapshots; medium.kind === 'writing'
 * requires literacy. The optional descriptor identifies media for this port.
 */
export function availableMedia(
  techniques: readonly TechniqueRecord[], states: readonly CapabilityState[], literacy: readonly LiteracyReport[],
): SocietyMedia[] {
  const records = new Map(techniques.map(technique => [technique.id, technique]))
  const shares = new Map(literacy.map(report => [report.society, report.share]))
  const societies = new Set([...states.map(state => state.society), ...shares.keys()])
  return [...societies].sort(compare).map(society => ({
    society,
    media: states.filter(state => state.society === society && state.deployed !== null && state.deployed > 0)
      .flatMap(state => {
        const medium = records.get(state.technique)?.medium
        return medium ? [{
          technique: state.technique, kind: medium.kind,
          userShare: medium.kind === 'writing' ? shares.get(society) ?? null : 1,
        }] : []
      }).sort((a, b) => compare(a.technique, b.technique)),
  }))
}
