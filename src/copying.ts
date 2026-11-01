import type { Param } from './schema.ts'

/** Euler–Mascheroni constant in Henrich's Gumbel maximum (DESIGN §1.2, level 1). */
export const EULER_GAMMA = 0.5772156649015329

function value(param: Param, name: string): number {
  if (param.value === null) throw new Error(`${name} is null; a copying-loss parameter is required`)
  return param.value
}

export function expectedSkillChange(alpha: Param, beta: Param, nEff: number): number {
  const loss = value(alpha, 'copyingLoss.alpha')
  const spread = value(beta, 'copyingLoss.beta')
  if (!Number.isFinite(nEff) || nEff < 1) throw new Error('nEff must be finite and >= 1')
  return -loss + spread * (EULER_GAMMA + Math.log(nEff))
}

export function criticalSize(alpha: Param, beta: Param): number {
  return Math.exp(value(alpha, 'copyingLoss.alpha') / value(beta, 'copyingLoss.beta') - EULER_GAMMA)
}
