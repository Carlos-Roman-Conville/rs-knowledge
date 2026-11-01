import { expect, it } from 'vitest'
import { arrivalTimeMean, migrationHazard, recordHazard, totalHazard, tradeHazard } from '../src/index.ts'
import type { ContactReport, DiffusionParams, LiteracyReport, Param } from '../src/index.ts'
import { fiction } from './records.ts'

// All numbers below are explicitly fictional fixtures, never empirical calibration.
// These reports are Society/Economy port stubs; no live engine is integrated.
const contactStub: ContactReport = {
  from: 'fiction-source', to: 'fiction-target', migrants: 8, contacts: 20, artefacts: 3, records: 5,
}
const literacyStub: LiteracyReport = { society: contactStub.to, share: 0.6 }
const holders = 25, population = 100
const params: DiffusionParams = {
  piPractise: fiction(0.5), piTell: fiction(0.2), piInfer: fiction(0.4), piRead: fiction(0.8),
}
const open: Param = { value: null, label: 'open', sources: [] }
const unresolved: DiffusionParams = { piPractise: open, piTell: open, piInfer: open, piRead: open }
const noCarriers: ContactReport = { ...contactStub, migrants: 0, contacts: 0, artefacts: 0, records: 0 }

const channels = {
  migration: (c = contactStub, h = holders, n = population, p = params) => migrationHazard(c, h, n, p),
  trade: (c = contactStub, h = holders, n = population, p = params) => tradeHazard(c, h, n, p),
  record: (c = contactStub, h = holders, n = population, p = params) => recordHazard(c, h, n, literacyStub, p),
  total: (c = contactStub, h = holders, n = population, p = params) => totalHazard(c, h, n, literacyStub, p),
}

it('DESIGN §1.4: each fictional channel and its sum match hand-computed hazards', () => {
  expect(channels.migration()).toBe(1) // 8 * 0.25 * 0.5
  expect(channels.trade()).toBeCloseTo(2.2) // 20 * 0.25 * 0.2 + 3 * 0.4
  expect(channels.record()).toBeCloseTo(2.4) // 5 * 0.6 * 0.8
  expect(channels.total()).toBeCloseTo(5.6)
  expect(channels.total()).toBe(channels.migration() + channels.trade() + channels.record())
})

it.each(Object.entries(channels))('DESIGN §1.4: %s has no arrival without carriers', (_name, channel) => {
  expect(channel(noCarriers, holders, population, unresolved)).toBe(0)
  expect(channel(noCarriers, 0, population, unresolved)).toBe(0)
})

it('DESIGN §1.4: only migration and talk require living source holders', () => {
  expect(channels.migration({ ...contactStub, migrants: null }, 0, population, unresolved)).toBe(0)
  expect(channels.trade({ ...noCarriers, contacts: null }, 0, population, unresolved)).toBe(0)
  expect(channels.trade(contactStub, 0, population, { ...params, piTell: open })).toBeCloseTo(3 * 0.4)
  expect(channels.record(contactStub, 0)).toBeCloseTo(5 * 0.6 * 0.8)
  expect(channels.total(contactStub, 0)).toBeCloseTo(3 * 0.4 + 5 * 0.6 * 0.8)
  expect(() => channels.trade(contactStub, 0, population, unresolved)).toThrow('diffusion.piInfer')
  expect(() => channels.record(contactStub, 0, population, unresolved)).toThrow('diffusion.piRead')
})

it('rule 8: zero trade subchannels skip only their own unresolved probability', () => {
  expect(channels.trade({ ...contactStub, contacts: 0 }, holders, population, { ...unresolved, piInfer: params.piInfer })).toBeCloseTo(1.2)
  expect(channels.trade({ ...contactStub, artefacts: 0 }, holders, population, { ...unresolved, piTell: params.piTell })).toBe(1)
})

it('DESIGN §1.4: zero literacy prevents reading without resolving piRead', () => {
  expect(recordHazard(contactStub, holders, population, { ...literacyStub, share: 0 }, unresolved)).toBe(0)
})

it.each([
  ['piPractise', channels.migration], ['piTell', channels.trade],
  ['piInfer', channels.trade], ['piRead', channels.record],
] as const)('rule 8: active carrier names unresolved diffusion.%s', (name, channel) => {
  const missing = { ...params, [name]: open }
  expect(() => channel(contactStub, holders, population, missing)).toThrow(`diffusion.${name}`)
  expect(() => channels.total(contactStub, holders, population, missing)).toThrow(`diffusion.${name}`)
})

it('rule 8: each channel reads only its own probabilities and required rates', () => {
  expect(channels.migration({ ...contactStub, contacts: null, artefacts: null, records: null }, holders, population,
    { ...unresolved, piPractise: params.piPractise })).toBe(1)
  expect(channels.trade({ ...contactStub, migrants: null, records: null }, holders, population,
    { ...unresolved, piTell: params.piTell, piInfer: params.piInfer })).toBeCloseTo(2.2)
  expect(channels.record({ ...contactStub, migrants: null, contacts: null, artefacts: null }, holders, population,
    { ...unresolved, piRead: params.piRead })).toBeCloseTo(2.4)
})

it.each([
  ['migrants', channels.migration], ['contacts', channels.trade],
  ['artefacts', channels.trade], ['records', channels.record],
] as const)('DESIGN §1.4: an unreported active %s rate is not silently zero', (field, channel) => {
  expect(() => channel({ ...contactStub, [field]: null })).toThrow(`contact.${field}`)
  expect(() => channels.total({ ...contactStub, [field]: null })).toThrow(`contact.${field}`)
})

it.each([-1, NaN, Infinity, -Infinity])('DESIGN §1.4: rejects invalid fictional carrier rates %s in every channel', bad => {
  for (const field of ['migrants', 'contacts', 'artefacts', 'records'] as const) {
    for (const channel of Object.values(channels)) {
      expect(() => channel({ ...contactStub, [field]: bad })).toThrow(`contact.${field}`)
      expect(() => channel({ ...noCarriers, [field]: bad }, 0)).toThrow(`contact.${field}`)
    }
  }
})

it.each(Object.entries(channels))('DESIGN §1.4: %s validates counts, population and the holder share', (_name, channel) => {
  for (const bad of [-1, NaN, Infinity, -Infinity, population + 1]) {
    expect(() => channel(contactStub, bad)).toThrow('holders')
  }
  for (const bad of [0, -1, NaN, Infinity, -Infinity]) {
    expect(() => channel(contactStub, holders, bad)).toThrow('population')
    expect(() => channel(noCarriers, 0, bad, unresolved)).toThrow('population')
  }
})

it.each([-0.1, 1.1, NaN, Infinity, -Infinity])('DESIGN §1.4: rejects invalid fictional probabilities and literacy %s', bad => {
  for (const name of ['piPractise', 'piTell', 'piInfer', 'piRead'] as const) {
    expect(() => channels.total(contactStub, holders, population, { ...params, [name]: fiction(bad) })).toThrow(`diffusion.${name}`)
  }
  for (const channel of [recordHazard, totalHazard]) {
    expect(() => channel(contactStub, holders, population, { ...literacyStub, share: bad }, params)).toThrow('literacy.share')
    expect(() => channel(noCarriers, 0, population, { ...literacyStub, share: bad }, unresolved)).toThrow('literacy.share')
  }
})

it('DESIGN §1.4: literacy belongs to the receiving society', () => {
  for (const channel of [recordHazard, totalHazard]) {
    expect(() => channel(contactStub, holders, population, { ...literacyStub, society: contactStub.from }, params)).toThrow('literacy.society')
  }
})

it('DESIGN §1.4: valid share endpoints and fractional aggregate counts are accepted', () => {
  const certain: DiffusionParams = { piPractise: fiction(1), piTell: fiction(1), piInfer: fiction(1), piRead: fiction(1) }
  const impossible: DiffusionParams = { piPractise: fiction(0), piTell: fiction(0), piInfer: fiction(0), piRead: fiction(0) }
  expect(channels.total(contactStub, population, population, impossible)).toBe(0)
  expect(totalHazard(contactStub, population, population, { ...literacyStub, share: 1 }, certain)).toBe(36)
  expect(migrationHazard({ ...contactStub, migrants: 0.5 }, 0.5, 2, certain)).toBe(0.125)
})

it('DESIGN §1.4: artefact inference and reading are not multiplied by holder prevalence', () => {
  expect(channels.trade({ ...contactStub, contacts: 0 }, 1)).toBeCloseTo(1.2)
  expect(channels.record(contactStub, 1)).toBeCloseTo(2.4)
})

it('DESIGN §0 and rule 7: deterministic, pure hazards leave fictional port inputs unchanged', () => {
  const before = JSON.stringify({ contactStub, literacyStub, params })
  for (const channel of Object.values(channels)) expect(channel()).toBe(channel())
  expect(JSON.stringify({ contactStub, literacyStub, params })).toBe(before)
})

it('DESIGN §4: exponential arrival mean matches the closed form in years', () => {
  expect(arrivalTimeMean(channels.total())).toBeCloseTo(5 / 28)
  expect(arrivalTimeMean(0.25)).toBe(4)
  expect(arrivalTimeMean(2)).toBe(0.5)
  expect(arrivalTimeMean(0)).toBe(Infinity)
})

it.each([-1, NaN, Infinity, -Infinity])('DESIGN §4: arrival mean rejects invalid hazard %s', bad => {
  expect(() => arrivalTimeMean(bad)).toThrow('hazard')
})
