export type Param = {
  value: number | null
  label: 'researched' | 'estimate' | 'fiction' | 'open'
  sources: string[]
  note?: string
}

export type PropositionRecord = {
  id: string
  kind: 'proposition'
  statement: string
  sources: string[]
  notes?: string
}

export type MethodLink = { recipe: string; version: string | null }

export type TechniqueRecord = {
  id: string
  kind: 'technique'
  name: string
  /** Alternative methods (OR), each requiring every linked recipe (AND). */
  methods: MethodLink[][]
  propositions: string[]
  minSkill: Param
  tacitShare: Param
  copyingLoss: { alpha: Param; beta: Param }
  isMedium: boolean
  medium?: { kind: string }
  catalogueRef: string | null
  sources: string[]
  notes?: string
}

export type KnowledgeRecord = PropositionRecord | TechniqueRecord

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const strings = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(item => typeof item === 'string')

/** Validate structure and local constraints; cross-record rules belong to checkRecords. */
export function validateRecord(record: unknown): string[] {
  if (!isObject(record)) return ['record must be an object']
  const errors: string[] = []
  const string = (key: string) => {
    if (typeof record[key] !== 'string') errors.push(`${key} must be a string`)
  }
  const array = (key: string) => {
    if (!strings(record[key])) errors.push(`${key} must be a string array`)
  }
  string('id')
  array('sources')
  if (record.notes !== undefined) string('notes')
  if (record.kind === 'proposition') {
    string('statement')
    if ('catalogueRef' in record) errors.push('proposition must not carry catalogueRef (KNT-K1)')
  } else if (record.kind === 'technique') {
    string('name')
    if ('enables' in record) errors.push('enables is obsolete; use methods')
    if (!Array.isArray(record.methods) || record.methods.length === 0) errors.push('methods must be non-empty')
    else record.methods.forEach((alternative, i) => {
      if (!Array.isArray(alternative) || alternative.length === 0) {
        errors.push(`methods[${i}] must be a non-empty array`)
        return
      }
      alternative.forEach((link, j) => {
        if (!isObject(link) || typeof link.recipe !== 'string' || link.recipe.trim().length === 0 ||
          (link.version !== null && typeof link.version !== 'string')) {
          errors.push(`methods[${i}][${j}] must have a non-empty recipe and a string or null version`)
        }
      })
    })
    array('propositions')
    if (typeof record.isMedium !== 'boolean') errors.push('isMedium must be a boolean')
    if (record.isMedium === false && record.medium !== undefined) {
      errors.push('medium descriptor requires isMedium to be true')
    }
    if (record.medium !== undefined && (!isObject(record.medium) || typeof record.medium.kind !== 'string')) {
      errors.push('medium must be an object with a string kind')
    }
    if (record.catalogueRef !== null && (typeof record.catalogueRef !== 'string' ||
      !/^catalogue\/(technology|practice)\.[a-z0-9]+(-[a-z0-9]+)*(\.[0-9]+)?$/.test(record.catalogueRef))) {
      errors.push('catalogueRef must be null or a catalogue technology/practice id')
    }
    const param = (value: unknown, path: string, unit: boolean) => {
      if (!isObject(value)) { errors.push(`${path} must be a Param object`); return }
      if (value.value !== null && (typeof value.value !== 'number' || !Number.isFinite(value.value))) {
        errors.push(`${path}.value must be a finite number or null`)
      }
      if (typeof value.label !== 'string' || !['researched', 'estimate', 'fiction', 'open'].includes(value.label)) errors.push(`${path}.label is invalid`)
      if (!strings(value.sources)) errors.push(`${path}.sources must be a string array`)
      if (value.note !== undefined && typeof value.note !== 'string') errors.push(`${path}.note must be a string`)
      if ((value.value === null) !== (value.label === 'open')) errors.push(`${path}: null value requires open label and open label requires null value`)
      if (['researched', 'estimate'].includes(String(value.label)) &&
        (!strings(value.sources) || !value.sources.some(source => source.trim().length > 0))) {
        errors.push(`${path}: researched or estimate requires a source`)
      }
      if (typeof value.value === 'number' && (unit ? value.value < 0 || value.value > 1 : !(value.value > 0))) {
        errors.push(`${path}.value must be ${unit ? 'in [0, 1]' : '> 0'}`)
      }
    }
    param(record.minSkill, 'minSkill', true)
    param(record.tacitShare, 'tacitShare', true)
    if (!isObject(record.copyingLoss)) errors.push('copyingLoss must be an object')
    else {
      param(record.copyingLoss.alpha, 'copyingLoss.alpha', false)
      param(record.copyingLoss.beta, 'copyingLoss.beta', false)
    }
  } else errors.push('kind must be proposition or technique')
  return errors.sort()
}
