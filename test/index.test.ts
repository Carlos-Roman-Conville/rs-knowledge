import { describe, expect, it } from 'vitest'
import { knowledgeId } from '../src/index.ts'

describe('ids', () => {
  it('qualifies a local id with the knowledge prefix', () => {
    expect(knowledgeId('technique.lime-burning')).toBe('knowledge/technique.lime-burning')
  })
  it('refuses a local id containing /', () => {
    expect(() => knowledgeId('technique.lime/burning')).toThrow()
  })
})
