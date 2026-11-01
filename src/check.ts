import { isObject, validateRecord } from './schema.ts'

export type RecordFile = { path: string; error?: string }

const forbiddenKeys = new Set(['year', 'date', 'period', 'era', 'century', 'prerequisite', 'prerequisites', 'requires_technique', 'unlocks'])
const idPattern = /^knowledge\/(proposition|technique)\.([a-z0-9]+(-[a-z0-9]+)*)$/

/** Accept unknown input so invalid records are reported instead of being trusted. */
export function checkRecords(records: readonly unknown[], files: readonly (RecordFile | string)[]): string[] {
  const failures: string[] = []
  const seen = new Set<string>()
  const propositions = new Set(records.filter(isObject).filter(record => record.kind === 'proposition' &&
    typeof record.id === 'string' && idPattern.test(record.id) && record.id.startsWith('knowledge/proposition.')).map(record => record.id))
  records.forEach((record, index) => {
    const file = files[index]
    const path = typeof file === 'string' ? file : file?.path ?? `record[${index}]`
    const fail = (message: string) => { failures.push(`${path}: ${message}`) }
    if (typeof file === 'object' && file.error) { fail(file.error); return }
    validateRecord(record).forEach(fail)
    if (!isObject(record)) return
    const match = typeof record.id === 'string' ? idPattern.exec(record.id) : null
    if (!match) fail('id must match knowledge/(proposition|technique).<slug>')
    else {
      if (match[1] !== record.kind) fail('id kind differs from kind')
      if (path.replaceAll('\\', '/').split('/').pop() !== `${match[2]}.json`) fail('file name must be <slug>.json')
    }
    if (typeof record.id === 'string') {
      if (seen.has(record.id)) fail(`duplicate id ${record.id}`)
      seen.add(record.id)
    }
    if (record.kind === 'technique' && Array.isArray(record.propositions)) {
      record.propositions.forEach(id => { if (!propositions.has(id)) fail(`propositions entry resolves to no proposition: ${String(id)}`) })
    }
    const walk = (value: unknown, location: string, ownId = false) => {
      if (record.kind === 'technique' && !ownId && typeof value === 'string' && value.startsWith('knowledge/technique.')) fail(`no tech tree: ${location}`)
      if (Array.isArray(value)) value.forEach((item, i) => walk(item, `${location}[${i}]`))
      else if (isObject(value)) Object.entries(value).forEach(([key, item]) => {
        if (forbiddenKeys.has(key)) fail(`no dates or prerequisites: ${location}.${key}`)
        // Keys are strings too; metadata cannot hide technique references in a key.
        if (record.kind === 'technique' && key.startsWith('knowledge/technique.')) fail(`no tech tree: ${location}.${key}`)
        walk(item, `${location}.${key}`, value === record && key === 'id')
      })
    }
    walk(record, '$')
  })
  return failures.sort()
}
