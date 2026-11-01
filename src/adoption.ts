import type { CapabilityState } from './capability.ts'
import type { Param } from './schema.ts'

export type AdopterInputs = {
  state: CapabilityState
  producers: number
  costAdvantage: number
  /** A working-method holder can be hired or learned from; unknown is not in reach. */
  inReach: boolean | null
}

function nonnegative(value: number, name: string): void {
  if (!Number.isFinite(value) || value < 0) throw new Error(`${name} must be finite and >= 0`)
}

function rate(param: Param, name: string): number {
  if (param.value === null) throw new Error(`${name} is null; a researched parameter is required`)
  nonnegative(param.value, name)
  return param.value
}

function initial(A: number, M: number, dt: number): number {
  if (!Number.isFinite(A)) throw new Error('A must be finite')
  nonnegative(M, 'M')
  nonnegative(dt, 'dt')
  return Math.min(M, Math.max(0, A))
}

/** DESIGN §1.6: eligible producer count from supplied capability and Economy/reach inputs. */
export function adopters({ state, producers, costAdvantage, inReach }: AdopterInputs): number {
  nonnegative(producers, 'producers')
  if (!Number.isFinite(costAdvantage)) throw new Error('costAdvantage must be finite')
  return costAdvantage > 0 && state.possible === true && state.invented && inReach === true ? producers : 0
}

/**
 * DESIGN §1.6: forward Euler with dt in years and p/q in inverse years.
 * Clamp before and after stepping, including abandonment when M falls. Resolve only active terms.
 */
export function bassStep(A: number, M: number, p: Param, q: Param, dt: number): number {
  const current = initial(A, M, dt)
  if (dt === 0 || current === M) return current
  const external = rate(p, 'adoption.p')
  const imitation = current === 0 ? 0 : rate(q, 'adoption.q') * (current / M)
  return Math.min(M, current + (external + imitation) * (M - current) * dt)
}

/** Return the clamped initial count followed by `steps` constant-input Bass steps. */
export function bassCurve(A0: number, M: number, p: Param, q: Param, dt: number, steps: number): number[] {
  if (!Number.isSafeInteger(steps) || steps < 0) throw new Error('steps must be a nonnegative safe integer')
  const curve = [initial(A0, M, dt)]
  for (let step = 0; step < steps; step++) curve.push(bassStep(curve[step], M, p, q, dt))
  return curve
}
