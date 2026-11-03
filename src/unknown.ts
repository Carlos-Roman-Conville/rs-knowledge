export type Unknown = { state: string; input: string; producer: string }

/** PLAN ?3.1 / KN-1: Kleene conjunction; false dominates unknown. */
export function and(values: readonly (boolean | null)[]): boolean | null {
  if (values.includes(false)) return false
  return values.includes(null) ? null : true
}

/** PLAN ?3.1 / KN-1: Kleene disjunction; true dominates unknown. */
export function or(values: readonly (boolean | null)[]): boolean | null {
  if (values.includes(true)) return true
  return values.includes(null) ? null : false
}
