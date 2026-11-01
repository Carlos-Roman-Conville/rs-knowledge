import type { ContactReport, LiteracyReport } from './ports.ts'
import type { Param } from './schema.ts'

export type DiffusionParams = {
  piPractise: Param
  piTell: Param
  piInfer: Param
  piRead: Param
}

function nonnegative(value: number, name: string): void {
  if (!Number.isFinite(value) || value < 0) throw new Error(`${name} must be finite and >= 0`)
}

function share(value: number, name: string): void {
  if (!Number.isFinite(value) || value < 0 || value > 1) throw new Error(`${name} must be in [0, 1]`)
}

function holderShare(contact: ContactReport, holders: number, population: number): number {
  nonnegative(holders, 'holders')
  if (!Number.isFinite(population) || population <= 0) throw new Error('population must be finite and > 0')
  if (holders > population) throw new Error('holders must not exceed population')
  for (const field of ['migrants', 'contacts', 'artefacts', 'records'] as const) {
    if (contact[field] !== null) nonnegative(contact[field], `contact.${field}`)
  }
  return holders / population
}

function probability(param: Param, name: keyof DiffusionParams): number {
  if (param.value === null) throw new Error(`diffusion.${name} is null; a diffusion parameter is required`)
  share(param.value, `diffusion.${name}`)
  return param.value
}

function rate(value: number | null, name: string): number {
  if (value === null) throw new Error(`contact.${name} is null; a carrier rate is required`)
  return value
}

/** DESIGN §1.4: m_st * (H_s / N_s) * piPractise, per year. */
export function migrationHazard(
  contact: ContactReport, holders: number, population: number, params: DiffusionParams,
): number {
  const fraction = holderShare(contact, holders, population)
  if (holders === 0) return 0
  const migrants = rate(contact.migrants, 'migrants')
  return migrants === 0 ? 0 : migrants * fraction * probability(params.piPractise, 'piPractise')
}

/** DESIGN §1.4: c_st * (H_s / N_s) * piTell + v_st * piInfer, per year. */
export function tradeHazard(
  contact: ContactReport, holders: number, population: number, params: DiffusionParams,
): number {
  const fraction = holderShare(contact, holders, population)
  if (holders === 0) return 0
  const contacts = rate(contact.contacts, 'contacts')
  const artefacts = rate(contact.artefacts, 'artefacts')
  const talk = contacts === 0 ? 0 : contacts * fraction * probability(params.piTell, 'piTell')
  const inference = artefacts === 0 ? 0 : artefacts * probability(params.piInfer, 'piInfer')
  return talk + inference
}

/** DESIGN §1.4: rho_st * L_t * piRead, per year; the task requires a living source holder. */
export function recordHazard(
  contact: ContactReport, holders: number, population: number, literacy: LiteracyReport, params: DiffusionParams,
): number {
  holderShare(contact, holders, population)
  share(literacy.share, 'literacy.share')
  if (literacy.society !== contact.to) throw new Error('literacy.society must match contact.to')
  if (holders === 0 || literacy.share === 0) return 0
  const records = rate(contact.records, 'records')
  return records === 0 ? 0 : records * literacy.share * probability(params.piRead, 'piRead')
}

/** Sum of the three independent carrier hazards; no additional spatial decay. */
export function totalHazard(
  contact: ContactReport, holders: number, population: number, literacy: LiteracyReport, params: DiffusionParams,
): number {
  return migrationHazard(contact, holders, population, params)
    + tradeHazard(contact, holders, population, params)
    + recordHazard(contact, holders, population, literacy, params)
}

/** Exponential waiting-time mean in years for a constant hazard per year. */
export function arrivalTimeMean(hazard: number): number {
  nonnegative(hazard, 'hazard')
  return hazard === 0 ? Infinity : 1 / hazard
}
