import type { CapabilityState } from './capability.ts'
import type { Param } from './schema.ts'

/** DESIGN §1.5: E (person-hours/year) * q (success probability/person-hour), per year. */
export function inventionHazard(
  state: CapabilityState, experimentHours: number, q: Param, inventionOff = false,
): number {
  if (!Number.isFinite(experimentHours) || experimentHours < 0) {
    throw new Error('experimentHours must be finite and >= 0')
  }
  if (inventionOff || state.possible !== true || state.invented || experimentHours === 0) return 0
  if (q.value === null) throw new Error('invention.q is null; a researched parameter is required')
  if (!Number.isFinite(q.value) || q.value < 0 || q.value > 1) {
    throw new Error('invention.q must be in [0, 1]')
  }
  return experimentHours * q.value
}
